import isPlainObject from 'lodash/isPlainObject' //判断一个对象是否为纯粹的
/**
 * sysbol-observable github:https://github.com/tc39/proposal-observable
 * 
 */
import $$observable from 'symbol-observable'

//被redux保留的私有action类型
export const ActionTypes = {
  INIT: '@@redux/INIT'
}

/**
 * 创建一个Redux store管理state状态.
 * 改变store唯一方法是调用dispatch方法
 *
 * store在app里应该是单一的，使用combineReducers可以将若干个reducers合并成为一个单一的reducer
 *
 * @param {Function} reducer 一个返回下一个state的函数，被提供给当前的state和action去控制.
 *
 * @param {any} [preloadedState] 初始状态
 *
 * @param {Function} [enhancer] 可以跟第三方中间件配合增强store功能
 *
 * @returns {Store} 返回新的store.
 */
export default function createStore(reducer, preloadedState, enhancer) {
  //根据参数指定相应的参数
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  //如果存在enhancer函数，返回 enhancer(createStore)(args...)
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  //当前Reducer变量
  let currentReducer = reducer
  //当前state变量
  let currentState = preloadedState
  //当前监听器变量
  let currentListeners = []
  //下一个监听器变量
  let nextListeners = currentListeners  
  let isDispatching = false

  //如果下一个监听器就是当前监听器，使用slice创建下一个监听器
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  //获取当前state
  function getState() {
    return currentState
  }

  /**
   这个函数可以给 store 的状态添加订阅监听函数
   *
   * @param {Function} listener 一个能被每个dispath调用的callback
   * @returns {Function} 返回删除listener功能的函数
   */
  function subscribe(listener) {
    //listener必须是函数
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }

    //是否被订阅
    let isSubscribed = true
    //确保下一个监听器
    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      //删除当前listener
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  /**
   * 这个函数是用来触发状态改变的
   *
   * @param {Object} action 
   *
   * @returns {Object} 原来action
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    //检查是否是纯粹的object
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }
    //检查action.type是否定义
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }
    
    //如果正在dispath，抛出错误
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      //调用currentReducer传给curentState
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    //将下一个监听器传给当前监听器，使用for循环依次执行listener
    const listeners = currentListeners = nextListeners
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }

  /**
   * 替代当前的Reducer，初始化reducer生成的状态
   *
   * @param {Function} nextReducer 
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer
    dispatch({ type: ActionTypes.INIT })
  }

  /**
   观察者模式库，具体查看：https://github.com/tc39/proposal-observable
   */
  function observable() {
    const outerSubscribe = subscribe
    return {
      subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  // 初始化 state tree.
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
