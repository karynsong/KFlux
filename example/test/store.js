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
        Object.assign(this.datas.person, person);
    },

    addItem: function (data){
        itemDatas.push(data);
        this.setData(() => {
            this.datas.randomItems = this.datas.randomItems.set('dataSource', this.datas.randomItems.get('dataSource').cloneWithRows(itemDatas));
            return this.datas;
        })
    }
});

export default store
