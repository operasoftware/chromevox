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
 * @fileoverview A floating choice widget that can be used as
 * a replacement for the standard alert() popup, a disambiguation
 * dialog if multiple targets are available, etc.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.ChromeVoxChoiceWidget');


goog.require('axsjax.common.PowerKey');
goog.require('cvox.AbstractTts');
goog.require('cvox.ChromeVox');
goog.require('cvox.Widget');

/**
 * Creates an alert dialog widget given a set of descriptions and associated
 * functions.
 *
 * @param {Array.<string>=} opt_descriptions The array of strings to present
 *     to the user.
 * @param {Array.<string>=} opt_functions The array of functions associated
 *     with the descriptions.
 * @param {string=} opt_prompt The message to be spoken to the user.
 * @constructor
 * @extends {cvox.Widget}
 */
cvox.ChromeVoxChoiceWidget = function(opt_descriptions, opt_functions, opt_prompt) {
  if (opt_descriptions != undefined &&
      opt_functions != undefined &&
      opt_prompt != undefined) {
    // intentional call to my init so that nobody can override
    cvox.ChromeVoxChoiceWidget.prototype.init.call(this,
        /** type = {Array.<string>} */ opt_descriptions,
        /** type = {Array.<string>} */ opt_functions,
        /** type = {string} */ opt_prompt);
  }
};
goog.inherits(cvox.ChromeVoxChoiceWidget, cvox.Widget);

/**
 * @param {Array.<string>} descriptions The array of strings to present to
 * the user.
 * @param {Array.<string>} functions The array of functions associated with
 * the descriptions.
 * @param {string} prompt The message to be spoken to the user.
 */
cvox.ChromeVoxChoiceWidget.prototype.init = function(
    descriptions, functions, prompt) {
  /**
   * @type {string}
   * @private
   */
  this.prompt_ = prompt;

  /**
   * @type {axsjax.common.PowerKey}
   * @protected
   */
  this.powerKey_ = new axsjax.common.PowerKey('main', null);
  this.powerKey_.createCompletionField(document.body, 50, null, null, null,
      false);
  this.powerKey_.setAutoHideCompletionField(true);
  this.powerKey_.setDefaultCSSStyle();

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

  this.powerKey_.setCompletionList(dedupped);
  var completionActionMap = new Object();
  for (var i = 0, description; description = dedupped[i]; i++) {
    var action = new Object();
    action['main'] = functions[i];
    completionActionMap[description.toLowerCase()] = action;
  }
  this.powerKey_.setCompletionActionMap(completionActionMap);
  this.powerKey_.setCompletionPromptStr(dedupped.toString());
  this.powerKey_.setBrowseCallback(function(text) {
    cvox.ChromeVox.tts.speak(text, cvox.AbstractTts.QUEUE_MODE_FLUSH,
        null);
  });
};

/**
 * @override
 */
cvox.ChromeVoxChoiceWidget.prototype.show = function() {
  cvox.ChromeVoxChoiceWidget.superClass_.show.call(this);

  if (this.isActive())
    return;

  this.powerKey_.updateCompletionField(
      window.PowerKey.status.VISIBLE, true, 40, 20);
  window.setTimeout(goog.bind(function() {
      cvox.ChromeVox.tts.speak(this.prompt_);
    }, this), 0);
};

/**
 * Checks if the choice widget is currently active.
 * @override
 */
cvox.ChromeVoxChoiceWidget.prototype.isActive = function() {
  if (this.powerKey_ &&
      this.powerKey_.getStatus() == window.PowerKey.status.VISIBLE) {
    return true;
  }
  return false;
};
