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
 */
cvox.MathWalker = function() {
  goog.base(this);
  // TODO (sorge)
  // Here we can put in some effort to determine the actual domain
  // of the math expression in which the walker lives via a function
  // in MathUtils!
  /**
   * The Math Speak object of the walker.
   * @type {!cvox.MathSpeak}
   * @private
   */
  this.speak_ = new cvox.MathSpeak({domain: 'default'});

  /**
   * The Traversal object of the walker to which the explore mode
   * delegates.
   * @type {!cvox.TraverseMath}
   * @private
   */
  this.traverse_ = new cvox.TraverseMath();

  /**
   * Flag indicating if we are in explore mode.
   * @type {boolean}
   * @private
   */
  this.explore_ = false;

  /**
   * The walker granularity before the math object was entered.
   * @type {?number}
   * @private
   */
  this.savedGranularity_ = null;
};
goog.inherits(cvox.MathWalker, cvox.AbstractWalker);


/**
 * @override
 */
cvox.MathWalker.prototype.next = function(sel) {
  if (this.explore_) {
    // TODO (sorge)
    // delegate fully to traverse.
    var r = sel.isReversed();
    var newSel = cvox.CursorSelection.fromNode(this.traverse_.next(r));
    newSel.setReversed(r);
    return newSel;
  } else {
    return null;
  }
};


/**
 * @override
 */
cvox.MathWalker.prototype.sync = function(sel) {
  // If we explore we sync to the active node
  // otherwise always to the entire math node.
  // TODO (sorge): Active node could be changed to a range
  // for different speech rules.

  if (!this.traverse_.activeNode || !this.traverse_.activeMath) {
    var mathNode = this.getMathNode_(sel);
    this.explore_ = false;
    this.traverse_.initialize(mathNode, sel.isReversed());
  }
  var newSel = this.explore_ ?
    cvox.CursorSelection.fromNode(this.traverse_.activeNode) :
    cvox.CursorSelection.fromNode(this.traverse_.activeMath);
  newSel.setReversed(sel.isReversed());
  return newSel;
};


/**
 * @override
 */
cvox.MathWalker.prototype.getDescription = function(prevSel, sel) {
  if (this.explore_) {
    return this.speak_.speakString(this.traverse_.activeContent());
  } else {
    var descs = new Array();
    descs.push(new cvox.NavDescription(
                 {text: cvox.ChromeVox.msgs.getMsg('math_expr')}));
    descs[0].pushEarcon(cvox.AbstractEarcons.OBJECT_ENTER);
    var mathNode = this.getMathNode_(sel);
    if (cvox.AriaUtil.isMath(mathNode)) {
      // Check for an Aria Role of the node
      descs.push(new cvox.NavDescription(
                   {text: cvox.DomUtil.getName(mathNode, false, false)}));
    } else if (cvox.AriaUtil.isMath(mathNode.parentNode)) {
      // Check for an Aria Role of the immediate parentNode
      descs.push(new cvox.NavDescription(
                   {text: cvox.DomUtil.getName(mathNode.parentNode,
                                               false, false)}));
    } else {
      // TODO (sorge) This should be refactored into MathSpeak:
      // Speak the entire tree with the currently active speech rules.
      var symbols = cvox.TraverseMath.allLeafNodes(mathNode);
      descs = descs.concat(this.speak_.speakSequence(symbols));
    }
    return descs;
  }
};


/**
 * @override
 */
cvox.MathWalker.prototype.getGranularityMsg = function() {
  return cvox.ChromeVox.msgs.getMsg('math_expr');
};


/**
 * @override
 */
cvox.MathWalker.prototype.getBraille = function(prevSel, sel) {
  return cvox.BrailleUtil.getBraille(prevSel, sel);
};


/**
 * Returns true if sel is inside a math expression.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {boolean} True if inside a math node.
 */
cvox.MathWalker.prototype.isInMath = function(sel) {
  return this.getMathNode_(sel) != null;
};


/**
 * Returns the nearest math node containing the end of the selection.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {Node} The math node containing sel. null if not in a
 * math expression.
 * @private
 */
cvox.MathWalker.prototype.getMathNode_ = function(sel) {
  return cvox.DomUtil.getContainingMath(sel.end.node);
};


/**
 * Setting the domain of the mathwalker.
 * @param {string} domain The new domain. This can really be anything as in
 *  a worst case it will resort to the default mapping.
 */
cvox.MathWalker.prototype.setDomain = function(domain) {
  this.speak_.setDomain(domain);
};


/**
 * Delegates to MathSpeak.
 */
cvox.MathWalker.prototype.cycleDomain = function() {
  this.speak_.cycleDomain();
};


/**
 * The active domain of the MathWalker.
 *
 * @return {string} The name of the current Math Domain.
 */
cvox.MathWalker.prototype.getDomainMsg = function() {
  return this.speak_.domain;
};


/**
 * Delegates to TraverseMath.
 */
cvox.MathWalker.prototype.cycleTraversalMode = function() {
  this.traverse_.cycleTraversalMode();
};


/**
 * The active Traversal Mode of the MathWalker.
 *
 * @return {string} The name of the current Math Traversal Mode.
 */
cvox.MathWalker.prototype.getTraversalModeMsg = function() {
  return this.traverse_.activeTraversalMode;
};


/**
 *
 * @param {number} index The index of the granularity before Math
 * Expression was entered.
 */
cvox.MathWalker.prototype.setSavedGranularity = function(index) {
  this.savedGranularity_ = index;
};


/**
 *
 * @return {?number} The index of the granularity before Math
 * Expression was entered.
 */
cvox.MathWalker.prototype.getSavedGranularity = function() {
  return this.savedGranularity_;
};


/**
 * Toggle explore mode of the math walker.
 */
cvox.MathWalker.prototype.toggleExplore = function() {
  this.explore_ = !this.explore_;
};


/**
 * Reset the math walker to initial state, before a math expression
 * was entered.
 */
cvox.MathWalker.prototype.reset = function() {
  this.traverse_.initialize(null);
};
