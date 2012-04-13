/**
 * @fileoverview A wrapper around a touch and mouse event. It provides useful
 *     methods for getting distance and angles between events as well as caching
 *     results.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.GestureTouchEvent');

goog.require('gestures.GestureEvent.Direction');
goog.require('gestures.utils.math');

/**
 * @param {TouchEvent|MouseEvent} event The base event to wrap.
 * @param {gestures.GestureTouchEvent=} opt_prevEvent The previous event.
 * @constructor
 */
gestures.GestureTouchEvent = function(event, opt_prevEvent) {
  this.baseEvent = event;
  if (opt_prevEvent) {
    this.prevBaseEvent = opt_prevEvent.baseEvent;
    if (opt_prevEvent.type != 'touchend') {
      this.prev = opt_prevEvent;
    }
  }
  if (this.isTouchEvent_(event)) {
    this.initFromTouchEvent_();
  } else {
    this.initFromMouseEvent_();
  }
  this.isMultitouch = this.numTouches > 1;
};

/**
 * The number of pixels off an angle can be in either direction.
 * @const
 * @type {number}
 */
gestures.GestureTouchEvent.ANGLE_FORGIVENESS = 35;

/**
 * The double mousemove event that signals a touchend is not fired if the user
 * lifts their finger within this many pixels from where the event started.
 * @const
 * @type {number} 160^2
 */
// TODO: make DPI independent
gestures.GestureTouchEvent.SQUARED_NO_TOUCHEND_RADIUS = 25600;

/**
 * @private
 * @param {Event} event Event to check.
 * @return {boolean} Returns true if given event is a touch event.
 */
gestures.GestureTouchEvent.prototype.isTouchEvent_ = function(event) {
  return event.type.indexOf('touch') != -1;
};

/**
 * @private
 */
gestures.GestureTouchEvent.prototype.initFromMouseEvent_ = function() {
  this.fromMouseEvent = true;
  this.numTouches = 1;
  this.x = this.baseEvent.screenX;
  this.y = this.baseEvent.screenY;
  this.hasLocation = true;
  this.determineMouseEventType_();
};

/**
 * Infer if the user has just touched the screen, is moving on the screen or has
 * just lost contact with the screen by looking at what events have taken place.
 * @private
 */
gestures.GestureTouchEvent.prototype.determineMouseEventType_ = function() {
  if (this.prev && this.prev.fromTouchEvent) {
    this.type = 'touchstart';
  } else if (this.hasSameLocationAsPrevMousemove_()) {
    this.type = 'touchend';
  } else if (!this.prev) {
    this.type = 'touchstart';
  } else if (this.isCloseToTouchStart_()) {
    this.type = 'touchend';
  } else {
    this.type = 'touchmove';
  }
};

/**
 * A touchend is signaled by a mousemove event in the same location as a
 * previous event.
 * @private
 * @return {boolean} Returns true if the event is a mousemove event in the
 * same location as the previous event.
 */
gestures.GestureTouchEvent.prototype.hasSameLocationAsPrevMousemove_ =
    function() {
  return !!this.prevBaseEvent && this.prevBaseEvent.screenX == this.x &&
      this.prevBaseEvent.screenY == this.y;
};

/**
 * A touchend is signaled from a mousemove event occurring within a certain
 * number of pixels from a mousestart event.
 * @private
 * @return {boolean} Returns true if the event occurred within a certain radius
 *     of the touchstart event.
 */
gestures.GestureTouchEvent.prototype.isCloseToTouchStart_ = function() {
  return this.prev.type == 'touchstart' &&
      this.getSquaredDistance() <=
      gestures.GestureTouchEvent.SQUARED_NO_TOUCHEND_RADIUS;
};

/**
 * Pull information from a touch event with the number of touches increased by
 * one to offset Explore By Touch.
 * @private
 */
