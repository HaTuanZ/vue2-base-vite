import i18n from '@plugins/i18n'

import { getTitle } from '../constant'
import { middlewarePipeline } from './middleware'

/**
 * @typedef {import('@/type')}
 * @typedef {import('vue-router/types')}
 */
/**
 *
 * @param {VueRouter} router
 * @param {OptionInitializeApp} option
 */
export function initialize(router, option) {
  router.beforeEach((to, from, next) => beforeEach(to, from, next, option))
  router.afterEach((to, from) => afterEach(to, from, option))
}
/**
 *
 * @param {Route} to
 * @param {Route} from
 * @param {OptionInitializeApp} option
 */
function handLoading(to, from, option) {
  const levelLoading = to.matched.reduce((acc, cur) => {
    if (cur.meta && cur.meta.levelLoading) {
      acc = cur.meta.levelLoading
    }
    return acc
  }, 0)
  if (levelLoading > 0) {
    option.loading.setLevel(levelLoading)
  } else {
    const levelTo = to.matched.length
    const levelFrom = from.matched.length
    if (levelTo == levelFrom || Math.abs(levelTo - levelFrom) == 1) {
      option.loading.setLevel(levelTo)
    } else {
      option.loading.setLevel(1)
    }
  }
}
/**
 *
 * @param {Route} to
 * @param {Route} from
 * @param {NavigationGuardNext} next
 * @param {OptionInitializeApp} option
 */
async function beforeEach(to, from, next, option) {
  handLoading(to, from, option)
  //chua dang nhap

  const middleware = to.matched.reduce((acc, cur) => {
    if (cur.meta && cur.meta.middleware && cur.meta.middleware.length > 0) {
      acc = acc.concat(cur.meta.middleware)
    }
    return acc
  }, [])
  const context = { to, from, next }

  if (!middleware || middleware.length < 1) {
    return next()
  }

  middleware[0]({
    ...context,
    next: middlewarePipeline(context, middleware, 1),
  })
}
/**
 *
 * @param {Route} to
 * @param {Route} from
 * @param {OptionInitializeApp} option
 */
function afterEach(to, from, option) {
  const title = to.matched.reduce((acc, cur) => {
    if (cur.meta) {
      if (cur.meta.title) {
        acc = i18n.t(cur.meta.title)
      } else if (cur.meta.titleText) {
        acc = cur.meta.titleText
      }
    }
    return acc
  }, '')

  if (title) {
    document.title = `${title} - ${getTitle()}`
  } else {
    document.title = getTitle()
  }
  option.loading.reset()
}
