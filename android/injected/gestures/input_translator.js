/**
 * @fileoverview Acts as a layer between the raw user input and the events
 *     passed to the gesture detector. It translates touch events into gesture
 *     touch events.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.InputTranslator');

goog.require('gestures.GestureTouchEvent');
goog.require('gestures.utils.Event');
goog.require('gestures.utils.EventTranslator');

/**
 * @param {!gestures.utils.EventTarget|Document} source The source that is
 *     listened to for touch/mouse events.
 * @constructor
 * @extends {gestures.utils.EventTranslator}
 */
gestures.InputTranslator = function(source) {
  goog.base(this, source);
  this.listenFor('touchstart', 'touchmove', 'touchend');
};
goog.inherits(gestures.InputTranslator, gestures.utils.EventTranslator);

/**
 * Transform the given event into a gesture touch event.
 * @param {gestures.utils.Event|Event} event The event to be translated.
 * @override
 */
gestures.InputTranslator.prototype.handleEvent = function(
    event) {
  this.inputEvent_ = event;
  this.previousTransformedEvent_ = this.transformedEvent_;
  this.transformedEvent_ = this.createFromTouchEvent();
  this.dispatchEvent(this.transformedEvent_);
};

/**
 * Creates a gesture touch event that wraps the given touch event.
 * @protected
 * @return {gestures.GestureTouchEvent} The new gesture touch event.
 */
gestures.InputTranslator.prototype.createFromTouchEvent =
    function() {
  var gestureTouchEvent = new gestures.GestureTouchEvent(this.inputEvent_.type);
  gestureTouchEvent.setBaseEvent(this.inputEvent_);
  gestureTouchEvent.setPrev(this.previousTransformedEvent_);
  if (gestureTouchEvent.hasLocation) {
    gestureTouchEvent.setLocation(this.inputEvent_.touches[0].screenX,
        this.inputEvent_.touches[0].screenY);
    gestureTouchEvent.setNumTouches(this.inputEvent_.touches.length);
  }
  return gestureTouchEvent;
};
