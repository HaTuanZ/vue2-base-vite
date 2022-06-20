import page from '@layouts/page.vue'

import {
  auth,
  checkScope,
  guest,
} from './middleware'

function callLazyLoad(view) {
  /* @vite-ignore */
  return () => import(`../views/${view}.vue`)
}

export class RedirectRouter {
  constructor(path, redirect, name) {
    this.path = path
    this.redirect = redirect
    this.name = name
  }
  withoutName() {
    this.name = undefined
    this.isNoName = true
    return this
  }
  withRedirect(cb) {
    this.redirect = cb
    return this
  }
  withPath(path) {
    this.path = path
    return this
  }
  withName(name) {
    this.name = name
    return this
  }
}
export class Route {
  constructor(path, component, { lazyload } = { lazyload: false }) {
    this.path = path

    this.component =
      lazyload || typeof component == 'string'
        ? callLazyLoad(component)
        : component
    this.meta = {
      middleware: [],
    }
    this.children = []
  }
  static withPageLayout(path, option) {
    return new Route(path, page, option)
  }
  static withPath(...args) {
    return new Route(...args)
  }
  static redirect(path, redirect, name) {
    return new RedirectRouter(path, redirect, name)
  }
  withName(name) {
    this.name = name
    return this
  }
  withOption(option) {
    Object.assign(this, option)
    return this
  }

  onBeforeEnter(handler) {
    this.beforeEnter = handler
    return this
  }
  addChild(child) {
    this.children.push(child)
    return this
  }
  withProps(props = true) {
    this.props = props
    return this
  }
  withBeforeEnter(cb) {
    if (cb) this.beforeEnter = cb
    return this
  }
  requireHasAnyInScopes(scopes = []) {
    if (typeof scopes == 'string') {
      scopes = scopes.split(',')
    }
    this.meta.scopes = scopes
    this.withMiddleware([checkScope])
    return this
  }
  withNoAuth() {
    this.withMiddleware([guest])
    return this
  }
  withAuth() {
    this.withMiddleware([auth])
    return this
  }
  withChildren(children) {
    this.children = children
    return this
  }
  addChildren(children) {
    if (!Array.isArray(children)) children = arguments
    this.children.push(...children)
    return this
  }
  withTitle(title) {
    this.meta.title = title
    return this
  }
  withTitleText(title) {
    this.meta.titleText = title
    return this
  }
  withoutName() {
    this.name = undefined
    this.isNoName = true
    return this
  }
  withParent(parent) {
    this.meta.breadcrumb = Object.assign({}, this.meta.breadcrumb, {
      parent,
    })
    return this
  }
  withMiddleware(middleware) {
    this.meta.middleware = middleware
    return this
  }
  addMiddleware(middleware) {
    this.meta.middleware.push(middleware)
    return this
  }
  /**
   *
   * @param {{
   * namespace: string,
   * title: string,
   * }} options
   * @param {Route[]} routes
   * @returns {Route[]}
   */
  static group(options, routes) {
    return replaceOption(routes, options)
  }
}
function replaceOption(routes, options = {}) {
  routes.forEach((route) => {
    if (options.namespace && !route.isNoName) {
      route.name = `${options.namespace}${route.name ? '.' + route.name : ''}`
    }
    if (options.prefix) {
      if (route.path) {
        route.path = `${options.prefix}/${route.path}`
      } else {
        route.path = `${options.prefix}`
      }
    }
    if (options.title && !route.meta.title) {
      route.withTitle(options.title)
    }
    if (route.children && route.children.length > 0) {
      route.children = replaceOption(route.children, options)
    }
  })
  return routes
}
function recursive(routes = [], cb = (route) => route) {
  routes.forEach((route) => {
    route = cb(route)
    if (route.children && route.children.length > 0) {
      route.children = recursive(route.children, cb)
    }
  })
  return routes
}
export class GroupRoute {
  /**
   * This callback type is called `groupCallback` and is displayed as a global symbol.
   *
   * @callback groupCallback
   * @param {GroupRoute} group
   * @returns {GroupRoute}
   */
  /**
   * @param {Route[]} routes
   * @param  {groupCallback} cb - The callback that handles the response
   * @returns {Route[]} routes
   */
  static create(
    routes = [],
    cb = (group) => {
      return group.getRoutes()
    }
  ) {
    let group = new GroupRoute(routes)
    if (cb) {
      group = cb(group) || group
    }
    return group.getRoutes()
  }
  routes = []
  cbs = []
  /**
   *
   * @param {Route[]} routes
   */
  constructor(routes = []) {
    this.routes = routes
  }
  prepareRouters() {
    if (this.cbs && this.cbs.length > 0)
      this.routes = recursive(this.routes, (route) => {
        this.cbs.forEach((cb) => {
          route = cb(route)
        })
        return route
      })
    return this
  }
  getRoutes() {
    this.prepareRouters()
    return this.routes
  }
  withPrefix(prefix) {
    if (prefix) {
      this.cbs.push((route) => {
        if (prefix) {
          if (route.path) {
            route.path = `${prefix}/${route.path}`
          } else {
            route.path = `${prefix}`
          }
        }
        return route
      })
    }
    return this
  }
  withNamespace(namespace) {
    if (namespace) {
      this.cbs.push((route) => {
        if (namespace && !route.isNoName) {
          route.name = `${namespace}${route.name ? '.' + route.name : ''}`
        }
        return route
      })
    }
    return this
  }
  withTitle(title) {
    if (title) {
      this.cbs.push((route) => {
        if (!route.meta.title) {
          route.withTitle(title)
        }
        return route
      })
    }
    return this
  }
  requireHasAnyInScopes(scopes) {
    if (scopes && scopes.length > 0) {
      this.cbs.push((route) => {
        route.requireHasAnyInScopes(scopes)
        return route
      })
    }
    return this
  }
}
