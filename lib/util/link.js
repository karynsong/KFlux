/**
 * Created by karyn on 16/2/26.
 * link函数,将一个store连接到react组件的state
 * 连接之后可以通过this.state访问store内的数据
 */
import {
    UtilIsFunction,
    UtilExtend
} from './util';

export default function (Component, store, select) {

    select = UtilIsFunction(select) ? select : store=>store;

    return class extends Component {
        constructor(props, context) {
            super(props, context);
            this.state = UtilExtend(this.state || {}, {
                store: select(store.getAll())
            });
        }

        _kFluxChangeData(){
            this.setState({
                store: select(store.getAll())
            });
        }

        componentWillUnmount() {
            store.removeChangeListener(this._kFluxChangeData.bind(this));
            super.componentWillUnmount && super.componentWillUnmount();
        }

        componentDidMount() {
            store.addChangeListener(this._kFluxChangeData.bind(this));
            super.componentDidMount && super.componentDidMount();
        }
    }
};