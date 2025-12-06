import api from "./axios";

export async function getServerMembers(serverGuid) {
  const res = await api.get(`/servers/${serverGuid}/members`);
  return res.data;
}

export async function kickMember(serverGuid, payload) {
  const res = await api.post(`/servers/${serverGuid}/members/kick`, payload);
  return res.data;
}


export async function banMember(serverGuid, payload) {
  const res = await api.post(`/servers/${serverGuid}/members/ban`, payload);
  return res.data;
}

export async function unbanMember(serverGuid, payload) {
  const res = await api.post(`/servers/${serverGuid}/members/unban`, payload);
  return res.data;
}

export async function getServerBans(serverGuid) {
  const res = await api.get(`/servers/${serverGuid}/members/bans`);
  return res.data;
}