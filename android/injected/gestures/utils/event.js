/**
 * @fileoverview A base class for event objects.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.utils.Event');

/**
 * @constructor
 * @param {string} type The event type.
 */
gestures.utils.Event = function(type) {
  this.type = type;
  this.defaultPrevented = false;
};

/**
 * Prevents the default behavior of the event from occurring.
 */
gestures.utils.Event.prototype.preventDefault = function() {
  this.defaultPrevented = true;
};

/**
 * Provides a default toString method for events.
 */
gestures.utils.Event.prototype.toString = function() {
  return this.type;
};