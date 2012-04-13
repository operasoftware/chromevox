/**
 * @fileoverview Looks at touch events to determine if a swipe turn gesture has
 *     occurred. A swipe turn gesture is triggered by a swipe in one direction,
 *     followed by a swipe in another direction without losing screen contact
 *     between the two swipes.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.SwipeTurnState');

goog.require('gestures.GestureEvent');
goog.require('gestures.GestureEvent.Direction');
goog.require('gestures.GestureEvent.Type');
goog.require('gestures.GestureState');
goog.require('gestures.SwipeState');

/**
 * @constructor
 * @extends {gestures.GestureState}
 */
gestures.SwipeTurnState = function() {
  goog.base(this);
  this.secondSwipe_ = new gestures.SwipeState();
  this.secondSwipe_.registerGesture = goog.bind(this.registerEvent_, this);
};
goog.inherits(gestures.SwipeTurnState, gestures.GestureState);

/**
 * After a swipe is completed, the user has a 25 pixels to re-accelerate into
 * the second swipe.
 * @type {number} 25^2
 */
// TODO: make DPI independent
gestures.SwipeTurnState.SQUARED_REACCELERATION_DISTANCE = 625;

/**
 * A swipe turn gesture starts when a swipe that has reached its max speed ends.
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @param {gestures.GestureState} previousState The previous gesture state.
 * @override
 * @return {boolean} Returns true if a swipe turn gesture should start.
 */
gestures.SwipeTurnState.prototype.meetsStartCondition = function(
    touchEvent, previousState) {
  var NONE = gestures.GestureEvent.Direction.NONE;
  return !touchEvent.isMultitouch &&
      touchEvent.type == 'touchmove' &&
      previousState instanceof gestures.SwipeState &&
      previousState.maxSpeed >= gestures.SwipeState.SQUARED_MIN_AVG_SPEED;
};

/**
 * Enter the state.
 * @param {gestures.GestureTouchEvent} touchEvent The first touch event.
 * @override
 */
gestures.SwipeTurnState.prototype.start = function(touchEvent) {
  this.willEnd_ = false;
  this.started_ = false;
  this.firstDirection = touchEvent.prev.getCardinalDirection();
  this.startingX_ = touchEvent.x;
  this.startingY_ = touchEvent.y;
};

/**
 * Updates the state with the latest touch event.
 * @param {gestures.GestureTouchEvent} touchEvent The event that occurred while
 *     the state was active.
 * @override
 */
gestures.SwipeTurnState.prototype.update = function(touchEvent) {
  if (this.started_) return;
  if (this.getSquaredDistanceFromStart_(touchEvent) >
      gestures.SwipeTurnState.SQUARED_REACCELERATION_DISTANCE) {
    this.secondSwipe_.start(touchEvent);
    this.started_ = true;
  }
};

/**
 * @private
 * @return {number} The number of pixels squared from the starting touch event.
 */
gestures.SwipeTurnState.prototype.getSquaredDistanceFromStart_ = function(
    touchEvent) {
  var dx = this.startingX_ - touchEvent.x;
  var dy = this.startingY_ - touchEvent.y;
  return dx * dx + dy * dy;
};

/**
 * A swipe turn gesture ends from ending contact with the screen or moving too
 * slowly across the screen. A swipe turn event is triggered if the gesture ends
 * from removing contact with the screen.
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @override
 * @return {boolean} Returns true if a swipe turn gesture should start.
 */
gestures.SwipeTurnState.prototype.meetsEndCondition = function(touchEvent) {
  if (!this.started_) {
    return touchEvent.type != 'touchmove';
  }
  return this.secondSwipe_.meetsEndCondition(touchEvent);
};

/**
 * Register that a swipe turn event has occurred.
 * @private
 * @param {gestures.GestureEvent} swipeEvent
 */
gestures.SwipeTurnState.prototype.registerEvent_ = function(swipeEvent) {
  var gestureEvent = new gestures.GestureEvent(
      gestures.GestureEvent.Type.SWIPE_TURN);
  gestureEvent.firstDirection = this.firstDirection;
  gestureEvent.secondDirection = swipeEvent.direction;
  gestureEvent.baseEvent = swipeEvent.baseEvent;
  this.registerGesture(gestureEvent);
};

/**
 * @return {string}
 */
gestures.SwipeTurnState.prototype.toString = function() {
  return 'swipe turn';
};
