import { CaPTWindow } from '../types'

export async function injectedFunction() {
  const captWindow = window as unknown as CaPTWindow
  return {
    lastInteraction: captWindow.__lastActive ?? 0,
    selectionAsPlainText: await captWindow.handlers.selection() ?? null
  };
}