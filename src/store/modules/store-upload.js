import axios from 'axios'

import i18n from '@plugins/i18n'
import sdk from '@service/auth-sdk'

export default {
  namespaced: true,
  state: {
    isShowDialog: false,
    progressFiles: [],
    queue: {},
    configSend: {},
  },
  getters: {
    isShowDialog: (state) => state.isShowDialog,
    progressFiles: (state) => state.progressFiles,
    getProgressFileById: (state) => (id) => state.queue[id],
  },
  mutations: {
    showDialog(state) {
      state.isShowDialog = true
    },
    closeDialog(state) {
      state.isShowDialog = false
      state.progressFiles = []
      state.configSend = {}
    },
    setQueueUpload(state, file) {
      state.progressFiles.push(file)
      state.queue[file.id] = file
    },
    updateQueue(state, { id, queue }) {
      state.progressFiles = state.progressFiles.filter((x) => x.id != id)
      state.queue[id] = queue
      state.progressFiles.push(queue)
    },
    removeQueueUpload(state, id) {
      delete state.queue[id]
      state.progressFiles = state.progressFiles.filter((x) => x.id != id)
      if (!state.queue) {
        state.queue = {}
      }
    },
    setConfigSend(state, { id, config }) {
      state.configSend[id] = config
    },
  },
  actions: {
    // _UPLOAD_FILE
    async callUpload(
      { commit, dispatch, state },
      { url, data, option, name = 'Upload', cbWhenComplete }
    ) {
      commit('showDialog')
      const id = new Date().getTime()
      const CancelToken = axios.CancelToken
      const source = CancelToken.source()
      const file_temp = {
        id,
        name,
        isDone: false,
        isError: false,
        progress: 0,
        cancel: () => source.cancel(),
      }
      commit('setQueueUpload', file_temp)
      let progressFile = state.progressFiles.find((x) => x.id == id)
      const config = {
        method: 'post',
        url,
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
        cancelToken: source.token,
        cbWhenComplete,
        onUploadProgress: (progressEvent) => {
          progressFile.progress = (
            (progressEvent.loaded / progressEvent.total) *
            100
          ).toFixed(2)
        },
        ...option,
      }
      commit('setConfigSend', { id, config })
      await dispatch('upload', { id })
      return { id, queue: file_temp }
    },
    // _CANCEL_UPLOAD
    async cancelUpload({ state }, { id }) {
      const file = state.queue[id]
      if (file && !file.isDone && file.cancel) {
        file.cancel()
      }
    },
    // _REUPLOAD
    async reUpload({ dispatch, commit, state }, { id }) {
      const oldConfig = state.configSend[id]
      const oldFile_temp = state.progressFiles.find((x) => x.id == id)
      const CancelToken = axios.CancelToken
      const source = CancelToken.source()
      const config = {
        ...oldConfig,
        cancelToken: source.token,
      }
      const file_temp = {
        ...oldFile_temp,
        isDone: false,
        isError: false,
        progress: 0,
        cancel: () => source.cancel(),
      }
      commit('setConfigSend', { id, config })
      commit('setQueueUpload', file_temp)
      commit('updateQueue', { id, queue: file_temp })
      dispatch('upload', { id })
    },
    // _UPLOAD
    async upload({ dispatch, state, commit }, { id }) {
      const config = state.configSend[id]
      const file_temp = state.queue[id]

      try {
        const res = await sdk.request(config, { disableLoadingBar: true })
        if (config.cbWhenComplete) {
          config.cbWhenComplete(res)
        }
        return res
      } catch (error) {
        file_temp.isError = true
        if (!axios.isCancel(error) || error.code != 'ECONNABORTED') {
          if (error.response) {
            if (error.response.status != 500) {
              dispatch(
                'notify/error',
                {
                  message: 'Fail to upload',
                },
                {
                  root: true,
                }
              )
            }
            file_temp.error_message =
              error.response.data.message || i18n.t('error.500')
          }
          file_temp.error = error
        } else {
          file_temp.error_message = 'Cancel upload process'
        }
      } finally {
        file_temp.isDone = true
      }
      commit('updateQueue', { id, queue: file_temp })
    },
  },
}
