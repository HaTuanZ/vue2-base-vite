import Vue from 'vue'

import Vuex from 'vuex'

import i18n from '@plugins/i18n'
import router from '@router'

import modules from './modules'

Vue.use(Vuex)
let moduleReset = []
export default new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {
    reset({ commit }) {
      moduleReset.forEach((key) => {
        commit(`${key}/reset`)
      })
    },
    gotoLogin({ rootState }) {
      if (rootState.route.requiresAuth) {
        router.push({
          name: 'login',
          query: {
            redirect: rootState.route.path,
          },
        })
      }
    },
    copyToClipboard({ dispatch }, str) {
      if (!navigator.clipboard) {
        const el = document.createElement('textarea')
        el.value = str
        el.style.position = 'fixed'
        el.style.top = '0'
        el.style.left = '0'
        el.style.width = '2em'
        el.style.height = '2em'
        el.style.padding = 0
        el.style.border = 'none'
        el.style.outline = 'none'
        el.style.boxShadow = 'none'
        el.style.background = 'transparent'

        document.body.appendChild(el)
        el.select()
        el.setSelectionRange(0, 99999)
        document.execCommand('copy')
        document.body.removeChild(el)
      } else {
        navigator.clipboard.writeText(str)
      }
      dispatch(
        'notify/success',
        {
          message: i18n.t('notify.success.copyToClipboard'),
        },
        {
          root: true,
        }
      )
    },
  },
  modules,
})
