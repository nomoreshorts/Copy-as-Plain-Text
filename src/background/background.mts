import { copyAsPlainText } from './copyAsPlainText.mjs'
chrome.commands.onCommand.addListener(async command => {
  switch (command) {
    case 'copy-as-plain-text': {
      await copyAsPlainText()
      break;
    }
  }
})