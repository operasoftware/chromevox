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

goog.require('cvox.DomPredicates');
goog.require('cvox.DomUtil');
goog.require('cvox.MathUtil');
goog.require('cvox.SelectionUtil');
goog.require('cvox.TraverseUtil');


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
   * The current traversal mode. Currently a simple string.
   * TODO (sorge) This should be replaced by proper reading rules.
   * @type {string}
   */
  this.activeTraversalMode = 'layout';

  /**
   * All available traversal mode. Currently an array of strings.
   * TODO (sorge) This should be replaced by proper reading rules.
   * @type {!Array.<string>}
   * @private
   */
  this.traversalModes_ = ['leaf', 'token', 'tree', 'layout'];
};


/**
 * Setting the traversal mode. Remains previous mode if the supplied mode
 * is unknown.
 * TODO (sorge) Should be updated for reading rules.
 * @param {string} mode The new mode.
 */
cvox.TraverseMath.prototype.setMode = function(mode) {
  if (this.traversalModes_.indexOf(mode) != -1) {
    this.activeTraversalMode = mode;
    }
};


/**
 * Sets the active mode for the TraverseMath object to the next one in the list
 * restarting from the first, if necessary.
 * @return {string} The name of the newly set mode.
 */
cvox.TraverseMath.prototype.cycleTraversalMode = function() {

  var index = this.traversalModes_.indexOf(this.activeTraversalMode);
  ++index;

  if (index == this.traversalModes_.length) {
    this.activeTraversalMode = this.traversalModes_[0];
    } else {
      this.activeTraversalMode = this.traversalModes_[index];
    }
  return this.activeTraversalMode;
};


/**
 * Initializes a traversal of a math expression.
 * @param {Node} node A MathML node.
 * @param {boolean=} reverse True if reversed. False by default.
 */
cvox.TraverseMath.prototype.initialize = function(node, reverse) {
  this.activeMath = node;
  this.activeNode = node;
  this.next(reverse);
};


/**
 * Compiles all leaf node of the MathML tree (left to right).
 * @param {Node} math A MathML node.
 * @return {Array.<string>} The content of the leaf nodes of math.
 */
cvox.TraverseMath.allLeafNodes = function(math) {

  var leafs = [];

  function getLeafs(node) {
    var children = node.childNodes;
    for (var i = 0, child; child = children[i]; i++) {
      // It is text.
      if (child.nodeType == 3) {
        leafs.push(child.textContent);
      } else if (cvox.MathUtil.isToken(child)) {
        leafs.push(child.textContent);
      } else {
        getLeafs(child);
      }
    }
  };

  getLeafs(math);
  return leafs;
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


/**
 * Moves to the next leaf node in the current Math expression if it exists.
 * @param {boolean=} reverse True if reversed. False by default.
 * @return {Node} The next node.
 */
cvox.TraverseMath.prototype.next = function(reverse) {
  reverse = !!reverse;
  if (!this.activeNode) {
    return null;
  }
  switch (this.activeTraversalMode) {
    case 'leaf':
      return this.nextLeaf(reverse, cvox.DomUtil.isLeafNode);
      break;
    case 'token':
      return this.nextLeaf(reverse, cvox.MathUtil.isToken);
      break;
    case 'tree':
      return this.nextSubtree(reverse, cvox.MathUtil.isMathmlTag);
      break;
    case 'layout':
      return this.nextSubtree(reverse, cvox.MathUtil.isLayout);
      break;
    default:
      return this.nextSubtree(reverse, cvox.MathUtil.isMathmlTag);
  }
};


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
