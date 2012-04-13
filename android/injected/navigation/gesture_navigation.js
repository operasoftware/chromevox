/**
 * @fileoverview Enables navigating the DOM through gestures.
 *   - Drag to explore by touch.
 *   - Tap an element to focus it.
 *   - Tap after a swipe to force click the currently focused element.
 *   - Pinch/spread to zoom out/in.
 *   - Drag with two fingers to pan.
 *   - Swipe down to navigate forward.
 *   - Swipe up to navigate backward.
 *   - Swipe right to jump to next jump item.
 *   - Swipe left to jump to previous jump item.
 *   - Swipe down or up and move right to increase granularity.
 *   - Swipe down or up and move left to decrease granularity.
 *   - Swipe right or left and move up to change to the previous jump item.
 *   - Swipe right or left and move down to change the next jump item.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('navigation.gesturenav');

goog.require('gestures.GestureDetector');
goog.require('gestures.GestureEvent.Direction');
goog.require('gestures.GestureEvent.Type');
goog.require('gestures.utils.math');

/**
 * The available jump levels that can be selected and the order they are in.
 * @enum {number}
 */
navigation.gesturenav.JUMP_LEVELS = {
  TEXT: 0,
  JUMP_POINT: 1,
  LINK: 2
};

/**
 * The number of available jump levels.
 * @type {number}
 */
navigation.gesturenav.NUM_JUMP_LEVELS = 3;

/**
 * Begin gesture navigation.
 * @param {!navigation.DomNavigator} domNavigator The DOM navigator to use.
 * @param {!Document} source The source that is listened for touch/mouse events.
 */
navigation.gesturenav.start = function(domNavigator, source) {
  this.source_ = source;
  this.tapEnabled_ = false;
  this.domNavigator_ = domNavigator;
  this.jumpLevel_ = 1;
  this.initGestureDetector_();
  this.addGestureListeners_();
};

/**
 * Create a new gesture detector that detects swipe turns, swipes, drags and
 * taps.
 * @private
 */
navigation.gesturenav.initGestureDetector_ = function() {
  this.gestureDetector_ = new gestures.GestureDetector(this.source_);
};

/**
 * Listen for gestures.
 * @private
 */
navigation.gesturenav.addGestureListeners_ = function() {
  var Type = gestures.GestureEvent.Type;
  this.addListener_(Type.SWIPE, this.handleSwipe_);
  this.addListener_(Type.SWIPE_TURN, this.setLevel_);
  this.addListener_(Type.DRAG_START, this.startExploreByTouch_);
  this.addListener_(Type.DRAG_END, this.stopExploreByTouch_);
  this.addListener_(Type.TAP, this.handleTapEvent_);
};

/**
 * @param {gestures.GestureEvent.Type} type The type of event to listen for.
 * @param {Function} listener The function called when the event occurs.
 * @private
 */
navigation.gesturenav.addListener_ = function(type, listener) {
  var boundListener = goog.bind(listener, this);
  this.gestureDetector_.addEventListener(type, boundListener);
};

/**
 * @param {gestures.GestureEvent} e The swipe turn event that changes the
 *     jump or detail level. If the first direction is vertical it sets
 *     granularity, horizontal sets jump level.
 * @private
 */
navigation.gesturenav.setLevel_ = function(e) {
  if (e.firstDirection == 'south' || e.firstDirection == 'north') {
    this.adjustGranularity_(e.secondDirection);
  } else { // direction is east or west
    this.adjustJumpLevel_(e.secondDirection);
  }
};

/**
 * Move to the next or previous granularity.
 * @param {gestures.GestureEvent.Direction} direction The direction
 *     determines if granularity is increased or decreased. East is next, west
 *     is previous.
 * @private
 */
navigation.gesturenav.adjustGranularity_ = function(direction) {
  if (direction == 'east') {
    this.domNavigator_.nextGranularity();
  } else if (direction == 'west') {
    this.domNavigator_.previousGranularity();
  }
};

