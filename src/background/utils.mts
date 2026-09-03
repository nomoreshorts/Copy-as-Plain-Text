export async function getActiveTab() {
  return (await chrome.tabs.query({active: true, currentWindow: true}))[0] as chrome.tabs.Tab|undefined
}

export async function sendToAllTabs(message:any) {
  ;(await chrome.tabs.query({})).forEach(async tab => {
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, message)
      } catch(e) {
        console.debug('Could not send', message, `to ${tab.id}. Error:`, e)
      }
    }
  })
}