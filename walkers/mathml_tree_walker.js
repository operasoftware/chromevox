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
 * @fileoverview A simple tree walker for walking mathml expressions.
 * Walks all possible subtree in the MathML DOM.
 * @author sorge@google.com (Volker Sorge)
 */


goog.provide('cvox.MathmlTreeWalker');

goog.require('cvox.MathWalker');


/**
 * @constructor
 * @extends {cvox.MathWalker}
 * @param {!cvox.MathShifter} shifter The Math Shifter handling this walker.
 */
cvox.MathmlTreeWalker = function(shifter) {
  goog.base(this, shifter);

  this.traverse.setMode('tree');
};
goog.inherits(cvox.MathmlTreeWalker, cvox.MathWalker);


/**
 * @override
 */
cvox.MathmlTreeWalker.prototype.getDescription = function(prevSel, sel) {
  return this.shifter.speak.speakTree(this.traverse.activeNode);
};


/**
 * @override
 */
cvox.MathmlTreeWalker.prototype.getGranularityMsg = function() {
  return cvox.ChromeVox.msgs.getMsg('mathml_tree_granularity');
};
