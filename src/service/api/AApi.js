import { clone } from 'lodash'

import AuthSdk from '@service/auth-sdk'
import storage from '@service/storage.js'
import { withErrorHandling } from '@utils/error-handling'
import {
  JsonToFormData,
  JsonToFormDataV2,
} from '@utils/JsonToFormData'

/**
 * @typedef {import('@/type')}
 */
/**
 * @type {OptionApi}
 */
const DEFAULT_OPTION = {
  only: ['list', 'getDetail', 'create', 'update', 'destroy'],
  isConvertFormData: false,
  useConvertv2: false,
  convertData: null,
  url: '',
}
const DEFAULT_METHOD = {
  list(params, option = {}) {
    return this.sdk.request({
      url: `${this.url}`,
      params,
      ...option,
    })
  },
  getDetail: {
    request(id, option = {}) {
      return this.sdk
        .request({
          method: 'get',
          url: `${this.url}/${id}`,
          ...option,
        })
        .then((res) => res.data)
    },
    type: 'list',
  },
  async create(data, option = {}) {
    data = this.convertData(data, 'create')
    const res = await this.sdk.request({
      method: 'post',
      url: `${this.url}`,
      data,
      ...option,
    })
    return res.data.data
  },
  async update(id, data, option = {}) {
    if (this.option.isConvertFormData) {
      data = this.convertData({ ...data, _method: 'patch' }, 'update')
      const res = await this.sdk.request({
        method: 'post',
        url: `${this.url}/${id}`,
        data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...option,
      })
      return res.data.data
    } else {
      data = this.convertData(data, 'update')
      const res = await this.sdk.request({
        method: 'put',
        url: `${this.url}/${id}`,
        data: data,
        ...option,
      })
      return res.data.data
    }
  },
  async destroy(id, option = {}) {
    const res = await this.sdk.request({
      method: 'delete',
      url: `${this.url}/${id}`,
      ...option,
    })
    return res.data
  },
}
export class Api {
  /**
   * class handle error, store local for api
   *
   * @param {OptionApi} option option for api
   * @param {OtherApi} otherApi add more api
   * @param {import("axios").AxiosInstance} sdk skd handle for request
   */
  constructor(option = DEFAULT_OPTION, otherApi = {}, sdk = AuthSdk) {
    this.updateOption(option)
    this.sdk = sdk || AuthSdk
    this._url = option.url
    this._wrapConvertData()
    this._wrapCallWithErrorHandle(otherApi)
  }
  getUrl() {
    return this._url
  }
  setUrl(url) {
    this._url = url
  }
  getSdk() {
    return this.sdk
  }
  /**
   *
   * @param {OptionApi} option option
   * @returns {this} api instance
   */
  updateOption(option) {
    this.option = Object.assign(
      {},
      clone(DEFAULT_OPTION),
      this.option || {},
      option
    )
    this.url = option.url
    this._wrapConvertData()
    return this
  }
  /**
   *
   * @param {OtherApi} otherApi other api
   * @returns {this} api instance
   */
  addOtherApi(otherApi) {
    this._wrapCallWithErrorHandle(otherApi, false)
    return this
  }
  /**
   * @returns {this} Api instance
   */
  clone() {
    return clone(this)
  }
  _wrapConvertData() {
    let defaultConvert = (data) => data
    if (this.option.isConvertFormData)
      defaultConvert = (data) => {
        return this.option.useConvertv2
          ? JsonToFormDataV2(data)
          : JsonToFormData(data)
      }
    this.convertData = this.option.convertData || defaultConvert
  }
  /**
   * @param {OtherApi} otherApi other api
   * @param {boolean} isCheckOnly is check api in only option
   */
  _wrapCallWithErrorHandle(otherApi = {}, isCheckOnly = true) {
    const methods = isCheckOnly
      ? [...new Set(this.option.only.concat(Object.keys(otherApi)))]
      : Object.keys(otherApi)
    for (let i = 0, len = methods.length; i < len; i++) {
      const nameMethod = methods[i]
      let { type, request, option, storage } = this._getMethod(
        otherApi[nameMethod],
        nameMethod
      )
      if (!request) continue
      if (storage.key) {
        request = callWithStorageHandle(this, request, storage)
      }
      this[nameMethod] = callWithErrorHandle(this, type, request, option)
    }
  }

  _getMethod(method, nameMethod = '') {
    let other = method || DEFAULT_METHOD[nameMethod]
    if (!other.request) {
      other = {
        request: other,
      }
    }
    return Object.assign(
      {
        request: null,
        option: {},
        type: 'list',
        storage: {},
      },
      {
        type: nameMethod,
      },
      other
    )
  }
}

function callWithErrorHandle(instance, type, method, option = {}) {
  return function () {
    const _args = arguments
    return withErrorHandling(
      method.bind(instance, ..._args),
      type,
      option.handleError,
      option.handleSuccess
    )
  }
}
function callWithStorageHandle(instance, method, option = {}) {
  return function () {
    const _args = arguments
    return storage.handleGetDataStorage(
      option.key(..._args),
      method.bind(instance, ..._args),
      option
    )
  }
}
