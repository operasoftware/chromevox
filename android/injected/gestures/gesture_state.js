/**
 * @fileoverview GestureState is an abstract base class for a detecting a
 *     gesture. It is a state with a single entry and exit and can trigger
 *     gesture events at any time.
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.GestureState');

/**
 * @constructor
 */
gestures.GestureState = function() {};

/**
 * A null gesture state that does nothing.
 * @type {gestures.GestureState}
 */
gestures.GestureState.NULL_STATE = new gestures.GestureState();

/**
 * Determines if the given touch event can start the state.
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @param {gestures.GestureState} previousGesture The previous gesture.
 * @return {boolean} True if the gesture can now start.
 */
gestures.GestureState.prototype.meetsStartCondition = function(
    touchEvent, previousGesture) {
  return false;
};

/**
 * Enter the state.
 * @param {gestures.GestureTouchEvent} touchEvent The first touch event.
 */
gestures.GestureState.prototype.start = function(touchEvent) {
};

/**
 * Updates the state with the latest touch event.
 * @param {gestures.GestureTouchEvent} touchEvent The event that occurred while
 *     the state was active.
 */
gestures.GestureState.prototype.update = function(touchEvent) {
};

/**
 * Determines if the given touch event can end the state.
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @return {boolean} True if the gesture is now over.
 */
gestures.GestureState.prototype.meetsEndCondition = function(touchEvent) {
  return true;
};

/**
 * Exit the state.
 * @param {gestures.GestureTouchEvent} touchEvent The last touch event.
 */
gestures.GestureState.prototype.end = function(touchEvent) {
};

/**
 * Registers that a gesture has occurred. This method should be set by the class
 * that wants to know when a gesture occurs.
 * @param {gestures.GestureEvent} gesture The event for the gesture that
 *     occurred.
 */
gestures.GestureState.prototype.registerGesture = function(gesture) {
};

/**
 * @return {gestures.GestureState} Returns a null state.
 */
gestures.GestureState.getNullState = function() {
  return gestures.GestureState.NULL_STATE;
};
