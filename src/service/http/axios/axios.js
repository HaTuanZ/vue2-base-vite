import Axios, { AxiosInstance } from 'axios'
import { cloneDeep, isFunction } from 'lodash'

import { AxiosCanceler } from './axios-cancel'

/**
 * @description request method
 */
export const RequestEnum = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
}

/**
 * @description  contentType
 */
export const ContentTypeEnum = {
  // json
  JSON: 'application/json;charset=UTF-8',
  // form-data qs
  FORM_URLENCODED: 'application/x-www-form-urlencoded;charset=UTF-8',
  // form-data  upload
  FORM_DATA: 'multipart/form-data;charset=UTF-8',
}

/**
 * @description  axios module
 */
export class VAxios {
  /**
   * @private
   * @type {AxiosInstance}
   */
  _axios
  /**
   * @private
   * @readonly
   * @type {import("@/type/axios").CreateAxiosOptions}
   */
  _options

  /**
   *
   * @param {import("@/type/axios").CreateAxiosOptions} options
   */
  constructor(options) {
    this._options = options
    this._axios = Axios.create(options)
    this.setupInterceptors()
  }
  /**
   *
   * @private
   * @returns {import("@/type/axios").AxiosTransform}
   */
  getTransform() {
    const { transform } = this._options
    return transform
  }
  /**
   *
   * @private
   * @description Interceptor configuration
   */
  setupInterceptors() {
    const transform = this.getTransform()
    if (!transform) {
      return
    }
    let {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch,
    } = transform
    requestInterceptors = checkFunction(requestInterceptors)
    requestInterceptorsCatch = checkFunction(requestInterceptorsCatch)
    responseInterceptors = checkFunction(responseInterceptors)
    responseInterceptorsCatch = checkFunction(responseInterceptorsCatch)

    const axiosCanceler = new AxiosCanceler()
    this._axios.interceptors.request.use((config) => {
      // If cancel repeat request is turned on, then cancel repeat request is prohibited
      const {
        headers: { isCancelToken },
        requestOptions,
      } = config

      // const ignoreCancel =
      //   ignoreCancelToken ||
      //   requestOptions.ignoreCancelToken ||
      //   this._options.requestOptions.ignoreCancelToken

      isCancelToken && axiosCanceler.addPending(config)

      if (requestInterceptors) {
        config = requestInterceptors(config, this._options)
      }
      return config
    }, requestInterceptorsCatch)
    this._axios.interceptors.response.use((res) => {
      res && axiosCanceler.removePending(res.config)
      if (responseInterceptors) {
        res = responseInterceptors(res)
      }
      return res
    }, responseInterceptorsCatch)
  }

  /**
   *
   * @param {import("@/type/axios").AxiosRequestConfig} config
   * @param {import("@/type/axios").RequestOptions} options
   * @returns {Promise}
   */
  request(config, options) {
    let conf = Object.assign({ headers: {} }, cloneDeep(config))
    const transform = this.getTransform()

    const { requestOptions } = this._options

    const opt = Object.assign({}, requestOptions, options)

    const { beforeRequestHook, requestCatchHook, transformRequestHook } =
      transform || {}
    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt)
    }
    conf.requestOptions = opt
    return new Promise((resolve, reject) => {
      this._axios
        .request(conf)
        .then((res) => {
          if (transformRequestHook && isFunction(transformRequestHook)) {
            try {
              const ret = transformRequestHook(res, opt)
              resolve(ret)
            } catch (err) {
              reject(err || new Error('request error!'))
            }
            return
          }
          resolve(res)
        })
        .catch((e) => {
          if (requestCatchHook && isFunction(requestCatchHook)) {
            reject(requestCatchHook(e, opt))
            return
          }
          reject(e)
        })
    })
  }
  /**
   * @param {string} url
   * @param {import("@/type/axios").AxiosRequestConfig} config
   * @param {import("@/type/axios").RequestOptions} options
   * @returns {Promise}
   */
  get(url, config, options) {
    return this.request({ url, ...config, method: 'GET' }, options)
  }

  /**
   * @param {string} url
   * @param {any} data
   * @param {import("@/type/axios").AxiosRequestConfig} config
   * @param {import("@/type/axios").RequestOptions} options
   * @returns {Promise}
   */

  post(url, data, config, options) {
    return this.request({ url, data, ...config, method: 'POST' }, options)
  }

  /**
   * @param {string} url
   * @param {any} data
   * @param {import("@/type/axios").AxiosRequestConfig} config
   * @param {import("@/type/axios").RequestOptions} options
   * @returns {Promise}
   */
  put(url, data, config, options) {
    return this.request({ url, data, ...config, method: 'PUT' }, options)
  }

  /**
   * @param {string} url
   * @param {import("@/type/axios").AxiosRequestConfig} config
   * @param {import("@/type/axios").RequestOptions} options
   * @returns {Promise}
   */
  delete(url, config, options) {
    return this.request({ url, ...config, method: 'DELETE' }, options)
  }
}

function checkFunction(cb) {
  return cb && isFunction(cb) ? cb : undefined
}
