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
 * @fileoverview Text-To-Speech engine for Android.
 *
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 */

goog.provide('cvox.AndroidTts');

goog.require('cvox.AbstractTts');
goog.require('cvox.HostFactory');

/**
 * @constructor
 * @extends {cvox.AbstractTts}
 */
cvox.AndroidTts = function() {
  // Inherit AbstractTts.
  cvox.AbstractTts.call(this);

  this.ttsProperties.rate = .5;
  this.ttsProperties.pitch = .5;
  this.ttsProperties.volume = 1;
};
goog.inherits(cvox.AndroidTts, cvox.AbstractTts);

/** @override */
cvox.AndroidTts.prototype.speak = function(textString, queueMode, properties) {
  cvox.AndroidTts.superClass_.speak.call(this, textString, queueMode, properties);
  var mergedProperties = this.mergeProperties(properties);
  accessibility.speak(textString, queueMode, mergedProperties);
  return this;
};

/** @override */
cvox.AndroidTts.prototype.isSpeaking = function() {
  cvox.AndroidTts.superClass_.isSpeaking.call(this);
  return accessibility.isSpeaking();
};

/** @override */
cvox.AndroidTts.prototype.stop = function() {
  cvox.AndroidTts.superClass_.stop.call(this);
  accessibility.stop();
};

cvox.HostFactory.ttsConstructor = cvox.AndroidTts;
