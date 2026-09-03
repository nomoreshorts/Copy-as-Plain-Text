export interface CaPTWindow extends Window {
  __lastActive:number
  __alwaysCaPTActive:Promise<boolean>|boolean|undefined
  __defaults: {
    selection: () => string|undefined,
    delete: (savedSelected:string) => void
  }
  handlers: {
    selection: () => Promise<string|undefined>|string|undefined,
    delete: (savedSelected:string) => Promise<void>|void
  }
}

export type CaPTQuery = {
  lastInteraction:number;
  selectionAsPlainText:string|null;
}

export type RuntimeMessage = {
  target:string
  type:string
  info:string
}