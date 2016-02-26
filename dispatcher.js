/**
 * Created by karyn on 16/2/23.
 */
import {
    UtilIsString,
    UtilIsFunction,
    UtilIsArray,
    UtilIsObject,
    UtilExtend
} from './util/util';
import {
    UtilCreateEventManager
} from './util/custEvent';
import enableMiddleware from './util/enableMiddleware';

// 错误输出
const ERR = {
    PARAMETER_ERR_NAMESPACE: 'parameter Err: nameSpace 传入格式有误,只支持 String',
    PARAMETER_ERR_CALLBACK: 'parameter Err: callback 传入格式有误,只支持 Function',
    PARAMETER_ERR_OPTIONS: 'parameter Err: opts 传入格式有误,非必须,但是只支持 Object',
    PARAMETER_ERR_BEFOREDISPATH: 'parameter Err: beforeDispath 传入格式有误,只支持 Function',
    PARAMETER_ERR_AFTERDISPATH: 'parameter Err: afterDispath 传入格式有误,只支持 Function',
    PARAMETER_ERR_PAYLOAD: 'parameter Err: payload 传入格式有误,只支持 Object',
    PARAMETER_ERR_NOTEXIST: 'parameter Err: 没有声明对应名称的dispatch',
    PARAMETER_ERR_EXIST: 'parameter Err: 你创建的 dispatch 已经被创建'
}

let _dispatcher = {};   // 用于存储所有的 dispatcher
let _isHandled = {};    // 用于存储 dispatcher 的状态 不可修改
let _isPending = {};    // 用于存储 dispatcher 的状态 可修改

let Dispatcher = {
    /**
     * [register 注册 dispatcher]
     * @param  {[String]} nameSpace [用于标识 dispatch 的命名空间]
     * @param  {[Function]} callback [触发回调函数]
     * @return {[String]}     [nameSpace, 主要用于删除注册的dispatch]
     */
    register: function(nameSpace, callback, opts){
        // 校验参数
        if(!UtilIsString(nameSpace)){
            throw new Error('register ' + ERR.PARAMETER_ERR_NAMESPACE);
        }
        if(!UtilIsFunction(callback)){
            throw new Error('register ' + ERR.PARAMETER_ERR_NAMESPACE);
        }
        if(opts && !UtilIsObject(opts)){
            throw new Error('register ' + ERR.PARAMETER_ERR_OPTIONS);
        }
        if(_dispatcher[nameSpace]){
            throw new Error('register ' + ERR.PARAMETER_ERR_EXIST);
        }
        _dispatcher[nameSpace] = {
            unregister: () => {
                delete _dispatcher[nameSpace];
            },
            _callbacks: callback,
            _isDispatching: false,
        }

        if(opts && opts.beforeDispath){
            if(UtilIsFunction(opts.beforeDispath)){
                _dispatcher[nameSpace]['_beforeDispath'] = opts.beforeDispath;
            }else{
                throw new Error('register ' + ERR.PARAMETER_ERR_BEFOREDISPATH);
            }
        }
        if(opts && opts.afterDispath){
            if(UtilIsFunction(opts.beforeDispath)){
                _dispatcher[nameSpace]['_afterDispath'] = opts.beforeDispath;
            }else{
                throw new Error('register ' + ERR.PARAMETER_ERR_AFTERDISPATH);
            }
        }
        UtilExtend(_dispatcher[nameSpace], UtilCreateEventManager());
        return _dispatcher[nameSpace];
    },
    /**
     * [unregister 删除 dispatcher]
     * @param  {[String]} nameSpace [用于标识 dispatch 的命名空间]
     */
    unregister: function(nameSpace){
        // 校验参数
        if(!UtilIsString(nameSpace)){
            throw new Error('unregister ' + ERR.PARAMETER_ERR_NAMESPACE);
        }

        delete _dispatcher[nameSpace];
    },
    /**
     * [dispatchMore 群发]
     * @param  {[String]} nameSpace [用于标识 dispatch 的命名空间,数组]
     * @param  {[Object]} payload [payload]
     */
    dispatchMore: function(nameSpaces, payload){
        // 校验参数
        if(!UtilIsArray(nameSpaces)){
            throw new Error('dispatchMore ' + ERR.PARAMETER_ERR_NAMESPACE);
        }
        if(!UtilIsObject(nameSpaces)){
            throw new Error('dispatchMore ' + ERR.PARAMETER_ERR_NAMESPACE);
        }
        for (var ii = 0; ii < nameSpaces.length; ii++) {
            var nameSpace = nameSpaces[ii];
            if (_isPending[nameSpace]) {
                continue;
            }
            payload['nameSpace'] = nameSpace;
            this.dispatch(nameSpace);
        }
    },
    /**
     * [dispatch 触发dispatch]
     * @param  {[Object]} payload [payload]
     */
    dispatch: function(payload) {
        if(!UtilIsObject(payload)){
            throw new Error('dispatch ' + ERR.PARAMETER_ERR_NAMESPACE);
        }
        let nameSpace = payload.nameSpace;
        if(!_dispatcher[nameSpace]){
            throw new Error('dispatch ' + ERR.PARAMETER_ERR_NOTEXIST);
        }
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._startDispatching(payload);
            try {
                if (!_isPending[nameSpace]) {
                    _this._invokeCallback(nameSpace);
                }
            } finally {
                _this._stopDispatching(payload, () => {
                    resolve(payload);
                });
            }
        });
    },
    /**
     * [isDispatching 检测是不是正在dispatching]
     * @param  {[String]} nameSpace [命名空间]
     */
    isDispatching: function(nameSpace){
        // 校验参数
        if(!UtilIsString(nameSpace)){
            throw new Error('isDispatching ' + ERR.PARAMETER_ERR_NAMESPACE);
        }
        if(!_dispatcher[nameSpace]){
            throw new Error('isDispatching ' + ERR.PARAMETER_ERR_NOTEXIST);
        }
        return _dispatcher[nameSpace]['_isDispatching'];
    },
    /**
     * [_invokeCallback 真正的触发回调的方法]
     * @param  {[String]} nameSpace [命名空间]
     */
    _invokeCallback: function(nameSpace){
        _isPending[nameSpace] = true;
        _dispatcher[nameSpace]['_callbacks'](this._pendingPayload);
        _isHandled[nameSpace] = true;
    },
    /**
     * [_startDispatching 开始执行 dispathch 之前]
     * @param  {[Object]} payload [payload]
     */
    _startDispatching: function(payload){
        var nameSpace = payload.nameSpace;
        _dispatcher[nameSpace]['_beforeDispath'] && _dispatcher[nameSpace]['_beforeDispath'].call(this, payload);
        _dispatcher[nameSpace].trigger('beforeDispath', payload);
        _isPending[nameSpace] = false;
        _isHandled[nameSpace] = false;
        this._pendingPayload = payload;
        _dispatcher[nameSpace]['_isDispatching'] = true;
    },
    /**
     * [_stopDispatching 执行完所有 dispathch 之后]
     * @param  {[Object]} payload [payload]
     */
    _stopDispatching: function(payload, callback){
        var nameSpace = payload.nameSpace;
        delete this._pendingPayload;
        _dispatcher[nameSpace]['_isDispatching'] = false;
        _dispatcher[nameSpace]['_afterDispath'] && _dispatcher[nameSpace]['_afterDispath'].call(this, payload);
        _dispatcher[nameSpace].trigger('beforeDispath', payload);
        callback();
    }
}

enableMiddleware(Dispatcher);

export default Dispatcher;
