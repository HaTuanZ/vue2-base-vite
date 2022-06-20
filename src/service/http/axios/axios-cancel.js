import { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { isFunction } from 'lodash'

// Used to store the identification and cancellation function of each request
let pendingMap = new Map()

export const getPendingUrl = (config) => {
  if (config.requestOptions) {
    const { makeIdCancel } = config.requestOptions
    if (makeIdCancel && isFunction(makeIdCancel)) return makeIdCancel(config)
  }
  return [config.method, config.url].join('&')
}

export class AxiosCanceler {
  /**
   * Add request
   *
   * @param {AxiosRequestConfig} config
   */
  addPending(config) {
    this.removePending(config)
    const url = getPendingUrl(config)
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken((cancel) => {
        if (!pendingMap.has(url)) {
          // If there is no current request in pending, add it
          pendingMap.set(url, cancel)
        }
      })
  }

  /**
   * @description Clear all pending
   */
  removeAllPending() {
    pendingMap.forEach((cancel) => {
      cancel && isFunction(cancel) && cancel()
    })
    pendingMap.clear()
  }

  /**
   * Removal request
   *
   * @param {AxiosRequestConfig} config
   */
  removePending(config) {
    const url = getPendingUrl(config)

    if (pendingMap.has(url)) {
      // If there is a current request identifier in pending,
      // the current request needs to be cancelled and removed
      const cancel = pendingMap.get(url)
      cancel && cancel(url)
      pendingMap.delete(url)
    }
  }

  /**
   * @description reset
   */
  reset() {
    pendingMap = new Map()
  }
}
