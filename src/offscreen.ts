import { RuntimeMessage } from './types'
chrome.runtime.onMessage.addListener((msg, sender,sendResponse) => {
  const message = msg as RuntimeMessage
  if (message.target !== 'offscreen') {
    return;
  }
  switch (message.type) {
    case 'copy': {
      const textArea = document.createElement('textarea')

      textArea.value = message.info
      document.body.append(textArea)

      textArea.focus()
      textArea.select()
      sendResponse(document.execCommand('copy'))
      textArea.remove()
      break;
    }
  }
})