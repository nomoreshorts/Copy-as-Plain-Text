import { requestContextMenu, setContextMenuBtns, unsetContextMenuBtns } from './menus.mjs'
import { SettingsItem } from './settings_item.js'

const versionTxt = document.getElementById('extension-version')
if (versionTxt) {
  versionTxt.textContent = `CaPT Version ${chrome.runtime.getVersion()}`
}

const permissionReqWarnings = document.getElementById('permission-req-warnings')
if (permissionReqWarnings) {
  const permissionReqWarningsContainer = new SettingsItem(permissionReqWarnings, {
    storageItem: {
      name: "permissionReqWarnings",
      defaultState: (await chrome.storage.local.get("permissionReqWarnings")).permissionReqWarnings === 'true'
    }
  })
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

