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
 * @fileoverview Sends Text-To-Speech commands to Chrome's native TTS
 * extension API.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.ChromeVoxChromeNativeTtsEngine');

goog.require('cvox.AbstractTts');
goog.require('cvox.ChromeVox');

/**
 * @constructor
 * @extends {cvox.AbstractTts}
 */
cvox.ChromeVoxChromeNativeTtsEngine = function() {
  //Inherit AbstractTts
  cvox.AbstractTts.call(this);
  if (cvox.ChromeVox.isChromeOS) {
    this.ttsProperties.rate = .3;
    // We want to keep low default volume for ChromeOS because amplifying the
    // sound by the TTS engine results into unintelligible speech on ChromeOS
    // netbook, especially the CR-48.
    this.ttsProperties.volume = .3;
  } else {
    this.ttsProperties.rate = .5;
    this.ttsProperties.volume = 1;
  }
  this.ttsProperties.pitch = .5;
};
goog.inherits(cvox.ChromeVoxChromeNativeTtsEngine, cvox.AbstractTts);

/**
 * @return {string} The human-readable name of the speech engine.
 */
cvox.ChromeVoxChromeNativeTtsEngine.prototype.getName = function() {
  return 'Chrome OS Native Speech';
};

/**
 * Speaks the given string using the specified queueMode and properties.
 * @param {string} textString The string of text to be spoken.
 * @param {number=} queueMode The queue mode: AbstractTts.QUEUE_MODE_FLUSH
 *        for flush, AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 */
cvox.ChromeVoxChromeNativeTtsEngine.prototype.speak = function(
    textString, queueMode, properties) {
  cvox.ChromeVoxChromeNativeTtsEngine.superClass_.speak.call(this, textString,
      queueMode, properties);
  if (queueMode === cvox.AbstractTts.QUEUE_MODE_FLUSH) {
    this.stop();
  }
  var mergedProperties = this.mergeProperties(properties);
  mergedProperties.enqueue = (queueMode === cvox.AbstractTts.QUEUE_MODE_QUEUE);
  // chrome.experimental.tts.speak is a call directly into Chrome, so
  // chrome.experimental.tts.speak(textString, null); is NOT the same as
  // chrome.experimental.tts.speak(textString);
  //
  // TODO (chaitanyag): Make the underlying code handle var args so that
  // properties can be optional and match JS expected behavior of these two
  // being the same.
  if (mergedProperties) {
    chrome.experimental.tts.speak(textString, mergedProperties);
  } else {
    chrome.experimental.tts.speak(textString);
  }
};

/**
 * Returns true if the TTS is currently speaking.
 * @return {boolean} True if the TTS is speaking.
 */
cvox.ChromeVoxChromeNativeTtsEngine.prototype.isSpeaking = function() {
  cvox.ChromeVoxChromeNativeTtsEngine.superClass_.isSpeaking.call(this);
  return chrome.experimental.tts.isSpeaking();
};

/**
 * Stops speech.
 */
cvox.ChromeVoxChromeNativeTtsEngine.prototype.stop = function() {
  cvox.ChromeVoxChromeNativeTtsEngine.superClass_.stop.call(this);
  chrome.experimental.tts.stop();
};

