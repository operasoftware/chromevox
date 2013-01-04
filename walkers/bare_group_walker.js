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
 * @fileoverview A JavaScript class for walking the group leaf nodes of the dom.
 * This is a bare class that tries to limit dependencies. It should only be used
 * when traversal of the group leaf nodes is required (e.g. by other walkers),
 * but no other walker functionality (such as being able to describe the
 * position. It should not be used for user-visible navigation.
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.BareGroupWalker');

goog.require('cvox.AbstractNodeWalker');

/**
 * @constructor
 * @extends {cvox.AbstractNodeWalker}
 */
cvox.BareGroupWalker = function() {
  goog.base(this);
};
goog.inherits(cvox.BareGroupWalker, cvox.AbstractNodeWalker);

/**
 * @override
 */
cvox.BareGroupWalker.prototype.stopNodeDescent = function(node) {
  return cvox.GroupUtil.isLeafNode(node);
};
