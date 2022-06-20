import store from '@/store'

const DEFAULT_ROUTE_CONFIG = () => {
  return {
    notify: {
      error: (error, notify) => {
        store.dispatch('notify/error', notify)
      },
    },
    loading: {
      setLevel() {
        return store.commit('loading/setLoading', true)
      },
      reset() {
        return store.commit('loading/setLoading', false)
      },
      setLoadingBar(value) {
        return store.commit('loading/setLoadingBar', value)
      },
    },
  }
}
export { DEFAULT_ROUTE_CONFIG }
