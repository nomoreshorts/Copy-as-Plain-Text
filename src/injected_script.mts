import { CaPTWindow } from './types'

export function injectedFunction() {
  const captWindow = window as unknown as CaPTWindow
  return {
    lastInteraction: captWindow.__lastActive ?? 0,
    selectionAsPlainText: getSelection()?.toString() ?? null
  };
}