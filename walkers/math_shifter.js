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
 * @fileoverview A class for walking mathml expressions.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathShifter');

goog.require('cvox.AbstractShifter');
goog.require('cvox.BrailleUtil');
goog.require('cvox.CursorSelection');
goog.require('cvox.DomUtil');
goog.require('cvox.MathSpeak');
goog.require('cvox.NavDescription');
goog.require('cvox.TraverseMath');


/**
 * @constructor
 * @extends {cvox.AbstractShifter}
 * @param {cvox.CursorSelection=} sel A cursor selection.
 */
cvox.MathShifter = function(sel) {
  goog.base(this);
  // TODO (sorge)
  // Here we can put in some effort to determine the actual domain
  // of the math expression in which the shifter lives via a function
  // in MathUtils!
  /**
   * The Math Speak object of the shifter.
   * @type {!cvox.MathSpeak}
   */
  this.speak = new cvox.MathSpeak(
      {domain: cvox.TraverseMath.getInstance().domain,
       rule: cvox.TraverseMath.getInstance().style});

  /**
   * Indicates the depth of the currently read expression.
   * @type {number}
   * @private
   */
  this.level_ = 0;

  /**
   * Indicates the vertical direction of movement (true for up, false for down).
   * @type {boolean}
   * @private
   */
  this.direction_ = false;

  /**
   * Indicates whether or not we've bumped against an edge in the math
   * structure.
   * @private
   */
  this.bumped_ = false;

cvox.TraverseMath.getInstance().initialize(sel.start.node);
};
goog.inherits(cvox.MathShifter, cvox.AbstractShifter);


/**
 * @override
 */
cvox.MathShifter.prototype.next = function(sel) {
  // Delegate to TraverseMath which manages selection inside of the math tree.
  var r = sel.isReversed();
  this.bumped_ = !cvox.TraverseMath.getInstance().nextSibling(r);
  var attachedNode = cvox.TraverseMath.getInstance().getAttachedActiveNode();
  return attachedNode ? cvox.CursorSelection.fromNode(attachedNode) : sel;
};


/**
 * @override
 */
cvox.MathShifter.prototype.sync = function(sel) {
  var attachedNode = cvox.TraverseMath.getInstance().getAttachedActiveNode();
  return attachedNode ? cvox.CursorSelection.fromNode(attachedNode) : sel;
};


/**
 * @override
 */
cvox.MathShifter.prototype.getName = function() {
  return cvox.ChromeVox.msgs.getMsg('math_shifter');
};


/**
 * @override
 */
cvox.MathShifter.prototype.getDescription = function(prevSel, sel) {
  var descs = this.speak.speakTree(cvox.TraverseMath.getInstance().activeNode);
  if (this.bumped_ && descs.length > 0) {
    descs[0].pushEarcon(cvox.AbstractEarcons.WRAP_EDGE);
  }
  return descs;
};


/**
 * @override
 */
cvox.MathShifter.prototype.getBraille = function(prevSel, sel) {
  return new cvox.NavBraille({
    text: cvox.BrailleUtil.getTemplated(prevSel.start.node, sel.start.node)
  });
};


/**
 * @override
 */
cvox.MathShifter.prototype.getGranularityMsg = function() {
  return this.direction_ ? 'up to level ' + this.level_ :
      'down to level ' + this.level_;
};


/**
 * @override
 */
cvox.MathShifter.prototype.makeLessGranular = function() {
  this.level_ = this.level_ > 0 ? this.level_ - 1 : 0;
  this.direction_ = true;
  this.bumped_ = !cvox.TraverseMath.getInstance().nextParentChild(true);
};


/**
 * @override
 */
cvox.MathShifter.prototype.makeMoreGranular = function() {
  this.direction_ = false;
  this.bumped_ = !cvox.TraverseMath.getInstance().nextParentChild(false);
  if (!this.bumped_) {
    this.level_++;
  }
};


/**
 * @override
 */
cvox.MathShifter.create = function(sel) {
  if (cvox.DomPredicates.mathPredicate(
      cvox.DomUtil.getAncestors(sel.start.node))) {
    return new cvox.MathShifter(sel);
  }
  return null;
};


/**
 * The active domain of the MathShifter.
 *
 * @return {string} The name of the current Math Domain.
 */
cvox.MathShifter.prototype.getDomainMsg = function() {
  return this.speak.domain;
};
