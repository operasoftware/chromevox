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
goog.require('cvox.AriaUtil');
goog.require('cvox.BrailleUtil');
goog.require('cvox.CursorSelection');
goog.require('cvox.DomUtil');
goog.require('cvox.MathSpeak');
goog.require('cvox.MathmlLayoutWalker');
goog.require('cvox.MathmlLeafWalker');
goog.require('cvox.MathmlTokenWalker');
goog.require('cvox.MathmlTreeWalker');
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
  this.speak = new cvox.MathSpeak({domain: 'default'});

  this.MathmlWalkers_ = [new cvox.MathmlTreeWalker(this),
                         new cvox.MathmlLayoutWalker(this),
                         new cvox.MathmlTokenWalker(this),
                         // TODO (sorge) Replace Leaf Walker by Object Walker
                         // once math translation is refactored.
                         new cvox.MathmlLeafWalker(this)
                        ];

  this.SemanticWalkers_ = [];

  this.currentWalkerList_ = this.MathmlWalkers_;
  this.currentWalker_ = this.currentWalkerList_[0];
  if (sel) {
    this.next(sel);
  }
};
goog.inherits(cvox.MathShifter, cvox.AbstractShifter);


/**
 * @override
 */
cvox.MathShifter.prototype.next = function(sel) {
  return this.currentWalker_.next(sel);
};


/**
 * @override
 */
cvox.MathShifter.prototype.sync = function(sel) {
  // TODO (sorge): We currently delegate to the active walker.
  // See if this is sufficient in all cases!
  return this.currentWalker_.sync(sel);
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
  return this.currentWalker_.getDescription(prevSel, sel);
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
  return this.currentWalker_.getGranularityMsg();
};


/**
 * @override
 */
cvox.MathShifter.prototype.makeLessGranular = function() {
  goog.base(this, 'makeLessGranular');
  var index = this.currentWalkerList_.indexOf(this.currentWalker_);
  --index;

  if (index >= 0) {
    this.currentWalker_ = this.currentWalkerList_[index];
  }
};


/**
 * @override
 */
cvox.MathShifter.prototype.makeMoreGranular = function() {
  goog.base(this, 'makeMoreGranular');
  var index = this.currentWalkerList_.indexOf(this.currentWalker_);
  ++index;

  if (index < this.currentWalkerList_.length) {
    this.currentWalker_ = this.currentWalkerList_[index];
  }
};


/**
 * @override
 */
cvox.MathShifter.create = function(sel) {
  if (cvox.DomPredicates.mathPredicate(
      cvox.DomUtil.getAncestors(sel.start.node))) {
    var mathNode = cvox.DomUtil.getContainingMath(sel.end.node);
    cvox.TraverseMath.getInstance().initialize(mathNode, sel.isReversed());
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
