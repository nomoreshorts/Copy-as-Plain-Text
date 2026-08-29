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
    // fire so any custom handling knows we cut
    active.dispatchEvent(new InputEvent('input', {
      inputType: "deleteByCut",
      data: ''
    }))
  } else {
    // handle contenteditable and design mode
    handleContentEditable()
  }

  // needs to be here because we're injecting this function
  function findNonEditableParent(elm:HTMLElement) {
    while (true) {
      if (!elm.isContentEditable) {
        return elm
      }
      if (elm.parentElement === null) {
        break;
      }
      elm = elm.parentElement
    }
    return null;
  }
  function handleContentEditable() {
    const selectionRange = getSelection()?.getRangeAt(0)
    if (!selectionRange) {
      return;
    }
    let editingHost:HTMLElement|null

    if (document.designMode === 'on' 
      // designMode does not casscade into shadow roots
      && selectionRange.startContainer.parentElement?.querySelector(':host') == null) {
      editingHost = document.documentElement
    } else {
      let currentElm
      if (selectionRange.commonAncestorContainer instanceof HTMLElement) {
        currentElm = selectionRange.commonAncestorContainer
      } else {
        currentElm = selectionRange.commonAncestorContainer.parentElement
      }
      // if not editable, leave.
      if (currentElm === null || !currentElm.isContentEditable) {
        return;
      }
      editingHost = findNonEditableParent(currentElm)
    }
    if (editingHost === null) {
      return;
    }

    if (getSelection()?.toString() === savedSelected) {
      selectionRange.deleteContents()
      // handle selectionRange deleteContents not removing the container for the start and end even when they are emptied
/*       function removeEmptiedContainer(container:Node) {
        if (container instanceof HTMLElement) {
          if (container.textContent === '') {
            container.remove()
          }
        } else if (container.parentElement?.textContent === '') {
          container.parentElement?.remove()
        }
      }
      removeEmptiedContainer(selectionRange.startContainer)
      removeEmptiedContainer(selectionRange.endContainer) */

      editingHost.dispatchEvent(new InputEvent('input', {
        inputType: "deleteByCut",
        data: ''
      }))
    }
  }
}