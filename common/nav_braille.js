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
 * @fileoverview A simple container object for the brailling of a
 * navigation from one object to another.
 *
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.NavBraille');

goog.require('cvox.ChromeVox');
goog.require('cvox.CursorSelection');
goog.require('cvox.PlatformFilter');
goog.require('cvox.PlatformUtil');
goog.require('cvox.Spannable');

/**
 * A class capturing the braille for navigation from one object to
 * another.
 * @param {{text: (undefined|string|!cvox.Spannable),
 *          startIndex: (undefined|number),
 *          endIndex: (undefined|number)}} kwargs The arguments for braille.
 *  text The text of the object itself, including text from
 *     titles, labels, etc.
 *  startIndex The beginning of a selection within text.
 *  endIndex The end of a selection within text.
 * @constructor
 */
cvox.NavBraille = function(kwargs) {
  /**
   * Text, annotated with DOM nodes.
   * @type {!cvox.Spannable}
   */
  this.text = (kwargs.text instanceof cvox.Spannable) ?
      kwargs.text : new cvox.Spannable(kwargs.text);

  /**
   * Selection start index.
   * @type {number}
   */
  this.startIndex = kwargs.startIndex ? kwargs.startIndex : 0;

  /**
   * Selection end index.
   * @type {number}
   */
  this.endIndex = kwargs.endIndex ? kwargs.endIndex : 0;
};

/**
 * Convenience for creating simple braille output.
 * @param {string|!cvox.Spannable} text Text to represent in braille.
 * @return {!cvox.NavBraille} Braille output without a cursor.
 */
cvox.NavBraille.fromText = function(text) {
  return new cvox.NavBraille({'text': text});
};


/**
 * @return {boolean} true if this braille description is empty.
 */
cvox.NavBraille.prototype.isEmpty = function() {
  return this.text.getLength() == 0;
};


/**
 * @return {string} A string representation of this object.
 */
cvox.NavBraille.prototype.toString = function() {
  return 'NavBraille(text="' + this.text.toString() + '" ' +
         ' startIndex="' + this.startIndex + '" ' +
         ' endIndex="' + this.endIndex + '")';
};


/**
 * Returns a plain old data object with the same data.
 * Suitable for JSON encoding.
 *
 * @return {{text: (undefined|string),
 *           startIndex: (undefined|number),
 *           endIndex: (undefined|number)}} JSON equivalent.
 */
cvox.NavBraille.prototype.toJson = function() {
  return {
    text: this.text.toString(),
    startIndex: this.startIndex,
    endIndex: this.endIndex
  };
};


/**
 * Sends braille to the background page.
 */
cvox.NavBraille.prototype.write = function() {
  if (cvox.PlatformUtil.matchesPlatform(cvox.PlatformFilter.CHROMEOS |
      cvox.PlatformFilter.ANDROID)) {
    cvox.ChromeVox.braille.write(this);
  }
};
