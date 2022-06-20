import store from '@/store'
import { getToken } from '@service/http/auth'

export async function auth({ to, next }) {
  const loginQuery = { name: 'login', query: { redirect: to.fullPath } }

  const currentToken = getToken()
  if (!currentToken) {
    next(loginQuery)
    return
  }

  if (!store.getters['auth/isLogin']) {
    let res = await store.dispatch('auth/getInfo')
  }

  let isLogin = store.getters['auth/isLogin']
  if (isLogin) {
    next()
  } else {
    next(loginQuery)
  }
}
