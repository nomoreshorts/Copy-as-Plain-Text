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
    if (!this.copyBtn) {
      console.warn("Copy button not found")
    }
    this.getPlainTextFromSelection()

    this.currentTabBtn?.addEventListener('click', this.getPlainTextFromSelection.bind(this))
    this.clipboardBtn?.addEventListener('click', this.getPlainTextFromClipboard.bind(this))
    this.copyBtn?.addEventListener('click', async e => {
      e.preventDefault()
      if (!this.plainTextRepresentation || this.plainTextRepresentation.value === '') {
        return;
      }
      await navigator.clipboard.writeText(this.plainTextRepresentation.value)
    })
  }
  private async getPlainTextFromSelection() {
    if (!this.plainTextRepresentation) {
      console.warn("Plain text field not found")
      return;
    }
    this.plainTextRepresentation.value = ''
    const getSelectionMsg:RuntimeMessage = {
      target: "background",
      type: "get-selected",
      info: ""
    }

    const res = await chrome.runtime.sendMessage(getSelectionMsg) as string|null|false
    if (res === false) {
      this.plainTextRepresentation.placeholder = "Cannot access current URL"
    } else if (res === null || res === '') {
      this.plainTextRepresentation.placeholder = "(No text selected)"
    } else {
      this.plainTextRepresentation.value = res
    }
  }

  private async getPlainTextFromClipboard() {
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
  }

  private async requestClipboardRead() {
    return chrome.permissions.request({
      permissions: ["clipboardRead"]
    })
  }
}
new CopyUI()