/**
 * @fileoverview Looks at touch events and determines if a swipe gesture has
 *     occurred. A swipe gesture occurs when the user quickly moves across the
 *     screen in one direction, lifting at the end.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.SwipeState');

goog.require('gestures.GestureEvent');
goog.require('gestures.GestureEvent.Direction');
goog.require('gestures.GestureEvent.Type');
goog.require('gestures.GestureState');

/**
 * @constructor
 * @extends {gestures.GestureState}
 */
gestures.SwipeState = function() {
  goog.base(this);
};
goog.inherits(gestures.SwipeState, gestures.GestureState);

/**
 * The squared min average speed of a swipe across all touch move events for it
 * to be considered a swipe and not a drag. The units are pixels^2 per
 * millisecond^2 at mdpi.
 * @const
 * @type {number} 1.5^2
 */
gestures.SwipeState.SQUARED_MIN_AVG_SPEED = 2.25;

/**
 * Events within this many pixels from the touch start event are not checked for
 * speed. This acts as a runway to accelerate into the swipe.
 * @const
 * @type {number} 80^2
 */
gestures.SwipeState.SQUARED_ACCELERATION_RADIUS = 6400;

/**
 * A swipe gesture starts from quick movement in one direction across the
 * screen.
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @param {gestures.GestureState} previousState The previous gesture state.
 * @override
 * @return {boolean} Returns true if a swipe gesture should start.
 */
gestures.SwipeState.prototype.meetsStartCondition = function(
    touchEvent, previousState) {
  var NONE = gestures.GestureEvent.Direction.NONE;
  return !touchEvent.isMultitouch &&
      touchEvent.type == 'touchmove' &&
      previousState instanceof gestures.TapState &&
      touchEvent.getCardinalDirection() != NONE;
};

/**
 * Enter the state.
 * @param {gestures.GestureTouchEvent} touchEvent The first touch event.
 * @override
 */
gestures.SwipeState.prototype.start = function(touchEvent) {
  this.numEvents_ = 1;
  this.speed_ = touchEvent.getSquaredSpeed();
  this.startingEvent_ = touchEvent;
  this.maxSpeed = this.speed_;
};

/**
 * A swipe gesture ends from ending contact with the screen or moving too slowly
 * across the screen. A swipe event is triggered if the gesture ends from
 * removing contact with the screen.
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @override
 * @return {boolean} Returns true if a swipe gesture should start.
 */
gestures.SwipeState.prototype.meetsEndCondition = function(touchEvent) {
  if (touchEvent.type == 'touchend') {
    return true;
  }

  this.calculateSpeed_(touchEvent);

  var distanceFromStart = gestures.GestureTouchEvent.squaredDistance(
      this.startingEvent_, touchEvent);
  return (distanceFromStart > gestures.SwipeState.SQUARED_ACCELERATION_RADIUS &&
      this.speed_ < gestures.SwipeState.SQUARED_MIN_AVG_SPEED) ||
      this.directionChanged_(touchEvent);
};

/**
 * Exit the state.
 * @param {gestures.GestureTouchEvent} touchEvent The last touch event.
 * @override
 */
gestures.SwipeState.prototype.end = function(touchEvent) {
  if (touchEvent.type == 'touchend' &&
      this.speed_ > gestures.SwipeState.SQUARED_MIN_AVG_SPEED) {
    this.registerEvent_(touchEvent.prev);
  }
};

/**
 * Calculate the gesture speed using data from the newest touch event.
 * @private
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 */
gestures.SwipeState.prototype.calculateSpeed_ = function(touchEvent) {
  if (touchEvent.getSquaredSpeed() > this.maxSpeed) {
    this.maxSpeed = touchEvent.getSquaredSpeed();
  }
  this.speed_ = (this.speed_ * this.numEvents_ + touchEvent.getSquaredSpeed()) /
      (this.numEvents_ + 1);
  this.numEvents_++;
};

/**
 * Create and register a gesture event indicating that a swipe has occurred.
 * @private
 * @param {gestures.GestureTouchEvent} touchEvent The touch event that caused
 *     the gesture to occur.
 */
gestures.SwipeState.prototype.registerEvent_ = function(touchEvent) {
  var gestureEvent = new gestures.GestureEvent(
      gestures.GestureEvent.Type.SWIPE);
  gestureEvent.direction = touchEvent.getCardinalDirection();
  gestureEvent.baseEvent = touchEvent.baseEvent;
  this.registerGesture(gestureEvent);
};

/**
 * @private
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @return {boolean} Returns true if the swipe changed direction.
 */
gestures.SwipeState.prototype.directionChanged_ = function(touchEvent) {
  var prevDirection = touchEvent.prev.getCardinalDirection();
  return prevDirection != touchEvent.getCardinalDirection();
};

/**
 * @return {string}
 */
gestures.SwipeState.prototype.toString = function() {
  return 'swipe';
};
