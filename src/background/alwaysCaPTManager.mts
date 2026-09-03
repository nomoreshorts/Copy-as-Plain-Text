export class AlwaysCaPTManager {
  private constructor(private readonly alwaysCaPTTabIds:Set<number>, private allTabsCaPTEnabled:boolean) {}
  public static async retrieve() {
    let savedTabIdArray = (await chrome.storage.session.get("alwaysCaPTTabIds")).alwaysCaPTTabIds as number[]|undefined
      let allTabsCaPTEnabled = (await chrome.storage.local.get("alwaysCaPTAllTabs")).alwaysCaPTAllTabs as boolean|undefined
    return new this(new Set(savedTabIdArray), allTabsCaPTEnabled ?? false)
  }
  private async saveTabIds() {
    await chrome.storage.session.set({
      "alwaysCaPTTabIds": Array.from(this.alwaysCaPTTabIds)
    })
  }
  public async enableCaPTAllTabs() {
    await chrome.storage.local.set({
      alwaysCaPTAllTabs: true
    })
    this.allTabsCaPTEnabled = true
  }
  public async disableCaPTAllTabs() {
    await chrome.storage.local.set({
      alwaysCaPTAllTabs: false
    })
    this.allTabsCaPTEnabled = false
  }
  /** Includes global switches */
  public isCaPTEnabledOnTab(id:number) {
    if (this.allTabsCaPTEnabled) {
      return true
    } else {
      return this.alwaysCaPTTabIds.has(id)
    }
  }
  /** Excludes global switches */
  public isCaPTEnabledLocallyOnTab(id:number) {
    return this.alwaysCaPTTabIds.has(id)
  }
  public addTab(id:number) {
    this.alwaysCaPTTabIds.add(id)
    this.saveTabIds()
  }
  public removeTab(id:number) {
    this.alwaysCaPTTabIds.delete(id)
    this.saveTabIds()
  }
}

chrome.tabs.onRemoved.addListener(async tabId => {
  (await AlwaysCaPTManager.retrieve()).removeTab(tabId)
})