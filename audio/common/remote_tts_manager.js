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

cvoxgoog.provide('cvox.RemoteTtsManager');

cvoxgoog.require('cvox.AbstractTtsManager');

if (BUILD_TYPE == BUILD_TYPE_CHROME) {
  /**
   * @constructor
   * @extends {cvox.AbstractTtsManager}
   */
  cvox.RemoteTtsManager = function() {
    cvox.AbstractTtsManager.call(this);
  };
  cvoxgoog.inherits(cvox.RemoteTtsManager, cvox.AbstractTtsManager);

  /**
   * Current call id, used for matching callback functions.
   * @type {number}
   */
  cvox.RemoteTtsManager.callId = 0;

  /**
   * Maps call ids to callback functions.
   * @type {Object.<number, Function>}
   */
  cvox.RemoteTtsManager.functionMap = new Object();

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
    textString = cvox.AbstractTts.preprocess(textString);
    cvox.RemoteTtsManager.superClass_.speak.call(this, textString, queueMode,
        properties);

    var message = {'target': 'TTS',
                   'action': 'speak',
                   'text': textString,
                   'queueMode': queueMode,
                   'properties': properties};

    if (properties && properties['startCallback'] != undefined) {
      cvox.RemoteTtsManager.functionMap[cvox.RemoteTtsManager.callId] =
          properties['startCallback'];
      message['startCallbackId'] = cvox.RemoteTtsManager.callId++;
    }
    if (properties && properties['endCallback'] != undefined) {
      cvox.RemoteTtsManager.functionMap[cvox.RemoteTtsManager.callId] =
          properties['endCallback'];
      message['endCallbackId'] = cvox.RemoteTtsManager.callId++;
    }

    cvox.ExtensionBridge.send(message);
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

  /**
   * Listens for TTS_COMPLETED message and executes the callback function.
   */
  cvox.RemoteTtsManager.prototype.addBridgeListener = function() {
    cvox.ExtensionBridge.addMessageListener(function(msg, port) {
      var message = msg['message'];
      if (message == 'TTS_CALLBACK') {
        var id = msg['id'];
        var func = cvox.RemoteTtsManager.functionMap[id];
        if (func != undefined) {
          func();
          delete cvox.RemoteTtsManager.functionMap[id];
        }
      }
    });
  };
} else {
  cvox.RemoteTtsManager = function() {};
}
