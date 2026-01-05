import 'virtual:webrtc-adapter-global';
import Janus from 'janus-gateway';
import adapter from 'webrtc-adapter';

Janus.init({
    debug: true, 
    dependencies: Janus.useDefaultDependencies({ adapter }),
});

export class MediaRoomClient {
    constructor(roomId, setLocalStream, addRemoteStream, removeRemoteStream) {
        this.roomId = roomId;
        this.setLocalStream = setLocalStream;
        this.addRemoteStream = addRemoteStream;
        this.removeRemoteStream = removeRemoteStream;
        this.videoEnabled = false;
        this.audioEnabled = true;
        this.janus = null;
        this.publisherHandle = null;
        this.subscriberHandles = new Map();
        this.remoteStreams = new Map();
        this.localStream = null;
        this.myId = null;
        this.isJoined = false;
        this.privateId = null;
        this.audioDeviceId = null;
        this.remoteAudioEnabled = true;
        this.feedSubscriptions = new Map();
    }
    async initialize() {
        const serverUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/janus`;
        this.janus = new Janus({
            server: serverUrl,
            success: this.attachPublisher,
            error: err => console.error("[Janus init error]", err),
            destroyed: this.onDestroyed,
        });
    }

    attachPublisher = () => {
        this.janus.attach({
            plugin: "janus.plugin.videoroom",
            success: ph => {
                this.publisherHandle = ph;

                ph.oniceconnectionstatechange = () => {
                    console.log("Publisher ICE state:", ph.webrtcStuff.pc?.iceConnectionState);
                };

                ph.onconnectionstatechange = () => {
                    console.log("Publisher connectionState:", ph.webrtcStuff.pc?.connectionState);
                };

                this.joinRoom(this.roomId);
            },
            error: err => console.error("[Publisher attach error]", err),
            onmessage: this.onPublisherMessage,
            onlocalstream: this.onLocalStream,
            onicecandidate: this.onPublisherIceCandidate,
        });
    };

    joinRoom = async roomGuid => {
        this.roomId = roomGuid;
        if (!this.publisherHandle) {
            console.error("Publisher not ready");
            return;
        }
        if(this.isJoined) {
            console.warn("Already joined room");
            return;
        }

        if (!this.localStream) {
            try {
                this.localStream = await navigator.mediaDevices.getUserMedia({
                    audio: this.audioDeviceId
                        ? { deviceId: { exact: this.audioDeviceId } }
                        : true,
                    video: this.videoEnabled,
                });
                
                this.setLocalStream(this.localStream);
            } catch (err) {
                console.error("Failed to getUserMedia:", err);
                return;
            }
        }

        this.publisherHandle.send({
            message: { request: "join", room: roomGuid, ptype: "publisher" },
        });
    };

    onPublisherIceCandidate = candidate => {
        if (candidate) {
            this.publisherHandle.send({
                message: { request: "trickle", candidate },
            });
        }
    };

    onPublisherMessage = (msg, jsep) => {
        const event = msg["videoroom"];
        if (event === "joined") {
            this.myId = msg["id"];
            this.privateId = msg["private_id"];
            this.isJoined = true;
            

            this.publishOwnFeed();  

            (msg["publishers"] || []).forEach(pub => {
                this._ensureRemoteFeed(pub);
            });
        } else if (event === "event") {
            (msg["publishers"] || []).forEach(pub => {
                this._ensureRemoteFeed(pub);
            });
            if (msg["leaving"]) {
                this.detachRemoteFeed(msg["leaving"]);
            }
        }

        if (jsep) {
            
            this.publisherHandle.handleRemoteJsep({ jsep });
        }
    };

    publishOwnFeed = () => {
        if (!this.publisherHandle || !this.localStream) return;

        this.publisherHandle.createOffer({
            media: { audioSend: this.audioEnabled, videoSend: this.videoEnabled },
            stream: this.localStream,
            success: jsep => {
                this.publisherHandle.send({
                    message: { request: "configure", audio: this.audioEnabled, video: this.videoEnabled },
                    jsep,
                });

               
            },
            
        });
    };

    setAudioEnabled(enabled) {
        this.audioEnabled = enabled;

        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(t => {
                t.enabled = enabled;
            });
        }
        try {
            this.publisherHandle?.send({ message: { request: "configure", audio: enabled, video: this.videoEnabled } });
        } catch (e) {
            console.warn("configure audio toggle failed", e);
        }
    }

    setRemoteAudioEnabled(enabled) {
        this.remoteAudioEnabled = enabled;
        this.remoteStreams.forEach(stream => {
            stream.getAudioTracks().forEach(t => {
                t.enabled = enabled;
            });
        });
    }

    newRemoteFeed = (feedId, streams = []) => {
            const feed = Number(feedId);
        if (!Number.isInteger(feed) || feed <= 0) {
            
            return;
        }

        if (this.subscriberHandles.has(feed)) {
            this._updateRemoteSubscription(feed, streams);
            return;
        }

        let handle;

        this.janus.attach({
            plugin: "janus.plugin.videoroom",
            success: ph => {
                handle = ph;
                this.subscriberHandles.set(feed, ph);

                const streamList = Array.isArray(streams)
                    ? streams.filter(s => s.mid).map(s => ({ feed, mid: s.mid }))
                    : [];

                const desiredStreams = streamList.length ? streamList : [{ feed }];

                const subscribed = new Set(desiredStreams.map(s => s.mid ?? "__default"));
                this.feedSubscriptions.set(feed, subscribed);

                ph.send({
                    message: {
                        request: "join",
                        room: this.roomId,
                        ptype: "subscriber",
                        private_id: this.privateId,
                        streams: desiredStreams
                    }
                });
            },
            
            onmessage: (msg, jsep) => {
                
                if (jsep && handle && jsep.type === "offer") {
                    handle.createAnswer({
                        jsep,
                        media: { audioRecv: true, videoRecv: true },
                        success: answer => {
                            handle.send({
                                message: { request: "start", room: this.roomId },
                                jsep: answer,
                            });
                        },
                        
                    });
                }
            },
            onremotetrack: (track,mid, on) => {
                if (!on){
                this._removeRemoteTrack(feed, track);
                return;
                }
                this._addRemoteTrack(feed, track);
            },
            oncleanup: () => {
                this.removeRemoteStream(null, feed);
                this.remoteStreams.delete(feed);
                this.subscriberHandles.delete(feed);
                this.feedSubscriptions.delete(feed);
            },
            
        });
    };

    detachRemoteFeed = feedId => {
        const handle = this.subscriberHandles.get(feedId);
        if (!handle) return;
        handle.detach();
        this.subscriberHandles.delete(feedId);
        this.remoteStreams.delete(feedId);
        this.removeRemoteStream(null, feedId);
        this.feedSubscriptions.delete(feedId);
    };
    
    _updateRemoteSubscription = (feedId, streams) => {
            const feed = Number(feedId);
        if (!Number.isInteger(feed) || feed <= 0) {
            console.warn("Invalid feed id:", feedId);
            return;
        }

        const handle = this.subscriberHandles.get(feed);
        if (!handle) return;

        const subscribed = this.feedSubscriptions.get(feed) || new Set();

        const streamList = Array.isArray(streams)
            ? streams.filter(s => s.mid).map(s => ({ feed, mid: s.mid }))
            : [];

        const newStreams = streamList.filter(s => !subscribed.has(s.mid));
        if (!newStreams.length) return;

        newStreams.forEach(s => subscribed.add(s.mid));
        this.feedSubscriptions.set(feed, subscribed);

        handle.send({
            message: {
                request: "subscribe",
                streams: newStreams
            }
        });
    };

    _ensureRemoteFeed = (pub) => {
        const streams = Array.isArray(pub.streams) ? pub.streams : [];
        if (this.subscriberHandles.has(pub.id)) {
            this._updateRemoteSubscription(pub.id, streams);
        } else {
            this.newRemoteFeed(pub.id, pub.display, streams);
        }
    };
    _addRemoteTrack = (feedId, track) => {
        const existing = this.remoteStreams.get(feedId) || new MediaStream();
        if (!existing.getTracks().some(t => t.id === track.id)) {
            existing.addTrack(track);
        }
        if (!this.remoteAudioEnabled) {
            existing.getAudioTracks().forEach(t => {
                t.enabled = false;
            });
        }
        this.remoteStreams.set(feedId, existing);
        this.addRemoteStream(existing, feedId);
    };

    _removeRemoteTrack = (feedId, track) => {
        const existing = this.remoteStreams.get(feedId);
        if (!existing)
        {
            return;
        } 
        existing.removeTrack(track);
        if( existing.getTracks().length === 0)
        {    
           this.remoteStreams.delete(feedId);
            this.removeRemoteStream(null, feedId);
        } else 
        {
             this.addRemoteStream(existing, feedId);
        }
    }

    async setVideoEnabled(enabled) {
        this.videoEnabled = enabled;

        if(!this.localStream) {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: this.audioDeviceId
                    ? { deviceId: { exact: this.audioDeviceId } }
                    : true,
                video: this.videoEnabled ,
        });
            this.setLocalStream(this.localStream);
        } else if (enabled && this.localStream.getVideoTracks().length === 0) {
            const camera = await navigator.mediaDevices.getUserMedia({ video: true });
            const cameraTrack = camera.getVideoTracks()[0];
            if (cameraTrack) {
                this.localStream.addTrack(cameraTrack);
                this.setLocalStream(this.localStream);
            }
    } else if (!enabled) {
            this.localStream.getVideoTracks().forEach(track => {
                try { track.stop(); } catch {
                    console.warn("Failed to stop video track");
                }
                this.localStream.removeTrack(track);
            });
            this.setLocalStream(this.localStream);
        }
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(t => {
            t.enabled = this.audioEnabled;
        });
    }
        if(this.publisherHandle) {
            this.publisherHandle.createOffer({
                media: { audioSend: this.audioEnabled, videoSend: this.videoEnabled },
                stream: this.localStream,
                success: jsep => {
                    this.publisherHandle.send({
                        message: { request: "configure", audio: this.audioEnabled, video: this.videoEnabled },
                        jsep,
                    });
                },
                error: err => console.error("Publish offer error", err),
            });
        }
    }

    async leaveRoom() {
        try {
            
            for (const handle of this.subscriberHandles.values()) {
                try { handle.detach(); } catch (e) { console.warn("detach subscriber failed", e); }
            }
            this.subscriberHandles.clear();
            this.remoteStreams.clear();

            
            if (this.publisherHandle) {
                try { 
                    this.publisherHandle.hangup(true); 
                } catch 
                { 
                    console.warn("hangup publisher failed");
                }
                try {
                     this.publisherHandle.detach();
                } catch (e) 
                { 
                console.warn("detach publisher failed", e);
                }
                this.publisherHandle = null;
            }

            
            if (this.janus) {
                try { 
                    this.janus.destroy(); 
                } catch (e) 
                { 
                    console.warn("janus destroy failed", e); 
                }
                this.janus = null;
            }

            
            if (this.localStream) {
                this.localStream.getTracks().forEach(t => { try { t.stop(); } catch {
                    console.warn("Failed to stop local track");
                } });
                this.localStream = null;
                this.setLocalStream(null);
            }
        } catch (err) {
            console.error("Error leaving room", err);
        }
    }
}
