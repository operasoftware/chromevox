/**
 * @fileoverview Acts as a layer between the raw user input and the events
 *     passed to the gesture detector. It translates touch and mouse events sent
 *     when touch exploration is enabled into gesture touch events.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('androidvoxnav.TouchExploreInputTranslator');

goog.require('gestures.GestureTouchEvent');
goog.require('gestures.InputTranslator');
goog.require('gestures.utils.Event');

/**
 * @param {!gestures.utils.EventTarget|Document} source The source that is
 *     listened to for touch/mouse events.
 * @constructor
 * @extends {gestures.InputTranslator}
 */
androidvoxnav.TouchExploreInputTranslator = function(source) {
  goog.base(this, source);
  this.listenFor('mousemove'); // already listening to touch events
};
goog.inherits(androidvoxnav.TouchExploreInputTranslator,
    gestures.InputTranslator);

/**
 * Touch exploration prevents any events from being sent within this many pixels
 * at mdpi from the touch start event, except for touch end events.
 * @const
 * @type {number} 80^2
 */
androidvoxnav.TouchExploreInputTranslator.SQUARED_TOUCH_END_ONLY_RADIUS = 6400;

/**
 * Interpret the given event and dispatch a touch event if needed.
 * @param {gestures.utils.Event|Event} event The event to be translated.
 * @override
 */
androidvoxnav.TouchExploreInputTranslator.prototype.handleEvent = function(
    event) {
  this.inputEvent_ = event;
  this.previousTransformedEvent_ = this.transformedEvent_;
  if (this.isTouchEvent_(event)) {
    this.transformTouchEvent_();
  } else {
    this.transformMouseEvent_();
  }
};

/**
 * @private
 * @param {gestures.utils.Event|Event} event Event to check.
 * @return {boolean} Returns true if given event is a touch event.
 */
androidvoxnav.TouchExploreInputTranslator.prototype.isTouchEvent_ =
    function(event) {
  return event.type.indexOf('touch') != -1;
};

/**
 * Forward the touch event with the number of touches increased by one.
 * @private
 */
androidvoxnav.TouchExploreInputTranslator.prototype.transformTouchEvent_ =
    function() {
  this.transformedEvent_ = this.createFromTouchEvent();
  this.transformedEvent_.numTouches++;
  this.transformedEvent_.isMultitouch = true;
  this.dispatchEvent(this.transformedEvent_);
};

/**
 * Infer which touch event(s) the mouse event corresponds to and dispatch them.
 * @private
 */
androidvoxnav.TouchExploreInputTranslator.prototype.transformMouseEvent_ =
    function() {
  this.transformedEvent_ = this.createFromMouseEvent();
  this.determineTypeFromMouseEvent_();
  this.dispatchEvent(this.transformedEvent_);
  if (this.transformedEvent_.type == 'touchmove' &&
      this.isWithinTouchEndOnlyRadius_()) {
    this.dispatchTouchEndEvent_();
  }
};

/**
 * Creates a gesture touch event that wraps the given mouse event.
 * @protected
 * @return {gestures.GestureTouchEvent} The new gesture touch event.
 */
androidvoxnav.TouchExploreInputTranslator.prototype.createFromMouseEvent =
    function() {
  var gestureTouchEvent = new gestures.GestureTouchEvent('touchmove');
  gestureTouchEvent.setBaseEvent(this.inputEvent_);
  gestureTouchEvent.setPrev(this.previousTransformedEvent_);
  gestureTouchEvent.setLocation(this.inputEvent_.screenX,
      this.inputEvent_.screenY);
  return gestureTouchEvent;
};

/**
 * Infer if the user has just touched the screen, is moving on the screen or has
 * just lost contact with the screen by looking at what events have taken place.
 * @private
 */
androidvoxnav.TouchExploreInputTranslator.prototype.
    determineTypeFromMouseEvent_ = function() {
  var event = this.transformedEvent_;
  if (event.hasPrev && this.isTouchEvent_(event.prev.baseEvent)) {
    this.transformedEvent_.setType('touchstart');
  } else if (this.hasSameLocationAsPrevMousemove_()) {
    this.transformedEvent_.setType('touchend');
  } else if (!event.hasPrev) {
    this.transformedEvent_.setType('touchstart');
  } else {
    this.transformedEvent_.setType('touchmove');
  }
};

/**
 * A touchend is signaled by a mousemove event in the same location as a
 * previous event.
 * @private
 * @return {boolean} Returns true if the event is a mousemove event in the
 * same location as the previous event.
 */
androidvoxnav.TouchExploreInputTranslator.prototype.
    hasSameLocationAsPrevMousemove_ = function() {
  return !!this.previousTransformedEvent_ &&
      this.previousTransformedEvent_.baseEvent.type == 'mousemove' &&
      this.previousTransformedEvent_.x == this.transformedEvent_.x &&
      this.previousTransformedEvent_.y == this.transformedEvent_.y;
};

/**
 * Determines if the current event occurred within the touch end only radius.
 * @private
 * @return {boolean} Returns true if the event is within the touch end only
 *     radius.
 */
androidvoxnav.TouchExploreInputTranslator.prototype.
    isWithinTouchEndOnlyRadius_ = function() {
  return this.transformedEvent_.prev.type == 'touchstart' &&
      this.transformedEvent_.getSquaredDistance() <
      androidvoxnav.TouchExploreInputTranslator.SQUARED_TOUCH_END_ONLY_RADIUS;
};

/**
 * When an event occurs within the touch end only radius it acts as both a
 * touch move and touch end.
 * @private
 */
androidvoxnav.TouchExploreInputTranslator.prototype.dispatchTouchEndEvent_ =
    function() {
  this.previousTransformedEvent_ = this.transformedEvent_;
  this.transformedEvent_ = new gestures.GestureTouchEvent('touchend');
  this.transformedEvent_.setBaseEvent(this.previousTransformedEvent_.baseEvent);
  this.transformedEvent_.setPrev(this.previousTransformedEvent_);
  this.dispatchEvent(this.transformedEvent_);
};
