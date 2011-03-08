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
 * @fileoverview Text-To-Speech engine that is running as a local server.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.ChromeVoxLocalTtsServerEngine');

goog.require('cvox.AbstractTts');

/**
 * @constructor
 * @extends {cvox.AbstractTts}
 */
cvox.ChromeVoxLocalTtsServerEngine = function() {
  //Inherit AbstractTts
  cvox.AbstractTts.call(this);
};
goog.inherits(cvox.ChromeVoxLocalTtsServerEngine, cvox.AbstractTts);

/**
 * @return {string} The human-readable name of the speech engine.
 */
cvox.ChromeVoxLocalTtsServerEngine.prototype.getName = function() {
  return 'Local Speech';
};

/**
 * Speaks the given string using the specified queueMode and properties.
 * @param {string} textString The string of text to be spoken.
 * @param {number=} queueMode The queue mode: AbstractTts.QUEUE_MODE_FLUSH
 *        for flush, AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 */
cvox.ChromeVoxLocalTtsServerEngine.prototype.speak = function(
    textString, queueMode, properties) {
  cvox.ChromeVoxLocalTtsServerEngine.superClass_.speak.call(this,
      textString, queueMode, properties);
  //This is VERY hacky, but it works as a demo
  var theScript = document.createElement('script');
  theScript.type = 'text/javascript';
  theScript.src = 'http://localhost/' + textString;
  document.getElementsByTagName('head')[0].appendChild(theScript);
};

/**
 * @return {boolean} True if the TTS is speaking.
 */
cvox.ChromeVoxLocalTtsServerEngine.prototype.isSpeaking = function() {
  cvox.ChromeVoxLocalTtsServerEngine.superClass_.isSpeaking.call(this);
  return false;
};

/**
 * Stops speech.
 */
cvox.ChromeVoxLocalTtsServerEngine.prototype.stop = function() {
  cvox.ChromeVoxLocalTtsServerEngine.superClass_.stop.call(this);
  this.speak('');
};
