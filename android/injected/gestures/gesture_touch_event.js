/**
 * @fileoverview A touch event that is part of a gesture. It provides useful
 *     methods for getting distance and angles between events as well as caching
 *     results.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.GestureTouchEvent');

goog.require('androidvoxnav.constants');
goog.require('gestures.GestureEvent.Direction');
goog.require('gestures.utils.Event');
goog.require('gestures.utils.math');

/**
 * Constructs a gesture touch event.
 * @param {string} type The event type.
 * @constructor
 * @extends {gestures.utils.Event}
 */
gestures.GestureTouchEvent = function(type) {
  goog.base(this, type);
  this.hasLocation = type != 'touchend';
  this.setNumTouches(1);
};
goog.inherits(gestures.GestureTouchEvent, gestures.utils.Event);

/**
 * Set the event type.
 * @param {gestures.utils.Event|Event} baseEvent The base event to wrap.
 */
gestures.GestureTouchEvent.prototype.setBaseEvent = function(baseEvent) {
  this.baseEvent = baseEvent;
};

/**
 * Set the event type.
 * @param {string} type The event type.
 */
gestures.GestureTouchEvent.prototype.setType = function(type) {
  this.type = type;
  this.hasLocation = type != 'touchend';
};

/**
 * Set the previous event.
 * @param {gestures.GestureTouchEvent=} prev The previous event in the gesture.
 */
gestures.GestureTouchEvent.prototype.setPrev = function(prev) {
  this.prev = prev;
  this.hasPrev = this.prev && this.prev.type != 'touchend';
};

/**
 * Set the number of touches.
 * @param {number} numTouches The number of touches corresponding to the event.
 */
gestures.GestureTouchEvent.prototype.setNumTouches = function(numTouches) {
  this.numTouches = numTouches;
  this.isMultitouch = numTouches > 1;
};

/**
 * Set the event location.
 * @param {number} x The x coordinate in pixels.
 * @param {number} y The y coordinate in pixels.
 */
gestures.GestureTouchEvent.prototype.setLocation = function(x, y) {
  this.x = x;
  this.y = y;
};

/**
 * The number of degrees off an angle can be in either direction.
 * @const
 * @type {number}
 */
gestures.GestureTouchEvent.ANGLE_FORGIVENESS = 35;

/**
 * Returns the angle between this event and the previous event.
 * @return {number} the angle in degrees.
 */
gestures.GestureTouchEvent.prototype.getAngle = function() {
  if (goog.isDef(this.angle_)) return this.angle_;
  if (!this.hasLocation || !this.hasPrev) {
    this.angle_ = 0;
  } else {
    this.angle_ = gestures.utils.math.angle(
        this.prev.x, this.prev.y, this.x, this.y);
  }
  return this.angle_;
};

/**
 * Get the squared distance from the previous event.
 * @return {number} Returns the distance in pixels.
 */
gestures.GestureTouchEvent.prototype.getSquaredDistance = function() {
  if (goog.isDef(this.squaredDistance_)) return this.squaredDistance_;
  if (!this.hasLocation || !this.hasPrev) {
    this.squaredDistance_ = 0;
  } else {
    return gestures.GestureTouchEvent.squaredDistance(this, this.prev);
  }
  return this.squaredDistance_;
};

/**
 * Get the number of milliseconds since the last event.
 * @return {number} Returns the elapsed time in milliseconds.
 */
gestures.GestureTouchEvent.prototype.getElapsedTime = function() {
  if (!this.hasPrev) return 0;
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
  if (!this.hasLocation || !this.hasPrev) {
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

/**
 * Calculates the squared distance in pixels between two touch events. The
 * distance is scaled based on the device density.
 * @param {gestures.GestureTouchEvent} event1
 * @param {gestures.GestureTouchEvent} event2
 * @return {number} Returns the squared distance in pixels.
 */
gestures.GestureTouchEvent.squaredDistance = function(event1, event2) {
  var dx = event1.x - event2.x;
  var dy = event1.y - event2.y;
  return (dx * dx + dy * dy) / androidvoxnav.constants.devicePixelRatio;
};
