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
    })
    return true
  }
  return false;
}

export async function unsetContextMenuBtns() {
  await chrome.contextMenus?.removeAll()
}