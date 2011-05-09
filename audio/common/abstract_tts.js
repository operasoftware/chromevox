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
  this.lens_ = null;
  this.lensContent_ = document.createElement('div');
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
  if (this.lens_) {
    if (queueMode == cvox.AbstractTts.QUEUE_MODE_FLUSH) {
      this.lensContent_ = document.createElement('div');
    }
    var lensElem = document.createElement('span');
    lensElem.innerText = textString;
    lensElem.style.marginLeft = '1em !important';
    if (properties && properties[cvox.AbstractTts.COLOR]) {
      lensElem.style.color = properties[cvox.AbstractTts.COLOR] + ' !important';
    }
    if (properties && properties[cvox.AbstractTts.FONT_WEIGHT]) {
      lensElem.style.fontWeight =
          properties[cvox.AbstractTts.FONT_WEIGHT] + ' !important';
    }
    this.lensContent_.appendChild(lensElem);
    this.lens_.setLensContent(this.lensContent_);
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
 * @param {boolean} announce Whether to announce that the property is changing.
 */
cvox.AbstractTts.prototype.increaseProperty =
    function(property_name, announce) {
  if (property_name == cvox.AbstractTts.RATE) {
    this.ttsProperties.rate = this.increasePropertyValue(
        this.ttsProperties.rate);
    if (announce) {
      this.speak(cvox.AbstractTts.str.increaseRate, 0, this.ttsProperties);
    }
  } else if (property_name == cvox.AbstractTts.PITCH) {
    this.ttsProperties.pitch = this.increasePropertyValue(
        this.ttsProperties.pitch);
    if (announce) {
      this.speak(cvox.AbstractTts.str.increasePitch, 0, this.ttsProperties);
    }
  } else if (property_name == cvox.AbstractTts.VOLUME) {
    this.ttsProperties.volume = this.increasePropertyValue(
        this.ttsProperties.volume);
    if (announce) {
      this.speak(cvox.AbstractTts.str.increaseVolume, 0, this.ttsProperties);
    }
  }
};


/**
 * Decreases a TTS speech property.
 * @param {string} property_name The name of the property to decrease.
 * @param {boolean} announce Whether to announce that the property is changing.
 */
cvox.AbstractTts.prototype.decreaseProperty =
    function(property_name, announce) {
  if (property_name == cvox.AbstractTts.RATE) {
    this.ttsProperties.rate = this.decreasePropertyValue(
        this.ttsProperties.rate);
    if (announce) {
      this.speak(cvox.AbstractTts.str.decreaseRate, 0, this.ttsProperties);
    }
  } else if (property_name == cvox.AbstractTts.PITCH) {
    this.ttsProperties.pitch = this.decreasePropertyValue(
        this.ttsProperties.pitch);
    if (announce) {
      this.speak(cvox.AbstractTts.str.decreasePitch, 0, this.ttsProperties);
    }
  } else if (property_name == cvox.AbstractTts.VOLUME) {
    this.ttsProperties.volume = this.decreasePropertyValue(
        this.ttsProperties.volume);
    if (announce) {
      this.speak(cvox.AbstractTts.str.decreaseVolume, 0, this.ttsProperties);
    }
  }
};


/**
 * Merges the given properties with the default ones. Always returns a
 * new object, so that you can safely modify the result of mergeProperties
 * without worrying that you're modifying an object used elsewhere.
 * @param {Object=} properties The properties to merge with the default.
 * @return {Object} The merged properties.
 */
cvox.AbstractTts.prototype.mergeProperties = function(properties) {
  var mergedProperties = new Object();
  var p;
  if (this.ttsProperties) {
    for (p in this.ttsProperties) {
      mergedProperties[p] = this.ttsProperties[p];
    }
  }
  if (properties) {
    var tts = cvox.AbstractTts;
    if (typeof(properties[tts.VOLUME]) == 'number') {
      mergedProperties[tts.VOLUME] = properties[tts.VOLUME];
    }
    if (typeof(properties[tts.PITCH]) == 'number') {
      mergedProperties[tts.PITCH] = properties[tts.PITCH];
    }
    if (typeof(properties[tts.RATE]) == 'number') {
      mergedProperties[tts.RATE] = properties[tts.RATE];
    }

    function mergeRelativeProperty(abs, rel) {
      if (typeof(properties[rel]) == 'number' &&
          typeof(mergedProperties[abs]) == 'number') {
        mergedProperties[abs] += properties[rel];
        if (mergedProperties[abs] > 1.0) {
          mergedProperties[abs] = 1.0;
        } else if (mergedProperties[abs] < 0.0) {
          mergedProperties[abs] = 0.0;
        }
      }
    }

    mergeRelativeProperty(tts.VOLUME, tts.RELATIVE_VOLUME);
    mergeRelativeProperty(tts.PITCH, tts.RELATIVE_PITCH);
    mergeRelativeProperty(tts.RATE, tts.RELATIVE_RATE);
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
 * Set a chromevis.ChromeVisLens to display any messages spoken via speak().
 * @param {Object} lens The chromevis.ChromeVisLens object.
 */
cvox.AbstractTts.prototype.setLens = function(lens) {
  this.lens_ = lens;
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


/** TTS rate property. @type {string} */
cvox.AbstractTts.RATE = 'rate';
/** TTS pitch property. @type {string} */
cvox.AbstractTts.PITCH = 'pitch';
/** TTS volume property. @type {string} */
cvox.AbstractTts.VOLUME = 'volume';

/** TTS relative rate property. @type {string} */
cvox.AbstractTts.RELATIVE_RATE = 'relativeRate';
/** TTS relative pitch property. @type {string} */
cvox.AbstractTts.RELATIVE_PITCH = 'relativePitch';
/** TTS relative volume property. @type {string} */
cvox.AbstractTts.RELATIVE_VOLUME = 'relativeVolume';

/** TTS color property (for the lens display). @type {string} */
cvox.AbstractTts.COLOR = 'color';
/** TTS CSS font-weight property (for the lens display). @type {string} */
cvox.AbstractTts.FONT_WEIGHT = 'fontWeight';


/**
 * TTS personality for annotations - text spoken by ChromeVox that
 * doesn't come from the web page or user interface.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_ANNOTATION = {
  'relativePitch': -0.1,
  // TODO:(rshearer) Added this color change for I/O presentation.
  'color': 'yellow'
};


/**
 * TTS personality for an aside - text in parentheses.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_ASIDE = {
  'relativePitch': -0.1,
  'color': '#669'
};


/**
 * TTS personality for quoted text.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_QUOTE = {
  'relativePitch': 0.1,
  'color': '#b6b',
  'fontWeight': 'bold'
};


/**
 * TTS personality for strong or bold text.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_STRONG = {
  'relativePitch': 0.1,
  'color': '#b66',
  'fontWeight': 'bold'
};


/**
 * TTS personality for emphasis or italicized text.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_EMPHASIS = {
  'relativeVolume': 0.1,
  'relativeRate': -0.1,
  'color': '#6bb',
  'fontWeight': 'bold'
};


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

