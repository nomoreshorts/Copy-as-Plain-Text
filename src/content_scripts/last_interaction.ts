import { CaPTWindow } from '../types'
const captWindow = window as unknown as CaPTWindow
captWindow.__lastActive = 0
window.addEventListener('pointerdown', e => {
  // we need this to know which was the last active frame and thus which frame to get selection from.
  captWindow.__lastActive = Date.now()
})