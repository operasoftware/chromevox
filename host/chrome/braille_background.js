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
 * @fileoverview Sends Braille commands to the Braille API.
 * @author clchen@google.com (Charles L. Chen)
 * @author plundblad@google.com (Peter Lundblad)
 */

goog.provide('cvox.BrailleBackground');

goog.require('cvox.AbstractBraille');
goog.require('cvox.BrailleDisplayManager');
goog.require('cvox.ChromeVox');
goog.require('cvox.braille.LibLouisNativeClient');


/**
 * @constructor
 * @extends {cvox.AbstractBraille}
 */
cvox.BrailleBackground = function() {
  goog.base(this);
  /**
   * @type {cvox.BrailleDisplayManager}
   * @private
   */
  this.displayManager_ = new cvox.BrailleDisplayManager();
  this.initialize_(0);
  this.setCommandListener(this.defaultCommandListener_);
};
goog.inherits(cvox.BrailleBackground, cvox.AbstractBraille);


/** @override */
cvox.BrailleBackground.prototype.write = function(params) {
  this.displayManager_.setContent(params);
};

/** @override */
cvox.BrailleBackground.prototype.setCommandListener = function(func) {
  this.displayManager_.setCommandListener(func);
};

/**
 * Refreshes the braille translator used for output.  This should be
 * called when something changed (such as a preference) to make sure that
 * the correct translator is used.
 */
cvox.BrailleBackground.prototype.refreshTranslator = function() {
  if (!this.liblouis_) {
    return;
  }
  // TODO(plundblad): Make customizable.
  this.liblouis_.getTranslator('en-us-comp8.ctb',
      goog.bind(function(translator) {
        this.displayManager_.setTranslator(translator);
      }, this));
};

/**
 * Initialization to be done after part of the background page's DOM has been
 * constructed. Currently only used on ChromeOS.
 * @param {number} retries Number of retries.
 * @private
 */
cvox.BrailleBackground.prototype.initialize_ = function(retries) {
  if (!cvox.ChromeVox.isChromeOS) {
    return;
  } else if (retries > 5) {
    console.error(
        'Timeout waiting for document.body; not initializing braille.');
    return;
  }
  if (!document.body) {
    window.setTimeout(goog.bind(this.initialize_, this, ++retries), 500);
  } else {
    /**
     * @type {cvox.braille.LibLouisNativeClient}
     * @private
     */
    this.liblouis_ = new cvox.braille.LibLouisNativeClient(
        chrome.extension.getURL(
            'chromevox/background/braille/liblouis_nacl.nmf'),
        chrome.extension.getURL(
            'chromevox/background/braille/tables'));
    this.liblouis_.attachToElement(document.body);
    this.refreshTranslator();
  }
};


/**
 * Dispatches braille input commands to the content script.
 * @param {!cvox.BrailleKeyEvent} brailleEvt The event.
 * @private
 */
cvox.BrailleBackground.prototype.defaultCommandListener_ =
    function(brailleEvt) {
  var msg = {
    'message': 'BRAILLE',
    'args': brailleEvt
  };
  cvox.ExtensionBridge.send(msg);
};
