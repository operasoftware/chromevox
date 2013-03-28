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
 * @fileoverview The spoken list builder. Used in test cases.
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.SpokenListBuilder');



/**
 * Builds a spoken list.
 * @constructor
 */
cvox.SpokenListBuilder = function() {
  this.list_ = [];
};


/**
 * Adds an expected flushed utterance to the builder.
 * @param {string} expectedText The expected text.
 * @return {cvox.SpokenListBuilder} this.
 */
cvox.SpokenListBuilder.prototype.flush = function(expectedText) {
  this.list_.push([expectedText, cvox.AbstractTts.QUEUE_MODE_FLUSH]);
  return this;  // for chaining
};


/**
 * Adds an expected queued utterance to the builder.
 * @param {string} expectedText The expected text.
 * @return {cvox.SpokenListBuilder} this.
 */
cvox.SpokenListBuilder.prototype.queue = function(expectedText) {
  this.list_.push([expectedText, cvox.AbstractTts.QUEUE_MODE_QUEUE]);
  return this;  // for chaining
};


/**
 * Builds the list.
 * @return {Array} The array of utterances.
 */
cvox.SpokenListBuilder.prototype.build = function() {
  return this.list_;
};
