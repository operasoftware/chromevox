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
 * @fileoverview A class for walking mathml expressions.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathWalker');

goog.require('cvox.AbstractWalker');
goog.require('cvox.AriaUtil');
goog.require('cvox.BrailleUtil');
goog.require('cvox.CursorSelection');
goog.require('cvox.DescriptionUtil');
goog.require('cvox.DomUtil');
goog.require('cvox.MathSpeak');
goog.require('cvox.NavDescription');
goog.require('cvox.TraverseMath');


/**
 * @constructor
 * @extends {cvox.AbstractWalker}
 * @param {!cvox.MathShifter} shifter The Math Shifter handling this walker.
 */
cvox.MathWalker = function(shifter) {
  goog.base(this);
  // TODO (sorge)
  // Here we can put in some effort to determine the actual domain
  // of the math expression in which the walker lives via a function
  // in MathUtils!
  /**
   * The Traversal object of the walker to which the explore mode
   * delegates.
   * @type {!cvox.TraverseMath}
   */
  this.traverse = new cvox.TraverseMath();

  /**
   * The Math Shifter that handling this walker.
   * @type {!cvox.MathShifter}
   */
  this.shifter = shifter;

};
goog.inherits(cvox.MathWalker, cvox.AbstractWalker);


/**
 * @override
 */
cvox.MathWalker.prototype.sync = function(sel) {
  var mathNode = cvox.DomUtil.getContainingMath(sel.end.node);
  this.traverse.initialize(mathNode, sel.isReversed());
  var newSel = cvox.CursorSelection.fromNode(this.traverse.activeNode);
  newSel.setReversed(sel.isReversed());
  return newSel;
};


/**
 * @override
 * @suppress {checkTypes} inconsistent return type
 * found   : Array.<(cvox.NavMathDescription|null)>
 * required: Array.<cvox.NavDescription>
 */
cvox.MathWalker.prototype.getDescription = function(prevSel, sel) {
  return this.shifter.speak.speakString(this.traverse.activeContent());
};


/**
 * @override
 */
cvox.MathWalker.prototype.next = function(sel) {
    var r = sel.isReversed();
    var newSel = cvox.CursorSelection.fromNode(this.traverse.next(r));
    newSel.setReversed(r);
    return newSel;
};


/**
 * @override
 */
cvox.MathWalker.prototype.getBraille = function(prevSel, sel) {
  throw 'getBraille is unsupported';
};
