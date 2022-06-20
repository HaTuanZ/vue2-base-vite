import store from '@/store'
import i18n from '@plugins/i18n'
const DEFAULT_STRING_ERROR_TYPE = {
  list: i18n.t('notify.error.get-data'),
  getDetail: i18n.t('notify.error.get-detail'),
  create: i18n.t('notify.error.create'),
  add: i18n.t('notify.error.add'),
  update: i18n.t('notify.error.update'),
  destroy: i18n.t('notify.error.destroy'),
  delete: i18n.t('notify.error.delete'),
}
const DEFAULT_STRING_SUCCESS_TYPE = {
  create: i18n.t('notify.success.create'),
  add: i18n.t('notify.success.add'),
  update: i18n.t('notify.success.update'),
  destroy: i18n.t('notify.success.destroy'),
  delete: i18n.t('notify.success.delete'),
}

/**
 * @async
 * @function withErrorHandling
 * @param {Function} cb callback use.
 * @param {'create'|'destroy'|'update'|'list'|'getDetail'} type type handlding.
 * @param {string|defaultHanlderError} handleError key string for error or function use for handle error.
 * @param {string | defaultHanlderSuccess} handleSuccess key string for success or function use for handle success.
 * @returns {object} data return
 */
export async function withErrorHandling(cb, type, handleError, handleSuccess) {
  try {
    const res = await cb()
    return handler(res, handleSuccess, type, {
      handle: defaultHandlerSuccess,
      message: DEFAULT_STRING_SUCCESS_TYPE[type],
    })
  } catch (error) {
    return handler(error, handleError, type, {
      handle: defaultHandlerError,
      message: DEFAULT_STRING_ERROR_TYPE[type],
    })
  }
}

function handler(data, customHandle, type, { handle, message }) {
  return !customHandle || typeof customHandle == 'string'
    ? handle(data, customHandle || message, type)
    : customHandle(data, handle.bind(null, data, message, type))
}

/**
 * @function defaultHanlderSuccess
 * @callback defaultHanlderSuccess
 * @param {object} res Response from callback
 * @param {string} messageSuccess  message show for notify.
 * @param {'create'|'destroy'|'update'|'list'|'getDetail'} type type handlding.
 * @returns {object} Response from callback
 */
export function defaultHandlerSuccess(res, messageSuccess, type) {
  if (type == 'list') {
    return res
  }
  if (!messageSuccess && res.data.message) {
    messageSuccess = res.data.message
  }
  if (messageSuccess)
    store.dispatch('notify/success', {
      message: messageSuccess,
    })
  return { isDone: true, data: res }
}

/**
 * @function defaultHanlderError
 * @callback defaultHanlderError
 * @param {object} error error from callback
 * @param {string} messageError  message show for notify.
 * @param {'create'|'destroy'|'update'|'list'|'getDetail'} type type handlding.
 * @returns {boolean} return false
 */
export function defaultHandlerError(error, messageError, type) {
  let { response } = error
  if (response && ![401, 403].includes(response.status)) {
    const { data } = response
    if (data.hint && data.hint.key) {
      store.dispatch('notify/error', {
        title: messageError,
        message: i18n.t(data.hint.key, data.hint),
      })
    } else if (response.status == 422) {
      let err = data.errors
      store.dispatch('notify/error', {
        title: messageError,
        message: 'Dữ liệu không thỏa mãn',
        // Object.keys(err)
        //   .map((key) => err[key])
        //   .flat(),
      })
    } else {
      store.dispatch(
        'notify/error',
        response.data.message
          ? {
              title: messageError,
              message: response.data.message,
            }
          : {
              message: messageError,
            }
      )
    }
  }
  return { isDone: false, error }
}
