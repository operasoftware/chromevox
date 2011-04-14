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
 * @fileoverview This is the ChromeVox feedback core TTS implementation. It
 *               is responsible for speaking, playing earcons and state
 *               management.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 */

goog.provide('cvox.LocalTtsManager');

goog.require('cvox.AbstractTts');
goog.require('cvox.AbstractTtsManager');



/**
 * This class is responsible for the ChromeVox feedback in terms of
 * speech. It also stores the TTS configuration state.
 *
 * @constructor
 * @extends {cvox.AbstractTtsManager}
 *
 * @param {Array} ttsEngines An array of TTS engine constructors.
 * @param {Array} ttsProperties The default TTS properties to use.
 */
cvox.LocalTtsManager = function(ttsEngines, ttsProperties) {
  //Inherit AbstractTtsManager
  cvox.AbstractTtsManager.call(this);

  this.ttsEngines = ttsEngines;
  this.initializedTtsEngines = new Array(ttsEngines.length);
  this.currentTtsEngineIndex = -1;
  this.nextTtsEngine(false);
  this.initializeTtsPropertiesToDefault(ttsProperties);
};
goog.inherits(cvox.LocalTtsManager, cvox.AbstractTtsManager);


/**
 * @return {string} The human-readable name of this instance.
 */
cvox.LocalTtsManager.prototype.getName = function() {
  return 'LocalTtsManager';
};


/**
 * Speaks the given string using the specified queueMode and properties.
 * @param {string} textString The string of text to be spoken.
 * @param {number} queueMode The queue mode: 0 for flush, 1 for adding to queue.
 * @param {Object} properties Speech properties to use for this utterance.
 */
cvox.LocalTtsManager.prototype.speak = function(textString, queueMode,
    properties) {
  cvox.LocalTtsManager.superClass_.speak.call(this, textString, queueMode,
      properties);
  if (!this.currentTtsEngine) {
    return;
  }
  this.currentTtsEngine.speak(textString, queueMode, properties);
};


/**
 * Returns true if the TTS is currently speaking.
 * @return {boolean} True if the TTS is speaking.
 */
cvox.LocalTtsManager.prototype.isSpeaking = function() {
  cvox.LocalTtsManager.superClass_.isSpeaking.call(this);
  if (!this.currentTtsEngine) {
    return false;
  }
  return this.currentTtsEngine.isSpeaking();
};


/**
 * Stops speech.
 */
cvox.LocalTtsManager.prototype.stop = function() {
  cvox.LocalTtsManager.superClass_.stop.call(this);
  if (!this.currentTtsEngine) {
    return;
  }
  this.currentTtsEngine.stop();
};


/**
 * Initializes the default properties of all the available TTS engines.
 * @param {Array} ttsProperties An Array of TTS properties objects for all
 *     available TTS engines.
 */
cvox.LocalTtsManager.prototype.initializeTtsPropertiesToDefault =
    function(ttsProperties) {
  if (!ttsProperties)
    return;
  for (var i = 0; i < this.ttsEngines.length; i++) {
    if (this.ttsProperties[i])
      this.ttsEngines[i].setDefaultTtsProperties(this.ttsProperties[i]);
  }
};


/**
 * Switch to the next TTS engine and optionally announce its name.
 * If not TTS engines have been specified this function is a NOOP.
 * @param {boolean} announce If true, will announce the name of the
 *     new TTS engine.
 */
cvox.LocalTtsManager.prototype.nextTtsEngine = function(announce) {
  cvox.LocalTtsManager.superClass_.nextTtsEngine.call(this, announce);
  if (!this.ttsEngines) {
    return;
  }
  if (this.currentTtsEngine) {
    this.currentTtsEngine.stop();
  }
  this.currentTtsEngineIndex =
      (this.currentTtsEngineIndex + 1) % this.ttsEngines.length;
  this.currentTtsEngine = null;
  try {
    this.currentTtsEngine =
        this.initializedTtsEngines[this.currentTtsEngineIndex] ||
        new this.ttsEngines[this.currentTtsEngineIndex];
    this.initializedTtsEngines[this.currentTtsEngineIndex] =
        this.currentTtsEngine;
    this.log('Switching to speech engine: ' + this.currentTtsEngine.getName());
    if (announce) {
      this.speak(this.currentTtsEngine.getName(),
          cvox.AbstractTts.QUEUE_MODE_FLUSH,
          this.ttsProperties[this.currentTtsEngineIndex]);
    }
  } catch (err) {
    this.log('error switching to engine #' +
        this.currentTtsEngineIndex + ' ' + err);
  }
};


/**
 * Increases a TTS speech property.
 * @param {string} property_name The name of the property to increase.
 * @param {boolean} announce Whether to announce that the property is changing.
 */
cvox.LocalTtsManager.prototype.increaseProperty =
    function(property_name, announce) {
  cvox.LocalTtsManager.superClass_.increaseProperty.call(this, property_name);
  this.currentTtsEngine.increaseProperty(property_name, announce);
};


/**
 * Decreases a TTS speech property.
 * @param {string} property_name The name of the property to decrease.
 * @param {boolean} announce Whether to announce that the property is changing.
 */
cvox.LocalTtsManager.prototype.decreaseProperty =
    function(property_name, announce) {
  cvox.LocalTtsManager.superClass_.decreaseProperty.call(this, property_name);
  this.currentTtsEngine.decreaseProperty(property_name, announce);
};

