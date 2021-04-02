"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
exports.State = void 0;
var _1 = require(".");
/**
 * A state is a situation in the lifecycle of the state machine that is stable between events.
 */
var State = /** @class */ (function (_super) {
    __extends(State, _super);
    /**
     * Creates a new instance of the state class.
     * @param name The name of the state.
     * @param parent The parent region of the state; note that another state can also be used, in which case the default region of the state will become this states parent. If parent is left undefined, then this state is the root of the state machine hierarchy.
     */
    function State(name, parent) {
        if (parent === void 0) { parent = undefined; }
        var _this = _super.call(this, name, parent instanceof State ? parent.getDefaultRegion() : parent) || this;
        /**
         * The child regions of the state.
         * @internal
         * @hidden
         */
        _this.children = [];
        /**
         * The types of events that may be deferred while in this state.
         */
        _this.deferrableTriggers = [];
        /**
         * The user-defined actions that will be called upon state entry.
         */
        _this.entryActions = [];
        /**
         * The user-defined actions that will be called upon state exit.
         */
        _this.exitActions = [];
        return _this;
    }
    /**
     * Adds a user-defined behaviour to call on state entry.
     * @param actions One or callbacks that will be passed the trigger event.
     * @return Returns the state thereby allowing a fluent style state construction.
     */
    State.prototype.entry = function () {
        var _a;
        var actions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            actions[_i] = arguments[_i];
        }
        (_a = this.entryActions).push.apply(_a, __spreadArray([], __read(actions)));
        return this;
    };
    /**
     * Adds a user-defined behaviour to call on state exit.
     * @param actions One or callbacks that will be passed the trigger event.
     * @return Returns the state thereby allowing a fluent style state construction.
     */
    State.prototype.exit = function () {
        var _a;
        var actions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            actions[_i] = arguments[_i];
        }
        (_a = this.exitActions).push.apply(_a, __spreadArray([], __read(actions)));
        return this;
    };
    /**
     * Adds the types of trigger event that can .
     * @param actions One or callbacks that will be passed the trigger event.
     * @return Returns the state thereby allowing a fluent style state construction.
     */
    State.prototype.defer = function () {
        var _a;
        var type = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            type[_i] = arguments[_i];
        }
        (_a = this.deferrableTriggers).push.apply(_a, __spreadArray([], __read(type)));
        return this;
    };
    /**
     * Returns the default region for state and creates it if required; as used in the implicit creation of vertices.
     * @returns The default state.
     * @internal
     * @hidden
     */
    State.prototype.getDefaultRegion = function () {
        return this.defaultRegion || (this.defaultRegion = new _1.Region("default", this));
    };
    /**
     * Tests a state to see if it is a simple state, one without and child regions.
     * @returns Returns true if the state is a simple state.
     */
    State.prototype.isSimple = function () {
        return this.children.length === 0;
    };
    /**
     * Tests a state to see if it is a composite state, one with one or more child regions.
     * @returns Returns true if the state is a composite state.
     */
    State.prototype.isComposite = function () {
        return this.children.length > 0;
    };
    /**
     * Tests a state to see if it is an orthogonal state, one with two or more child regions.
     * @returns Returns true if the state is an orthogonal state.
     */
    State.prototype.isOrthogonal = function () {
        return this.children.length > 1;
    };
    /**
     * Tests a state to see if it is a final state, one without outgoing transitions.
     * @returns Returns true if the state is a final state.
     */
    State.prototype.isFinal = function () {
        return this.outgoing.length === 0;
    };
    /**
     * Tests a state machine instance to see if this state is complete.
     * A state is complete if it is a simple state, or if composite, all its child regions are complete.
     * @returns Returns true if the state machine instance is complete for this state.
     * @internal
     * @hidden
     */
    State.prototype.isComplete = function (transaction) {
        return !this.children.some(function (region) { return !region.isComplete(transaction); });
    };
    /**
     * Evaluates a trigger event at this state to determine if it will trigger an outgoing transition.
     * @param transaction The current transaction being executed.
     * @param history True if deep history semantics are in play.
     * @param trigger The trigger event.
     * @returns Returns true if one of outgoing transitions guard conditions passed.
     * @remarks Prior to evaluating the trigger against the outcoing transitions, it delegates the trigger to children for evaluation thereby implementing depth-first evaluation of trigger events.
     * @internal
     * @hidden
     */
    State.prototype.evaluate = function (transaction, history, trigger) {
        var result = this.delegate(transaction, history, trigger) || _super.prototype.evaluate.call(this, transaction, history, trigger) || this.deferrable(transaction, trigger);
        if (result) {
            this.completion(transaction, history);
        }
        return result;
    };
    /**
     * Delegates a trigger event to the children of this state to determine if it will trigger an outgoing transition.
     * @param transaction The current transaction being executed.
     * @param history True if deep history semantics are in play.
     * @param trigger The trigger event.
     * @returns Returns true if a child state processed the trigger.
     * @internal
     * @hidden
     */
    State.prototype.delegate = function (transaction, history, trigger) {
        var result = false;
        for (var i = 0, l = this.children.length; i < l && this.isActive(transaction); ++i) { // delegate to all children unless one causes a transition away from this state
            result = transaction.getState(this.children[i]).evaluate(transaction, history, trigger) || result;
        }
        return result;
    };
    /**
     * Tests the trigger event to see if it can be deferred from this state.
     * @param transaction The current transaction being executed.
     * @param trigger The trigger event.
     * @returns Returns true if the type of the trigger event matched one of the user defined deferrable event types.
     * @internal
     * @hidden
     */
    State.prototype.deferrable = function (transaction, trigger) {
        if (this.deferrableTriggers.indexOf(trigger.constructor) !== -1) {
            transaction.instance.defer(trigger);
            return true;
        }
        return false;
    };
    /**
     * Returns the list of deferable event types from the current active state configuration.
     * @param transaction The current transaction being executed.
     * @returns Returns an array of the deferable event types from the current active state configuration.
     * @internal
     * @hidden
     */
    State.prototype.getDeferrableTriggers = function (transaction) {
        return this.children.reduce(function (result, region) { return result.concat(transaction.getState(region).getDeferrableTriggers(transaction)); }, this.deferrableTriggers);
    };
    /**
     * Performs the initial steps required to enter a state during a state transition; updates teh active state configuration.
     * @param transaction The current transaction being executed.
     * @param history Flag used to denote deep history semantics are in force at the time of entry.
     * @param trigger The event that triggered the state transition.
     * @internal
     * @hidden
     */
    State.prototype.doEnterHead = function (transaction, history, trigger, next) {
        if (next) {
            this.children.forEach(function (region) {
                if (region !== next) {
                    region.doEnter(transaction, history, trigger);
                }
            });
        }
        _super.prototype.doEnterHead.call(this, transaction, history, trigger, next);
        transaction.setState(this);
        this.entryActions.forEach(function (action) { return action(trigger, transaction.instance); });
    };
    /**
     * Performs the final steps required to enter a state during a state transition including cascading the entry operation to child elements and completion transition.
     * @param transaction The current transaction being executed.
     * @param history Flag used to denote deep history semantics are in force at the time of entry.
     * @param trigger The event that triggered the state transition.
     * @internal
     * @hidden
     */
    State.prototype.doEnterTail = function (transaction, history, trigger) {
        this.children.forEach(function (region) { return region.doEnter(transaction, history, trigger); });
        this.completion(transaction, history);
    };
    /**
     * Exits a state during a state transition.
     * @param transaction The current transaction being executed.
     * @param history Flag used to denote deep history semantics are in force at the time of exit.
     * @param trigger The event that triggered the state transition.
     * @internal
     * @hidden
     */
    State.prototype.doExit = function (transaction, history, trigger) {
        this.children.forEach(function (region) { return region.doExit(transaction, history, trigger); });
        _super.prototype.doExit.call(this, transaction, history, trigger);
        this.exitActions.forEach(function (action) { return action(trigger, transaction.instance); });
    };
    /**
     * Evaluates completion transitions at the state.
     * @param transaction The current transaction being executed.
     * @param history Flag used to denote deep history semantics are in force at the time of exit.
     * @internal
     * @hidden
     */
    State.prototype.completion = function (transaction, history) {
        if (this.isComplete(transaction)) {
            _super.prototype.evaluate.call(this, transaction, history, this);
        }
    };
    /**
     * Accepts a visitor and calls visitor.visitStateHead method, cascades to child regions then calls the visitor.visitStateTail.
     * @param visitor The visitor to call back.
     */
    State.prototype.accept = function (visitor) {
        var e_1, _a;
        visitor.visitState(this);
        try {
            for (var _b = __values(this.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var region = _c.value;
                region.accept(visitor);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        visitor.visitStateTail(this);
    };
    return State;
}(_1.Vertex));
exports.State = State;
