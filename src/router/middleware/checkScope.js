import store from '@/store'
import { getToken } from '@service/http/auth'

export async function checkScope({ next, to }) {
  const loginQuery = { name: 'login', query: { redirect: to.fullPath } }
  const currentToken = getToken()
  if (!currentToken) {
    next(loginQuery)
    return
  }
  const meta = to.matched.reduce(convertPermission, null)
  const permissions = meta.permissions
  if (!permissions || permissions.length < 1) {
    next()
    return
  }

  if (!store.getters['auth/isLogin']) {
    let res = await store.dispatch('auth/getInfo')
  }
  let isLogin = store.getters['auth/isLogin']
  let user = store.getters['auth/currentUser']
  if (isLogin) {
    if (user.hasPermissions(permissions)) {
      next()
    } else {
      next({ name: 'error.404' })
    }
  } else {
    next({ name: 'error.404' })
  }
}
function convertPermission(acc, cur) {
  if (!acc) {
    acc = {
      requiresNoAuth: false,
      requiresAuth: false,
      permissions: [],
    }
  }
  const meta = cur.meta || {}

  if (meta.scopes) {
    const diff = meta.scopes.filter((x) => !acc.permissions.find((i) => i == x))
    acc.permissions.push(...diff)
  }
  return acc
}
