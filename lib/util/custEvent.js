/**
 * Created by karyn on 16/2/19.
 */
// custEvent
import {
    TRUE,
    FALSE,
    NULL,
    UNDEFINED,
    slice
} from './const.js';
import {
    UtilExtend
} from './util.js';

var _once = (func) => {
    var ran = FALSE,
        memo;
    return () => {
        if (ran) return memo;
        ran = TRUE;
        memo = func.apply(this, arguments);
        func = NULL;
        return memo;
    };
}

var triggerEvents = (events, args) => {
    var ev,
        i = -1,
        l = events.length,
        ret = 1;
    while (++i < l && ret) {
        ev = events[i];
        ret &= (ev.callback.apply(ev.ctx, args) !== false);
    }
    return !!ret;
};

var CustEvent = {
    on: function (name, callback, context) {
        this._events = this._events || {};
        this._events[name] = this._events[name] || [];
        var events = this._events[name];
        events.push({
            callback: callback,
            context: context,
            ctx: context || this
        });
        return this;
    },
    once: function (name, callback, context) {
        var self = this;
        var once = _once(function () {
            self.off(name, once);
            callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
    },
    off: function (name, callback, context) {
        if(this._events === UNDEFINED){
            return this;
        }
        var retain, ev, events, names, i, l, j, k;
        if (!name && !callback && !context) {
            this._events = UNDEFINED;
            return this;
        }
        names = name ? [name] : keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
            name = names[i];
            events = this._events[name];
            if (events) {
                this._events[name] = retain = [];
                if (callback || context) {
                    for (j = 0, k = events.length; j < k; j++) {
                        ev = events[j];
                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                            (context && context !== ev.context)) {
                            retain.push(ev);
                        }
                    }
                }
                if (!retain.length) delete this._events[name];
            }
        }
        return this;
    },
    trigger: function (name) {
        if (!this._events) return this;
        var args = slice.call(arguments, 1),
            events = this._events[name],
            allEvents = this._events.all,
            ret = 1;
        if (events) {
            ret &= triggerEvents(events, args);
        }
        if (allEvents && ret) {
            ret &= triggerEvents(allEvents, args);
        }
        return !!ret;
    }
};

function _createEventManager() {
    var EM = function () {
    };
    UtilExtend(EM.prototype, CustEvent);
    return new EM();
}

export {
    _createEventManager as UtilCreateEventManager,
    CustEvent as UtilCustEvent,
}