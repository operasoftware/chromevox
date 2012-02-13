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
 * @fileoverview Bridge that sends TTS messages from content scripts or
 * other pages to the main background page.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.ChromeTts');

goog.require('cvox.AbstractTts');
goog.require('cvox.HostFactory');

/**
 * @constructor
 * @extends {cvox.AbstractTts}
 */
cvox.ChromeTts = function() {
  cvox.AbstractTts.call(this);

  this.lens_ = null;
  this.lensContent_ = document.createElement('div');

  this.addBridgeListener();
};
goog.inherits(cvox.ChromeTts, cvox.AbstractTts);

/**
 * Current call id, used for matching callback functions.
 * @type {number}
 */
cvox.ChromeTts.callId = 0;

/**
 * Maps call ids to callback functions.
 * @type {Object.<number, Function>}
 */
cvox.ChromeTts.functionMap = new Object();

/**
 * Speaks the given string using the specified queueMode and properties.
 * @param {string} textString The string of text to be spoken.
 * @param {number=} queueMode The queue mode: AbstractTts.QUEUE_MODE_FLUSH
 *        for flush, AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 */
cvox.ChromeTts.prototype.speak = function(textString, queueMode, properties) {
  if (!properties)
    properties = {};

  properties['lang'] = cvox.ChromeVox.msgs.getLocale();

  textString =
      cvox.AbstractTts.preprocessWithProperties(textString, properties);

  cvox.ChromeTts.superClass_.speak.call(this, textString, queueMode, properties);

  if (this.lens_) {
    if (queueMode == cvox.AbstractTts.QUEUE_MODE_FLUSH) {
      var line = document.createElement('hr');
      this.lensContent_.appendChild(line);
    }
    // Remove elements if exceed maxHistory. Multiply by 2 to accont for <hr>.
    while (this.lensContent_.childNodes.length > this.lens_.maxHistory * 2) {
      var temp = this.lensContent_.childNodes[0];
      this.lensContent_.removeChild(temp);
    }
    var lensElem = document.createElement('span');
    lensElem.innerText = textString;
    lensElem.style.marginLeft = '0.5em !important';
    if (properties && properties[cvox.AbstractTts.COLOR]) {
      lensElem.style.color = properties[cvox.AbstractTts.COLOR] + ' !important';
    }
    if (properties && properties[cvox.AbstractTts.FONT_WEIGHT]) {
      lensElem.style.fontWeight =
          properties[cvox.AbstractTts.FONT_WEIGHT] + ' !important';
    }
    this.lensContent_.appendChild(lensElem);
    this.lens_.setLensContent(this.lensContent_);
  }

  var message = {'target': 'TTS',
                 'action': 'speak',
                 'text': textString,
                 'queueMode': queueMode,
                 'properties': properties};

  if (properties && properties['startCallback'] != undefined) {
    console.log('  using startCallback');

    cvox.ChromeTts.functionMap[cvox.ChromeTts.callId] =
        properties['startCallback'];
    message['startCallbackId'] = cvox.ChromeTts.callId++;
  }
  if (properties && properties['endCallback'] != undefined) {
    console.log('  using endCallback');

    cvox.ChromeTts.functionMap[cvox.ChromeTts.callId] =
        properties['endCallback'];
    message['endCallbackId'] = cvox.ChromeTts.callId++;
  }

  cvox.ExtensionBridge.send(message);
};

/**
 * Set a cvox.Lens to display any messages spoken via speak().
 * @param {cvox.AbstractLens} lens The lens.
 */
cvox.ChromeTts.prototype.setLens = function(lens) {
  this.lens_ = lens;
};

/**
 * Returns true if the TTS is currently speaking.
 * @return {boolean} True if the TTS is speaking.
 */
cvox.ChromeTts.prototype.isSpeaking = function() {
  cvox.ChromeTts.superClass_.isSpeaking.call(this);
  return false;
};

/**
 * Stops speech.
 */
cvox.ChromeTts.prototype.stop = function() {
  cvox.ChromeTts.superClass_.stop.call(this);
  cvox.ExtensionBridge.send(
      {'target': 'TTS',
       'action': 'stop'});
};

/**
 * Increases a TTS speech property.
 * @param {string} propertyName The name of the property to change.
 * @param {boolean} increase If true, increases the property value by one
 *     step size, otherwise decreases.
 */
cvox.ChromeTts.prototype.increaseOrDecreaseProperty =
    function(propertyName, increase) {
  cvox.ExtensionBridge.send(
      {'target': 'TTS',
       'action': 'increaseOrDecrease',
       'property': propertyName,
       'increase': increase});
};

/**
 * Increases a TTS speech property.
 * @param {string} property_name The name of the property to increase.
 * @param {boolean} announce Whether to announce that the property is
 * changing.
 */
cvox.ChromeTts.prototype.increaseProperty = function(property_name, announce) {
  cvox.ChromeTts.superClass_.increaseProperty.call(this, property_name, announce);
  cvox.ExtensionBridge.send(
      {'target': 'TTS',
       'action': 'increase' + property_name,
       'announce': announce});
};

/**
 * Listens for TTS_COMPLETED message and executes the callback function.
 */
cvox.ChromeTts.prototype.addBridgeListener = function() {
  cvox.ExtensionBridge.addMessageListener(
      function(msg, port) {
        var message = msg['message'];
        if (message == 'TTS_CALLBACK') {
          var id = msg['id'];
          var func = cvox.ChromeTts.functionMap[id];
          if (func != undefined) {
            func();
            delete cvox.ChromeTts.functionMap[id];
          }
        }
      });
};

cvox.HostFactory.ttsConstructor = cvox.ChromeTts;
