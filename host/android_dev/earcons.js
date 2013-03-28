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
 * @fileoverview Earcons library for the Android platform.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.AndroidEarcons');

goog.require('cvox.AbstractEarcons');
goog.require('cvox.HostFactory');

/**
 * @extends {cvox.AbstractEarcons}
 * @constructor
 */
cvox.AndroidEarcons = function() {
  cvox.AbstractEarcons.call(this);
  this.audioMap = new Object();
};
goog.inherits(cvox.AndroidEarcons, cvox.AbstractEarcons);

/**
 * The base URL for  loading eracons.
 * @type {string}
 */
cvox.AndroidEarcons.BASE_URL =
    'https://ssl.gstatic.com/accessibility/javascript/android/earcons/';

/**
 * Plays the specified earcon.
 * @param {number} earcon The earcon to be played.
 */
cvox.AndroidEarcons.prototype.playEarcon = function(earcon) {
  if (!this.earconsAvailable()) {
    return;
  }
  cvox.AndroidEarcons.superClass_.playEarcon.call(this, earcon);
  this.currentAudio = this.audioMap[earcon];
  if (!this.currentAudio) {
    this.currentAudio = new Audio(cvox.AndroidEarcons.BASE_URL +
        this.getEarconFilename(earcon));
    this.audioMap[earcon] = this.currentAudio;
  }
  try {
    this.currentAudio.currentTime = 0;
  } catch (e) {
  }
  if (this.currentAudio.paused) {
    this.currentAudio.play();
  }
};

/**
 * Whether or not earcons are available.
 * @return {boolean} True if earcons are available.
 */
cvox.AndroidEarcons.prototype.earconsAvailable = function() {
  if (navigator.userAgent.indexOf('Chrome') == -1) {
    // Don't try to play earcons on WebView Classic since there it has an audio
    // focus bug that will cause the earcon to repeat when audio focus changes.
    return false;
  }
  return true;
};

cvox.HostFactory.earconsConstructor = cvox.AndroidEarcons;
