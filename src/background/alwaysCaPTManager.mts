export class AlwaysCaPTManager {
  private constructor(private readonly alwaysCaPTTabIds:Set<number>, private allTabsCaPTEnabled:boolean) {}
  protected static savedInstance:typeof this.prototype|Promise<typeof this.prototype>|null = null
  public static async retrieve() {
    if (this.savedInstance) {
      return this.savedInstance
    }
    // prevent race
    this.savedInstance = this.create()
    return this.create()
  }
  protected static async create() {
    let savedTabIdArray = chrome.storage.session.get("alwaysCaPTTabIds")
    let allTabsCaPTEnabled = chrome.storage.local.get("alwaysCaPTAllTabs")
    return this.savedInstance = new this(
    new Set((await savedTabIdArray).alwaysCaPTTabIds as number[]|undefined), 
    (await allTabsCaPTEnabled).alwaysCaPTAllTabs as boolean|undefined ?? false)
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