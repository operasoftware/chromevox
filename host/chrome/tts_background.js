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
  var defaultVolume;
  if (cvox.ChromeVox.isChromeOS) {
    // We want to keep low default volume for ChromeOS because amplifying the
    // sound by the TTS engine results into unintelligible speech on ChromeOS
    // netbook, especially the CR-48.
    defaultVolume = .5;
  } else {
    defaultVolume = 1;
  }
  var defaultPitch = 1;
  var defaultRate = 1;

  this.ttsProperties['rate'] = (parseFloat(localStorage['rate']) ||
                                defaultRate);
  this.ttsProperties['pitch'] = (parseFloat(localStorage['pitch']) ||
                                 defaultPitch);
  this.ttsProperties['volume'] = (parseFloat(localStorage['volume']) ||
                                  defaultVolume);

  this.propertyMin['pitch'] = 0.0;
  this.propertyMax['pitch'] = 2.0;

  this.propertyMin['rate'] = 0.2;
  this.propertyMax['rate'] = 5.0;

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
};
goog.inherits(cvox.TtsBackground, cvox.AbstractTts);


/** @override */
cvox.TtsBackground.prototype.speak = function(
    textString, queueMode, properties) {
  cvox.TtsBackground.superClass_.speak.call(this, textString,
      queueMode, properties);

  var mergedProperties = this.mergeProperties(properties);
  mergedProperties['enqueue'] =
      (queueMode === cvox.AbstractTts.QUEUE_MODE_QUEUE);
  if (localStorage['voiceName']) {
    mergedProperties['voiceName'] = localStorage['voiceName'];
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
  // TODO(deboer): This function appears to only work when the min == 0.
  return this.ttsProperties[property] /
         Math.abs(this.propertyMax[property] - this.propertyMin[property]);
};
