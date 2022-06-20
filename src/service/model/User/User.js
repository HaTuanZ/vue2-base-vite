import { get } from 'lodash'

import { CAN_ACCESS } from '@constant'

import getUserIP from './getUserIP'

//ds toan bo quyen
const ROLE_PERMISSION = {
  'access:department-head': ['access:department-head', 'user-management'],
  'access:department-user': ['access:department-user'],
  'access:user': ['access:user'],
  'access:admin': [
    'access:admin',
    'user-management',
    'dashboard',
    'log-management',
    'department-management',
    'dataset-management',
    'category-management',
    'dataset-management',
    'domain-management',
    'public-user-management',
  ],
}
export class User {
  /**
   *
   * @param {Object} options
   * @param {Number} options.id
   * @param {String} [options.name]
   * @param {String} options.first_name
   * @param {String} options.last_name
   * @param {String} options.email
   * @param {String} [options.created_at]
   * @param {String} [options.updated_at]
   * @param {String} [options.avatar_url]
   * @param {Number} [options.company_id]
   * @param {Object} [options.company]
   * @param {Array.<id: String, name: String, all: Boolean>} options.roles
   */
  constructor(options) {
    const data = options || {}
    this.id = data.id
    this.name = data.name || ''
    this.first_name = data.first_name || ''
    this.last_name = data.last_name || ''

    if (!data.email) {
      getUserIP((ip) => {
        this.email = ip
      })
    } else {
      this.email = data.email
    }

    this.created_at = data.created_at
    this.center_point = data.center_point
    this.updated_at = data.updated_at
    this.username = data.username
    this.avatar_url = data.avatar_url
    this.birthday = data.birthday
    this.gender = +data.gender
    this.mobile = data.mobile
    this.roles = data.roles || []
    this.primary_role = data.primary_role
  }
  get isLogin() {
    return !!this.id
  }
  setPrimaryRole(value, field = 'code') {
    this.primary_role = this.roles.find((role) => role[field] === value)
    return this
  }
  get primaryRole() {
    return this.primary_role || this.roles[0]
  }

  get permissions() {
    let roles = this.roles
    if (this.primaryRole) {
      roles = [this.primaryRole]
    }
    return roles.reduce(
      (permissions, role) =>
        permissions.concat(
          (ROLE_PERMISSION[role.code] || []).map((x) => ({ name: x }))
        ),
      []
    )
  }
  get isCustomer() {
    return this.hasPermission('access:customer')
  }
  get isAdmin() {
    return this.roles.some((x) => x.code == 'access:admin')
  }
  //toan bo quyen
  get isSysAdmin() {
    return this.roles.some((x) => x.all)
  }

  /**
   * Update user properties
   * @param {Object} data
   */
  update(data) {
    const keys = Object.keys(data)
    keys.forEach((key) => {
      this[key] = data[key]

      if (key === 'last_name' || key === 'first_name') {
        this.name = this.first_name + ' ' + this.last_name
        this.full_name = this.name
      } else if (key === 'email') {
        if (!data[key]) {
          getUserIP((ip) => {
            this.email = ip
          })
        }
      }
    })
  }

  // #region Roles, Permissions System

  /**
   * Determine user has a role
   * @param {String} role
   */
  hasRole(role) {
    if (this.isSysAdmin) return true

    let valid = false

    for (const r of this.roles) {
      if (r.code === role) {
        valid = true
        break
      }
    }

    return valid
  }

  /**
   * Determine user has one in the roles
   * @param {String[]} roles
   */
  hasRoles(roles) {
    if (this.isSysAdmin) return true

    let valid = false

    for (const role of roles) {
      if (this.hasRole(role)) {
        valid = true
        break
      }
    }

    return valid
  }

  /**
   * Determine user has all the roles
   * @param {String[]} roles
   */
  hasAllRoles(roles) {
    if (this.isSysAdmin) return true

    if (roles.length === 0) return false

    let valid = true

    for (const role of roles) {
      if (!this.hasRole(role)) {
        valid = false
        break
      }
    }

    return valid
  }

  /**
   * Determine user has a permission
   * @param {String} permission
   */
  hasPermission(permission) {
    if (this.isSysAdmin) return true

    let valid = false

    for (const p of this.permissions) {
      if (p.name === permission) {
        valid = true
        break
      }
    }
    return valid
  }

  /**
   * Determine user has one in the permissions
   * @param {String[]} permissions
   */
  hasPermissions(permissions) {
    if (this.isSysAdmin) return true

    let valid = false

    for (const permission of permissions) {
      if (this.hasPermission(permission)) {
        valid = true
        break
      }
    }
    return valid
  }

  /**
   * Determine user has all the permissions
   * @param {String[]} permissions
   */
  hasAllPermissions(permissions = []) {
    if (this.isSysAdmin) return true

    if (permissions.length === 0) return false

    let valid = true

    for (const permission of permissions) {
      if (!this.hasPermission(permission)) {
        valid = false
        break
      }
    }
    return valid
  }
  // #endregion
  getHomeRoute() {
    if (this.primaryRole.code == 'access:admin') return { name: 'dashboard' }
    if (this.primaryRole.code == 'access:department-user')
      return { name: 'editor.main' }
    return { name: 'data-explorer' }
  }
  canAccess(permission, data) {
    let access = get(CAN_ACCESS, permission, () => false)
    return access(data, this)
  }
}
