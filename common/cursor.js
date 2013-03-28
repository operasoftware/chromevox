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
 * @fileoverview Simple class to represent a cursor location in the document.
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.Cursor');

/**
 * A class to represent a cursor location in the document,
 * like the start position or end position of a selection range.
 *
 * Later this may be extended to support "virtual text" for an object,
 * like the ALT text for an image.
 *
 * Note: we cache the text of a particular node at the time we
 * traverse into it. Later we should add support for dynamically
 * reloading it.
 * NOTE: Undefined behavior if node is null
 * @param {Node} node The DOM node.
 * @param {number} index The index of the character within the node.
 * @param {string} text The cached text contents of the node.
 * @constructor
 */
cvox.Cursor = function(node, index, text) {
  this.node = node;
  this.index = index;
  this.text = text;
};

/**
 * @return {!cvox.Cursor} A new cursor pointing to the same location.
 */
cvox.Cursor.prototype.clone = function() {
  return new cvox.Cursor(this.node, this.index, this.text);
};

/**
 * Modify this cursor to point to the location that another cursor points to.
 * @param {!cvox.Cursor} otherCursor The cursor to copy from.
 */
cvox.Cursor.prototype.copyFrom = function(otherCursor) {
  this.node = otherCursor.node;
  this.index = otherCursor.index;
  this.text = otherCursor.text;
};

/**
 * Check for equality.
 * @param {!cvox.Cursor} rhs The cursor to compare against.
 * @return {boolean} True if equal.
 */
cvox.Cursor.prototype.equals = function(rhs) {
  return this.node == rhs.node &&
      this.index == rhs.index &&
      this.text == rhs.text;
};
