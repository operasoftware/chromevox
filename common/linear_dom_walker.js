// Copyright 2010 Google Inc.
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
 * @fileoverview A JavaScript class for walking the DOM.
 * @author clchen@google.com (Charles L. Chen)
 */


cvoxgoog.provide('cvox.LinearDomWalker');

cvoxgoog.require('cvox.DomUtil');
cvoxgoog.require('cvox.XpathUtil');



/**
 * @constructor
 */
cvox.LinearDomWalker = function() {
  this.currentNode = null;
  this.currentAncestors = new Array();
  this.previousNode = null;
};


/**
 * Gets the currentNode for the cvox.LinearDomWalker.
 * @return {Node} The the current node.
 */
cvox.LinearDomWalker.prototype.getCurrentNode = function() {
  return this.currentNode;
};


/**
 * Sets the currentNode for the cvox.LinearDomWalker.
 * @param {Node} node The node that should be treated as the current node.
 */
cvox.LinearDomWalker.prototype.setCurrentNode = function(node) {
  this.currentNode = node;
  this.currentAncestors = new Array();
  var ancestor = this.currentNode;
  while (ancestor) {
    this.currentAncestors.push(ancestor);
    ancestor = ancestor.parentNode;
  }
  this.currentAncestors.reverse();
};


/**
 * Moves to the next node.
 *
 * @return {Node} The current node.
 */
cvox.LinearDomWalker.prototype.next = function() {
  this.previousNode = this.currentNode;

  /* Make sure the handle to the current element is still valid (attached to the
   * document); if it isn't, use the cached list of ancestors to find a valid
   * node, then resume navigation from that point.
   * The current node can be invalidated by AJAX changing content.
   */
  if (this.currentNode &&
      !cvox.DomUtil.isAttachedToDocument(this.currentNode)) {
    for (var i = this.currentAncestors.length - 1, ancestor;
        ancestor = this.currentAncestors[i]; i--) {
      if (cvox.DomUtil.isAttachedToDocument(ancestor)) {
        this.setCurrentNode(ancestor);
        // Previous-Next sequence to put us back at the correct level.
        this.previous();
        this.next();
        break;
      }
    }
  }

  return this.nextContentNode();
};


/**
 * Moves to the previous node.
 *
 * @return {Node} The current node.
 */
cvox.LinearDomWalker.prototype.previous = function() {
  this.previousNode = this.currentNode;

  /* Make sure the handle to the current element is still valid (attached to the
   * document); if it isn't, use the cached list of ancestors to find a valid
   * node, then resume navigation from that point.
   * The current node can be invalidated by AJAX changing content.
   */
  if (this.currentNode &&
      !cvox.DomUtil.isAttachedToDocument(this.currentNode)) {
    for (var i = this.currentAncestors.length - 1, ancestor;
        ancestor = this.currentAncestors[i]; i--) {
      if (cvox.DomUtil.isAttachedToDocument(ancestor)) {
        this.setCurrentNode(ancestor);
        // Next-previous sequence to put us back at the correct level.
        this.next();
        this.previous();
        break;
      }
    }
  }

  return this.prevContentNode();
};


/**
 * Moves to the next node.
 * @return {Node} The current node.
 */
cvox.LinearDomWalker.prototype.nextNode = function() {
  if (!this.currentNode) {
    this.setCurrentNode(document.body);
  } else {
    while (this.currentNode && (!this.currentNode.nextSibling)) {
      this.setCurrentNode(this.currentNode.parentNode);
    }
    if (this.currentNode && this.currentNode.nextSibling) {
      this.setCurrentNode(this.currentNode.nextSibling);
    }
  }
  if (!this.currentNode) {
    return null;
  }
  while (!this.isLeafNode(this.currentNode)) {
    this.setCurrentNode(this.currentNode.firstChild);
  }
  return this.currentNode;
};


/**
 * Moves to the next node that has content.
 * @return {Node} The current node.
 */
cvox.LinearDomWalker.prototype.nextContentNode = function() {
  this.nextNode();
  while (this.currentNode && !cvox.DomUtil.hasContent(this.currentNode)) {
    this.nextNode();
  }
  return this.currentNode;
};


/**
 * Moves to the previous node.
 * @return {Node} The current node.
 */
cvox.LinearDomWalker.prototype.prevNode = function() {
  if (!this.currentNode) {
    this.setCurrentNode(document.body);
  } else {
    while (this.currentNode && (!this.currentNode.previousSibling)) {
      this.setCurrentNode(this.currentNode.parentNode);
    }
    if (this.currentNode && this.currentNode.previousSibling) {
      this.setCurrentNode(this.currentNode.previousSibling);
    }
  }
  if (!this.currentNode) {
    return null;
  }
  while (!this.isLeafNode(this.currentNode)) {
    this.setCurrentNode(this.currentNode.lastChild);
  }
  return this.currentNode;
};


/**
 * Moves to the previous node that has content.
 * @return {Node} The current node.
 */
cvox.LinearDomWalker.prototype.prevContentNode = function() {
  this.prevNode();
  while (this.currentNode && !cvox.DomUtil.hasContent(this.currentNode)) {
    this.prevNode();
  }
  return this.currentNode;
};


/**
 * Returns an array of ancestors that are unique for the current node when
 * compared to the previous node. Having such an array is useful in generating
 * the node information (identifying when interesting node boundaries have been
 * crossed, etc.).
 *
 * @return {Array.<Node>} An array of unique ancestors for the current node.
 */
cvox.LinearDomWalker.prototype.getUniqueAncestors = function() {
  return cvox.DomUtil.getUniqueAncestors(this.previousNode,
      this.currentNode);
};


/**
 * Determines if the a node should be treated as a leaf node.
 * Based on DomUtil.isLeafNode - if SmartNav is enabled, then a few additional
 * heuristics will be applied to determine if a node can be treated as a leaf
 * node for smoother reading.
 * @param {Node} targetNode to check.
 * @return {boolean} True if targetNode can be considered a leaf node.
 */
cvox.LinearDomWalker.prototype.isLeafNode = function(targetNode) {
  if (cvox.DomUtil.isLeafNode(targetNode)) {
    return true;
  }
  return false;
};
