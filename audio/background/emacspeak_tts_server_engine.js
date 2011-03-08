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
 * @fileoverview Text-To-Speech engine that is using the Emacspeak
 * local speech server.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.ChromeVoxEmacspeakTtsServerEngine');

goog.require('cvox.AbstractTts');

/**
 * @constructor
 * @extends {cvox.AbstractTts}
 */
cvox.ChromeVoxEmacspeakTtsServerEngine = function() {
  //Inherit AbstractTts
  cvox.AbstractTts.call(this);
};
goog.inherits(cvox.ChromeVoxEmacspeakTtsServerEngine, cvox.AbstractTts);

/**
 * @return {string} The human-readable name of the speech engine.
 */
cvox.ChromeVoxEmacspeakTtsServerEngine.prototype.getName = function() {
  return 'Local Speech';
};

/**
 * Speaks the given string using the specified queueMode and properties.
 * @param {string} textString The string of text to be spoken.
 * @param {number=} queueMode The queue mode: AbstractTts.QUEUE_MODE_FLUSH
 *        for flush, AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 */
cvox.ChromeVoxEmacspeakTtsServerEngine.prototype.speak = function(
    textString, queueMode, properties) {
  cvox.ChromeVoxEmacspeakTtsServerEngine.superClass_.speak.call(this,
      textString, queueMode, properties);
   if (queueMode == cvox.AbstractTts.QUEUE_MODE_FLUSH) {
     this.stop();
   }
   var emacspeakConnection = new XMLHttpRequest();
   emacspeakConnection.overrideMimeType('text/xml');
   emacspeakConnection.open('POST', 'http://127.0.0.1:8000', true);
   emacspeakConnection.setRequestHeader('Content-Type',
                                        'application/x-www-form-urlencoded');
   emacspeakConnection.send('speak: ' + textString);
};

/**
 * @return {boolean} True if the TTS is speaking.
 */
cvox.ChromeVoxEmacspeakTtsServerEngine.prototype.isSpeaking = function() {
  cvox.ChromeVoxEmacspeakTtsServerEngine.superClass_.isSpeaking.call(this);
  return false;
};

/**
 * Stops speech.
 */
cvox.ChromeVoxEmacspeakTtsServerEngine.prototype.stop = function() {
  cvox.ChromeVoxEmacspeakTtsServerEngine.superClass_.stop.call(this);
   var emacspeakConnection = new XMLHttpRequest();
   emacspeakConnection.overrideMimeType('text/xml');
   emacspeakConnection.open('POST', 'http://127.0.0.1:8000', true);
   emacspeakConnection.setRequestHeader('Content-Type',
                                        'application/x-www-form-urlencoded');
   emacspeakConnection.send('stop');
};
