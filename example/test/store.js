/**
 * Created by karyn on 16/2/29.
 */
import React, {
    ListView
} from 'react-native';
import {
    Store
} from '../../lib';

let Immutable = require('immutable');

let itemDatas = [];

let store = new Store({
    // 设置数据,key 必须是 datas
    datas: {
        person: {
            name: 'karynsong',
            age: 23
        },
        randomItems: Immutable.fromJS({
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            })
        })
    },

    changePerson: function (person) {
        // 数据都要是不变了
        // Object.assign 只会复制一层
        Object.assign(this.datas.person, person);
    },

    addItem: function (data){
        itemDatas.push(data);
        // 这个方法会自动触发 emitChange 方法
        // 推荐使用下面这种纯函数的写法来写
        this.setData(() => {
            this.datas.randomItems = this.datas.randomItems.set('dataSource', this.datas.randomItems.get('dataSource').cloneWithRows(itemDatas));
            return this.datas;
        })
    }
});

export default store
