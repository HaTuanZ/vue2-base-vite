import axios from 'axios'
import { isNil } from 'lodash'

import { sdk } from '../axios'

axios.defaults.withCredentials = true
const TOKEN_STORAGE_KEY = 'user-token'
const REFRESH_TOKEN_STORAGE_KEY = 'user-refresh-token'
const TOKEN_REMEMBER_KEY = 'remember-token'
const URL_LOGIN = '/login'
const URL_LOGOUT = '/logout'
const URL_REFRESH_TOKEN = '/spa-refresh-token'
const URL_VALIDATE_TOKEN = '/check'
const URL_ME = '/me'
const auth = {
  token: null,
  remember_token: true,
  refresh_token: null,
  scope: [],
}
const meAuth = { promise: null, data: null }
export function getToken() {
  if (!auth.token) {
    initData()
  }
  return auth.token
}
export function setToken(token) {
  auth.token = token
  if (auth.remember_token && token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}
export function getRefreshToken() {
  return auth.refresh_token
}
export function setRefreshToken(refresh_token) {
  auth.refresh_token = refresh_token
  if (auth.remember_token && refresh_token) {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refresh_token)
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  }
}
export function setRememberToken(enable) {
  auth.remember_token = enable
  window.localStorage.setItem(TOKEN_REMEMBER_KEY, enable)
}

export function initData(default_remember = true) {
  const remember_token = window.localStorage.getItem(TOKEN_REMEMBER_KEY)
  if (default_remember && isNil(remember_token)) {
    setRememberToken(true)
    auth.remember_token = true
  } else {
    auth.remember_token = !!remember_token
  }
  if (auth.remember_token) {
    auth.token = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    auth.refresh_token = window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
  }
}
export function setDataToken(data = {}) {
  setToken(data.access_token)
  setRefreshToken(data.refresh_token)
}
export async function logIn(data) {
  await axios.get('/sanctum/csrf-cookie')
  let { username, password } = data
  const res = await sdk.post(
    URL_LOGIN,
    { email: username, password },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  )
  let data_return = { access_token: true, refresh_token: null }
  setDataToken(data_return)
  await getMe()
  return { status: 204, data: data_return }
}

export async function logOut() {
  await sdk.post(URL_LOGOUT)
  setDataToken()
}
export async function getMe() {
  if (meAuth.data) return meAuth.data
  if (!meAuth.promise) {
    meAuth.promise = sdk.get(URL_ME).then((res) => {
      meAuth.promise = null
      meAuth.data = res.data.user
      return meAuth.data
    })
  }

  return meAuth.promise
}
export function updateMe(data) {
  return sdk.post(`/me`, data).then((res) => {
    meAuth.data = Object.assign(meAuth.data, res.data.data)
    return res
  })
}
export function updatePassword(data) {
  return sdk.put(`/me/password`, data)
}
export function updateAvatar(data) {
  return sdk.post(`/me/avatar`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function getNewToken() {
  if (!auth.refresh_token) {
    return
  }
  try {
    const res = await sdk.post(URL_REFRESH_TOKEN, {
      refresh_token: auth.refresh_token,
      scope: auth.scope,
    })
    setDataToken(res.data)
    return res
  } catch (error) {
    setDataToken()
    throw error
  }
}

export function checkToken(scopes) {
  return sdk.get(URL_VALIDATE_TOKEN, { params: { scopes } })
}

let storeValidScopes = {}
let resetScopeValid
export async function checkUser(scopes) {
  if (!scopes || scopes.length == 0) {
    return true
  }
  try {
    if (isNil(storeValidScopes[scopes])) {
      const res = await checkToken(scopes)
      if (res.status < 300) {
        storeValidScopes[scopes] = res.data.isValid
        return res.data.isValid
      }
    } else {
      clearTimeout(resetScopeValid)
      resetScopeValid = setTimeout(function() {
        storeValidScopes[scopes] = null
      }, 1000 * 60 * 10)
      return storeValidScopes[scopes]
    }
    return false
  } catch (error) {
    if (error.response && [403].includes(error.response.status)) {
      storeValidScopes[scopes] = false
    }
    throw error
  }
}
export function isTokenInvalid(e) {
  return (
    e.response &&
    (e.response.status === 401 ||
      e.response.data.code === 'token_invalid' ||
      e.response.data.message === 'Unauthenticated.' ||
      e.response.data.code === 'token_absent')
  )
}
export function isForbidden(e) {
  return (
    e.response &&
    (e.response.status === 403 || e.response.data.code === 'forbidden')
  )
}
