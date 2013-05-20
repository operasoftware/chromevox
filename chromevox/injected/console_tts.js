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
 * @fileoverview A TTS engine that writes to window.console.
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.ConsoleTts');

goog.require('cvox.AbstractTts');
goog.require('cvox.TtsInterface');

/**
 * @constructor
 * @implements {cvox.TtsInterface}
 */
cvox.ConsoleTts = function() {
  /**
   * True if the console TTS is enabled by the user.
   * @type {boolean}
   * @private
   */
  this.enabled_ = false;
};
goog.addSingletonGetter(cvox.ConsoleTts);


/** @override */
cvox.ConsoleTts.prototype.speak = function(textString, queueMode, properties) {
  if (this.enabled_ && window['console']) {
    var logStr = 'Speak';
    if (queueMode == cvox.AbstractTts.QUEUE_MODE_FLUSH) {
      logStr += ' (I)';
    } else {
      logStr += ' (Q)';
    }
    logStr += ' "' + textString + '"';
    window['console']['log'](logStr);

    if (properties && properties['startCallback'] != undefined) {
      window.console.log('  using startCallback');
    }

    if (properties && properties['endCallback'] != undefined) {
      window.console.log('  using endCallback');
    }
  }
  return this;
};

/** @override */
cvox.ConsoleTts.prototype.isSpeaking = function() { return false; };

/** @override */
cvox.ConsoleTts.prototype.stop = function() {
  if (this.enabled_) {
    window['console']['log']('Stop');
  }
};

/** @override */
cvox.ConsoleTts.prototype.addCapturingEventListener = function(listener) { };

/** @override */
cvox.ConsoleTts.prototype.increaseOrDecreaseProperty = function() { };

/**
 * Sets the enabled bit.
 * @param {boolean} enabled The new enabled bit.
 */
cvox.ConsoleTts.prototype.setEnabled = function(enabled) {
  this.enabled_ = enabled;
};
