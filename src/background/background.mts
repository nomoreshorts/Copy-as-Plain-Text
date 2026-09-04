import { RuntimeMessage } from '../types';
import { copyAsPlainText, getSelectedText, delSelectedText } from './copyAsPlainText.mjs'
import { setContextMenuBtns } from '../settings/menus.mjs'
import { AlwaysCaPTManager } from './alwaysCaPTManager.mjs'
import { getActiveTab, sendToAllTabs } from './utils.mjs'
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
    case 'copy-as-plain-text': {
      await copyAsPlainText(message.info)
      break;
    }

    // These assume that we have active tab access
    case 'active-CaPT-enable': {
      const activeTab = await getActiveTab()
      if (activeTab?.id) {
        (await AlwaysCaPTManager.retrieve()).addTab(activeTab.id)
        const message:RuntimeMessage = {
          target: 'always_CaPT',
          type: 'on',
          info: ''
        }
        try {
          // this sends to all frames
          await chrome.tabs.sendMessage(activeTab.id, message)
        } catch {}
        res(true)
      } else {
        console.error("Active tab is undefined.")
        res(false)
      }
      break;
    }
    case 'active-CaPT-disable': {
      const activeTab = await getActiveTab()
      if (activeTab?.id) {
        (await AlwaysCaPTManager.retrieve()).removeTab(activeTab.id)
        const message:RuntimeMessage = {
          target: 'always_CaPT',
          type: 'off',
          info: ''
        }
        if (!(await AlwaysCaPTManager.retrieve()).isCaPTEnabledOnTab(activeTab.id)) {
          try {
              await chrome.tabs.sendMessage(activeTab.id, message)
          } catch {}
        }
        res(true)
      } else {
        console.error("Active tab is undefined.")
        res(false)
      }
      break;
    }

    case 'all-CaPT-enable': {
      (await AlwaysCaPTManager.retrieve()).enableCaPTAllTabs()
      const message:RuntimeMessage = {
        target: 'always_CaPT',
        type: 'on',
        info: ''
      }
      sendToAllTabs(message)
      break;
    }
    case 'all-CaPT-disable': {
      (await AlwaysCaPTManager.retrieve()).disableCaPTAllTabs()
      const message:RuntimeMessage = {
        target: 'always_CaPT',
        type: 'off',
        info: ''
      }
      ;(await chrome.tabs.query({})).forEach(async tab => {
        // use isCaPTEnabledOnTab as there might be other global switches still on in the future
        if (tab.id && !(await AlwaysCaPTManager.retrieve()).isCaPTEnabledOnTab(tab.id)) {
          try {
            await chrome.tabs.sendMessage(tab.id, message)
          } catch(e) {
            console.debug('Could not send', message, `to ${tab.id}. Error:`, e)
          }
        }
      })
      break;
    }

    // includes global switches
    case 'CaPT-status': {
      const desiredTabId = sender.tab?.id ?? (await getActiveTab())?.id
      if (desiredTabId == undefined) {
        return;
      }
      res((await AlwaysCaPTManager.retrieve()).isCaPTEnabledOnTab(desiredTabId))
      break;
    }
    // excludes global switches
    case 'local-CaPT-status': {
      const desiredTabId = sender.tab?.id ?? (await getActiveTab())?.id
      if (desiredTabId == undefined) {
        return;
      }
      res((await AlwaysCaPTManager.retrieve()).isCaPTEnabledLocallyOnTab(desiredTabId))
      break;
    }
  }
  return true;
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