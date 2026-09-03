export async function getActiveTab() {
  return (await chrome.tabs.query({active: true, currentWindow: true}))[0] as chrome.tabs.Tab|undefined
}