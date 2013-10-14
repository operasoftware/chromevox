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
 * @fileoverview Bridge that sends Braille messages from content scripts or
 * other pages to the main background page.
 *
 * @author clchen@google.com (Charles L. Chen)
 * @author plundblad@google.com (Peter Lundblad)
 */

goog.provide('cvox.ChromeBraille');

goog.require('cvox.AbstractBraille');
goog.require('cvox.BrailleKeyEvent');
goog.require('cvox.HostFactory');

/**
 * @constructor
 * @extends {cvox.AbstractBraille}
 */
cvox.ChromeBraille = function() {
  goog.base(this);
  /**
   * @type {function(!cvox.BrailleKeyEvent)}
   * @private
   */
  this.commandListener_ = this.defaultCommandListener_;
  cvox.ExtensionBridge.addMessageListener(goog.bind(function(msg, port) {
    // Since ChromeVox gets injected into multiple iframes on a page, check to
    // ensure that this is the "active" iframe via its focused state.
    // Furthermore, if the active element is itself an iframe, the focus is
    // within the iframe even though the containing document also has focus.
    // Don't process the event if this document isn't focused or focus lies in a
    // descendant.
    if (!document.hasFocus() || document.activeElement.tagName == 'IFRAME') {
      return;
    }
    if (msg['message'] == 'BRAILLE' && msg['args']) {
      this.commandListener_(msg['args']);
    }
  }, this));
};
goog.inherits(cvox.ChromeBraille, cvox.AbstractBraille);

/** @override */
cvox.ChromeBraille.prototype.write = function(params) {
  var outParams = params.toJson();

  var message = {'target': 'BRAILLE',
                 'action': 'write',
                 'params': outParams};

  cvox.ExtensionBridge.send(message);
};

/** @override */
cvox.ChromeBraille.prototype.setCommandListener = function(func) {
  this.commandListener_ = func;
};


/**
 * Dispatches braille input commands.
 * @param {cvox.BrailleKeyEvent} brailleEvt The braille key event.
 * @private
 */
cvox.ChromeBraille.prototype.defaultCommandListener_ = function(brailleEvt) {
  var command = cvox.ChromeVoxUserCommands.commands[brailleEvt.command];
  if (command) {
    command(brailleEvt);
  } else {
    console.error('Unknown braille command: ' + JSON.stringify(brailleEvt));
  }
};


/** Export platform constructor. */
cvox.HostFactory.brailleConstructor = cvox.ChromeBraille;
