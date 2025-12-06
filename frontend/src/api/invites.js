import api from "./axios"; 


export async function createInvite(serverGuid, payload) {
  const res = await api.post(`/servers/${serverGuid}/invites`, payload);
  return res.data;
}

export async function getInvites(serverGuid) {
  const res = await api.get(`/servers/${serverGuid}/invites`);
  return res.data;
}


export async function joinServer(inviteGuid, serverGuid) {
  
  const res = await api.post(`/servers/${serverGuid}/invites/${inviteGuid}/join`);
  return res.data;
}

export async function revokeInvite(serverGuid, inviteGuid) {
  const res = await api.delete(`/servers/${serverGuid}/invites/${inviteGuid}`);
  return res.data;
}
