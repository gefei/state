"use strict";
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
exports.log = void 0;
/**
 * Logging integration for state; provides callbacks for logging events thereby allowing integration of third party logging tools.
 */
var log;
(function (log) {
    /** The registered logging consumers. */
    var consumers = [];
    /** Logging category used when new state machine elements are created. */
    log.Create = 1;
    /** Logging category used when states are entered during state machine instance initialisation or state transitions. */
    log.Entry = 2;
    /** Logging category used when states are exited during state machine instance initialisation or state transitions. */
    log.Exit = 4;
    /** Logging category used when trigger events are evaluated during state transitions. */
    log.Evaluate = 8;
    /** Logging category used when state transitions are traversed. */
    log.Transition = 16;
    /** Logging category used for user generated log events. */
    log.User = 128;
    /**
     * Adds a new log event consumer that will be called when log events of a particular category or categories are raised.
     * @param consumer The callback that will be invoked with the log message.
     * @param categories The categorory or categories for which the consumer callback will be invoked.
     * @returns Returns an id for the consumer so that it can be removed if desired.
     */
    function add(consumer) {
        var categories = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            categories[_i - 1] = arguments[_i];
        }
        return consumers.push({ consumer: consumer, category: categories.reduce(function (p, c) { return p | c; }) });
    }
    log.add = add;
    /**
     * Removes a log event consumer.
     * @param index The id of the consumer previously returned by the add function.
     */
    function remove(index) {
        delete consumers[index];
    }
    log.remove = remove;
    /**
     * Raises a log event
     * @param producer A callback used to generate the log message.
     * @param category The category of message.
     * @remarks The producer callback will only be called if there is a registered consumer for the category of message.
     */
    function write(producer, category) {
        var e_1, _a;
        var message;
        try {
            for (var consumers_1 = __values(consumers), consumers_1_1 = consumers_1.next(); !consumers_1_1.done; consumers_1_1 = consumers_1.next()) {
                var consumer = consumers_1_1.value;
                if (consumer && category & consumer.category) {
                    consumer.consumer(message || (message = producer()));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (consumers_1_1 && !consumers_1_1.done && (_a = consumers_1["return"])) _a.call(consumers_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    log.write = write;
})(log = exports.log || (exports.log = {}));
