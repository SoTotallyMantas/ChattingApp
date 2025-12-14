import api from "./axios";

export async function sendMessage({ channelGuid, content, replyToGuid }) {
  const response = await api.post("/messages", {
    channelGuid,
    content,
    replyToGuid: replyToGuid ?? null,
  });

  return response.data;
}

export async function editMessage({ messageGuid, NewContent }) {
  const response = await api.put("/messages", {
    messageGuid,
    NewContent,
  });

  return response.data;
}
export async function getHistory(channelGuid, before = null) {
    return api.get("/messages/history", {
        params: {
            channelGuid,
            before
        }
    });
}

export async function searchMessages(channelGuid, query, limit = 20) {
    return api.get("/messages/search", {
        params: {
            channelGuid,
            query,
            limit
        }
    });
}

export async function downloadAttachment(attachmentGuid) {
    const res = await api.get("/messages/attachment", {
        params: { attachmentGuid },
        responseType: "blob"
    });
    return res.data;
}
export async function deleteMessage(messageGuid) {
  const response = await api.delete("/messages", {
    params: { messageGuid },
  });

  return response.data;
}
