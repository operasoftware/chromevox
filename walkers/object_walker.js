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
 * @author stoarca@google.com (Sergiu Toarca)
 */


goog.provide('cvox.ObjectWalker');

goog.require('cvox.AbstractNodeWalker');
goog.require('cvox.BrailleUtil');
goog.require('cvox.DescriptionUtil');

/**
 * @constructor
 * @extends {cvox.AbstractNodeWalker}
 */
cvox.ObjectWalker = function() {
  goog.base(this);
};
goog.inherits(cvox.ObjectWalker, cvox.AbstractNodeWalker);

/**
 * @override
 */
cvox.ObjectWalker.prototype.stopNodeDescent = function(node) {
  return cvox.DomUtil.isLeafNode(node);
};

// TODO(dtseng): Causes a circular dependency if put into AbstractNodeWalker.
/**
 * @override
 */
cvox.AbstractNodeWalker.prototype.getDescription = function(prevSel, sel) {
  return cvox.DescriptionUtil.getDescriptionFromNavigation(
      prevSel.end.node,
      sel.start.node,
      true,
      cvox.ChromeVox.verbosity);
};

/**
 * @override
 */
cvox.ObjectWalker.prototype.getBraille = function(prevSel, sel) {
  throw 'getBraille is unsupported';
};

/**
 * @override
 */
cvox.ObjectWalker.prototype.getGranularityMsg = function() {
  return cvox.ChromeVox.msgs.getMsg('object_strategy');
};
