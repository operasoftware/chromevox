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
 * @fileoverview Class which allows construction of annotated strings.
 * @author jbroman@google.com (Jeremy Roman)
 */

goog.provide('cvox.Spannable');

/**
 * @constructor
 * @param {string=} opt_string Initial value of the spannable.
 * @param {*=} opt_annotation Initial annotation for the entire string.
 */
cvox.Spannable = function(opt_string, opt_annotation) {
  /**
   * Underlying string.
   * @type {string}
   * @private
   */
  this.string_ = opt_string || '';

  /**
   * Spans (annotations).
   * @type {!Array.<!{ value: *, start: number, end: number }>}
   * @private
   */
  this.spans_ = [];

  // Optionally annotate the entire string.
  if (goog.isDef(opt_annotation)) {
    var len = this.string_.length;
    this.spans_.push({ value: opt_annotation, start: 0, end: len });
  }
};

/** @override */
cvox.Spannable.prototype.toString = function() {
  return this.string_;
};

/**
 * Returns the length of the string.
 * @return {number} Length of the string.
 */
cvox.Spannable.prototype.getLength = function() {
  return this.string_.length;
};

/**
 * Adds a span to some region of the string.
 * @param {*} value Annotation.
 * @param {number} start Starting index (inclusive).
 * @param {number} end Ending index (exclusive).
 */
cvox.Spannable.prototype.setSpan = function(value, start, end) {
  this.removeSpan(value);
  if (0 <= start && start <= end && end <= this.string_.length) {
    // Zero-length spans are explicitly allowed, because it is possible to
    // query for position by annotation as well as the reverse.
    this.spans_.push({ value: value, start: start, end: end });
  } else {
    throw new RangeError('span out of range');
  }
};

/**
 * Removes a span.
 * @param {*} value Annotation.
 */
cvox.Spannable.prototype.removeSpan = function(value) {
  for (var i = this.spans_.length - 1; i >= 0; i--) {
    if (this.spans_[i].value === value) {
      this.spans_.splice(i, 1);
    }
  }
};

/**
 * Appends another Spannable or string to this one.
 * @param {string|!cvox.Spannable} other String or spannable to concatenate.
 */
cvox.Spannable.prototype.append = function(other) {
  if (other instanceof cvox.Spannable) {
    var otherSpannable = /** @type {!cvox.Spannable} */ (other);
    var originalLength = this.getLength();
    this.string_ += otherSpannable.string_;
    other.spans_.forEach(goog.bind(function(span) {
      this.setSpan(
          span.value,
          span.start + originalLength,
          span.end + originalLength);
    }, this));
  } else if (typeof other === 'string') {
    this.string_ += /** @type {string} */ (other);
  }
};

/**
 * Returns the first value matching a position.
 * @param {number} position Position to query.
 * @return {*} Value annotating that position, or undefined if none is found.
 */
cvox.Spannable.prototype.getSpan = function(position) {
  for (var i = 0; i < this.spans_.length; i++) {
    var span = this.spans_[i];
    if (span.start <= position && position < span.end) {
      return span.value;
    }
  }
};

/**
 * Returns the first span value which is an instance of a given constructor.
 * @param {!Function} constructor Constructor.
 * @return {!Object|undefined} Object if found; undefined otherwise.
 */
cvox.Spannable.prototype.getSpanInstanceOf = function(constructor) {
  for (var i = 0; i < this.spans_.length; i++) {
    var span = this.spans_[i];
    if (span.value instanceof constructor) {
      return span.value;
    }
  }
};

/**
 * Returns all spans matching a position.
 * @param {number} position Position to query.
 * @return {!Array} Values annotating that position.
 */
cvox.Spannable.prototype.getSpans = function(position) {
  var results = [];
  for (var i = 0; i < this.spans_.length; i++) {
    var span = this.spans_[i];
    if (span.start <= position && position < span.end) {
      results.push(span.value);
    }
  }
  return results;
};

/**
 * Returns the start of the requested span.
 * @param {*} value Annotation.
 * @return {?number} Start of the span, or null if not attached.
 */
cvox.Spannable.prototype.getSpanStart = function(value) {
  for (var i = 0; i < this.spans_.length; i++) {
    var span = this.spans_[i];
    if (span.value === value) {
      return span.start;
    }
  }
  return null;
};

/**
 * Returns the end of the requested span.
 * @param {*} value Annotation.
 * @return {?number} End of the span, or null if not attached.
 */
cvox.Spannable.prototype.getSpanEnd = function(value) {
  for (var i = 0; i < this.spans_.length; i++) {
    var span = this.spans_[i];
    if (span.value === value) {
      return span.end;
    }
  }
  return null;
};

/**
 * Returns a substring of this spannable.
 * Note that while similar to String#substring, this function is much less
 * permissive about its arguments. It does not accept arguments in the wrong
 * order or out of bounds.
 *
 * @param {number} start Start index, inclusive.
 * @param {number=} opt_end End index, exclusive.
 *     If excluded, the length of the string is used instead.
 * @return {!cvox.Spannable} Substring requested.
 */
cvox.Spannable.prototype.substring = function(start, opt_end) {
  var end = goog.isDef(opt_end) ? opt_end : this.string_.length;

  if (start < 0 || end > this.string_.length || start > end) {
    throw new RangeError('substring indices out of range');
  }

  var result = new cvox.Spannable(this.string_.substring(start, end));
  for (var i = 0; i < this.spans_.length; i++) {
    var span = this.spans_[i];
    if (span.start <= end && span.end >= start) {
      var newStart = Math.max(0, span.start - start);
      var newEnd = Math.min(end - start, span.end - start);
      result.spans_.push({ value: span.value, start: newStart, end: newEnd });
    }
  }
  return result;
};

/**
 * Trims whitespace from the beginning and end.
 * @return {!cvox.Spannable} String with whitespace removed.
 */
cvox.Spannable.prototype.trim = function() {
  // Special-case whitespace-only strings, including the empty string.
  // As an arbitrary decision, we treat this as trimming the whitespace off the
  // end, rather than the beginning, of the string.
  // This choice affects which spans are kept.
  if (/^\s*$/.test(this.string_)) {
    return this.substring(0, 0);
  }

  // Otherwise, we have at least one non-whitespace character to use as an
  // anchor when trimming.
  var trimmedStart = this.string_.match(/^\s*/)[0].length;
  var trimmedEnd = this.string_.match(/\s*$/).index;
  return this.substring(trimmedStart, trimmedEnd);
};
