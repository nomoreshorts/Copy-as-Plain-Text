import { CaPTWindow } from "../types";

// savedSelected is so that we don't accidentally delete something else if the user moved off
export async function injectedCut(savedSelected:string) {
  const CaPTWindow = window as unknown as CaPTWindow
  await CaPTWindow.handlers.delete(savedSelected)
}