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

        this.janus = null;
        this.publisherHandle = null;
        this.subscriberHandles = new Map();
        this.remoteStreams = new Map();
        this.localStream = null;
        this.myId = null;
        this.privateId = null;
        this.audioDeviceId = null;
        this.remoteAudioEnabled = true;
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

        if (!this.localStream) {
            try {
                this.localStream = await navigator.mediaDevices.getUserMedia({
                    audio: this.audioDeviceId
                        ? { deviceId: { exact: this.audioDeviceId } }
                        : true,
                    video: false,
                });
                console.log("Local audio tracks:", this.localStream.getAudioTracks());
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
            console.log("Joined video room, my id:", this.myId);

            this.publishOwnFeed();  

            (msg["publishers"] || []).forEach(pub => {
                this.newRemoteFeed(pub.id, pub.display);
            });
        } else if (event === "event") {
            (msg["publishers"] || []).forEach(pub => {
                this.newRemoteFeed(pub.id, pub.display);
            });
            if (msg["leaving"]) {
                this.detachRemoteFeed(msg["leaving"]);
            }
        }

        if (jsep) {
            console.log("Publisher received JSEP:", jsep);
            this.publisherHandle.handleRemoteJsep({ jsep });
        }
    };

    publishOwnFeed = () => {
        if (!this.publisherHandle || !this.localStream) return;

        this.publisherHandle.createOffer({
            media: { audioSend: true, videoSend: false },
            stream: this.localStream,
            success: jsep => {
                console.group("%c Publisher Offer SDP", "color:green");
                console.log(jsep.sdp);
                console.groupEnd();

                this.publisherHandle.send({
                    message: { request: "configure", audio: true, video: false },
                    jsep,
                });

                this._printStats();
            },
            error: err => console.error("[Publish offer error]", err),
        });
    };

    setAudioEnabled(enabled) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(t => {
                t.enabled = enabled;
            });
        }
        try {
            this.publisherHandle?.send({ message: { request: "configure", audio: enabled, video: false } });
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

   
    _printStats = async () => {
        const pc = this.publisherHandle?.webrtcStuff?.pc;
        if (!pc) return;

        try {
            const stats = await pc.getStats();
            stats.forEach(report => {
                if (report.type === "outbound-rtp" && report.kind === "audio") {
                    console.log("Outbound audio stats:", report);
                }
                if (report.type === "transceiver") {
                    console.log("Transceiver:", report.mid, report.direction);
                }
            });
        } catch (err) {
            console.warn("getStats failed:", err);
        }
    };

  
    newRemoteFeed = (feedId, display) => {
        if (this.subscriberHandles.has(feedId)) return;
        let handle;
        this.janus.attach({
            plugin: "janus.plugin.videoroom",
            success: ph => {
                handle = ph;
                this.subscriberHandles.set(feedId, ph);

                const subscribe = {
                    request: "join",
                    room: this.roomId,
                    ptype: "subscriber",
                    private_id: this.privateId,
                    streams: [{ feed: feedId }],
                };
                ph.send({ message: subscribe });
            },
            onmessage: (msg, jsep) => {
                if (msg["videoroom"] === "attached" && jsep && handle) {
                    handle.createAnswer({
                        jsep,
                        media: { audioRecv: true, videoRecv: false },
                        success: answer => {
                            handle.send({
                                message: { request: "start", room: this.roomId },
                                jsep: answer,
                            });
                        },
                        error: err => console.error("[Subscriber answer error]", err),
                    });
                }
            },
            onremotetrack: (track, mid, on) => {
                if (!on) return;
                this.__processRemoteStream(new MediaStream([track]), feedId);
            },
            oncleanup: () => {
                this.removeRemoteStream(null, feedId);
                this.remoteStreams.delete(feedId);
                this.subscriberHandles.delete(feedId);
            },
            error: err => console.error("[Subscriber attach error]", err),
        });
    };

    detachRemoteFeed = feedId => {
        const handle = this.subscriberHandles.get(feedId);
        if (!handle) return;
        handle.detach();
        this.subscriberHandles.delete(feedId);
        this.remoteStreams.delete(feedId);
        this.removeRemoteStream(null, feedId);
    };

    __processRemoteStream(stream, feedId) {
        if (!this.remoteAudioEnabled) {
            stream.getAudioTracks().forEach(t => {
                t.enabled = false;
            });
        }
        this.remoteStreams.set(feedId, stream);
        this.addRemoteStream(stream, feedId);
    }

    async leaveRoom() {
        try {
            // Detach all subscribers
            for (const handle of this.subscriberHandles.values()) {
                try { handle.detach(); } catch (e) { console.warn("detach subscriber failed", e); }
            }
            this.subscriberHandles.clear();
            this.remoteStreams.clear();

            // Detach publisher
            if (this.publisherHandle) {
                try { this.publisherHandle.hangup(true); } catch {}
                try { this.publisherHandle.detach(); } catch (e) { console.warn("detach publisher failed", e); }
                this.publisherHandle = null;
            }

            // Destroy Janus session
            if (this.janus) {
                try { this.janus.destroy(); } catch (e) { console.warn("janus destroy failed", e); }
                this.janus = null;
            }

            // Stop local media tracks
            if (this.localStream) {
                this.localStream.getTracks().forEach(t => { try { t.stop(); } catch {} });
                this.localStream = null;
                this.setLocalStream(null);
            }
        } catch (err) {
            console.error("Error leaving room", err);
        }
    }
}
