import api from "./axios";

export async function uploadAttachment(messageGuid, file) {
    const form = new FormData();
    form.append("file", file);

    const url = `/messages/${messageGuid}/attachemnts`;

    return api.post(url, form, {
        params: { messageGuid },
        headers: { "Content-Type": "multipart/form-data" }
    });
}
