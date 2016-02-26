/**
 * Created by karyn on 16/2/7.
 */
const TRUE = true;
const FALSE = false;
const NULL = null;
const UNDEFINED = void 0;

const __object__ = Object.prototype;
const __array__ = Array.prototype;
const toString = __object__.toString;
const slice = __array__.slice;

export {
    TRUE,
    FALSE,
    NULL,
    UNDEFINED,
    __object__,
    __array__,
    toString,
    slice
}