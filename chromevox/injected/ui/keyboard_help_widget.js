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

goog.require('cvox.ChromeVox');
goog.require('cvox.CommandStore');
goog.require('cvox.KeyUtil');
goog.require('cvox.OverlayWidget');

/**
 * @constructor
 * @extends {cvox.OverlayWidget}
 */
cvox.KeyboardHelpWidget = function() {
  goog.base(this, '');
  this.container_ = document.createElement('div');
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

    var commandElement = document.createElement('p');
    commandElement.id = command;
    commandElement.setAttribute('role', 'menuitem');
    commandElement.textContent =
        message + ' - ' + cvox.KeyUtil.keySequenceToString(keySeq, true);
    this.container_.appendChild(commandElement);
  }, this));
};
goog.inherits(cvox.KeyboardHelpWidget, cvox.OverlayWidget);
goog.addSingletonGetter(cvox.KeyboardHelpWidget);


/**
 * @override
 */
cvox.KeyboardHelpWidget.prototype.show = function() {
  goog.base(this, 'show');
  this.host_.appendChild(this.container_);
};


/**
 * @override
 */
cvox.KeyboardHelpWidget.prototype.getNameMsg = function() {
  return ['keyboard_help_intro'];
};

/**
 * @override
 */
cvox.KeyboardHelpWidget.prototype.onKeyDown = function(evt) {
  if (evt.keyCode == 13) { // Enter
    var currentCommand =
        cvox.ChromeVox.navigationManager.getCurrentNode().parentNode.id;
    this.hide();
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(
        cvox.ChromeVoxUserCommands.commands[currentCommand])();
    evt.preventDefault();
    evt.stopPropagation();
    return true;
  } else {
    return goog.base(this, 'onKeyDown', evt);
  }
};
