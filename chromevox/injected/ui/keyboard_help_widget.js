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
 * @fileoverview Widget presenting all keyboard commands.
 * @author dtseng@google.com (David Tseng)
 */

goog.provide('cvox.KeyboardHelpWidget');

goog.require('cvox.ChoiceWidget');
goog.require('cvox.ChromeVox');
goog.require('cvox.CommandStore');
goog.require('cvox.KeyUtil');

/**
 * @constructor
 * @extends {cvox.ChoiceWidget}
 */
cvox.KeyboardHelpWidget = function() {
  cvox.CommandStore.init();
  var list = [];
  var callbacks = [];
  var keymap = cvox.ChromeVoxKbHandler.handlerKeyMap;

  keymap.bindings().forEach(goog.bind(function(pair) {
    var command = pair.command;
    var keySeq = pair.sequence;
    var message = command;
    try {
      var id = cvox.CommandStore.messageForCommand(command);
      if (!id) {
        return;
      }
      message = cvox.ChromeVox.msgs.getMsg(id);
    } catch (e) {
      // TODO(dtseng): We have some commands that don't have valid message id's.
    }

    list.push(message + ' - ' + cvox.KeyUtil.keySequenceToString(keySeq, true));
    callbacks.push(this.createCallback_(command));
  }, this));

  return goog.base(this, list, callbacks);
};
goog.inherits(cvox.KeyboardHelpWidget, cvox.ChoiceWidget);
goog.addSingletonGetter(cvox.KeyboardHelpWidget);


/**
 * @override
 */
cvox.KeyboardHelpWidget.prototype.getNameMsg = function() {
  return ['keyboard_help_intro'];
};


/**
 * Helper to create callbacks for power key.
 *
 * @param {string} functionName A function to create a callback for.
 * @return {function()} The callback.
 * @private
 */
cvox.KeyboardHelpWidget.prototype.createCallback_ = function(functionName) {
  return goog.bind(function() {
      this.hide(true);
      cvox.ChromeVoxUserCommands.commands[functionName]();
    }, this);
};
