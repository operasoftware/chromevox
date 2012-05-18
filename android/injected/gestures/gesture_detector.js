/**
 * @fileoverview A gesture detector that listens for touch or mouse events and
 *     dispatches gesture events. It is a state machine that manages gesture
 *     states and dispatches events when triggered. Only one state can be active
 *     at a time. States have priority and can be preempted.
 *
 * Tap gestures occur when the user makes contact and then immediately removes
 *     contact with the screen.
 *
 * Drag gestures occur when the user slowly moves their finger across the
 *     screen.
 *
 * Swipe gestures occur when the user quickly moves across the screen in one
 *     direction, lifting at the end.
 *
 * Swipe turn gestures are triggered by a swipe in one direction, followed by a
 *     swipe in another direction without losing screen contact between the two
 *     swipes. Swiping in the shape of an L is an example of a swipe turn.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.GestureDetector');

goog.require('gestures.DragState');
goog.require('gestures.GestureState');
goog.require('gestures.GestureTouchEvent');
goog.require('gestures.SwipeState');
goog.require('gestures.SwipeTurnState');
goog.require('gestures.TapState');
goog.require('gestures.utils.EventTranslator');

/**
 * Constructs a new GestureDetector and start detecting gestures.
 * @param {!gestures.utils.EventTarget} source The source that is
 *     listened to for touch/mouse events.
 * @constructor
 * @extends {gestures.utils.EventTranslator}
 */
gestures.GestureDetector = function(source) {
  goog.base(this, source);
  this.listenFor('touchstart', 'touchmove', 'touchend');
  this.startDetecting();
};
goog.inherits(gestures.GestureDetector, gestures.utils.EventTranslator);

/**
 * Initialize gesture detection variables.
 * @private
 */
gestures.GestureDetector.prototype.init_ = function() {
  this.hasActiveState_ = false;
  this.lastActiveState_ = gestures.GestureState.getNullState();
  this.activeState_ = gestures.GestureState.getNullState();
  this.gestureStates_ = [];
};

/**
 * Start detecting tap, swipe, swipe turn and drag gestures. This is called
 * automatically when the gesture detector is constructed.
 */
gestures.GestureDetector.prototype.startDetecting = function() {
  this.init_();
  this.detectInPriorityOrder(new gestures.TapState());
  this.detectInPriorityOrder(new gestures.SwipeTurnState());
  this.detectInPriorityOrder(new gestures.SwipeState());
  this.detectInPriorityOrder(new gestures.DragState());
};

/**
 * Disable all detection.
 */
gestures.GestureDetector.prototype.stopDetecting = function() {
  this.init_();
};

/**
 * Add detection for a given gesture. The order the state is added determines
 * its priority. States added first have the highest priority. If a high
 * priority state can start it will preempt the lower priority active state.
 * @param {gestures.GestureState} state The state to add to the gesture
 *     detection state machine.
 */
gestures.GestureDetector.prototype.detectInPriorityOrder = function(state) {
  state.registerGesture = goog.bind(this.registerGesture_, this);
  this.gestureStates_.push(state);
};

/**
 * Analyzes touch events to see if a gesture has occurred.
 * @param {Event|gestures.utils.Event} event The event to handle.
 * @override
 */
gestures.GestureDetector.prototype.handleEvent = function(event) {
  this.event_ = event;
  this.tryToEndActiveState_();
  this.tryToUpdateActiveState_();
  this.tryToStartInactiveState_();
};

/**
 * If there is an active gesture, update it with the new touch event.
 * @private
 */
gestures.GestureDetector.prototype.tryToUpdateActiveState_ = function() {
  if (!this.hasActiveState_) return;
  this.activeState_.update(this.event_);
};

/**
 * If there is an active gesture, check if it should end.
 * @private
 */
gestures.GestureDetector.prototype.tryToEndActiveState_ = function() {
  if (!this.hasActiveState_) return;
  if (this.activeState_.meetsEndCondition(this.event_)) {
    this.endActiveState_();
  }
};

/**
 * End the active state.
 * @private
 */
gestures.GestureDetector.prototype.endActiveState_ = function() {
  this.activeState_.end(this.event_);
  this.hasActiveState_ = false;
  this.lastActiveState_ = this.activeState_;
  this.activeState_ = gestures.GestureState.getNullState();
};

/**
 * Try to activate an inactive state in priority order and end the active
 * state if it has lower priority.
 * @private
 */
gestures.GestureDetector.prototype.tryToStartInactiveState_ = function() {
  var len = this.gestureStates_.length;
  for (var i = 0; i < len; i++) {
    var state = this.gestureStates_[i];
    if (state == this.activeState_) break;
    if (state.meetsStartCondition(this.event_, this.lastActiveState_)) {
      this.startActiveState_(state);
      break;
    }
  }
};

/**
 * @private
 * @param {gestures.GestureState} gesture The new active gesture state.
 */
gestures.GestureDetector.prototype.startActiveState_ = function(gesture) {
  this.endActiveState_(); // preemt the current active state
  this.activeState_ = gesture;
  this.hasActiveState_ = true;
  this.lastActiveState_ = gestures.GestureState.getNullState();
  this.activeState_.start(this.event_);
};

/**
 * Called by active gestures that detect a gesture event. Dispatches the gesture
 * event to listeners.
 * @private
 * @param {gestures.GestureEvent} gestureEvent Event to dispatch.
 */
gestures.GestureDetector.prototype.registerGesture_ = function(gestureEvent) {
  this.dispatchEvent(gestureEvent);
};
