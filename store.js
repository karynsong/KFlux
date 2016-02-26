import {
    UtilIsObject,
    UtilIsFunction,
    UtilExtend
} from './util/util';
import {
    UtilCreateEventManager
} from './util/custEvent';
import enableMiddleware from './util/enableMiddleware';

// 错误输出
const ERR = {
    PARAMETER_ERR_OPTIONS: 'parameter Err: options 传入格式有误,只支持 Object'
}

class Store {
    constructor(opts) {
        if(!UtilIsObject(opts)){
            throw new Error('register ' + ERR.PARAMETER_ERR_OPTIONS);
        }
        this.datas = opts.datas || {};
        delete opts.datas;
        UtilExtend(this, opts);
        UtilExtend(this, UtilCreateEventManager())
    }
    /**
     * [getAll 获取所有的数据]
     */
    getAll() {
        return this.datas;
    }
    /**
     * [setData 设置数据]
     * @param  {[Function]} func [纯函数]
     * @param  {[Boolean]} noChange [是否需要自动触发change事件]
     */
    setData(_data, noChange) {
        if(UtilIsFunction(_data)){
            this.datas = _data();
        }else{
            this.datas = _data;
        }
        if(!noChange){
            this.emitChange();
        }
    }
    /**
     * [emitChange 触发改变方法]
     */
    emitChange() {
        this.trigger('change');
    }
    /**
     * [addChangeListener 监听数据发生的改变]
     */
    addChangeListener(callback) {
        this.on('change', callback);
    }
    /**
     * [removeChangeListener 取消监听数据发生的改变]
     */
    removeChangeListener(callback) {
        this.off('change', callback);
    }
}

enableMiddleware(Store);

export default Store
