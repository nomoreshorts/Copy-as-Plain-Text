import { CaPTWindow } from '../types'
const captWindow = window as unknown as CaPTWindow
captWindow.__lastActive = 0
window.addEventListener('pointerdown', e => {
  captWindow.__lastActive = Date.now()
})