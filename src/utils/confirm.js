import { copyByJson } from './helper'

/**
 * @type {Promise<boolean>}
 */
let confirmStore = () => Promise.resolve(true)

/**
 * @param {Promise<boolean>} confirm - confirm function
 */
export function initConfirm(confirm) {
  confirmStore = confirm
}
export function callConfirm(...args) {
  return confirmStore(...args)
}
/**
 * @async
 * @function withConfirmHandling
 * @param {'add'|'delete'|'update'} type type confirm.
 * @param {object} confirm config for confirm.
 * @param {string} confirm.title title of confirm.
 * @param {string|Array<{  confirmText?:string,title?:string,field?:{value?:string,label?:string,rules?:Function[],type:string}}>} confirm.messages message or array message of confirm.
 * @param {object} confirm.options options of confirm.
 * @param {string} [confirm.options.color=primary] color of confirm.
 * @param {number} [confirm.options.width=600] width of confirm.
 * @param {number} [confirm.options.zIndex=200] zIndex of confirm.
 * @param {object} [confirm.options.params={}] params of confirm.
 * @returns  {Promise<boolean>} the confirm of user
 */
export function withConfirmHandling(type, confirm) {
  confirm = Object.assign(copyByJson(defaultConfim), confirm)
  if (!confirm.title) {
    confirm.title = `actions.${type}`
  }
  if (!confirm.messages || confirm.messages.length == 0) {
    confirm.messages = `confirm.${type}`
  }
  return confirmStore(confirm.title, confirm.messages, confirm.options)
}
const defaultConfim = {
  title: '',
  messages: [],
  options: {
    color: 'primary',
    width: 600,
    zIndex: 200,
    params: {},
  },
}
//messages = [ {title:string}     ,    {rules:[]}]

export class ConfirmBuilder {
  /**
   * @typedef {object} ConfirmOption - creates a new type named 'ConfirmOption'
   * @property {string} [color=primary] color of confirm.
   * @property {number} [width=600] width of confirm.
   * @property {number} [zIndex=200] zIndex of confirm.
   * @property {object} [params] params of confirm.
   */
  /**
   * @typedef {object} ConfirmMessages - message need user confirm
   * @property {string} [confirmText] text need type for confirm.
   * /
  /**
   * @typedef {object} ConfirmTextMessages - message show
   * @property {string} [title] text show in confirm.
   */

  /**
   * @typedef {object} ConfirmFieldReturn - field get value return in confirm
   * @property {string} value field-value return
   * @property {string} label field-label return
   * @property {Function[]} rules field-rules return
   * @property {string} type type input of field return
   */

  /**
   * @typedef {object} ConfirmFieldReturnMessages - message show field get value return in confirm
   * @property {ConfirmFieldReturn} field field return from confirm.
   */

  /**
   * Create a confirm.
   *
   * @param {string} title title for confirm.
   * @param {string|Array<ConfirmMessages|ConfirmTextMessages|ConfirmFieldReturnMessages>} messages messages for confirm.
   * @param {ConfirmOption?} option option for confirm.
   */
  constructor(title, messages, option) {
    /**
     * title of confirm
     *
     * @type {string}
     */
    this.title = title || ''
    /**
     * messages of confirm
     *
     * @type {string|Array<ConfirmMessages|ConfirmTextMessages|ConfirmFieldReturnMessages>}
     */
    this.messages = messages || []
    /**
     * option of confirm
     *
     * @type {ConfirmOption}
     */
    this.option = Object.assign({}, defaultConfim.options, option)
  }

  /**
   *
   * @param {string} type - title of confirm
   * @returns {this} ConfirmBuilder
   */
  initByType(type) {
    if (!this.title) {
      this.title = `actions.${type}`
    }
    if (!this.messages || this.messages.length == 0) {
      this.messages = [{ trans: `confirm.${type}` }]
    }
    this.option.type = type
    return this
  }
  /**
   *
   * @param {string} title - title of confirm
   * @returns {this} ConfirmBuilder
   */
  setTitle(title) {
    this.title = title
    return this
  }
  removeMessage() {
    this.messages = []
    return this
  }
  setType(type) {
    this.option.type = type
    return this
  }

  /**
   *
   * @param {ConfirmOption} option - option of confirm
   * @returns {this} ConfirmBuilder
   */
  setOption(option) {
    this.option = Object.assign({}, this.option, option)
    return this
  }
  /**
   * add config require user confirm text before press yes
   *
   * @public
   * @param {string} confirmText - message need user confirm
   * @returns {this} ConfirmBuilder
   */
  needConfirmText(confirmText = '') {
    if (confirmText) {
      this.messages.push({ confirmText })
    }
    return this
  }
  /**
   * add cofig show field in confirm
   *
   * @public
   * @param {ConfirmFieldReturn} field - field get value return in confirm
   * @returns {this} ConfirmBuilder
   */
  addField(field) {
    if (field) {
      this.messages.push({ field })
    }
    return this
  }
  /**
   * add cofig show text in confirm
   *
   * @public
   * @param {string} title - text show in confirm
   * @returns {this} ConfirmBuilder
   */
  addMessage(title) {
    if (title) {
      this.messages.push({ trans: title })
    }
    return this
  }
  /**
   * add cofig show text in confirm
   *
   * @public
   * @param {string} title - text show in confirm
   * @returns {this} ConfirmBuilder
   */
  addText(title) {
    if (title) {
      this.messages.push({ title })
    }
    return this
  }
  /**
   * call action confirm
   *
   * @public
   * @returns {Promise<boolean|object>} - result of confirm
   */
  confirm() {
    return confirmStore(this.title, this.messages, this.option)
  }

  setApplyText(text) {
    this.option.yesText = text
    return this
  }
  setCancelText(text) {
    this.option.noText = text
    return this
  }
}
