export async function requestContextMenu() {
  return chrome.permissions.request({
    permissions: [
      "contextMenus"
    ]
  })
}

async function contextMenuAllowed() {
  return chrome.permissions.contains({
    permissions: [
      "contextMenus"
    ]
  })
}

export async function setContextMenuBtns() {
  const allowed = contextMenuAllowed()
  if ((await chrome.storage.local.get("useContextMenu")).useContextMenu === 'true') {
    if (!await allowed) {
      console.error("contextMenu permission not granted when useContextMenu is true.")
      return false;
    }

    chrome.contextMenus.create({
      contexts: ["selection", "action"],
      title: "Copy as plain text",
      id: "copyAsPlainTextContextMenu"
    }, () => {
      if (chrome.runtime.lastError) {
        // lower the importance of duplicate creation errors
        if (!chrome.runtime.lastError.message?.startsWith("Cannot create item with duplicate id")) {
          console.error(chrome.runtime.lastError.message)
        } else {
          console.debug(chrome.runtime.lastError.message)
        }
      }
    })


    return true
  }
  return false;
}

export async function unsetContextMenuBtns() {
  await chrome.contextMenus?.removeAll()
}