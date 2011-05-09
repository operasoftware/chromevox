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
 * @fileoverview Bridge that sends TTS messages from content scripts or
 * other pages to the main background page.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.RemoteTtsManager');

goog.require('cvox.AbstractTtsManager');

if (BUILD_TYPE == BUILD_TYPE_CHROME) {

  /**
   * @constructor
   * @extends {cvox.AbstractTtsManager}
   */
  cvox.RemoteTtsManager = function() {
    cvox.AbstractTtsManager.call(this);
  };
  goog.inherits(cvox.RemoteTtsManager, cvox.AbstractTtsManager);

  /**
   * @return {string} The human-readable name of this instance.
   */
  cvox.RemoteTtsManager.prototype.getName = function() {
    return 'RemoteTtsManager';
  };

  /**
   * Speaks the given string using the specified queueMode and properties.
   * @param {string} textString The string of text to be spoken.
   * @param {number=} queueMode The queue mode: AbstractTts.QUEUE_MODE_FLUSH
   *        for flush, AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
   * @param {Object=} properties Speech properties to use for this utterance.
   */
  cvox.RemoteTtsManager.prototype.speak = function(textString, queueMode,
      properties) {
    cvox.RemoteTtsManager.superClass_.speak.call(this, textString, queueMode,
        properties);

    // Do some preprocessing to make text sound better.
    var allCapsWords = textString.match(/([A-Z]+)/g);
    // This is null if there are no such matches.
    if (allCapsWords) {
      for (var word, i = 0; word = allCapsWords[i]; i++) {
        var replacement;
        // If a word contains vowels and is more than 3 letters long,
        // it is probably a real word and not just an abbreviation.
        // Convert it to lower case and speak it normally.
        if ((word.length > 3) && word.match(/([AEIOUY])/g)) {
          replacement = word.toLowerCase();
        } else {
          // This regex will space out any camelCased/all CAPS words
          // so they sound better when spoken by TTS engines.
          replacement = word.replace(/([A-Z])/g, ' $1');
        }
        textString = textString.replace(word, replacement);
      }
    }

    cvox.ExtensionBridge.send(
        {'target': 'TTS',
          'action': 'speak',
          'text': textString,
          'queueMode': queueMode,
          'properties': properties});
  };

  /**
   * Returns true if the TTS is currently speaking.
   * @return {boolean} True if the TTS is speaking.
   */
  cvox.RemoteTtsManager.prototype.isSpeaking = function() {
    cvox.RemoteTtsManager.superClass_.isSpeaking.call(this);
    return false;
  };

  /**
   * Stops speech.
   */
  cvox.RemoteTtsManager.prototype.stop = function() {
    cvox.RemoteTtsManager.superClass_.stop.call(this);
    cvox.ExtensionBridge.send(
        {'target': 'TTS',
          'action': 'stop'});
  };

  /**
   * Switch to the next TTS engine and optionally announce its name.
   *
   * @param {boolean} announce If true, will announce the name of the
   *     new TTS engine.
   */
  cvox.RemoteTtsManager.prototype.nextEngine = function(announce) {
    cvox.RemoteTtsManager.superClass_.nextTtsEngine.call(this, announce);
    cvox.ExtensionBridge.send(
        {'target': 'TTS',
          'action': 'nextEngine'});
  };

  /**
   * Decreases a TTS speech property.
   * @param {string} property_name The name of the property to decrease.
   * @param {boolean} announce Whether to announce that the property is
   * changing.
   */
  cvox.RemoteTtsManager.prototype.decreaseProperty =
      function(property_name, announce) {
    cvox.RemoteTtsManager.superClass_.decreaseProperty.call(this,
        property_name);
    cvox.ExtensionBridge.send(
        {'target': 'TTS',
          'action': 'decrease' + property_name,
          'modifier': announce});
  };

  /**
   * Increases a TTS speech property.
   * @param {string} property_name The name of the property to increase.
   * @param {boolean} announce Whether to announce that the property is
   * changing.
   */
  cvox.RemoteTtsManager.prototype.increaseProperty =
      function(property_name, announce) {
    cvox.RemoteTtsManager.superClass_.increaseProperty.call(this,
        property_name);
    cvox.ExtensionBridge.send(
        {'target': 'TTS',
          'action': 'increase' + property_name,
          'modifier': announce});
  };
} else {
  cvox.RemoteTtsManager = function() {};
}
