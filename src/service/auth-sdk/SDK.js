import axios from 'axios'
import Vue from 'vue'
const TOKEN_STORAGE_KEY = 'user-token'
const REFRESH_TOKEN_STORAGE_KEY = 'user-refresh-token'
const TOKEN_REMEMBER_KEY = 'remember-token'
const URL_LOGIN = '/spa-login'
const URL_LOGOUT = '/logout'
const URL_REFRESH_TOKEN = '/spa-refresh-token'
const URL_VALIDATE_TOKEN = '/validate-token'
const URL_ME = '/me'
/**
 * @typedef {import('axios/index.d.ts')}
 */

export class SDK {
  constructor() {
    this._scope = ''
    this._axios = axios.create({
      baseURL: '/api',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-LOCALIZATION': 'en',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
    this._rememberToken =
      window.localStorage.getItem(TOKEN_REMEMBER_KEY) === 'true'

    this.token = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    this.refresh_token = window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)

    if (this._token) {
      this._axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${this._token}`
    }
    this.eventBus = new Vue()
    this._defaultHandle = {
      401: (error) => {
        const originalRequest = error.config
        if (!originalRequest._retry) {
          originalRequest._retry = true
          return this.getRefreshToken().then((res) => {
            originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`
            return this.request(originalRequest)
          })
        }
      },
      403: (error) => {
        this.eventBus.$emit('token-forbidden', error)
      },
    }
  }
  setLang(lang) {
    this._axios.defaults.headers['X-LOCALIZATION'] = lang || 'en'
    axios.defaults.headers['X-LOCALIZATION'] = lang || 'en'
  }
  async axiosErrorHanlder(error) {
    let { response } = error

    if (response) {
      let handle = this._defaultHandle[response.status]
      if (handle) {
        return handle(error)
      }
    }
    throw error
  }
  /**
   *
   * @param {OptionInitializeApp} option
   */
  setHandleAxios(option) {
    this._axios.interceptors.request.use((config) => {
      option.loading.setLoadingBar(true)
      return config
    })
    this._axios.interceptors.response.use(
      (response) => {
        option.loading.setLoadingBar(false)
        return response
      },
      (error) => {
        option.loading.setLoadingBar(false)

        return this.axiosErrorHanlder(error)
      }
    )
  }

  get token() {
    return this._token
  }

  set token(token) {
    this._token = token

    if (token) {
      this._axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${this._token}`

      if (this.rememberToken) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, this._token)
      }
    } else {
      delete this._axios.defaults.headers.common['Authorization']
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }

  get rememberToken() {
    return this._rememberToken
  }

  set rememberToken(enable) {
    this._rememberToken = enable
    window.localStorage.setItem(TOKEN_REMEMBER_KEY, this._rememberToken)
  }

  get refreshToken() {
    return this._refreshToken
  }

  set refreshToken(refreshToken) {
    this._refreshToken = refreshToken
    if (this.rememberToken) {
      window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, this._refreshToken)
    } else {
      window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    }
  }
  /**
   * @param {object} data
   * @param {string} data.email
   * @param {string} data.password
   * @returns {AxiosResponse<T = any>}
   */
  async logIn(data) {
    let { email: username, password } = data
    let body = { username, password }
    const res = await axios({
      method: 'post',
      url: URL_LOGIN,
      data: body,
    })
    this.token = res.data.access_token
    this.refreshToken = res.data.refresh_token

    return res
  }
  async me() {
    return this._axios.get(URL_ME).then((res) => {
      const scope = res.data.data.role.scopes
      this._scope = scope
      return res
    })
  }

  async logOut() {
    const res = this.post(URL_LOGOUT, {
      token: this.token,
    })
    this.token = undefined
    return res
  }

  /**
   * More detail <https://github.com/axios/axios>
   *
   * @param {object} options options
   * @param {string} options.url url
   * @param {string} [options.method='get'] method
   * @param {object | URLSearchParams} [options.params] params
   * @param {object | string | FormData | File | Blob | ArrayBuffer | ArrayBufferView | URLSearchParams} [options.data] Only 'PUT', 'POST', and 'PATCH'
   * @param {string} [options.baseURL]
   * @param {object} [options.headers]
   * @param {number} [options.timeout=0] default is `0` (no timeout)
   * @param {boolean} [options.withCredentials=false]
   * @param {{ username: string, password: string }} [options.auth]
   * @param {string} [options.responseType='json'] options are 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
   * @param {string} [options.responseEncoding='utf8']
   * @param {(progressEvent: ProgressEvent) => void} [options.onUploadProgress]
   * @param {(progressEvent: ProgressEvent) => void} [options.onDownloadProgress]
   * @param {number} [options.maxContentLength=2000]
   * @param {{ host: string, port: number, auth: { username: string, password: string } }} [options.proxy]
   * @param {Array.<(data: Object, headers: Object) => String>} [options.transformRequest]
   * @param {Array.<(data: String | Object) => any>} [options.transformResponse]
   * @param {CancelToken} [options.cancelToken]
   *
   * @returns {Promise<{data: object, status: number, statusText: string, headers: object, config: object, request: object}>} For more detail: <https://github.com/axios/axios#response-schema>
   */
  request(options) {
    return this._axios(options)
  }
  /**
   * More detail <https://github.com/axios/axios>
   *
   * @param {string} url string
   * @param {AxiosRequestConfig} options AxiosRequestConfig
   * @returns {object}
   */
  get(url, options) {
    return this._axios.get(url, options)
  }

  /**
   * More detail <https://github.com/axios/axios>
   *
   * @param {string} url string
   * @param {AxiosRequestConfig} options AxiosRequestConfig
   * @returns {AxiosResponse<T = any>}
   */
  post(url, options) {
    return this._axios.post(url, options)
  }

  /**
   * More detail <https://github.com/axios/axios>
   *
   * @param {string} url string
   * @param {AxiosRequestConfig} options AxiosRequestConfig
   * @returns {AxiosResponse<T = any>}
   */
  put(url, options) {
    return this._axios.put(url, options)
  }

  /**
   * More detail <https://github.com/axios/axios>
   *
   * @param {string} url string
   * @param {AxiosRequestConfig} options AxiosRequestConfig
   * @returns {AxiosResponse<T = any>}
   */
  delete(url, options) {
    return this._axios.delete(url, options)
  }

  async getRefreshToken() {
    if (!this.refreshToken) {
      this.eventBus.$emit('token-invalid')
      return
    }
    try {
      const res = await axios.post(URL_REFRESH_TOKEN, {
        refresh_token: this.refreshToken,
        scope: this._scope,
      })
      this.token = res.data.access_token
      this.refreshToken = res.data.refresh_token

      return res
    } catch (e) {
      this.token = undefined
      this.refreshToken = undefined
      this.eventBus.$emit('token-invalid', e.response.data.message || e.message)
      throw e
    }
  }
  checkToken(scopes) {
    return this._axios.get(URL_VALIDATE_TOKEN, { params: { scopes } })
  }
}