gestures.GestureTouchEvent.prototype.initFromTouchEvent_ = function() {
  this.fromTouchEvent = true;
  this.type = this.baseEvent.type;
  this.hasLocation = this.type != 'touchend';

  if (this.hasLocation) {
    this.x = this.baseEvent.touches[0].screenX;
    this.y = this.baseEvent.touches[0].screenY;
    this.numTouches = this.baseEvent.touches.length + 1;
  } else {
    this.numTouches = 2;
  }
};

/**
 * Returns the angle between this event and the previous event.
 * @return {number} the angle in degrees.
 */
gestures.GestureTouchEvent.prototype.getAngle = function() {
  if (goog.isDef(this.angle_)) return this.angle_;
  if (!this.hasLocation || !this.prev || !this.prev.hasLocation) {
    this.angle_ = 0;
  } else {
    this.angle_ = gestures.utils.math.angle(
        this.prev.x, this.prev.y, this.x, this.y);
  }
  return this.angle_;
};

/**
 * Get the squared distance between the location of this and the previous event.
 * @return {number} Returns the distance in pixels.
 */
gestures.GestureTouchEvent.prototype.getSquaredDistance = function() {
  if (goog.isDef(this.squaredDistance_)) return this.squaredDistance_;
  if (!this.hasLocation || !this.prev || !this.prev.hasLocation) {
    this.squaredDistance_ = 0;
  } else {
    var dx = this.x - this.prev.x;
    var dy = this.y - this.prev.y;
    this.squaredDistance_ = dx * dx + dy * dy;
  }
  return this.squaredDistance_;
};

/**
 * Get the number of milliseconds since the last event.
 * @return {number} Returns the elapsed time in milliseconds.
 */
gestures.GestureTouchEvent.prototype.getElapsedTime = function() {
  if (!this.prev) return 0;
  return this.baseEvent.timeStamp - this.prev.baseEvent.timeStamp;
};

/**
 * Get the speed the user was moving when the event occurred.
 * @return {number} Returns the speed in pixels^2 per millisecond^2.
 */
gestures.GestureTouchEvent.prototype.getSquaredSpeed = function() {
  if (!this.speed_) {
    var time = this.getElapsedTime() || 1;
    this.speed_ = this.getSquaredDistance() / (time * time);
  }
  return this.speed_;
};

/**
 * Gets the primary cardinal direction the event is moving in. NONE is returned
 * if there is no direction information or the angle is diagonal.
 * @return {!gestures.GestureEvent.Direction}
 */
gestures.GestureTouchEvent.prototype.getCardinalDirection = function() {
  if (goog.isDef(this.direction_)) return this.direction_;
  if (!this.hasLocation || !this.prev || !this.prev.hasLocation) {
    this.direction_ = gestures.GestureEvent.Direction.NONE;
    return this.direction_;
  }
  var angle = this.getAngle();
  var threshold = gestures.GestureTouchEvent.ANGLE_FORGIVENESS;
  if (this.absAngleDifference_(angle, 0) < threshold) {
    this.direction_ = gestures.GestureEvent.Direction.EAST;
  } else if (this.absAngleDifference_(angle, 90) < threshold) {
    this.direction_ = gestures.GestureEvent.Direction.SOUTH;
  } else if (this.absAngleDifference_(angle, 180) < threshold) {
    this.direction_ = gestures.GestureEvent.Direction.WEST;
  } else if (this.absAngleDifference_(angle, 270) < threshold) {
    this.direction_ = gestures.GestureEvent.Direction.NORTH;
  } else {
    this.direction_ = gestures.GestureEvent.Direction.NONE;
  }
  return this.direction_;
};

/**
 * @private
 * @param {number} angle1 The first angle, measured in degrees.
 * @param {number} angle2 The second angle, measured in degrees.
 * @return {number} The absolute difference between the two angles degrees.
 */
gestures.GestureTouchEvent.prototype.absAngleDifference_ = function(
    angle1, angle2) {
  return Math.abs(gestures.utils.math.angleDifference(angle1, angle2));
};
