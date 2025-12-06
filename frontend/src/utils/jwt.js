export function isTokenExpiringSoon(token, seconds = 120) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp * 1000; 
        const now = Date.now();

        return exp - now < seconds * 1000;
    } catch {
        return true;
    }
}
