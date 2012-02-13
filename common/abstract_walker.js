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
 * @fileoverview A JavaScript interface for walking a DOM. The
 * traversal of the DOM entirely depends on concrete subclasses.
 *
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.AbstractWalker');

/**
 * @constructor
 */
cvox.AbstractWalker = function() {
};

/**
 * Moves to the next item.
 * @return {?Node} The current node.
 */
cvox.AbstractWalker.prototype.next = function() {
};

/**
 * Moves to the previous item.
 * @return {?Node} The newly moved to node; null.
 */
cvox.AbstractWalker.prototype.previous = function() {
};
