import { CaPTQuery, RuntimeMessage } from '../types'
import { injectedFunction } from './injected_script.mjs'
import { injectedCut } from './injected_cut_selection.mjs'

class OffscreenCopyDocument {
  static async create() {
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
  static async close() {
    return chrome.offscreen.closeDocument();
  }
}


async function retrieveLatestSelection() {
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
  let latestQuery:chrome.scripting.InjectionResult<CaPTQuery>|null = null
  for (const result of results) {
    const res = result as unknown as chrome.scripting.InjectionResult<CaPTQuery>
    if (!res.result) {}
    else if (latestQuery === null) {
      latestQuery = res
    } else if (latestQuery.result && res.result.lastInteraction > latestQuery.result.lastInteraction) {
      latestQuery = res
    }
  }

  if (latestQuery) {
    return ({
      ...latestQuery,
      tabId: activeTab.id
    } as chrome.scripting.InjectionResult<CaPTQuery> & {tabId: number})
  } else {
    return null;
  }
}
/** 
 * @returns {Promise<string|false|null>} string is the selected message, null is returned if nothing is selected and false is returned if we don't have access to the site.
 */
export async function getSelectedText() {
  const latestSelection = await retrieveLatestSelection()
  if (latestSelection === false || latestSelection === null) {
    return latestSelection;
  } else {
    return latestSelection.result?.selectionAsPlainText ?? null;
  }
}

/** 
 * @returns {Promise<string|false|null>} string is the selected message, null is returned if nothing is selected and false is returned if we don't have access to the site.
 * Differs from {@link getSelectedText} because it deletes the selected text after finding it (if possible)
 */
export async function delSelectedText() {
  const latestSelection = await retrieveLatestSelection()
  if (latestSelection === false || latestSelection === null) {
    return latestSelection;
  } else {
    if (latestSelection.result?.selectionAsPlainText != null
      && latestSelection.result.selectionAsPlainText != '') {
      try {
        await chrome.scripting.executeScript({
          func: injectedCut,
          args: [latestSelection.result.selectionAsPlainText],
          world: "ISOLATED",
          target: {
            tabId: latestSelection.tabId,
            frameIds: [latestSelection.frameId]
          }
        })
      } catch(err) { /* we can't access chrome:// urls */ }
    }

    return latestSelection.result?.selectionAsPlainText ?? null;
  }
}

export async function copyAsPlainText(selectedText:string|false|null) {
  if (selectedText) {
    console.debug("Got", selectedText)
    try {
      // chrome doesn't expose this
      if (navigator.clipboard) {
        navigator.clipboard.writeText(selectedText)
      } else {
        console.debug("Clipboard API not supported in service worker. Creating offscreen document...")
        await OffscreenCopyDocument.create()
        const message:RuntimeMessage = {
          target: "offscreen",
          type: "copy",
          info: selectedText
        }
        await chrome.runtime.sendMessage(message)
        await OffscreenCopyDocument.close()
      }

    } catch (err) {
      console.error("Failed to copy to clipboard. Error:", err)
    }
  }
}