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
 * @preserve
 * @filename chromevox/injected/navigation_speaker.js
 */

/**
 * @fileoverview A class for speaking navigation information.
 * @author stoarca@google.com (Sergiu Toarca)
 */


goog.provide('cvox.NavigationSpeaker');

goog.require('cvox.NavDescription');

/**
 * @constructor
 */
cvox.NavigationSpeaker = function() {
  /**
   * This member indicates to this speaker to cancel any pending callbacks.
   * This is needed primarily to support cancelling a chain of callbacks by an
   * outside caller.  There's currently no way to cancel a chain of callbacks in
   * any other way.  Consider removing this if we ever get silence at the tts
   * layer.
   * @type {boolean}
   */
  this.stopReading = false;

  /**
   * An identifier that tracks the calls to speakDescriptionArray. Used to
   * cancel a chain of callbacks that is stale.
   * @type {number}
   * @private
   */
  this.id_ = 1;
};

/**
 * Speak all of the NavDescriptions in the given array (as returned by
 * getDescription), including playing earcons.
 *
 * @param {Array.<cvox.NavDescription>} descriptionArray The array of
 *     NavDescriptions to speak.
 * @param {number} initialQueueMode The initial queue mode.
 * @param {Function} completionFunction Function to call when finished speaking.
 */
cvox.NavigationSpeaker.prototype.speakDescriptionArray = function(
    descriptionArray, initialQueueMode, completionFunction) {
  descriptionArray = this.reorderAnnotations(descriptionArray);

  this.stopReading = false;
  this.id_ = (this.id_ + 1) % 10000;

  // Using self rather than goog.bind in order to get debug symbols.
  var self = this;
  var speakDescriptionChain = function(i, queueMode, id) {
    var description = descriptionArray[i];
    if (!description || self.stopReading || self.id_ != id) {
      return;
    }
    var startCallback = function() {
      for (var j = 0; j < description.earcons.length; j++) {
        cvox.ChromeVox.earcons.playEarcon(description.earcons[j]);
      }
    };
    var endCallbackHelper = function() {
      speakDescriptionChain(i + 1, cvox.AbstractTts.QUEUE_MODE_QUEUE, id);
    };
    var endCallback = function() {
      // We process content-script specific properties here for now.
      if (description.personality &&
          description.personality[cvox.AbstractTts.PAUSE] &&
          typeof(description.personality[cvox.AbstractTts.PAUSE]) == 'number') {
        setTimeout(
            endCallbackHelper, description.personality[cvox.AbstractTts.PAUSE]);
      } else {
        endCallbackHelper();
      }
      if ((i == descriptionArray.length - 1) && completionFunction) {
        completionFunction();
      }
    };
    if (!description.isEmpty()) {
      description.speak(queueMode, startCallback, endCallback);
    } else {
      startCallback();
      endCallback();
      return;
    }
    if (!cvox.ChromeVox.host.hasTtsCallback()) {
      startCallback();
      endCallback();
    }
  };

  speakDescriptionChain(0, initialQueueMode, this.id_);

  if ((descriptionArray.length == 0) && completionFunction) {
    completionFunction();
  }
};


/**
 * Checks for an annotation of a structured elements.
 * @param {string} annon The annotation.
 * @return {boolean} True if annotating a structured element.
 */
cvox.NavigationSpeaker.structuredElement = function(annon) {
  // TODO(dtseng, sorge): This doesn't work for languages other than English.
  switch (annon) {
    case 'table':
    case 'Math':
    return true;
  }
  return false;
};


/**
 * Reorder special annotations for structured elements to be spoken first.
 * @param {Array.<cvox.NavDescription>} descriptionArray The array of
 *     NavDescriptions to speak.
 * @return {Array.<cvox.NavDescription>} The reordered array.
 */
cvox.NavigationSpeaker.prototype.reorderAnnotations = function(
    descriptionArray) {
  var descs = new Array;
  for (var i = 0; i < descriptionArray.length; i++) {
    var descr = descriptionArray[i];
    if (cvox.NavigationSpeaker.structuredElement(descr.annotation)) {
      descs.push(new cvox.NavDescription({
        text: '',
        annotation: descr.annotation
      }));
      descr.annotation = '';
    }
    descs.push(descr);
  }
  return descs;
};
