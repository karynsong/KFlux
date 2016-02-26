// 摘自 QApp
// 预赋值，利于压缩
import {
    TRUE,
    FALSE,
    NULL,
    UNDEFINED,
    __object__,
    __array__,
    toString,
    slice
} from './const.js';

// 类型判断
const class2type = {
    '[object HTMLDocument]': 'Document',
    '[object HTMLCollection]': 'NodeList',
    '[object StaticNodeList]': 'NodeList',
    '[object IXMLDOMNodeList]': 'NodeList',
    '[object DOMWindow]': 'Window',
    '[object global]': 'Window',
    'null': 'Null',
    'NaN': 'NaN',
    'undefined': 'Undefined'
};

'Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList,Null,Undefined'
    .replace(/\w+/ig, (value) => {
        class2type['[object ' + value + ']'] = value;
    });


/**
 * 类型判断
 *
 * @method QApp.util.is
 * @category Util-Fn
 * @param {Any} obj 要判断的对象
 * @param {String=} match 匹配的类型
 * @return {String|Boolean} 如果match参数存在，则返回是否匹配，如果不存在，则返回类型
 */
const getType = (obj, match) => {
    var rs = class2type[(obj === NULL || obj !== obj) ? obj :
            toString.call(obj)] ||
        (obj && obj.nodeName) || '#';
    if (obj === UNDEFINED) {
        rs = 'Undefined';
    } else if (rs.charAt(0) === '#') {
        if (obj == obj.document && obj.document != obj) {
            rs = 'Window';
        } else if (obj.nodeType === 9) {
            rs = 'Document';
        } else if (obj.callee) {
            rs = 'Arguments';
        } else if (isFinite(obj.length) && obj.item) {
            rs = 'NodeList';
        } else {
            rs = toString.call(obj).slice(8, -1);
        }
    }
    if (match) {
        return match === rs;
    }
    return rs;
}

const _isObject = (source) => {
    return getType(source, 'Object');
}

const _isArray = (source) => {
    return getType(source, 'Array');
}

const _isString = (source) => {
    return getType(source, 'String');
}

const _isFunction = (source) => {
    return getType(source, 'Function');
}

// 是否需要考虑用新的方式
// function _isElement(obj) {
//     if (obj && obj.nodeType === 1) { //先过滤最简单的
//         if (obj instanceof Node) { //如果是IE9,则判定其是否Node的实例
//             return TRUE; //由于obj可能是来自另一个文档对象，因此不能轻易返回false
//         }
//         return elementReg.test(toString.call(obj));
//     }
//     return FALSE;
// }

const _isNumber = (source) => {
    return getType(source, 'Number');
}

const _isPlainObject = (source) => {
    return getType(source, 'Object') && Object.getPrototypeOf(source) === __object__;
}

const _isEmptyObject = (source) => {
    try {
        return JSON.stringify(source) === "{}";
    } catch (e) {
        return FALSE;
    }
}

/**
 * 扩展
 *
 * @method QApp.util.extend
 * @category Util-Fn
 * @param {boolen} deep true表示深拷贝，false表示浅拷贝，默认没有此参数
 * @param {Any} target 需要扩展的对象
 * @return {Object} 扩展后的对象
 * @example
 *    var obj1, obj2, obj3, //定义变量
 *        deep; //定义一个布尔值
 *    QApp.util.extend(true, {}, obj1, obj2, obj3); //深拷贝，obj1, obj2, obj3的属性重新生成后放到{}上
 *
 *    var obj1, obj2, obj3,//定义变量
 *        deep;//定义一个布尔值
 *    QApp.util.extend(obj1, obj2, obj3); //浅拷贝，obj2，obj3的属性被复制到obj1上
 */
// extend
const extend = (target, source, deep) =>{
    var key;
    for (key in source) {
        if (deep && (_isPlainObject(source[key]) || _isArray(source[key]))) {
            if (_isPlainObject(source[key]) && !_isPlainObject(target[key])) {
                target[key] = {};
            }
            if (_isArray(source[key]) && !_isArray(target[key])) {
                target[key] = [];
            }
            extend(target[key], source[key], deep);
        } else if (source[key] !== UNDEFINED) {
            target[key] = source[key];
        }
    }
}

const _extend = (target, ...args) => {
    var deep,
        args = slice.call(args);
    if (typeof target == 'boolean') {
        deep = target;
        target = args.shift();
    }
    args.forEach((arg) => {
        extend(target, arg, deep);
    });
    return target;
}

export  {
    _isObject as UtilIsObject,
    _isArray as UtilIsArray,
    _isString as UtilIsString,
    _isFunction as UtilIsFunction,
    _isNumber as UtilIsNumber,
    _isPlainObject as UtilIsPlainObject,
    _isEmptyObject as UtilIsEmptyObject,
    _extend as UtilExtend
}
