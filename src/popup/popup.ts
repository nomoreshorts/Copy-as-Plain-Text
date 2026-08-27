import { RuntimeMessage } from '../types'

class CopyUI {
  protected currentTabBtn = document.getElementById('current-tab')
  protected clipboardBtn = document.getElementById('clipboard')
  protected plainTextRepresentation = document.getElementById('plain-text-representation') as HTMLTextAreaElement | null
  protected copyBtn = document.getElementById('CaPT-btn') as HTMLInputElement|null
  constructor() {
    if (!this.currentTabBtn) {
      console.warn("Current tab radio not found")
    }
    if (!this.clipboardBtn) {
      console.warn("Clipboard radio not found")
    }

    this.currentTabBtn?.addEventListener('click', e => {
      if (!this.plainTextRepresentation) {
        console.warn("Plain text field not found")
        return;
      }
      this.plainTextRepresentation.value = ''
      /** @todo todo */
    })
    this.clipboardBtn?.addEventListener('click', async e => {
      if (!this.plainTextRepresentation) {
        console.warn("Plain text field not found")
        return;
      }
      this.plainTextRepresentation.value = ''
      let clipboardValue
      try {
        clipboardValue = await navigator.clipboard.readText()
      } catch {
        this.plainTextRepresentation.placeholder = "Accept the clipboard read permission prompt to use this feature."
        const promptRes = this.requestClipboardRead()
        if (await promptRes) {
          this.plainTextRepresentation.removeAttribute('placeholder')
          clipboardValue = await navigator.clipboard.readText()
        } else {
          return;
        }
      }

      this.plainTextRepresentation.value = clipboardValue
    })
  }

  private async requestClipboardRead() {
    return chrome.permissions.request({
      permissions: ["clipboardRead"]
    })
  }
}
new CopyUI()