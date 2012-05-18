/**
 * @fileoverview Enables navigating the DOM through gestures.
 *   - Drag to explore by touch.
 *   - Tap an element to focus it.
 *   - Tap after a swipe to force click the currently focused element.
 *   - Pinch/spread to zoom out/in.
 *   - Drag with two fingers to pan.
 *   - Swipe down to navigate forward.
 *   - Swipe up to navigate backward.
 *   - Swipe right to increase granularity.
 *   - Swipe left to decrease granularity.
 *   - Swipe down then up to jump to next jump item.
 *   - Swipe up then down to jump to previous jump item.
 *   - Swipe right then left to cycle to the next jump item.
 *   - Swipe left then right to cycle to the previous jump item.
 *   - Swipe right then up or up then right to jump to the top of the page.
 *   - Swipe right then down or down then right to navigate forward in history.
 *   - Swipe left then down or down then left to navigate backward in history.
 *   - Swipe left then up or up then left to stop speech.
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
  HEADING: 0,
  LINK: 1,
  BUTTON: 2,
  TEXT: 3
};

/**
 * The number of available jump levels.
 * @type {number}
 */
navigation.gesturenav.NUM_JUMP_LEVELS = 4;

/**
 * Begin gesture navigation.
 * @param {!navigation.DomNavigator} domNavigator The DOM navigator to use.
 * @param {!gestures.utils.EventTarget} source The source that is
 *     listened to for touch/mouse events.
 */
navigation.gesturenav.start = function(domNavigator, source) {
  this.source_ = source;
  this.tapClicksCurrentFocus_ = false;
  this.domNavigator_ = domNavigator;
  this.jumpLevel_ = 1;
  this.gestureDetector_ = new gestures.GestureDetector(this.source_);
  this.addGestureListeners_();
};

/**
 * Listen for gestures.
 * @private
 */
navigation.gesturenav.addGestureListeners_ = function() {
  var Type = gestures.GestureEvent.Type;
  this.addListener_(Type.SWIPE, this.handleSwipe_);
  this.addListener_(Type.SWIPE_TURN, this.handleSwipeTurn_);
  this.addListener_(Type.DRAG_START, this.handleDragStart_);
  this.addListener_(Type.DRAG_END, this.handleDragEnd_);
  this.addListener_(Type.TAP, this.handleTap_);
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
 * Handle a swipe, which can be in one of four directions.
 * @param {gestures.GestureEvent} e The swipe gesture event.
 * @private
 */
navigation.gesturenav.handleSwipe_ = function(e) {
  this.tapClicksCurrentFocus_ = true;
  if (e.direction == gestures.GestureEvent.Direction.EAST) {
    this.domNavigator_.nextGranularity();
  } else if (e.direction == gestures.GestureEvent.Direction.WEST) {
    this.domNavigator_.previousGranularity();
  } else if (e.direction == gestures.GestureEvent.Direction.SOUTH) {
    this.domNavigator_.forward();
  } else { // direction == NORTH
    this.domNavigator_.backward();
  }
};

/**
 * Handle a swipe turn.
 * @param {gestures.GestureEvent} e The swipe turn gesture event.
 * @private
 */
navigation.gesturenav.handleSwipeTurn_ = function(e) {
  var seq = e.firstDirection + '-' + e.secondDirection;
  if (seq == 'south-north') {
    this.jumpToNext_();
  } else if (seq == 'north-south') {
    this.jumpToPrevious_();
  } else if (seq == 'east-west') {
    this.nextJumpLevel_();
  } else if (seq == 'west-east') {
    this.previousJumpLevel_();

  } else if (seq == 'east-north' || seq == 'north-east') {
    this.domNavigator_.jumpToTop();
  } else if (seq == 'east-south' || seq == 'south-east') {
    this.domNavigator_.forwardInHistory();
  } else if (seq == 'west-south' || seq == 'south-west') {
    this.domNavigator_.backwardInHistory();
  } else if (seq == 'west-north' || seq == 'north-west') {
    this.domNavigator_.stopSpeech();
  }
};

/**
 * @param {gestures.GestureEvent} e The drag start gesture event.
 * @private
 */
navigation.gesturenav.handleDragStart_ = function(e) {
  this.tapClicksCurrentFocus_ = false;
  this.domNavigator_.startExploreByTouch();
};

/**
 * @param {gestures.GestureEvent} e The drag end gesture event.
 * @private
 */
navigation.gesturenav.handleDragEnd_ = function(e) {
  this.domNavigator_.stopExploreByTouch();
};

/**
 * @param {gestures.GestureEvent} e The tap gesture event.
 * @private
 */
navigation.gesturenav.handleTap_ = function(e) {
  if (this.tapClicksCurrentFocus_) {
    this.domNavigator_.clickCurrentFocus();
  } else {
    this.domNavigator_.announceTarget(e.baseEvent);
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
  this.tapClicksCurrentFocus_ = true;
  switch (this.jumpLevel_) {
    case navigation.gesturenav.JUMP_LEVELS.LINK:
      if (next) this.domNavigator_.nextLink();
      else this.domNavigator_.previousLink();
      break;
    case navigation.gesturenav.JUMP_LEVELS.HEADING:
      if (next) this.domNavigator_.nextHeading();
      else this.domNavigator_.previousHeading();
      break;
    case navigation.gesturenav.JUMP_LEVELS.BUTTON:
      if (next) this.domNavigator_.nextEditText();
      else this.domNavigator_.previousEditText();
      break;
    case navigation.gesturenav.JUMP_LEVELS.TEXT:
      if (next) this.domNavigator_.nextEditText();
      else this.domNavigator_.previousEditText();
  }
};

/**
 * Cycle to the next jump level.
 * @private
 */
navigation.gesturenav.nextJumpLevel_ = function() {
  this.changeJumpLevel_(true);
};

/**
 * Cycle to the previous jump level.
 * @private
 */
navigation.gesturenav.previousJumpLevel_ = function() {
  this.changeJumpLevel_(false);
};

/**
 * Cycle to the next or previous jump level.
 * @param {boolean} next Cycle to the next jump level if true, cycle to the
 *     previous jump level if false.
 * @private
 */
navigation.gesturenav.changeJumpLevel_ = function(next) {
  if (next) {
    this.jumpLevel_++;
    if (this.jumpLevel_ >= navigation.gesturenav.NUM_JUMP_LEVELS) {
      this.jumpLevel_ = 0;
    }
  } else {
    this.jumpLevel_--;
    if (this.jumpLevel_ < 0) {
      this.jumpLevel_ = navigation.gesturenav.NUM_JUMP_LEVELS - 1;
    }
  }
  this.speakJumpLevel_();
};

/**
 * Speak the current jump level.
 * @private
 */
navigation.gesturenav.speakJumpLevel_ = function() {
  // TODO: internationalize raw strings
  switch (this.jumpLevel_) {
    case navigation.gesturenav.JUMP_LEVELS.LINK:
      this.domNavigator_.speakJumpLevel('link');
      break;
    case navigation.gesturenav.JUMP_LEVELS.HEADING:
      this.domNavigator_.speakJumpLevel('heading');
      break;
    case navigation.gesturenav.JUMP_LEVELS.BUTTON:
      this.domNavigator_.speakJumpLevel('button');
      break;
    case navigation.gesturenav.JUMP_LEVELS.TEXT:
      this.domNavigator_.speakJumpLevel('editable text');
  }
};
