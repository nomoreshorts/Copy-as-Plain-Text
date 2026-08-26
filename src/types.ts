export interface CaPTWindow extends Window {
  __lastActive:number
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