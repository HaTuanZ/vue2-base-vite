import { merge } from 'lodash'

import i18n from '@/plugins/i18n'
import { getToken } from '@/service/http/auth'
import store from '@/store'
import router from '@router'

import {
  isTokenInvalid,
  setDataToken,
} from '../auth'
import { isForbidden } from '../auth/index'
import {
  ContentTypeEnum,
  VAxios,
} from './axios'

const baseURL = process.env.VITE_APP_REST_API
const cache = {}
/**
 * @type {AxiosTransform}
 */
const transform = {
  transformRequestHook: (res, options) => {
    const { disableLoadingBar } = options
    if (!disableLoadingBar) store.commit('loading/setLoadingBar', false)
    return res
  },
  beforeRequestHook: (config, options) => {
    const {
      urlPrefix,
      joinPrefix,
      withLanguage,
      withCsrf,
      withoutToken,
      authenticationScheme,
      disableLoadingBar,
    } = options
    if (!disableLoadingBar) store.commit('loading/setLoadingBar', true)
    const { url } = config

    if (joinPrefix && urlPrefix) {
      if (url.trim()[0] === '/') {
        config.url = `${urlPrefix}${url}`
      } else {
        config.url = `${urlPrefix}/${url}`
      }
    }

    if (withLanguage) {
      config.headers['X-LOCALIZATION'] = i18n.locale
    }

    if (withCsrf) {
      if (!cache.csrf) {
        let csfr = document.querySelector('meta[name="csrf-token"]')
        if (csfr) cache.csrf = csfr.getAttribute('content')
      }
      config.headers['X-CSRF-TOKEN'] = cache.csrf
    }

    if (!withoutToken) {
      const token = getToken()
      config.headers.Authorization = authenticationScheme
        ? `${authenticationScheme} ${token}`
        : token
    }
    return config
  },
  requestCatchHook: (e, options) => {
    console.error(e)
    const { disableLoadingBar } = options
    if (!disableLoadingBar) store.commit('loading/setLoadingBar', false)
    if (isForbidden(e)) {
      store.dispatch('notify/error', { message: i18n.t('notify.error.403') })
    } else if (isTokenInvalid(e)) {
      setDataToken()
      if (router.currentRoute) {
        const requiresAuth = router.currentRoute.matched.some(
          (record) => record.meta.authRequired
        )
        if (requiresAuth) {
          router.push({
            name: 'login',
            query: {
              'chuyen-huong': router.currentRoute.fullPath,
            },
          })
        } else {
          router.go()
        }
      }
    }
    return e
  },
}
/**
 *
 * @param {import("@/type/axios").CreateAxiosOptions} opt
 * @returns {VAxios}
 */
function createAxios(opt) {
  return new VAxios(
    merge(
      {
        transform,
        requestOptions: {
          joinPrefix: true,
          withoutToken: false,
          withLanguage: true,
          withCsrf: false,
        },
        // timeout: 10 * 1000,
        headers: { 'Content-Type': ContentTypeEnum.JSON },
      },
      opt || {}
    )
  )
}
// See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
// authentication schemes，e.g: Bearer
// authenticationScheme: 'Bearer',
export const sdk = createAxios({
  baseURL: baseURL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': ContentTypeEnum.JSON,
    Accept: ContentTypeEnum.JSON,
  },
  withCredentials: true,
  requestOptions: { urlPrefix: 'api', authenticationScheme: 'Bearer' },
})
