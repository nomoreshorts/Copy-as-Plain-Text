import { requestContextMenu, setContextMenuBtns, unsetContextMenuBtns } from './menus.mjs'
import { SettingsItem } from './settings_item.js'

const versionTxt = document.getElementById('extension-version')
if (versionTxt) {
  versionTxt.textContent = `CaPT Version ${chrome.runtime.getVersion()}`
}

const contextMenuSettingContainer = document.getElementById('context-menu')
if (contextMenuSettingContainer) {
  const contextMenuSettingItem = new SettingsItem(contextMenuSettingContainer, {
    storageItem: {
      name: "useContextMenu",
      defaultState: (await chrome.storage.local.get("useContextMenu")).useContextMenu === 'true'
    },
    selectedCallback: async () => {
      if (await requestContextMenu()) {
        await setContextMenuBtns()
      } else {
        contextMenuSettingItem.checked = false
      }
    },
    unselectedCallback: async () => {
      await unsetContextMenuBtns()
    }
  })
}

