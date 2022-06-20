import { getToken } from '@service/http/auth'

import store from '../store'
import Home from '@views/home.vue'

export const HomeRoute = {
  path: '/',
  name: 'home',
  component: Home
  // beforeEnter: (to, from, next) => {
  //   const token = getToken()
  //   if (!token) {
  //     next({ name: 'login' })
  //     return
  //   }

  //   store
  //     .dispatch('auth/getInfo')
  //     .then((res) => {
  //       let routeReturn = { name: 'landingPage' }
  //       let currentUser = store.state.auth.currentUser
  //       if (currentUser && currentUser.id) {
  //         let defaultRoute = currentUser.getHomeRoute()
  //         if (defaultRoute) {
  //           routeReturn = defaultRoute
  //         }
  //       }
  //       next(routeReturn)
  //     })
  //     .catch((e) => {
  //       next({ name: 'login' })
  //     })
  // },
}
