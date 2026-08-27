import { CaPTQuery, RuntimeMessage } from '../types'
import { injectedFunction } from '../background/injected_script.mjs'

async function createOffscreenCopyDocument() {
  // only 1 offscreen document can exist at once
  if ((await chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"] })).length > 0) {
    return;
  }

  return chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ["CLIPBOARD"],
    justification: "Chrome doesn't support using navigator.clipboard in the service worker, so an offscreen document is required."
  })
}

/** 
 * @returns {Promise<string|false|null>} string is the selected message, null is returned if nothing is selected and false is returned if we don't have access to the site.
 */
export async function getSelectedText() {
  // query the currently active tab
  const activeTab = (await chrome.tabs.query({active: true, currentWindow: true}))[0]

  // probably devtools url
  if (!activeTab) {
    return false;
  }
  if (!activeTab.id || !activeTab.url) {
    console.error("We don't have permissions on the active tab.")
    return false;
  }
  

  let results
  try {
    results = await chrome.scripting.executeScript({
      func: injectedFunction,
      world: "ISOLATED",
      target: {
        tabId: activeTab.id,
        allFrames: true
      }
    })
  } catch(err) {
    // we can't access chrome:// urls
    return false;
  }
  let latestQuery:CaPTQuery|null = null
  for (const result of results) {
    const res = result as unknown as chrome.scripting.InjectionResult<CaPTQuery>
    if (!res.result) {}
    else if (latestQuery === null) {
      latestQuery = res.result
    } else if (res.result.lastInteraction > latestQuery.lastInteraction) {
      latestQuery = res.result
    }
  }

  return latestQuery?.selectionAsPlainText ?? null
}

export async function copyAsPlainText() {
  const selectedText = await getSelectedText()
  if (selectedText) {
    console.debug("Got", selectedText)
    try {
      // chrome doesn't expose this
      if (navigator.clipboard) {
        navigator.clipboard.writeText(selectedText)
      } else {
        console.debug("Clipboard API not supported in service worker. Creating offscreen document...")
        await createOffscreenCopyDocument()
        const message:RuntimeMessage = {
          target: "offscreen",
          type: "copy",
          info: selectedText
        }
        await chrome.runtime.sendMessage(message)
      }

    } catch (err) {
      console.error("Failed to copy to clipboard. Error:", err)
    }
  }
}