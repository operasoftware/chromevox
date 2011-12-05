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
 * @fileoverview A floating choice widget that can be used as
 * a replacement for the standard alert() popup, a disambiguation
 * dialog if multiple targets are available, etc.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.ChromeVoxChoiceWidget');

goog.require('cvox.AbstractEarcons');
goog.require('cvox.AbstractTts');
goog.require('cvox.ChromeVox');

/**
 * @constructor
 */
cvox.ChromeVoxChoiceWidget = function() {
  this.powerKey = new window.PowerKey('main', null);
  this.powerKey.createCompletionField(document.body, 50, null, null, null,
      false);
  this.powerKey.setAutoHideCompletionField(true);
  this.powerKey.setDefaultCSSStyle();
};

/**
 * Creates an alert dialog widget given a set of descriptions and associated
 * functions.
 *
 * @param {Array.<string>} descriptions The array of strings to present
 *     to the user.
 * @param {Array.<string>} functions The array of functions associated
 *     with the descriptions.
 * @param {string} prompt The message to be spoken to the user.
 */
cvox.ChromeVoxChoiceWidget.prototype.show = function(descriptions, functions,
    prompt) {
  // We must dedup the descriptions so they are accessible.
  // If there are two elements with the same lowercase form, the
  // first will keep its name.  The second will be named "<name> 2".
  var dedupped = [];
  var dedupKeys = {};
  for (var i = 0, description; description = descriptions[i]; i++) {
    var key = description.toLowerCase();
    var seq = 2;
    while (key in dedupKeys) {
      description = descriptions[i] + ' ' + seq;
      key = description.toLowerCase();
      seq++;
    }
    dedupKeys[key] = true;
    dedupped.push(description);
  }


  this.powerKey.setCompletionList(dedupped);
  var completionActionMap = new Object();
  for (var i = 0, description; description = dedupped[i]; i++) {
    var action = new Object();
    action['main'] = functions[i];
    completionActionMap[description.toLowerCase()] = action;
  }
  this.powerKey.setCompletionActionMap(completionActionMap);
  this.powerKey.setCompletionPromptStr(dedupped.toString());
  this.powerKey.setBrowseCallback(function(text) {
    cvox.ChromeVox.tts.speak(text, cvox.AbstractTts.QUEUE_MODE_FLUSH,
        null);
  });
  this.powerKey.updateCompletionField(
      window.PowerKey.status.VISIBLE, true, 40, 20);
  cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.LISTBOX);
  window.setTimeout(function() {
      cvox.ChromeVox.tts.speak(prompt);
    }, 0);
};
