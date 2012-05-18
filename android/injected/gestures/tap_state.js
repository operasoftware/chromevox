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
 * The min distance in pixels squared allowed between the touchstart and
 * touchend events.
 * @type {number} 15^2
 * @const
 */
gestures.TapState.SQUARED_MIN_DISTANCE = 225;

/**
 * A tap gesture starts from a quick tap on the screen with one or more finger
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @param {gestures.GestureState} previousState The previous gesture state.
 * @override
 * @return {boolean} Returns true if a tap gesture should start.
 */
gestures.TapState.prototype.meetsStartCondition = function(
    touchEvent, previousState) {
  return touchEvent.type == 'touchstart';
};

/**
 * Enter the state.
 * @param {gestures.GestureTouchEvent} touchEvent The first touch event.
 * @override
 */
gestures.TapState.prototype.start = function(touchEvent) {
  this.startingEvent_ = touchEvent;
};

/**
 * A tap gesture ends from moving across the screen or ending contact with the
 * screen.
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @override
 * @return {boolean} Returns true if a tap gesture should start.
 */
gestures.TapState.prototype.meetsEndCondition = function(touchEvent) {
  if (touchEvent.type == 'touchend') return true;
  if (touchEvent.type == 'touchstart') return false;
  return !this.meetsDistanceConstraint_(touchEvent) ||
      !this.meetsTimeConstraint_(touchEvent);
};

/**
 * Exit the state.
 * @param {gestures.GestureTouchEvent} touchEvent The last touch event.
 * @override
 */
gestures.TapState.prototype.end = function(touchEvent) {
  if (touchEvent.type == 'touchend') {
    this.registerTapEvent_();
  }
};

/**
 * Determines if the touchend event occurred within a certain time from the
 * touchstart event.
 * @private
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @return {boolean} Returns true if the event meets the time constraint.
 */
gestures.TapState.prototype.meetsTimeConstraint_ = function(touchEvent) {
  var timeSinceStart = touchEvent.baseEvent.timeStamp -
      this.startingEvent_.baseEvent.timeStamp;
  return timeSinceStart <= gestures.TapState.MIN_TIME;
};

/**
 * Determines if the touchend event occurred within a certain distance from the
 * touchstart event.
 * @private
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @return {boolean} Returns true if the event meets the distance constraint.
 */
gestures.TapState.prototype.meetsDistanceConstraint_ = function(touchEvent) {
  var distanceFromStart = gestures.GestureTouchEvent.squaredDistance(
      this.startingEvent_, touchEvent);
  return distanceFromStart <= gestures.TapState.SQUARED_MIN_DISTANCE;
};

/**
 * Create and register a gesture event indicating that a tap has occurred.
 * @private
 */
gestures.TapState.prototype.registerTapEvent_ = function() {
  var gestureEvent = new gestures.GestureEvent(
      gestures.GestureEvent.Type.TAP);
  gestureEvent.x = this.startingEvent_.x;
  gestureEvent.y = this.startingEvent_.y;
  gestureEvent.numTouches = this.startingEvent_.numTouches;
  gestureEvent.baseEvent = this.startingEvent_.baseEvent;
  this.registerGesture(gestureEvent);
};

/**
 * @return {string}
 */
gestures.TapState.prototype.toString = function() {
  return 'tap';
};
