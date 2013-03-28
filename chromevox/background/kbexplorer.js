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
 * @fileoverview Script for ChromeOS keyboard explorer.
 *
 * @author chaitanyag@google.com (Chaitanya Gharpure)
 */

goog.provide('cvox.KbExplorer');

goog.require('cvox.KeyUtil');


/**
 * Class to manage the keyboard explorer.
 * @constructor
 */
cvox.KbExplorer = function() { };


/**
 * Initialize keyboard explorer.
 */
cvox.KbExplorer.init = function() {
  document.addEventListener('keydown', cvox.KbExplorer.onKeyDown, false);
  document.addEventListener('keyup', cvox.KbExplorer.onKeyUp, false);
  document.addEventListener('keypress', cvox.KbExplorer.onKeyPress, false);
};


/**
 * Handles keydown events by speaking the human understandable name of the key.
 * @param {Event} evt key event.
 */
cvox.KbExplorer.onKeyDown = function(evt) {
  chrome.extension.getBackgroundPage()['speak'](
      cvox.KeyUtil.getReadableNameForKeyCode(evt.keyCode), false, {});
  evt.preventDefault();
  evt.stopPropagation();
};


/**
 * Handles keyup events.
 * @param {Event} evt key event.
 */
cvox.KbExplorer.onKeyUp = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();
};


/**
 * Handles keypress events.
 * @param {Event} evt key event.
 */
cvox.KbExplorer.onKeyPress = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();
};
