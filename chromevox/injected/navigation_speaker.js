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
 * @fileoverview A class for speaking navigation information.
 * @author stoarca@google.com (Sergiu Toarca)
 */


goog.provide('cvox.NavigationSpeaker');

goog.require('cvox.NavDescription');

/**
 * @constructor
 */
cvox.NavigationSpeaker = function() {
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
  var speakOneDescription = function(i, queueMode) {
    var description = descriptionArray[i];
    var startCallback = function() {
      for (var j = 0; j < description.earcons.length; j++) {
        cvox.ChromeVox.earcons.playEarcon(description.earcons[j]);
      }
    }
    var endCallback = undefined;
    if ((i == descriptionArray.length - 1) && completionFunction) {
      endCallback = completionFunction;
    }
    description.speak(queueMode, startCallback, endCallback);
  };

  var queueMode = initialQueueMode;
  for (var i = 0; i < descriptionArray.length; i++) {
    if (!descriptionArray[i].isEmpty()) {
      speakOneDescription(i, queueMode);
      queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
    }
  }

  if ((descriptionArray.length == 0) && completionFunction) {
    completionFunction();
  }
};
