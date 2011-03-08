// Copyright 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Base class for Text-To-Speech-Engines.
 *
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 */

goog.provide('cvox.AbstractTts');

goog.require('cvox.AbstractLogger');

/**
 * Creates a new instance.
 * @constructor
 * @extends {cvox.AbstractLogger}
 */
cvox.AbstractTts = function() {
  //Inherit AbstractLogger
  cvox.AbstractLogger.call(this);
  this.ttsProperties = new Object();
};
goog.inherits(cvox.AbstractTts, cvox.AbstractLogger);

/**
 * Default TTS properties for this TTS engine.
 * @type {Object}
 * @protected
 */
cvox.AbstractTts.prototype.ttsProperties;

/**
 * Override the super class method to configure logging.
 * @return {boolean} If logging is enabled.
 */
cvox.AbstractTts.prototype.logEnabled = function() {
  return cvox.AbstractTts.DEBUG;
};

/**
 * Speaks the given string using the specified queueMode and properties.
 * @param {string} textString The string of text to be spoken.
 * @param {number=} queueMode The queue mode: cvox.AbstractTts.QUEUE_MODE_FLUSH
 *        for flush, cvox.AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 */
cvox.AbstractTts.prototype.speak = function(textString, queueMode,
    properties) {
  if (this.logEnabled()) {
    this.log('[' + this.getName() + '] speak(' + textString + ', ' + queueMode +
        (properties ? ', ' + properties.toString() : '') + ')');
  }
};

/**
 * Returns true if the TTS is currently speaking.
 * @return {boolean} True if the TTS is speaking.
 */
cvox.AbstractTts.prototype.isSpeaking = function() {
  if (this.logEnabled()) {
    this.log('[' + this.getName() + '] isSpeaking()');
  }
  return false;
};

/**
 * Stops speech.
 */
cvox.AbstractTts.prototype.stop = function() {
  if (this.logEnabled()) {
    this.log('[' + this.getName() + '] stop()');
  }
};

/**
 * Retrieves the default TTS properties for this TTS engine.
 * @return {Object} Default TTS properties.
 */
cvox.AbstractTts.prototype.getDefaultTtsProperties = function() {
  return this.ttsProperties;
};

/**
 * Sets the default TTS properties for this TTS engine.
 * @param {Object} ttsProperties Default TTS properties.
 */
cvox.AbstractTts.prototype.setDefaultTtsProperties = function(ttsProperties) {
  this.ttsProperties = ttsProperties;
};

/**
 * Increases a TTS speech property.
 * @param {string} property_name The name of the property to increase.
 */
cvox.AbstractTts.prototype.increaseProperty = function(property_name) {
  if (property_name == cvox.AbstractTts.TTS_PROPERTY_RATE) {
    this.ttsProperties.rate = this.increasePropertyValue(
        this.ttsProperties.rate);
    this.speak(cvox.AbstractTts.str.increaseRate, 0, this.ttsProperties);
  } else if (property_name == cvox.AbstractTts.TTS_PROPERTY_PITCH) {
    this.ttsProperties.pitch = this.increasePropertyValue(
        this.ttsProperties.pitch);
    this.speak(cvox.AbstractTts.str.increasePitch, 0, this.ttsProperties);
  } else if (property_name == cvox.AbstractTts.TTS_PROPERTY_VOLUME) {
    this.ttsProperties.volume = this.increasePropertyValue(
        this.ttsProperties.volume);
    this.speak(cvox.AbstractTts.str.increaseVolume, 0, this.ttsProperties);
  }
};

/**
 * Decreases a TTS speech property.
 * @param {string} property_name The name of the property to decrease.
 */
cvox.AbstractTts.prototype.decreaseProperty = function(property_name) {
  if (property_name == cvox.AbstractTts.TTS_PROPERTY_RATE) {
    this.ttsProperties.rate = this.decreasePropertyValue(
        this.ttsProperties.rate);
    this.speak(cvox.AbstractTts.str.decreaseRate, 0, this.ttsProperties);
  } else if (property_name == cvox.AbstractTts.TTS_PROPERTY_PITCH) {
    this.ttsProperties.pitch = this.decreasePropertyValue(
        this.ttsProperties.pitch);
    this.speak(cvox.AbstractTts.str.decreasePitch, 0, this.ttsProperties);
  } else if (property_name == cvox.AbstractTts.TTS_PROPERTY_VOLUME) {
    this.ttsProperties.volume = this.decreasePropertyValue(
        this.ttsProperties.volume);
    this.speak(cvox.AbstractTts.str.decreaseVolume, 0, this.ttsProperties);
  }
};

/**
 * Merges the given properties with the default ones.
 * @param {Object=} properties The properties to merge with the default.
 * @return {Object} The merged properties.
 */
cvox.AbstractTts.prototype.mergeProperties = function(properties) {
  if (!properties) {
    return this.ttsProperties;
  }
  // Merge the default properties with the properties from this message,
  // so that the defaults are always passed along but the message
  // always overrides.
  var mergedProperties = new Object();
  for (var p in this.ttsProperties) {
    mergedProperties[p] = this.ttsProperties[p];
  }
  for (var p in properties) {
    mergedProperties[p] = properties[p];
  }
  return mergedProperties;
};

/**
 * Decrease by 0.1 the value of a TTS property that's normally in the range
 * 0.0 - 1.0, and make sure it doesn't end up smaller than 0.0. Return the
 * new value.
 * @param {number} current_value The current value of the property.
 * @return {number} The new value.
 */
cvox.AbstractTts.prototype.decreasePropertyValue = function(current_value) {
  return Math.max(0.0, current_value - 0.1);
};

/**
 * Increase by 0.1 the value of a TTS property that's normally in the range
 * 0.0 - 1.0, and make sure it doesn't end up larger than 1.0. Return the
 * new value.
 * @param {number} current_value The current value of the property.
 * @return {number} The new value.
 */
cvox.AbstractTts.prototype.increasePropertyValue = function(current_value) {
  return Math.min(1.0, current_value + 0.1);
};

/**
 * TTS rate property.
 * @type {string}
 */
cvox.AbstractTts.TTS_PROPERTY_RATE = 'Rate';

/**
 * TTS pitch property.
 * @type {string}
 */
cvox.AbstractTts.TTS_PROPERTY_PITCH = 'Pitch';

/**
 * TTS volume property.
 * @type {string}
 */
cvox.AbstractTts.TTS_PROPERTY_VOLUME = 'Volume';

/**
 * Flag indicating if the TTS is being debugged.
 * @type {boolean}
 */
cvox.AbstractTts.DEBUG = true;

/**
 * Speech queue mode that interrupts the current utterance.
 * @type {number}
 */
cvox.AbstractTts.QUEUE_MODE_FLUSH = 0;

/**
 * Speech queue mode that does not interrupt the current utterance.
 * @type {number}
 */
cvox.AbstractTts.QUEUE_MODE_QUEUE = 1;

/**
* String constants.
* @type {Object}
*/
cvox.AbstractTts.str = {
  'increaseRate': 'increasing rate',
  'increasePitch': 'increasing pitch',
  'increaseVolume': 'increasing volume',
  'decreaseRate': 'decreasing rate',
  'decreasePitch': 'decreasing pitch',
  'decreaseVolume': 'decreasing volume'
};

