import Vue from 'vue'

import i18n from '@plugins/i18n'

const defaultConfig = {
  duration: 2000,
  speed: 300,
  max: 4,
  ignoreDuplicates: true,
}
export default {
  namespaced: true,
  actions: {
    success(
      store,
      { message, title = i18n.t('notify.success.title'), options }
    ) {
      Vue.notify({
        group: 'notify',
        title,
        type: 'success',
        text: message,
        ...defaultConfig,
        ...options,
      })
    },
    warning(
      store,
      { message, title = i18n.t('notify.warning.title'), options }
    ) {
      Vue.notify({
        group: 'notify',
        title,
        type: 'warn',
        text: message,
        ...defaultConfig,
        ...options,
      })
    },
    error(store, { message, title = i18n.t('notify.error.title'), options }) {
      Vue.notify({
        group: 'notify',
        title,
        type: 'error',
        text: message,
        ...defaultConfig,
        ...options,
      })
    },
    progressStart(store, { message, title }) {
      Vue.notify({
        group: 'progress',
        type: 'text-light bg-dark',
        title,
        text: message,
        duration: 1500,
      })
    },
    progressStop() {
      Vue.notify({
        group: 'progress',
        clean: true,
      })
    },
  },
}
