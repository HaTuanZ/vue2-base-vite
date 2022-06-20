const delay_loading = 300;
let timeOutLoadingBar
export default {
  state: {
    loadingBar: false,
    handles: [],
    currentHandle: null,
  },
  getters: {
    loadingBar: (state) => state.loadingBar,
  },
  mutations: {
    setLoadingBar(state, loading) {
      clearTimeout(timeOutLoadingBar)
      if (loading) {
        state.loadingBar = loading
      } else {
        timeOutLoadingBar = setTimeout(() => {
          state.loadingBar = loading
        }, delay_loadingBar)
      }
    },
    setLoading(state, loading) {
      let handle = state.handles[state.handles.length - 1]
      if (
        !loading &&
        state.currentHandle &&
        handle.id != state.currentHandle.id
      ) {
        state.currentHandle.handle(loading)
      }
      if (handle) {
        handle.handle(loading)
        state.currentHandle = handle
      }
    },
    addRouteLoadingHandle(state, { id, handle }) {
      if (state.handles.some((x) => x.id === id)) {
        return
      }
      state.handles.push({ id, handle })
    },
    removeRouteLoadingHandle(state, { id }) {
      state.handles = state.handles.filter((x) => x.id != id)
      if (state.currentHandle && state.currentHandle.id == id) {
        state.currentHandle = null
      }
    },
  },
  actions: {},
}
