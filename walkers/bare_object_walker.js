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
 * @fileoverview A JavaScript class for walking the leaf nodes of the dom.
 * This is a bare class that tries to limit dependencies. It should only be used
 * when traversal of the leaf nodes is required (e.g. by other walkers), but
 * no other walker functionality (such as being able to describe the position).
 * It should not be used for user-visible navigation.
 * @author stoarca@google.com (Sergiu Toarca)
 */


goog.provide('cvox.BareObjectWalker');

goog.require('cvox.AbstractNodeWalker');

/**
 * @constructor
 * @extends {cvox.AbstractNodeWalker}
 */
cvox.BareObjectWalker = function() {
  goog.base(this);
};
goog.inherits(cvox.BareObjectWalker, cvox.AbstractNodeWalker);

/**
 * @override
 */
cvox.BareObjectWalker.prototype.stopNodeDescent = function(node) {
  return cvox.DomUtil.isLeafNode(node);
};
