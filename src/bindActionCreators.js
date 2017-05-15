import warning from './utils/warning'

function bindActionCreator(actionCreator, dispatch) {
  return (...args) => dispatch(actionCreator(...args))
}

/**
 * 这个函数生成dispath触发action的函数，接受两个参数
 * 
 *
 * @param {Function|Object} actionCreators actionCreator组成的Object,也可以是单一的actionCreate.
 *
 * @param {Function} dispatch
 *
 * @returns {Function|Object} 返回dispath函数
 */
export default function bindActionCreators(actionCreators, dispatch) {
  // 是一个函数，直接返回一个 bindActionCreator 函数，这个函数调用 dispatch 触发 action
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(
      `bindActionCreators expected an object or a function, instead received ${actionCreators === null ? 'null' : typeof actionCreators}. ` +
      `Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`
    )
  }

  const keys = Object.keys(actionCreators)
  const boundActionCreators = {}
  // 遍历对象，然后对每个遍历项的 actionCreator 生成函数，将函数按照原来的 key 值放到一个对象中，最后返回这个对象
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const actionCreator = actionCreators[key]
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    } else {
      warning(`bindActionCreators expected a function actionCreator for key '${key}', instead received type '${typeof actionCreator}'.`)
    }
  }
  return boundActionCreators
}
