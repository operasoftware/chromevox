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
 * @fileoverview Bridge that sends earcon messages from content scripts or
 * other pages to the main background page.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

cvoxgoog.provide('cvox.LocalEarconsManager');

cvoxgoog.require('cvox.AbstractEarconsManager');

/**
 * @constructor
 * @param {Array} earcons Array of earcon classes.
 * @param {cvox.AbstractTtsManager} ttsManager A TTS provider.
 * @extends {cvox.AbstractEarconsManager}
 */
cvox.LocalEarconsManager = function(earcons, ttsManager) {
  //Inherit AbstractEarconsManager
  cvox.AbstractEarconsManager.call(this);

  this.earcons = earcons;
  this.ttsManager = ttsManager;
  this.currentEarcons = null;
  this.currentEarconsIndex = -1;
  this.nextEarcons(false);
};
cvoxgoog.inherits(cvox.LocalEarconsManager, cvox.AbstractEarconsManager);

/**
 * @return {string} The human-readable name of this instance.
 */
cvox.LocalEarconsManager.prototype.getName = function() {
  return 'LocalEarconsManager';
};

/**
 * Plays the specified earcon.
 * @param {number} earcon The index of the earcon to be played.
 */
cvox.LocalEarconsManager.prototype.playEarcon = function(earcon) {
  cvox.LocalEarconsManager.superClass_.playEarcon.call(this, earcon);
  if (!this.currentEarcons) {
    return;
  }
  this.currentEarcons.playEarcon(earcon);
};

/**
 * Switch to the next earcon set and optionally announce its name.
 * If no earcon sets have been specified this function is a NOOP.
 * @param {boolean} announce If true, will announce the name of the
 *     new earcon set.
 */
cvox.LocalEarconsManager.prototype.nextEarcons = function(announce) {
  cvox.LocalEarconsManager.superClass_.nextEarcons.call(this, announce);
  if (!this.earcons) {
    return;
  }
  this.currentEarcons = null;
  this.currentEarconsIndex =
      (this.currentEarconsIndex + 1) % this.earcons.length;
  try {
    this.currentEarcons = new this.earcons[this.currentEarconsIndex];
    console.log('Switching to earcons: ' + this.currentEarcons.getName());
    if (announce) {
      this.ttsManager.speak(this.currentEarcons.getName());
    }
  } catch (err) {
    console.log('error switching to earcon #' + this.currentEarconsIndex);
  }
};
