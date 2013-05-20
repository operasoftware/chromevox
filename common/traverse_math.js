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

goog.provide('cvox.TraverseMath');

goog.require('cvox.DomUtil');
goog.require('cvox.MathJaxImplementation');
goog.require('cvox.MathJaxUtil');


/**
 * Initializes the traversal with the provided math node.
 *
 * @constructor
 */
cvox.TraverseMath = function() {

  /**
   * The active math <MATH> node. In this context, "active" means that this is
   * the math expression the TraverseMath object is navigating.
   * @type {Node}
   */
  this.activeMath = null;

  /**
   * The node currently under inspection.
   * @type {Node}
   */
  this.activeNode = null;

  /**
   * Dictionary of all MathJaxs elements in the page if there are any.
   * @type {!Object.<string, Node>}
   * @private
   */
  this.allMathjaxs_ = {};

  /**
   * When traversing a Mathjax node this will contain the internal
   * MathML representation of the node.
   * @type {Node}
   */
  this.activeMathmlHost = null;

  // Initializing the Mathjax object dictionary.
  cvox.MathJaxUtil.initializeMathjaxs(this.allMathjaxs_);

};
goog.addSingletonGetter(cvox.TraverseMath);


/**
 * Initializes a traversal of a math expression.
 * @param {Node} node A MathML node.
 * @param {boolean=} reverse True if reversed. False by default.
 */
cvox.TraverseMath.prototype.initialize = function(node, reverse) {
  this.activeMath = node;
  this.activeNode = node;
  if (cvox.DomUtil.isMathJax(node)) {
    this.activeMathmlHost = this.allMathjaxs_[node.getAttribute('id')];
  }
};


/**
 * Moves to the next leaf node in the current Math expression if it exists.
 * @param {boolean} reverse True if reversed. False by default.
 * @param {function(!Node):boolean} pred Predicate deciding what a leaf is.
 * @return {Node} The next node.
 */
cvox.TraverseMath.prototype.nextLeaf = function(reverse, pred) {
  if (this.activeNode && this.activeMath) {
    var next = pred(this.activeNode) ?
      cvox.DomUtil.directedFindNextNode(
          this.activeNode, this.activeMath, reverse, pred) :
      cvox.DomUtil.directedFindFirstNode(this.activeNode, reverse, pred);
    if (next) {
      this.activeNode = next;
    }
  }
  return this.activeNode;
};


// TODO (sorge) Refactor this logic into single walkers.
/**
 * Returns a string with the content of the active node.
 * @return {string} The active content.
 */
cvox.TraverseMath.prototype.activeContent = function() {
  return this.activeNode.textContent;
};


/**
 * Moves to the next subtree from a given node in a depth first fashion.
 * @param {boolean} reverse True if reversed. False by default.
 * @param {function(!Node):boolean} pred Predicate deciding what a subtree is.
 * @return {Node} The next subtree.
 */
cvox.TraverseMath.prototype.nextSubtree = function(reverse, pred) {
  if (!this.activeNode || !this.activeMath) {
    return null;
  }
  if (!reverse) {
    var child = cvox.DomUtil.directedFindFirstNode(
        this.activeNode, reverse, pred);
    if (child) {
      this.activeNode = child;
    } else {
      var next = cvox.DomUtil.directedFindNextNode(
          this.activeNode, this.activeMath, reverse, pred);
      if (next) {
          this.activeNode = next;
      }
    }
  } else {
    if (this.activeNode == this.activeMath) {
      var child = cvox.DomUtil.directedFindDeepestNode(
        this.activeNode, reverse, pred);
      if (child != this.activeNode) {
        this.activeNode = child;
        return this.activeNode;
      }
    }
    var prev = cvox.DomUtil.directedFindNextNode(
      this.activeNode, this.activeMath, reverse, pred, true, true);
    if (prev) {
      this.activeNode = prev;
    }
  }
  return this.activeNode;
};
