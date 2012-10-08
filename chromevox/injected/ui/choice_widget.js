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

goog.provide('cvox.ChoiceWidget');


goog.require('axsjax.common.PowerKey');
goog.require('cvox.AbstractTts');
goog.require('cvox.ChromeVox');
goog.require('cvox.Widget');

/**
 * A class wrapping PowerKey to expose a widget-like interface.
 *
 * @constructor
 * @extends {cvox.Widget}
 * @param {Array.<string>} descriptions The array of strings to present to
 * the user.
 * @param {Array.<string>} functions The array of functions associated with
 * the descriptions.
 */
cvox.ChoiceWidget = function(descriptions, functions) {
  /**
   * @type {axsjax.common.PowerKey}
   * @private
   */
  this.powerKey_ = new axsjax.common.PowerKey('main', null);
  this.powerKey_.createCompletionField(document.body, /* parent */
                                       50, /* size */
                                       null, /* handler */
                                       null, /* actionMap */
                                       null, /* completionList */
                                       false, /* browseOnly */
                                       true /* opt_ariaHidden */);
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
  this.prevIndex_ = 0;

  // Not binding since the callback belongs to PowerKey.
  var self = this;
  this.powerKey_.setBrowseCallback(function(text, index) {
    cvox.ChromeVox.tts.speak(text, cvox.AbstractTts.QUEUE_MODE_FLUSH,
        null);
    if ((index == 0 && self.prevIndex_ == dedupped.length - 1) ||
        index == dedupped.length - 1 && self.prevIndex_ == 0) {
      cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.WRAP);
    }
    self.prevIndex_ = index;
  });

  // TODO(dtseng): PowerKey doesn't have a clear distinction between intro and
  // help announcements.
  // Also, fix this for i18n.
  var prompt = cvox.ChromeVox.msgs.getMsg(this.getNameMsg()) +
      '. ' +
      cvox.ChromeVox.msgs.getMsg(this.getHelp());
  this.powerKey_.setCompletionPromptStr(prompt);
};
goog.inherits(cvox.ChoiceWidget, cvox.Widget);


/**
 * @override
 */
cvox.ChoiceWidget.prototype.show = function() {
  goog.base(this, 'show');
  this.powerKey_.updateCompletionField(
      window.PowerKey.status.VISIBLE, true, 40, 20);
};


/**
 * @override
 */
cvox.ChoiceWidget.prototype.hide = function(opt_noSync) {
  this.powerKey_.updateCompletionField(window.PowerKey.status.HIDDEN);
  goog.base(this, 'hide', opt_noSync);
};


/**
 * Checks if the choice widget is currently active.
 * @override
 */
cvox.ChoiceWidget.prototype.isActive = function() {
  return !!(this.powerKey_ &&
            this.powerKey_.getStatus() == window.PowerKey.status.VISIBLE);
};


/**
 * @override
 */
cvox.ChoiceWidget.prototype.getNameMsg = function() {
  return 'choice_widget_name';
};


/**
 * @override
 */
cvox.ChoiceWidget.prototype.getHelp = function() {
  return 'choice_widget_help';
};
