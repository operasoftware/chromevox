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

gestures.utils.Event.preventDefault = function() {
  this.defaultPrevented = true;
};
