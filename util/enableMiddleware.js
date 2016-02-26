/*
 * 给一个类或者原型对象添加connect方法,允许connect为某个方法注册中间件
 * 调用方式为useMiddleware(Class,method);
 *
 * 中间件是一个高阶函数,以dispatcher.dispatch中间件为例:
 * function(next){
 *   return function(payload){
 *     ...
 *     return next(payload);
 *   }
 * }
 * next参数是未经处理前的dispatcher.dispatch,而payload则是原来的传入dispatch函数中的参数
 * 它会返回一个新函数来替换掉原有的dispatch方法
 * 调用dispatcher.connect(mw1,mw2,...)来添加中间件
 *
 * 注意:一定要正确处理中间件的返回值!如果存在返回值,记得加return next(...)
 * */
import {
    UtilIsFunction,
    UtilIsObject,
    UtilIsString
} from './util.js';

var ERR = {
    CONNECT_ARG_NOT_VALID: 'Qlux enableMiddleware:参数不合法,请检查传入的参数(method,middlewareList)是否正确.',
    ENABLE_ARG_NOT_VALID: 'Qlux useMiddleware:useMiddleware传入的参数必须是构造函数或者对象.'
};

export default function useMiddleware(context) {

    if (UtilIsFunction(context)) {

        context = context.prototype;
    }

    if (UtilIsObject(context)) {

        context.connect = function (method, middlewareList) {

            if (Array.isArray(middlewareList) && UtilIsString(method)) {

                for (let i = middlewareList.length - 1; i >= 0; i--) {
                    let renderedMethod,
                        mw = middlewareList[i],
                        origMethod = context[method].bind(this);

                    if (UtilIsFunction(mw)) {

                        renderedMethod = mw.call(this, origMethod);
                        context[method] = (UtilIsFunction(renderedMethod) ? renderedMethod : context[method]).bind(this);
                    }
                }
            }
            else {

                throw new Error(ERR.CONNECT_ARG_NOT_VALID);
            }

            return this;
        }
    }
    else {

        throw new Error(ERR.ENABLE_ARG_NOT_VALID);
    }
}