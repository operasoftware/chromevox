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
 * @fileoverview Defines a Braille interface.
 *
 * All Braille engines in ChromeVox conform to this interface.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.BrailleInterface');

/**
 * @interface
 */
cvox.BrailleInterface = function() { };

/**
 * Writes the given string to the Braille display.
 * @param {string} textString The text to be output to the Braille display.
 */
cvox.BrailleInterface.prototype.write =
    function(textString) { };

/**
 * Sets a callback for when the user pans beyond either edge of the current
 * buffer.
 *
 * @param {Function} func The function to be called when the user tries to go
 *     past either edge of the current buffer. The callback function will take
 *     cvox.AbstractBraille.PAN_OUT_LEFT or cvox.AbstractBraille.PAN_OUT_RIGHT.
 */
cvox.BrailleInterface.prototype.setPanOutListener =
    function(func) { };

