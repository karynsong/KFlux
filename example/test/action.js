/**
 * Created by karyn on 16/2/29.
 */
import {
    Dispatcher
} from '../../lib';
import store from './store';

var dispather = Dispatcher.register('test', function(action){
        switch(action.actionType) {
            case 'CHANGE_PERSON':
                // 手动触发 change 方法
                store.changePerson(action.data);
                store.emitChange();
                break;
            case 'ADD_ITEM':
                // 自动触发 change 方法
                // 自动触发需要把所有数据传入
                store.addItem(action.data);
                break;
            default:
        }
    }
    // 钩子函数,两种方式绑定事件
    //,{
    //    beforeDispath: (payload) => {
    //        console.log('beforeDispath', payload)
    //    }
    //}
);

// 绑定事件
//dispather.on('beforeDispath', function (payload) {
//    console.log('beforeDispath', payload)
//}).on('afterDispath', function (payload) {
//    console.log('afterDispath', payload)
//})

// 中间件的使用
function logger1(next) {
    return function (currentStore) {
        console.log('logger1')
        return next(currentStore);
    }
}

function logger2(next) {
    return function (currentStore) {
        console.log('logger2');
        return next(currentStore);
    }
}

// 连接中间件
Dispatcher.connect('dispatch', [logger1, logger2]);

export default dispather