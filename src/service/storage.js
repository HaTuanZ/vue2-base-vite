import localForage from 'localforage'

const ONEDAYMS = 1 * 24 * 60 * 60 * 1000
const DEFAULT_OPTION = {
  expires: 1,
  key: 'default',
  type: '',
}
const CustomSessionStorage = {
  getItem: (key) => {
    return JSON.parse(sessionStorage.getItem(key))
  },
  setItem: (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value))
  },
  removeItem: (key) => {
    sessionStorage.removeItem(key)
  },
}
function MultiStorage(types) {
  let storages = types.map((type) => getStorage(type))
  return {
    getItem: (key) => {
      let res = null
      for (const storage of storages) {
        res = storage.getItem(key)
        if (res) {
          break
        }
      }
      return res
    },
    setItem: (key, value) => {
      storages.forEach((storage) => {
        storage.setItem(key, value)
      })
    },
    removeItem: (key) => {
      storages.forEach((storage) => {
        storage.removeItem(key)
      })
    },
  }
}

function getStorage(type) {
  if (Array.isArray(type)) {
    return MultiStorage(type)
  }
  switch (type) {
    case 'session':
      return CustomSessionStorage
    default:
      return localForage
  }
}
export class Storage {
  async getItem(key, option = {}) {
    key = `storage_${key}`
    const item = await getStorage(option.type).getItem(key)
    if (!item) {
      return null
    }
    const now = new Date()
    if (now.getTime() > item.expiry) {
      this.removeItem(key, option)
      return null
    }
    return item.value
  }
  async setItem(key, value, option = DEFAULT_OPTION) {
    key = `storage_${key}`
    if (option && option.key) {
      if (!this._lastKeyStorage[option.key])
        this._lastKeyStorage[option.key] = []
      if (this._lastKeyStorage[option.key].length > 2) {
        this.removeItem(this._lastKeyStorage[option.key][0], option)
        this._lastKeyStorage[option.key].splice(0, 1)
      }
      this._lastKeyStorage[option.key].push(key)
    }
    option = Object.assign({}, DEFAULT_OPTION, option)
    const now = new Date()

    const item = {
      value: value,
      expiry: now.getTime() + option.expires * ONEDAYMS,
    }
    return getStorage(option.type).setItem(key, item)
  }
  removeItem(key, option) {
    key = `storage_${key}`
    return getStorage(option.type).removeItem(key)
  }
  async removeAll(keyRemove = '', option) {
    const keys = await getStorage(option.type).keys()
    const regex = new RegExp(/^storage_/)
    for (const key of keys) {
      if (key.match(regex) && key.includes(keyRemove)) {
        getStorage(option.type).removeItem(key)
      }
    }
  }
  async handleGetDataStorage(key, cb, option) {
    let items = await this.getItem(key, option)
    if (items) {
      return items
    }
    const data = await cb()

    this.setItem(key, data, option)
    return data
  }
  constructor() {
    this._lastKeyStorage = {}
  }
}
export default new Storage()
