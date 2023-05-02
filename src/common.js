export async function getAPIKey() {
    const items = await chrome.storage.sync.get("api_key");
    if (items.api_key == null || items.api_key == "") {
        return null;
    }
    return items.api_key;
}