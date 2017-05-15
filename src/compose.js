/**
 * 这个函数可以组合一组函数参数，从右到左 *
 * 例如, compose(f, g, h) 生成 (...args)=> f(g(h(...args)))
 */

export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }  

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
