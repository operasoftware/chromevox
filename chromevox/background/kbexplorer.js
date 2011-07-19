// Copyright 2011 Google Inc.
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
 * @fileoverview Script for ChromeOS keyboard explorer.
 *
 * @author chaitanyag@google.com (Chaitanya Gharpure)
 */

cvoxgoog.require('cvox.KeyUtil');

var kbExplorer = {};

/**
 * Initialize keyboard explorer.
 */
kbExplorer.init = function() {
  document.write('<h2>ChromeOS Keyboard Explorer - Press any key to learn ' +
      'its name. Ctrl + W will close the keyboard explorer.</h2>');
  document.addEventListener('keydown', kbExplorer.onKeyDown, false);
  document.addEventListener('keyup', kbExplorer.onKeyUp, false);
  document.addEventListener('keypress', kbExplorer.onKeyPress, false);
};


/**
 * Handles keydown events by speaking the human understandable name of the key.
 * @param {Event} evt key event.
 */
kbExplorer.onKeyDown = function(evt) {
  chrome.extension.getBackgroundPage().background.ttsManager.speak(
      cvox.KeyUtil.getReadableNameForKeyCode(evt.keyCode), false, null);
  evt.preventDefault();
  evt.stopPropagation();
};


/**
 * Handles keyup events.
 * @param {Event} evt key event.
 */
kbExplorer.onKeyUp = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();
};


/**
 * Handles keypress events.
 * @param {Event} evt key event.
 */
kbExplorer.onKeyPress = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();
};

kbExplorer.init();

