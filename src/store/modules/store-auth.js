const siderbarItem = []
import { User } from '@models/User/User'
import {
  asyncRoutes,
  filterAsyncRoutes,
  resetRouter,
} from '@router'
import {
  getMe,
  getToken,
  logIn,
  logOut,
  setToken,
  updateAvatar,
  updateMe,
  updatePassword,
} from '@service/http/auth'
import storage from '@service/storage'
import {
  copyByJson,
  withErrorHandling,
} from '@utils'

export default {
  namespaced: true,
  state: {
    currentUser: null,
    primaryRole: null,
    sidebarItem: [],
  },
  getters: {
    sidebarItem(state) {
      return state.sidebarItem
    },
    currentUser(state) {
      return state.currentUser || {}
    },
    isLogin(state) {
      return state.currentUser && state.currentUser.isLogin
    },
    token() {
      return getToken()
    },
    currentId: (state) => state.currentUser && state.currentUser.id,
    primaryRole: (state) => state.currentUser.primaryRole,

    isCustomer: (state) => {
      return (
        !state.currentUser ||
        !state.currentUser.isLogin ||
        state.currentUser.isCustomer
      )
    },
  },
  mutations: {
    setToken(state, token) {
      setToken(token)
    },
    removeToken(state) {
      setToken(undefined)
    },
    setPrimaryRole(state, role) {
      if (!role) return
      state.primaryRole = role
      state.currentUser = new User(state.currentUser.setPrimaryRole(role.code))
      storage.setItem('auth-current-role', role.code, {
        type: ['session', 'local'],
      })
      const router = filterAsyncRoutes(asyncRoutes, state.currentUser)
      resetRouter(router)
      setSidebarItem(state)
    },

    async setUser(state, user) {
      state.currentUser = user && user.id ? new User(user) : null
      if (!state.currentUser) return
      if (state.primaryRole) {
        state.currentUser.setPrimaryRole(state.primaryRole.code)
      } else {
        state.primaryRole = user.primaryRole
      }
      setSidebarItem(state)
    },
    logout(state) {
      state.currentUser = {}
      state.primaryRole = null
      setToken(undefined)
    },
    setUserRoute(state) {
      const router = filterAsyncRoutes(asyncRoutes, state.currentUser)
      resetRouter(router)
    },
  },
  actions: {
    async logOut({ commit, dispatch }) {
      await logOut()
      commit('logout')
      dispatch('reset', {}, { root: true })
    },
    setToken({ commit }, { access_token, expires_in }) {
      commit('setToken', access_token)
    },
    async getInfo({ commit }) {
      const res = await getMe()
      let primary_role_code = await storage.getItem('auth-current-role', {
        type: ['session', 'local'],
      })
      let role = null
      if (primary_role_code) {
        role = res.roles.find((x) => x.code == primary_role_code)
        res.primary_role = role
      }
      commit('setUser', res)
      commit('setUserRoute')
      return res
    },

    async logIn({ commit, dispatch }, data) {
      const res = await logIn(data)
      if (res.status < 300) {
        dispatch('setToken', res.data)
        await dispatch('getInfo')
        return res
      }
    },
    async update({ dispatch }, data) {
      return withErrorHandling(async () => {
        const res = await updateMe(data)
        await dispatch('getInfo')
        return res
      }, 'update')
    },
    async updatePassword(_, data) {
      return withErrorHandling(async () => {
        const res = await updatePassword(data)
        return res
      }, 'update')
    },
    async updateAvatar({ dispatch, commit }, data) {
      return withErrorHandling(async () => {
        const res = await updateAvatar(data.form)
        data.user.avatar_url = res.data.ava
        commit('setUser', data.user)
        return res
      }, 'update')
    },
    gotologOut() {
      window.location.href = '/'
    },
  },
}
function setSidebarItem(state) {
  let currentUser = state.currentUser
  state.sidebarItem = copyByJson(siderbarItem).reduce((acc, cur) => {
    let isPush = !cur.scopes || currentUser.hasPermissions(cur.scopes)
    if (isPush && cur.children) {
      cur.children = cur.children.filter((x) => {
        if (!x.scopes) return true
        return currentUser.hasPermissions(x.scopes)
      })
      isPush = cur.children.length > 0
    }
    if (isPush) {
      acc.push(cur)
    }
    return acc
  }, [])
}
