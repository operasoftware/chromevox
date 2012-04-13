/**
 * @fileoverview Looks at touch events and determines if a tap gesture has
 *     occurred. A tap gesture occurs when the user makes contact and then
 *     immediately removes contact with the screen.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.TapState');

goog.require('gestures.GestureEvent');
goog.require('gestures.GestureEvent.Type');
goog.require('gestures.GestureState');

/**
 * Create a TapState detector.
 * @constructor
 * @extends {gestures.GestureState}
 */
gestures.TapState = function() {
  goog.base(this);
};
goog.inherits(gestures.TapState, gestures.GestureState);

/**
 * The min time allowed between the touchstart and touchend events.
 * @type {number} The time allowed in milliseconds.
 * @const
 */
gestures.TapState.MIN_TIME = 40;

/**
 * The min distance squared allowed between the touchstart and touchend events.
 * @type {number} The distance allowed in pixels. 20^2.
 * @const
 */
gestures.TapState.SQUARED_MIN_DISTANCE = 400;

/**
 * A tap gesture starts from a quick tap on the screen with one or more finger
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @param {gestures.GestureState} previousState The previous gesture state.
 * @override
 * @return {boolean} Returns true if a tap gesture should start.
 */
gestures.TapState.prototype.meetsStartCondition = function(
    touchEvent, previousState) {
  return touchEvent.type == 'touchstart' && !touchEvent.isMultitouch;
};

/**
 * A tap gesture ends from moving across the screen or ending contact with the
 * screen.
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @override
 * @return {boolean} Returns true if a tap gesture should start.
 */
gestures.TapState.prototype.meetsEndCondition = function(touchEvent) {
  return touchEvent.type != 'touchstart' || touchEvent.isMultitouch;
};

/**
 * Exit the state.
 * @param {gestures.GestureTouchEvent} touchEvent The last touch event.
 * @override
 */
gestures.TapState.prototype.end = function(touchEvent) {
  if (touchEvent.type == 'touchend' &&
      !touchEvent.isMultitouch &&
      this.meetsTimeConstraint_(touchEvent) &&
      this.meetsDistanceConstraint_(touchEvent)) {
    this.registerTapEvent_(touchEvent.prev);
  }
};

/**
 * Determines if the touchend event occurred within a certain time from the
 * touchstart event.
 * @private
 * @return {boolean}
 */
gestures.TapState.prototype.meetsTimeConstraint_ = function(touchEvent) {
    return touchEvent.getElapsedTime() <= gestures.TapState.MIN_TIME;
};

/**
 * Determines if the touchend event occurred within a certain distance from the
 * touchstart event.
 * @private
 * @return {boolean}
 */
gestures.TapState.prototype.meetsDistanceConstraint_ = function(touchEvent) {
    return !touchEvent.hasLocation ||
        touchEvent.getSquaredDistance() <=
        gestures.TapState.SQUARED_MIN_DISTANCE;
};

/**
 * Create and register a gesture event indicating that a tap has occurred.
 * @private
 * @param {gestures.GestureTouchEvent} touchEvent The touch event that caused
 *     the gesture to occur.
 */
gestures.TapState.prototype.registerTapEvent_ = function(touchEvent) {
  var gestureEvent = new gestures.GestureEvent(
      gestures.GestureEvent.Type.TAP);
  gestureEvent.x = touchEvent.x;
  gestureEvent.y = touchEvent.y;
  gestureEvent.numTouches = touchEvent.numTouches;
  gestureEvent.baseEvent = touchEvent.baseEvent;
  this.registerGesture(gestureEvent);
};

/**
 * @return {string}
 */
gestures.TapState.prototype.toString = function() {
  return 'tap';
};
