import { RuntimeMessage } from '../types';
import { copyAsPlainText, getSelectedText } from './copyAsPlainText.mjs'
import { setContextMenuBtns } from '../settings/menus.mjs'
chrome.commands.onCommand.addListener(async command => {
  switch (command) {
    case 'copy-as-plain-text': {
      await copyAsPlainText()
      break;
    }
  }
})

chrome.runtime.onMessage.addListener(async (message: RuntimeMessage, sender, res) => {
  if (message.target !== "background") {
    return;
  }
  switch (message.type) {
    case 'get-selected': {
      res(await getSelectedText())
      break;
    }
  }
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'copyAsPlainTextContextMenu') {
    copyAsPlainText()
  }
  console.dir(info.selectionText)
})

chrome.runtime.onInstalled.addListener(details => {
  ;(async () => {
    if ((await chrome.storage.local.get("useContextMenu")).useContextMenu === 'true') {
      await setContextMenuBtns()
    }
  })();
})