/**
 * Move to the next or previous jump level.
 * @param {gestures.GestureEvent.Direction} direction The direction
 *     determines which jump level is set. North is next, South is previous.
 * @private
 */
navigation.gesturenav.adjustJumpLevel_ = function(direction) {
  if (direction == 'south') {
    this.jumpLevel_++;
    if (this.jumpLevel_ >= navigation.gesturenav.NUM_JUMP_LEVELS) {
      this.jumpLevel_ = 0;
    }
  } else if (direction == 'north') {
    this.jumpLevel_--;
    if (this.jumpLevel_ < 0) {
      this.jumpLevel_ = navigation.gesturenav.NUM_JUMP_LEVELS - 1;
    }
  } else {
    return; // no change has been made
  }
  this.speakJumpLevel_();
};

/**
 * Speak the current jump level.
 * @private
 */
navigation.gesturenav.speakJumpLevel_ = function() {
  // TODO: internationalize raw strings
  if (this.jumpLevel_ == navigation.gesturenav.JUMP_LEVELS.LINK) {
    this.domNavigator_.speakJumpLevel('link');
  } else if (this.jumpLevel_ == navigation.gesturenav.JUMP_LEVELS.JUMP_POINT) {
    this.domNavigator_.speakJumpLevel('jump point');
  } else {
    this.domNavigator_.speakJumpLevel('editable text');
  }
};

/**
 * Handle a swipe, which can be in one of four directions.
 * @param {gestures.GestureEvent} e The swipe gesture event.
 * @private
 */
navigation.gesturenav.handleSwipe_ = function(e) {
  this.tapEnabled_ = true;
  if (e.direction == gestures.GestureEvent.Direction.EAST) {
    this.jumpToNext_();
  } else if (e.direction == gestures.GestureEvent.Direction.WEST) {
    this.jumpToPrevious_();
  } else if (e.direction == gestures.GestureEvent.Direction.SOUTH) {
    this.domNavigator_.forward();
  } else { // swipe in north direction
    this.domNavigator_.backward();
  }
};

/**
 * Jump to the next item.
 * @private
 */
navigation.gesturenav.jumpToNext_ = function() {
  this.jumpToLevel_(true);
};

/**
 * Jump to the previous item.
 * @private
 */
navigation.gesturenav.jumpToPrevious_ = function() {
  this.jumpToLevel_(false);
};

/**
 * Perform a jump at the current jump level.
 * @private
 * @param {boolean} next Jump to the next item if true, otherwise jump to the
 *     previous item.
 */
navigation.gesturenav.jumpToLevel_ = function(next) {
  if (this.jumpLevel_ == navigation.gesturenav.JUMP_LEVELS.LINK) {
    if (next) this.domNavigator_.nextLink();
    else this.domNavigator_.previousLink();
  } else if (this.jumpLevel_ == navigation.gesturenav.JUMP_LEVELS.JUMP_POINT) {
    if (next) this.domNavigator_.nextJumpPoint();
    else this.domNavigator_.previousJumpPoint();
  } else {
    if (next) this.domNavigator_.nextEditText();
    else this.domNavigator_.previousEditText();
  }
};

/**
 * @param {gestures.GestureEvent} e The drag start gesture event.
 * @private
 */
navigation.gesturenav.startExploreByTouch_ = function(e) {
  this.tapEnabled_ = false;
  this.domNavigator_.startExploreByTouch();
};

/**
 * @param {gestures.GestureEvent} e The drag end gesture event.
 * @private
 */
navigation.gesturenav.stopExploreByTouch_ = function(e) {
  this.domNavigator_.stopExploreByTouch();
};

/**
 * @param {gestures.GestureEvent} e The tap gesture event.
 * @private
 */
navigation.gesturenav.handleTapEvent_ = function(e) {
  if (this.tapEnabled_) {
    this.domNavigator_.clickCurrentFocus();
  } else {
    this.domNavigator_.announceTarget(e.baseEvent);
  }
};
