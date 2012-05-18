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
 * @fileoverview A wrapper for the TTS engine that recorded the output for the
 * cvox.History object.
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.TtsHistory');

goog.require('cvox.TtsInterface');

/**
 * @constructor
 * @implements {cvox.TtsInterface}
 */
cvox.TtsHistory = function() {
};


/** @override */
cvox.TtsHistory.prototype.speak = function(str, mode, props) {
    cvox.History.getInstance().speak(str, mode, props);
};

/** @override */
cvox.TtsHistory.prototype.isSpeaking = function() { return false; };

/** @override */
cvox.TtsHistory.prototype.stop = function() { };

/** @override */
cvox.TtsHistory.prototype.increaseOrDecreaseProperty = function() { };

