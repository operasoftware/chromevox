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
 * @fileoverview Sends Text-To-Speech commands to a separate Chrome extension.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

var ttsExtensionId = 'jhfhnnjfmmflacfniolmefnflomjcbdf';  // Substituted by package.py

goog.provide('cvox.ChromeVoxExtensionTtsEngine');

goog.require('cvox.AbstractTts');

/**
 * @constructor
 * @extends {cvox.AbstractTts}
 */
cvox.ChromeVoxExtensionTtsEngine = function() {
  //Inherit AbstractTts
  cvox.AbstractTts.call(this);

  this.ttsExtensionPort = chrome.extension.connect(ttsExtensionId);
};
goog.inherits(cvox.ChromeVoxExtensionTtsEngine, cvox.AbstractTts);

/**
 * @return {string} The human-readable name of the speech engine.
 */
cvox.ChromeVoxExtensionTtsEngine.prototype.getName = function() {
  return 'Native Client Pico Speech';
};

/**
 * Speaks the given string using the specified queueMode and properties.
 * @param {string} textString The string of text to be spoken.
 * @param {number=} queueMode The queue mode: AbstractTts.QUEUE_MODE_FLUSH
 *        for flush, AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 */
cvox.ChromeVoxExtensionTtsEngine.prototype.speak = function(
    textString, queueMode, properties) {
  cvox.ChromeVoxExtensionTtsEngine.superClass_.speak.call(this, textString,
      queueMode, properties);
  // TODO: the TTS extension should handle queueMode directly.
  if (queueMode == cvox.AbstractTts.QUEUE_MODE_FLUSH) {
    this.stop();
  }

  this.ttsExtensionPort.postMessage(
    {'action': 'speak',
     'text': textString,
     'queueMode': queueMode,
     'properties': properties});
};

/**
 * Returns true if the TTS is currently speaking.
 * @return {boolean} True if the TTS is speaking.
 */
cvox.ChromeVoxExtensionTtsEngine.prototype.isSpeaking = function() {
  cvox.ChromeVoxExtensionTtsEngine.superClass_.isSpeaking.call(this);
  // TODO: Fix this.
  return false;
};

/**
 * Stops speech.
 */
cvox.ChromeVoxExtensionTtsEngine.prototype.stop = function() {
  cvox.ChromeVoxExtensionTtsEngine.superClass_.stop.call(this);
  this.ttsExtensionPort.postMessage(
    {'action': 'stop'});
};
