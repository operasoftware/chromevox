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
 * @fileoverview Widget presenting all keyboard commands.
 * @author dtseng@google.com (David Tseng)
 */

goog.provide('cvox.KeyboardHelpWidget');

goog.require('cvox.ChoiceWidget');
goog.require('cvox.ChromeVox');
goog.require('cvox.CommandStore');

/**
 * @constructor
 * @param {Object.<string, string>} map Object with keyboard shortcut ->
 * function mappings.
 * @extends {cvox.ChoiceWidget}
 */
cvox.KeyboardHelpWidget = function(map) {
  cvox.CommandStore.init();
  var list = [];
  var callbacks = [];

  for (var key in map) {
    var command = map[key];
    var message = command;
    try {
      var id = cvox.CommandStore.messageForCommand(command);
      if (!id) {
        continue;
      }
      message = cvox.ChromeVox.msgs.getMsg(id);
    } catch (e) {
      // TODO(dtseng): We have some commands that don't have valid message id's.
    }

    list.push(message + ' - ' + this.getReadableShortcut(key));
    callbacks.push(this.createCallback_(command));
  }

  return goog.base(this, list, callbacks);
};
goog.inherits(cvox.KeyboardHelpWidget, cvox.ChoiceWidget);


/**
 * @override
 */
cvox.KeyboardHelpWidget.prototype.getNameMsg = function() {
  return 'keyboard_help_intro';
};


/**
 * Gets the singleton instance.
 * @param {Object.<string, string>} opt_map An optional map to initialize the
 * singleton.
 * @return {!cvox.KeyboardHelpWidget} The widget.
 */
cvox.KeyboardHelpWidget.getInstance = function(opt_map) {
  if (opt_map) {
    cvox.KeyboardHelpWidget.instance_ =
        new cvox.KeyboardHelpWidget(opt_map);
  }
  return cvox.KeyboardHelpWidget.instance_;
};


/**
 * Returns a readable form of the specified keyboard shortcut.
 *
 * @param {string} key String form of a keyboard shortcut.
 * @return {string} Readable string representation.
 */
cvox.KeyboardHelpWidget.prototype.getReadableShortcut = function(key) {
  var tokens = key.split('+');
  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].charAt(0) == '#' && tokens[i].indexOf('>') == -1) {
      var keyCode = parseInt(tokens[i].substr(1), 10);
      tokens[i] = cvox.KeyUtil.getReadableNameForKeyCode(keyCode);
    } else {
      var seqs = tokens[i].split('>');
      for (var j = 0; j < seqs.length; j++) {
        if (seqs[j].charAt(0) == '#') {
          var keyCode = parseInt(seqs[j].substr(1), 10);
          seqs[j] = cvox.KeyUtil.getReadableNameForKeyCode(keyCode);
        }
        seqs[j] = cvox.KeyUtil.getReadableNameForStr(seqs[j]) || seqs[j];
      }
      tokens[i] = seqs.join(', ');
    }
    tokens[i] = cvox.KeyUtil.getReadableNameForStr(tokens[i]) || tokens[i];
  }
  // trim '+'s, ' 's and return
  return tokens.join(' + ').replace(/^[\+\s]*/, '').replace(/[\+\s]*$/, '');
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
