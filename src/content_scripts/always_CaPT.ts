import { CaPTWindow, RuntimeMessage } from '../types'
{
  const captWindow = window as unknown as CaPTWindow

  chrome.runtime.onMessage.addListener((message:RuntimeMessage, sender, res) => {
    if (message.target !== 'always_CaPT') {
      return;
    }
    switch (message.type) {
      case 'on': {
        captWindow.__alwaysCaPTActive = true
        break;
      }
      case 'off': {
        captWindow.__alwaysCaPTActive = false
        break;
      }
    }
  })
  
  if (captWindow.__alwaysCaPTActive == undefined) {
    captWindow.__alwaysCaPTActive = new Promise(async res => {
      const mesage:RuntimeMessage = {
        target: "background",
        type: "CaPT-status",
        info: ""
      }
      res(await chrome.runtime.sendMessage(mesage))
    })
  }

  async function copy(toCopy:string) {
    const message:RuntimeMessage = {
      target: 'background',
      type: 'copy-as-plain-text',
      info: toCopy
    }
    chrome.runtime.sendMessage(message)
  }
  window.addEventListener('copy', async e => {
    if (await captWindow.__alwaysCaPTActive) {
      const selectedAsPlain = getSelection()?.toString() ?? null
      if (!(selectedAsPlain === null || selectedAsPlain === '')) {
        e.preventDefault()
        e.stopImmediatePropagation()
        copy(selectedAsPlain)
        // e.clipboardData?.setData('text/plain', selectedAsPlain) <- doesn't seem to work on Google for whatever reason...
      }
    }
  })
  window.addEventListener('cut', async e => {
    if (await captWindow.__alwaysCaPTActive) {
      const selectedAsPlain = getSelection()?.toString() ?? null
      if (!(selectedAsPlain === null || selectedAsPlain === '')) {
        e.preventDefault()
        e.stopImmediatePropagation()
        copy(selectedAsPlain)
        await captWindow.handlers.delete(selectedAsPlain)
      }
    }
  })
}
