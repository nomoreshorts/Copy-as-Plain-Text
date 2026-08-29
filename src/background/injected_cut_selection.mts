// savedSelected is so that we don't accidentally delete something else if the user moved off
export function injectedCut(savedSelected:string) {
  if (document.activeElement instanceof HTMLInputElement 
    || document.activeElement instanceof HTMLTextAreaElement) {
    const active = document.activeElement
    const start = active.selectionStart
    const end = active.selectionEnd
    if (start == null || end == null || start === end) {
      return;
    }
    const toRemove = active.value.slice(start, end + 1)
    if (toRemove !== savedSelected) {
      return;
    }
    active.value = active.value.slice(0, start) + active.value.slice(end)
    void 0
  }
}
