/**
 * @fileoverview An implementation of EventTarget.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.utils.EventTarget');

goog.require('gestures.utils.Event');

/**
 * @constructor
 */
gestures.utils.EventTarget = function() {
  this.listenerMap_ = {};
};

/**
 * @param {string} type
 * @param {EventListener|function(gestures.utils.Event):(boolean|undefined)}
 *     listener
 * @param {boolean=} opt_useCapture
 * @return {undefined}
 */
gestures.utils.EventTarget.prototype.addEventListener = function(
    type, listener, opt_useCapture) {
  if (!this.listenerMap_[type]) {
    this.listenerMap_[type] = [];
  }
  if (opt_useCapture) {
    this.listenerMap_[type].unshift(listener);
  } else {
    this.listenerMap_[type].push(listener);
  }
};

/**
 * @param {string} type
 * @param {EventListener|function(gestures.utils.Event):(boolean|undefined)}
 *     listener
 * @return {undefined}
 */
gestures.utils.EventTarget.prototype.removeEventListener = function(
    type, listener) {
  var listeners = this.listenerMap_[type];
  if (!listeners) return;
  var len = listeners.length;
  for (var i = 0; i < len; i++) {
    if (listeners[i] == listener) {
      listeners.splice(i, 1);
    }
  }
};

/**
 * @param {gestures.utils.Event} event The event to be dispatched.
 * @return {boolean} Returns false if at least one of the event handlers called
 *     preventDefault.
 */
gestures.utils.EventTarget.prototype.dispatchEvent = function(event) {
  var listeners = this.listenerMap_[event.type];
  if (!listeners) return false;
  var len = listeners.length;
  for (var i = 0; i < len; i++) {
    var listener = listeners[i];
    if (goog.isFunction(listener)) {
      listener(event);
    } else {
      listener.handleEvent(event);
    }
  }
  return event.defaultPrevented;
};
