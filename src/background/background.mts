import { RuntimeMessage } from '../types';
import { copyAsPlainText, getSelectedText, delSelectedText } from './copyAsPlainText.mjs'
import { setContextMenuBtns } from '../settings/menus.mjs'
chrome.commands.onCommand.addListener(async command => {
  switch (command) {
    case 'copy-as-plain-text': {
      await copyAsPlainText(await getSelectedText())
      break;
    }
    case 'cut-as-plain-text': {
      await copyAsPlainText(await delSelectedText())
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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'copyAsPlainTextContextMenu') {
    copyAsPlainText(await getSelectedText())
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