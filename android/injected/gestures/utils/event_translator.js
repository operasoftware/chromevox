/**
 * @fileoverview An abstract class that listens for and dispatches events. It
 *     implements the event listener and event target interface.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('gestures.utils.EventTranslator');

goog.require('gestures.utils.Event');
goog.require('gestures.utils.EventTarget');

/**
 * @param {!gestures.utils.EventTarget|Document} target The event target that is
 *     listened to.
 * @constructor
 * @extends {gestures.utils.EventTarget}
 */
gestures.utils.EventTranslator = function(target) {
  goog.base(this);
  this.target_ = target;
};
goog.inherits(gestures.utils.EventTranslator, gestures.utils.EventTarget);

/**
 * Listen for events from the base event target.
 * @param {...string} var_args The types of events to listen for.
 */
gestures.utils.EventTranslator.prototype.listenFor = function(
    var_args) {
  var len = arguments.length;
  for (var i = 0; i < len; i++) {
    this.target_.addEventListener(arguments[i], this, true);
  }
};

/**
 * Override to translate the received events. Default behavior is to forward
 * the event without modification.
 * @param {gestures.utils.Event|Event} event The event to be traslated.
 */
gestures.utils.EventTranslator.prototype.handleEvent = function(event) {
  this.dispatchEvent(event);
};
