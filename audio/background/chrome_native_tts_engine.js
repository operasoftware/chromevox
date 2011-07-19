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
 * @fileoverview Sends Text-To-Speech commands to Chrome's native TTS
 * extension API.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

cvoxgoog.provide('cvox.ChromeVoxChromeNativeTtsEngine');

cvoxgoog.require('cvox.AbstractTts');
cvoxgoog.require('cvox.ChromeVox');

/**
 * @constructor
 * @extends {cvox.AbstractTts}
 */
cvox.ChromeVoxChromeNativeTtsEngine = function() {
  //Inherit AbstractTts
  cvox.AbstractTts.call(this);
  if (cvox.ChromeVox.isChromeOS) {
    this.ttsProperties.rate = .3;
    // We want to keep low default volume for ChromeOS because amplifying the
    // sound by the TTS engine results into unintelligible speech on ChromeOS
    // netbook, especially the CR-48.
    this.ttsProperties.volume = .3;
  } else {
    this.ttsProperties.rate = .5;
    this.ttsProperties.volume = 1;
  }
  this.ttsProperties.pitch = .5;

  // Events are now handled by the onevent option. There are two spellings
  // depending on the exact Chrome version you're on.
  try {
    chrome.experimental.tts.speak(
        '', {'onevent': function(e) {}}, function() {});
    this.use_onevent = true;
  } catch (e) {
  }
  try {
    chrome.experimental.tts.speak(
        '', {'onEvent': function(e) {}}, function() {});
    this.use_onEvent = true;
  } catch (e) {
  }
};
cvoxgoog.inherits(cvox.ChromeVoxChromeNativeTtsEngine, cvox.AbstractTts);

/**
 * @return {string} The human-readable name of the speech engine.
 */
cvox.ChromeVoxChromeNativeTtsEngine.prototype.getName = function() {
  return 'Chrome Native Speech';
};

/**
 * Speaks the given string using the specified queueMode and properties.
 * @param {string} textString The string of text to be spoken.
 * @param {number=} queueMode The queue mode: AbstractTts.QUEUE_MODE_FLUSH
 *        for flush, AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 * @param {Function=} completionCallback Called if speech completes.
 */
cvox.ChromeVoxChromeNativeTtsEngine.prototype.speak = function(
    textString, queueMode, properties, completionCallback) {
  cvox.ChromeVoxChromeNativeTtsEngine.superClass_.speak.call(this, textString,
      queueMode, properties, completionCallback);
  if (queueMode === cvox.AbstractTts.QUEUE_MODE_FLUSH) {
    this.stop();
  }
  var mergedProperties = this.mergeProperties(properties);
  mergedProperties.enqueue = (queueMode === cvox.AbstractTts.QUEUE_MODE_QUEUE);

  // This function will be called when speech is complete.
  function onCompleted() {
    if (completionCallback != undefined) {
      completionCallback();
    }
  }

  // TODO(dmazzoni): remove this logic once Chrome 14 is the stable version.
  if (chrome.tts || chrome.experimental.tts.getVoices) {
    // Stable or transitional TTS API.

    // Events are now handled by the onevent option. There are two spellings
    // depending on the exact Chrome version you're on.
    function onEventHandler(event) {
      if (event.type == 'end') {
        onCompleted();
      }
    }
    if (this.use_onEvent) {
      mergedProperties.onEvent = onCompleted;
    } else if (this.use_onevent) {
      mergedProperties.onevent = onCompleted;
    }

    // Map rate from 0.0-1.0 with 0.5 being normal,
    // to 0.1-10.0 with 1 being normal:
    if (mergedProperties.rate) {
      mergedProperties.rate *= 1;
    }
    // Map pitch from 0.0-1.0 to 0.0-2.0:
    if (mergedProperties.pitch) {
      mergedProperties.pitch *= 2;
    }
    // Map locale to lang
    mergedProperties.lang = mergedProperties.locale;
    if (chrome.tts) {
      chrome.tts.speak(textString, mergedProperties);
    } else {
      chrome.experimental.tts.speak(textString, mergedProperties);
    }
  } else {
    // Old TTS API.
    chrome.experimental.tts.speak(textString, mergedProperties, function() {
      if (!chrome.extension.lastError) {
        onCompleted();
      }
    });
  }
};

/**
 * Returns true if the TTS is currently speaking.
 * @return {boolean} True if the TTS is speaking.
 */
cvox.ChromeVoxChromeNativeTtsEngine.prototype.isSpeaking = function() {
  cvox.ChromeVoxChromeNativeTtsEngine.superClass_.isSpeaking.call(this);
  // TODO(dmazzoni): Replace this with something that actually works!
  // This is not using the API correctly; the API is asynchronous, and
  // can't be used like this.
  return false;
};

/**
 * Stops speech.
 */
cvox.ChromeVoxChromeNativeTtsEngine.prototype.stop = function() {
  cvox.ChromeVoxChromeNativeTtsEngine.superClass_.stop.call(this);
  if (chrome.tts) {
    chrome.tts.stop();
  } else {
    chrome.experimental.tts.stop();
  }
};

