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
 * @fileoverview Defines a Braille interface.
 *
 * All Braille engines in ChromeVox conform to this interface.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.BrailleInterface');

goog.require('cvox.BrailleKeyCommand');
goog.require('cvox.BrailleKeyEvent');
goog.require('cvox.NavBraille');

/**
 * @interface
 */
cvox.BrailleInterface = function() { };

/**
 * Sends the given params to the Braille display for output.
 * @param {!cvox.NavBraille} params Parameters to send to the
 * platform braille service.
 */
cvox.BrailleInterface.prototype.write =
    function(params) { };

/**
 * Sets a callback for when the user pans beyond either edge of the current
 * buffer.
 *
 * @param {function(!cvox.BrailleKeyEvent)} func The function to be called when
 *     the user invokes a keyboard command on the braille display.
 */
cvox.BrailleInterface.prototype.setCommandListener =
    function(func) { };
