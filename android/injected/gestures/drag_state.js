/**
 * @fileoverview Looks at touch events and determines if a drag start, move or
 *     end gesture has occurred. A drag gesture occurs when the user moves
 *     their finger on the screen.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.DragState');

goog.require('gestures.GestureEvent');
goog.require('gestures.GestureEvent.Type');
goog.require('gestures.GestureState');

/**
 * @constructor
 * @extends {gestures.GestureState}
 */
gestures.DragState = function() {
  goog.base(this);
};
goog.inherits(gestures.DragState, gestures.GestureState);

/**
 * A drag gesture starts from any movement on the screen.
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @param {gestures.GestureState} previousState The previous gesture state.
 * @override
 * @return {boolean} Returns true if a drag gesture should start.
 */
gestures.DragState.prototype.meetsStartCondition = function(
    touchEvent, previousState) {
  return !touchEvent.isMultitouch &&
      touchEvent.type == 'touchmove';
};

/**
 * Enter the state.
 * @override
 * @param {gestures.GestureTouchEvent} touchEvent The first touch event.
 */
gestures.DragState.prototype.start = function(touchEvent) {
  this.registerStartEvent_(touchEvent);
};

/**
 * Updates the state with the latest touch event.
 * @override
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 */
gestures.DragState.prototype.update = function(touchEvent) {
  this.registerDragEvent_(touchEvent);
};

/**
 * A drag gesture ends from ending contact with the screen, putting down a
 * second finger or moving too fast.
 * @param {gestures.GestureTouchEvent} touchEvent The touch event to analyze.
 * @override
 * @return {boolean} Returns true if a drag gesture should start.
 */
gestures.DragState.prototype.meetsEndCondition = function(touchEvent) {
  return touchEvent.type == 'touchend' ||
      touchEvent.isMultitouch;
};

/**
 * Exit the state.
 * @override
 * @param {gestures.GestureTouchEvent} touchEvent The last touch event.
 */
gestures.DragState.prototype.end = function(touchEvent) {
  this.registerEndEvent_(touchEvent);
};

/**
 * Create and register a gesture event indicating that dragging has started.
 * @private
 * @param {gestures.GestureTouchEvent} touchEvent The touch event that caused
 *     the gesture to occur.
 */
gestures.DragState.prototype.registerStartEvent_ = function(touchEvent) {
  var gestureEvent = new gestures.GestureEvent(
      gestures.GestureEvent.Type.DRAG_START);
  gestureEvent.x = touchEvent.x;
  gestureEvent.y = touchEvent.y;
  gestureEvent.baseEvent = touchEvent.baseEvent;
  this.registerGesture(gestureEvent);
};

/**
 * Create and register a gesture event indicating that dragging is happening.
 * @private
 * @param {gestures.GestureTouchEvent} touchEvent The touch event that caused
 *     the gesture to occur.
 */
gestures.DragState.prototype.registerDragEvent_ = function(touchEvent) {
  var gestureEvent = new gestures.GestureEvent(
      gestures.GestureEvent.Type.DRAG_MOVE);
  gestureEvent.x = touchEvent.x;
  gestureEvent.y = touchEvent.y;
  gestureEvent.baseEvent = touchEvent.baseEvent;
  this.registerGesture(gestureEvent);
};

/**
 * Create and register a gesture event indicating that dragging has ended.
 * @param {gestures.GestureTouchEvent} touchEvent The touch event that caused
 *     the gesture to occur.
 * @private
 */
gestures.DragState.prototype.registerEndEvent_ = function(touchEvent) {
  var gestureEvent = new gestures.GestureEvent(
      gestures.GestureEvent.Type.DRAG_END);
  gestureEvent.baseEvent = touchEvent.baseEvent;
  this.registerGesture(gestureEvent);
};

/**
 * @return {string}
 */
gestures.DragState.prototype.toString = function() {
  return 'drag';
};
