import store from '@/store'
import { getToken } from '@service/http/auth'

export async function guest({ next }) {
  const currentToken = getToken()
  if (!currentToken) {
    next()
    return
  } else {
    if (!store.getters['auth/isLogin']) {
      let res = await store.dispatch('auth/getInfo')
    }
    let user = store.getters['auth/currentUser']
    next(user.getHomeRoute())
  }
}
