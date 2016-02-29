/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
    AppRegistry,
    Component,
    StyleSheet,
    ListView,
    Text,
    View
} from 'react-native';

import {
    Link,
    Dispatcher
} from '../../lib';
import action from './action';
import store from './store';

class Person extends Component {
    render() {
        console.log('rendering Person');
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    name: {this.props.data.name}
                </Text>
                <Text style={styles.instructions}>
                    age: {this.props.data.age}
                </Text>
                <Text style={styles.instructions} onPress={this.props.changePerson}>
                    press here change Person
                </Text>
            </View>
        );
    }
}

class RandomItem extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.data !== this.props.data;
    }
    render() {
        // 纯数据的方式可以避免少渲染
        console.log('rendering RandomItem');
        return (
            <View>
                <Text style={styles.welcome} onPress={this.props.addItem}>
                    press here Add Item
                </Text>
                <ListView
                    dataSource={this.props.data.get('dataSource')}
                    renderRow={(num) => {
                        return (
                            <Text style={styles.instructions}>
                                {num}
                            </Text>
                        )
                    }}
                />
            </View>
        );
    }
}

class KFlux extends Component {
    changePerson() {
        Dispatcher.dispatch({
            nameSpace: 'test',
            actionType: 'CHANGE_PERSON',
            data: {
                name: 'songqi',
                age: 23
            }
        })
    }

    addItem() {
        // Dispatcher 用 nameSpace 来区分 dispather
        // 返回一个 Promise,可以继续触发其他动作
        Dispatcher.dispatch({
            nameSpace: 'test',
            actionType: 'ADD_ITEM',
            data: Math.random()
        }).then((payload) => {
            console.log(payload);
        })
    }

    render() {
        return (
            <View>
                <Person
                    data={this.state.store.person}
                    changePerson={this.changePerson.bind(this)}
                />
                <RandomItem
                    data={this.state.store.randomItems}
                    addItem={this.addItem.bind(this)}
                />
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});

// 用 Link 实现 Component 自动 setState,及state的设置
AppRegistry.registerComponent('KFlux', () => Link(KFlux, store));
