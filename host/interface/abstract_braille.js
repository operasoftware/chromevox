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
 * @fileoverview Base class for Braille engines that output to the Braille
 * display.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.AbstractBraille');

goog.require('cvox.BrailleInterface');

/**
 * Creates a new instance.
 * @constructor
 * @implements {cvox.BrailleInterface}
 */
cvox.AbstractBraille = function() {
};

/** @override */
cvox.AbstractBraille.prototype.write = function(textString) {
  window.console.log("Braille: " + textString);
};

/** @override */
cvox.AbstractBraille.prototype.setPanOutListener = function(func) {
  window.console.log("Braille pan out listener set:");
  window.console.log(func);
};

/**
 * User has panned out on the left edge of the buffer.
 * @type {number}
 */
cvox.AbstractBraille.PAN_OUT_LEFT = 0;


/**
 * User has panned out on the right edge of the buffer.
 * @type {number}
 */
cvox.AbstractBraille.PAN_OUT_RIGHT = 1;

