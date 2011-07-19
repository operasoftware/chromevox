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
 * @fileoverview This is the base class responsible managing TTS engines.
 *
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 */

cvoxgoog.provide('cvox.AbstractTtsManager');

cvoxgoog.require('cvox.AbstractTts');

/**
 * This is the base class responsible for spoken feedback.
 *
 * @constructor
 * @extends {cvox.AbstractTts}
 */
cvox.AbstractTtsManager = function() {
  //Inherit AbstractTts
  cvox.AbstractTts.call(this);
};
cvoxgoog.inherits(cvox.AbstractTtsManager, cvox.AbstractTts);

/**
 * Switch to the next TTS engine and optionally announce its name.
 *
 * @param {boolean} announce If true, will announce the name of the
 *     new TTS engine.
 */
cvox.AbstractTtsManager.prototype.nextTtsEngine = function(announce) {
  if (this.logEnabled()) {
    this.log('[' + this.getName() + '] nextTtsEngine(' + announce + ')');
  }
};

/**
 * Increases a TTS speech property.
 * @param {string} property_name The name of the property to increase.
 */
cvox.AbstractTtsManager.prototype.increaseProperty = function(
    property_name) {
  if (this.logEnabled()) {
    this.log('[' + this.getName() + '] increaseProperty(' +
        property_name + ')');
  }
};

/**
 * Decreases a TTS speech property.
 * @param {string} property_name The name of the property to decrease.
 */
cvox.AbstractTtsManager.prototype.decreaseProperty = function(
    property_name) {
  if (this.logEnabled()) {
    this.log('[' + this.getName() + '] decreaseProperty(' +
        property_name + ')');
  }
};
