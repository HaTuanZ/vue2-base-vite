import Vue from 'vue'

import VueRouter from 'vue-router'

import { DEFAULT_ROUTE_CONFIG } from '@constant/_config_router'

import { initialize } from './initialize'
import { asyncRoutes } from './route-async'
import {
  constantRoutes,
  Wildcard404,
} from './route-constant'
import { HomeRoute } from './route-home'

Vue.use(VueRouter)
const createRouter = (routes = []) => {
  routes = [HomeRoute, ...constantRoutes, ...routes, Wildcard404]
  const router = new VueRouter({
    mode: 'history',
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        return { x: 0, y: 0 }
      }
    },
    routes,
  })
  initialize(router, DEFAULT_ROUTE_CONFIG())
  return router
}

const router = createRouter(asyncRoutes)

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter(routes) {
  const newRouter = createRouter(routes)
  router.matcher = newRouter.matcher // reset router
}

export default router

export function filterAsyncRoutes(routes, user) {
  const res = []
  routes.forEach((route) => {
    const tmp = { ...route }
    let requirePermissions = []
    if (route.meta && tmp.meta.scopes && tmp.meta.scopes.length > 0)
      requirePermissions = tmp.meta.scopes || []
    if (
      requirePermissions.length == 0 ||
      (user && user.hasPermissions(requirePermissions))
    ) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, user)
      }
      res.push(tmp)
    }
  })
  return res
}

export * from './route-async'
