/**
 * @fileoverview An event that is dispatched when a gesture, such as a swipe,
 *     tap, drag or swipe-turn occurs.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.GestureEvent');
goog.provide('gestures.GestureEvent.Direction');
goog.provide('gestures.GestureEvent.Type');

goog.require('gestures.utils.Event');

/**
 * The event that is fired when a gesture occurs.
 * @param {gestures.GestureEvent.Type} type The type of the event.
 * @constructor
 * @extends {gestures.utils.Event}
 */
gestures.GestureEvent = function(type) {
  goog.base(this, type);
};
goog.inherits(gestures.GestureEvent, gestures.utils.Event);

/**
 * The types of gesture events.
 * @enum {string}
 */
gestures.GestureEvent.Type = {
  TAP: 'tap',
  SWIPE: 'swipe',
  SWIPE_TURN: 'swipeturn',
  DRAG_START: 'dragstart',
  DRAG_MOVE: 'dragmove',
  DRAG_END: 'dragend'
};

/**
 * The possible directions a gesture event can have.
 * @enum {string}
 */
gestures.GestureEvent.Direction = {
  NORTH: 'north',
  EAST: 'east',
  SOUTH: 'south',
  WEST: 'west',
  NONE: 'none'
};
