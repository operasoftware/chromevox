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
 * @fileoverview Text-To-Speech for development of the Android version of
 * ChromeVox as a Chrome extension.
 *
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 */

cvoxgoog.provide('cvox.AndroidDevTtsEngine');

cvoxgoog.require('cvox.AbstractTts');
cvoxgoog.require('cvox.BuildConfig');

if (BUILD_TYPE == BUILD_TYPE_ANDROID_DEV) {
  /**
   * @constructor
   * @extends {cvox.AbstractTts}
   */
  cvox.AndroidDevTtsEngine = function() {
    //Inherit AbstractTts
    cvox.AbstractTts.call(this);

    this.speech = null;
    this.speaking = false;

    var theScript = document.createElement('script');
    theScript.type = 'text/javascript';
    theScript.src =
        'http://www.gstatic.com/speech/api/tts/google-network-tts.js';
    document.getElementsByTagName('head')[0].appendChild(theScript);
    var context = this;
    theScript.onload = function() {
      cvoxgoog.tts = cvoxgoog.tts || undefined;
      context.speech = cvoxgoog.tts;
      context.speech.initialize();
    };
  };
  cvoxgoog.inherits(cvox.AndroidDevTtsEngine, cvox.AbstractTts);

  /**
   * @return {string} The human-readable name of the speech engine.
   */
  cvox.AndroidDevTtsEngine.prototype.getName = function() {
    return 'Android development engine (Google Network Speech using Flash)';
  };

  /**
   * Speaks the given string using the specified queueMode and properties.
   * @param {string} textString The string of text to be spoken.
   * @param {number=} queueMode The queue mode: AbstractTts.QUEUE_MODE_FLUSH
   *        for flush, AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
   * @param {Object=} properties Speech properties to use for this utterance.
   */
  cvox.AndroidDevTtsEngine.prototype.speak = function(textString,
      queueMode, properties) {
    if (!this.speech) {
      console.log(this.getName() + ' is not initialized yet.');
      return;
    }
    cvox.AndroidDevTtsEngine.superClass_.speak.call(this, textString,
        queueMode, properties);
    // TODO: Implement speech queue so that queued speech is possible
    this.speaking = true;
    var queue = (queueMode === cvox.AbstractTts.QUEUE_MODE_QUEUE);
    this.speech.speak(textString,
        function(event) {
          this.isSpeaking = false;
        }, queue, cvox.AndroidDevTtsEngine.DEFAULT_PROPERTIES_JSON);
  };

  /**
   * Returns true if the TTS is currently speaking.
   * @return {boolean} True if the TTS is speaking.
   */
  cvox.AndroidDevTtsEngine.prototype.isSpeaking = function() {
    cvox.AndroidDevTtsEngine.superClass_.isSpeaking.call(this);
    return this.speaking;
  };

  /**
   * Stops speech.
   */
  cvox.AndroidDevTtsEngine.prototype.stop = function() {
    if (!this.speech) {
      return;
    }
    cvox.AndroidDevTtsEngine.superClass_.stop.call(this);
    this.speaking = false;
    this.speech.stopSpeaking();
  };

  /**
   * The default properties array used for speaking.
   * @type {Object}
   */
  cvox.AndroidDevTtsEngine.DEFAULT_PROPERTIES_JSON = {'lang': 'en-US'};
} else {
  cvox.AndroidDevTtsEngine = function() {};
}
