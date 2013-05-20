// Copyright 2013 Google Inc.
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
 * @fileoverview A composite TTS sends allows ChromeVox to use
 * multiple TTS engines at the same time.
 *
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.CompositeTts');

goog.require('cvox.TtsInterface');

/**
 * A Composite Tts
 * @constructor
 * @implements {cvox.TtsInterface}
 */
cvox.CompositeTts = function() {
  /**
   * @type {Array.<cvox.TtsInterface>}
   * @private
   */
  this.ttsEngines_ = [];
};


/**
 * Adds a TTS engine to the composite TTS
 * @param {cvox.TtsInterface} tts The TTS to add.
 * @return {cvox.CompositeTts} this.
 */
cvox.CompositeTts.prototype.add = function(tts) {
  this.ttsEngines_.push(tts);
  return this;
};


/**
 * @override
 */
cvox.CompositeTts.prototype.speak =
    function(textString, queueMode, properties) {
  this.ttsEngines_.forEach(function(engine) {
    engine.speak(textString, queueMode, properties);
  });
};


/**
 * Returns true if any of the TTSes are still speaking.
 * @override
 */
cvox.CompositeTts.prototype.isSpeaking = function() {
  return this.ttsEngines_.some(function(engine) {
    return engine.isSpeaking();
  });
};


/**
 * @override
 */
cvox.CompositeTts.prototype.stop = function() {
  this.ttsEngines_.forEach(function(engine) {
    engine.stop();
  });
};


/**
 * @override
 */
cvox.CompositeTts.prototype.addCapturingEventListener = function(listener) {
  this.ttsEngines_.forEach(function(engine) {
    engine.addCapturingEventListener(listener);
  });
};


/**
 * @override
 */
cvox.CompositeTts.prototype.increaseOrDecreaseProperty =
    function(propertyName, increase) {
  this.ttsEngines_.forEach(function(engine) {
    engine.increaseOrDecreaseProperty(propertyName, increase);
  });
};
