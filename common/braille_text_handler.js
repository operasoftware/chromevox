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

goog.provide('cvox.BrailleTextHandler');


/**
 * @fileoverview Updates braille display contents following text changes.
 *
 * @author dtseng@google.com (David Tseng)
 */

/**
 * Represents an editable text region.
 *
 * @constructor
 * @param {!cvox.BrailleInterface} braille Braille interface.
 */
cvox.BrailleTextHandler = function(braille) {
  /**
   * Braille interface used to produce output.
   * @type {!cvox.BrailleInterface}
   * @private
   */
  this.braille_ = braille;
};


/**
 * Called by controller class when text changes.
 * @param {string} line The text of the line.
 * @param {number} start The 0-based index starting selection.
 * @param {number} end The 0-based index ending selection.
 * @param {boolean} multiline True if the text comes from a multi line text
 * field.
 */
cvox.BrailleTextHandler.prototype.changed = function(
    line, start, end, multiline) {
  var content;
  if (multiline) {
    content = cvox.NavBraille.fromText(line);
    content.startIndex = start;
    content.endIndex = end;
  } else {
    if (cvox.ChromeVox.navigationManager) {
      content = cvox.ChromeVox.navigationManager.getBraille();
    }
  }
  if (content) {
    this.braille_.write(content);
  }
};
