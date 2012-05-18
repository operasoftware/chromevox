// Copyright 2012 Google Inc.
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
 * @fileoverview Sends Text-To-Speech commands to Chrome's native TTS
 * extension API.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.TtsBackground');

goog.require('cvox.AbstractTts');
goog.require('cvox.ChromeVox');

/**
 * @constructor
 * @extends {cvox.AbstractTts}
 */
cvox.TtsBackground = function() {
  //Inherit AbstractTts
  cvox.AbstractTts.call(this);
  var defaultVolume;
  if (cvox.ChromeVox.isChromeOS) {
    // We want to keep low default volume for ChromeOS because amplifying the
    // sound by the TTS engine results into unintelligible speech on ChromeOS
    // netbook, especially the CR-48.
    defaultVolume = .5;
  } else {
    defaultVolume = 1;
  }
  var defaultPitch = 1;
  var defaultRate = 1;

  this.ttsProperties['rate'] = (parseFloat(localStorage['rate']) ||
                                defaultRate);
  this.ttsProperties['pitch'] = (parseFloat(localStorage['pitch']) ||
                                 defaultPitch);
  this.ttsProperties['volume'] = (parseFloat(localStorage['volume']) ||
                                  defaultVolume);

  this.propertyMin['pitch'] = 0.0;
  this.propertyMax['pitch'] = 2.0;

  this.propertyMin['rate'] = 0.2;
  this.propertyMax['rate'] = 5.0;

  this.lastEventType = 'end';
};
goog.inherits(cvox.TtsBackground, cvox.AbstractTts);

/**
 * Speaks the given string using the specified queueMode and properties.
 * @param {string} textString The string of text to be spoken.
 * @param {number=} queueMode The queue mode: AbstractTts.QUEUE_MODE_FLUSH
 *        for flush, AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 */
cvox.TtsBackground.prototype.speak = function(
    textString, queueMode, properties) {
  cvox.TtsBackground.superClass_.speak.call(this, textString,
      queueMode, properties);

  var mergedProperties = this.mergeProperties(properties);
  mergedProperties['enqueue'] =
      (queueMode === cvox.AbstractTts.QUEUE_MODE_QUEUE);
  mergedProperties['onEvent'] = goog.bind(function(event) {
    this.lastEventType = event['type'];
    if (event['type'] == 'end' && properties && properties['endCallback']) {
      properties['endCallback']();
    }
    if (event['type'] == 'start' &&
        properties &&
        properties['startCallback']) {
      properties['startCallback']();
    }
  }, this);

  chrome.tts.isSpeaking(goog.bind(function(state) {
    // Check to see that either no one is speaking or only we are.
    if (!state ||
        (this.lastEventType != 'end' && this.lastEventType != 'cancelled')) {
      chrome.tts.speak(textString, mergedProperties);
    }
  }, this));
};

/**
 * Increases a TTS speech property.
 * @param {string} propertyName The name of the property to change.
 * @param {boolean} increase If true, increases the property value by one
 *     step size, otherwise decreases.
 */
cvox.TtsBackground.prototype.increaseOrDecreaseProperty =
    function(propertyName, increase) {
  cvox.TtsBackground.superClass_.increaseOrDecreaseProperty.call(
      this, propertyName, increase);
  localStorage[propertyName] = this.ttsProperties[propertyName];
};

/**
 * Returns true if the TTS is currently speaking.
 * @return {boolean} True if the TTS is speaking.
 */
cvox.TtsBackground.prototype.isSpeaking = function() {
  cvox.TtsBackground.superClass_.isSpeaking.call(this);
  return this.lastEventType != 'end';
};

/**
 * Stops speech.
 */
cvox.TtsBackground.prototype.stop = function() {
  cvox.TtsBackground.superClass_.stop.call(this);
  chrome.tts.stop();
};
