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
 * @fileoverview A simple leaf walker for walking mathml expressions.
 * Walks only proper leafs of the MathML DOM. Ignores all tags,
 * thus also decends into nested Token Tags.
 * @author sorge@google.com (Volker Sorge)
 */


goog.provide('cvox.MathmlLeafWalker');

goog.require('cvox.MathWalker');


/**
 * @constructor
 * @extends {cvox.MathWalker}
 * @param {!cvox.MathShifter} shifter The Math Shifter handling this walker.
 */
cvox.MathmlLeafWalker = function(shifter) {
  goog.base(this, shifter);

  this.granularity = cvox.MathWalker.granularity.MATHML_LEAF;
};
goog.inherits(cvox.MathmlLeafWalker, cvox.MathWalker);


/**
 * @override
 */
cvox.MathmlLeafWalker.prototype.next = function(sel) {
  var reverse = sel.isReversed();
  var node = this.traverse.nextLeaf(
      reverse, function(node) {return node.nodeType == Node.TEXT_NODE;});
  var newSel = cvox.CursorSelection.fromNode(node);
  newSel.setReversed(reverse);
  return newSel;
};
