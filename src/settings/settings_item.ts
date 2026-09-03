type SettingsItemOptions = {
  selectedCallback?:() => void
  unselectedCallback?: () => void
  storageItem?: {
    name?:string
    defaultState:boolean
  }
}

export class SettingsItem {
  protected text:HTMLParagraphElement|null
  protected checkbox:HTMLInputElement|null
  constructor(protected container:HTMLElement, options:SettingsItemOptions) {
    this.text = container.getElementsByTagName('p')[0] ?? null

    this.checkbox = container.querySelector('input[type="checkbox"]')
    if (this.checkbox && options.storageItem) {
      this.checkbox.checked = options.storageItem?.defaultState
    }
    this.checkbox?.addEventListener('change', async e => {
      if (this.checkbox?.checked) {
        if (options.storageItem?.name) {
          await chrome.storage.local.set({
            [options.storageItem.name]: "true"
          })
        }
        if (options.selectedCallback) {
          options.selectedCallback()
        }
      } else {
        if (options.storageItem?.name) {
          await chrome.storage.local.set({
            [options.storageItem.name]: "false"
          })
        }
        if (options.unselectedCallback) {
          options.unselectedCallback()
        }
      }
    })
  }
  get checked() {
    if (!this.checkbox) {
      console.error("this.checkbox not found. checked() call defaulting to false.")
      return false;
    }
    return this.checkbox.checked
  }
  set checked(checkStatus:boolean) {
    if (this.checkbox) {
      this.checkbox.checked = checkStatus
    }
  }
}