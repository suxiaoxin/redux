import compose from './compose'

/**
 * 这个函数是根据中间件和原有的store生成新的dispath和store.
 *
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer)
    let dispatch = store.dispatch
    let chain = []

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }

    //所有中间件被放进了一个数组chain，然后嵌套执行，最后执行store.dispatch。可以看到，中间件内部（middlewareAPI）可以拿到getState和dispatch这两个方法
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
