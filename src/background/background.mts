import { RuntimeMessage } from '../types';
import { copyAsPlainText, getSelectedText } from './copyAsPlainText.mjs'
chrome.commands.onCommand.addListener(async command => {
  switch (command) {
    case 'copy-as-plain-text': {
      await copyAsPlainText()
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