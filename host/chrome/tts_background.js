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
 * @fileoverview Sends Text-To-Speech commands to Chrome's native TTS
 * extension API.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.TtsBackground');

goog.require('cvox.AbstractTts');
goog.require('cvox.ChromeVox');

/**
 * @constructor
 * @extends {cvox.AbstractTts}
 */
cvox.TtsBackground = function() {
  //Inherit AbstractTts
  cvox.AbstractTts.call(this);
  var defaultVolume = 1;
  var defaultPitch = 1;
  var defaultRate = 1;
  this.currentVoice = '';

  this.ttsProperties['rate'] = (parseFloat(localStorage['rate']) ||
                                defaultRate);
  this.ttsProperties['pitch'] = (parseFloat(localStorage['pitch']) ||
                                 defaultPitch);
  this.ttsProperties['volume'] = (parseFloat(localStorage['volume']) ||
                                  defaultVolume);

  this.propertyMin['pitch'] = 0.2;
  this.propertyMax['pitch'] = 2.0;

  this.propertyMin['rate'] = 0.2;
  this.propertyMax['rate'] = 5.0;

  this.propertyMin['volume'] = 0.2;
  this.propertyMax['volume'] = 1.0;

  this.lastEventType = 'end';

  /**
   * Used to count the number of active utterances sent to tts.
   * We increment the count when an utterance first gets sent to tts via speak()
   * calls. We decrement when we receive one of 'end', 'cancelled',
   * 'interrupted', or 'error'. The count should always be zero when we're in a
   * idle state.
   * @type {number}
   * @private
   */
  this.utteranceCount_ = 0;

  this.loadPreferredVoice_();
};
goog.inherits(cvox.TtsBackground, cvox.AbstractTts);

/**
 * Sets the current voice to the one that the user selected on the options page
 * if that voice exists.
 * @private
 */
cvox.TtsBackground.prototype.loadPreferredVoice_ = function() {
  var self = this;
  chrome.tts.getVoices(
      function(voices) {
        for (var i = 0, v; v = voices[i]; i++) {
          if (v['voiceName'] == localStorage['voiceName']) {
            self.currentVoice = v['voiceName'];
            return;
          }
        }
      });
};


/** @override */
cvox.TtsBackground.prototype.speak = function(
    textString, queueMode, properties) {
  cvox.TtsBackground.superClass_.speak.call(this, textString,
      queueMode, properties);

  // Chunk to improve responsiveness. Use a replace/split pattern in order to
  // retain the original punctuation.
  var splitTextString = textString.replace(/([-\n\r.,!?;])(\s)/g, '$1$2|');
  splitTextString = splitTextString.split('|');
  // Since we are substituting the chunk delimiters back into the string, only
  // recurse when there are more than 2 split items. This should result in only
  // one recursive call.
  if (splitTextString.length > 2) {
    var startCallback = properties['startCallback'];
    var endCallback = properties['endCallback'];
    for (var i = 0; i < splitTextString.length; i++) {
      properties['startCallback'] = i == 0 ? startCallback : null;
      properties['endCallback'] =
          i == (splitTextString.length - 1) ? endCallback : null;
      this.speak(splitTextString[i], queueMode, properties);
      queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
    }
    return this;
  }

  textString =
      cvox.AbstractTts.preprocessWithProperties(textString, properties);

  // TODO(dtseng): Google TTS has bad performance when speaking numbers. This
  // pattern causes ChromeVox to read numbers as digits rather than words.
  textString = this.getNumberAsDigits_(textString);

  // TODO(dtseng): Google TTS flushes the queue when encountering strings of
  // this pattern which stops ChromeVox speech.
  if (!textString || !textString.match(/\w+/g)) {
    // We still want to callback for listeners in our content script.
    if (properties['startCallback']) {
      properties['startCallback']();
    }
    if (properties['endCallback']) {
      properties['endCallback']();
    }
    if (queueMode === cvox.AbstractTts.QUEUE_MODE_FLUSH) {
      this.stop();
    }
    return this;
  }

  var mergedProperties = this.mergeProperties(properties);
  mergedProperties['enqueue'] =
      (queueMode === cvox.AbstractTts.QUEUE_MODE_QUEUE);

  if (this.currentVoice && (this.currentVoice == localStorage['voiceName'])) {
    mergedProperties['voiceName'] = this.currentVoice;
  }
  if (localStorage['voiceName'] &&
      this.currentVoice != localStorage['voiceName']) {
    this.loadPreferredVoice_();
  }

  mergedProperties['onEvent'] = goog.bind(function(event) {
    this.lastEventType = event['type'];
    if (this.lastEventType == 'end' ||
        this.lastEventType == 'cancelled' ||
        this.lastEventType == 'interrupted' ||
        this.lastEventType == 'error') {
      this.utteranceCount_--;
    }

    if (event['type'] == 'end' && properties && properties['endCallback']) {
      properties['endCallback']();
    }
    if (event['type'] == 'start' &&
        properties &&
        properties['startCallback']) {
      properties['startCallback']();
    }
    if (event['type'] == 'error') {
      this.onError_();
    }
  }, this);

  chrome.tts.isSpeaking(goog.bind(function(state) {
    // TODO(dtseng): Leaving this here to identify cases when we drop text
    // unintentionally.
    // Eventually rewrite this arbitration logic to defer to other speakers
    // except for ChromeOS. Currently only useful on Mac.
    // Be wary of changing this as it depends on proper callbacks from the
    // current TTS engine.
    if (cvox.ChromeVox.isMac && this.utteranceCount_ == 0 && state) {
      console.log('Dropped utterance: ' + textString);
    } else {
      // Check to see that either no one is speaking or only we are.
      chrome.tts.speak(textString, mergedProperties, this.onError_);
      this.utteranceCount_++;
    }
  }, this));
};

/** @override */
cvox.TtsBackground.prototype.increaseOrDecreaseProperty =
    function(propertyName, increase) {
  cvox.TtsBackground.superClass_.increaseOrDecreaseProperty.call(
      this, propertyName, increase);
  localStorage[propertyName] = this.ttsProperties[propertyName];
};

/** @override */
cvox.TtsBackground.prototype.isSpeaking = function() {
  cvox.TtsBackground.superClass_.isSpeaking.call(this);
  return this.lastEventType != 'end';
};

/** @override */
cvox.TtsBackground.prototype.stop = function() {
  cvox.TtsBackground.superClass_.stop.call(this);
  chrome.tts.stop();
};

/**
 * An error handler passed as a callback to chrome.tts.speak.
 * @private
 */
cvox.TtsBackground.prototype.onError_ = function() {
  if (chrome.extension.lastError) {
    // Reset voice related parameters.
    delete localStorage['voiceName'];
  }
};

/**
 * Converts an engine property value to a percentage from 0.00 to 1.00.
 * @return {?number} The percentage of the property.
 */
cvox.TtsBackground.prototype.propertyToPercentage = function(property) {
  return (this.ttsProperties[property] - this.propertyMin[property]) /
         Math.abs(this.propertyMax[property] - this.propertyMin[property]);
};


/**
 * Converts a number into space-separated digits.
 * For numbers containing 4 or fewer digits, we return the original number.
 * This ensures that numbers like 123,456 or 2011 are not "digitized" while
 * 123456 is.
 * @param {string} text The text to process.
 * @return {string} A string with all numbers converted.
 * @private
 */
cvox.TtsBackground.prototype.getNumberAsDigits_ = function(text) {
  return text.replace(/\d+/g, function(num) {
    if (num.length <= 4) {
      return num;
    }
    return num.split('').join(' ');
  });
};
