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
 * @fileoverview A base class for walkers that have a concept of lowest-level
 * node. Base classes must override the stopNodeDescent method to define
 * what a lowest-level node is. Then this walker will use those nodes as the
 * set of valid CursorSelections.
 * @author stoarca@google.com (Sergiu Toarca)
 */


goog.provide('cvox.AbstractNodeWalker');

goog.require('cvox.AbstractWalker');
goog.require('cvox.CursorSelection');
goog.require('cvox.DomUtil');

/**
 * @constructor
 * @extends {cvox.AbstractWalker}
 */
cvox.AbstractNodeWalker = function() {
  cvox.AbstractWalker.call(this);

  /**
   * To keep track of and break infinite loops when trying to call next on
   * a body that does not DomUtil.hasContent().
   * @type {boolean}
   * @private
   */
  this.wasBegin_ = false;
};
goog.inherits(cvox.AbstractNodeWalker, cvox.AbstractWalker);

/**
 * @override
 */
cvox.AbstractNodeWalker.prototype.next = function(sel) {
  var r = sel.isReversed();
  var node = sel.end.node;

  if (node == document.body && !cvox.DomUtil.directedFirstChild(node, r)) {
    return sel;
  }

  do {
    if (!node || node == document.body) {
      // if null, we want to start from the beginning of the document
      node = document.body;
    } else {
      // if not null, we want to find the next possible branch forward
      // in the dom, so we climb up the parents until we find a
      // node that has a nextSibling
      while (node && !cvox.DomUtil.directedNextSibling(node, r)) {
        node = node.parentNode;
      }
      if (node && cvox.DomUtil.directedNextSibling(node, r)) {
        node = cvox.DomUtil.directedNextSibling(node, r);
      }
    }
    if (!node) {
      // weve reached the end of the document
      return null;
    }
    // once we're at our next sibling, we want to descend down into it as
    // far as the child class will allow
    while (cvox.DomUtil.directedFirstChild(node, r) &&
           !this.stopNodeDescent(node)) {
      node = cvox.DomUtil.directedFirstChild(node, r);
    }
    // and repeat all of the above until we have a node that is not empty
  } while (node && !cvox.DomUtil.hasContent(node));

  // special case body because if body is a valid selection, then
  // we won't be able to move past it (since we use it as the absolute root
  // of the tree).
  if (node == document.body) {
    return null;
  }

  return cvox.CursorSelection.fromNode(node).setReversed(r);
};

/**
 * @override
 */
cvox.AbstractNodeWalker.prototype.sync = function(sel) {
  var ret = this.privateSync_(sel);
  this.wasBegin_ = false;
  return ret;
};


/**
 * Private version of sync to ensure that when a body has no content, we
 * don't do an infinite loop trying to find an empty node.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The synced selection.
 * @private
 */
cvox.AbstractNodeWalker.prototype.privateSync_ = function(sel) {
  var r = sel.isReversed();

  if (sel.equals(cvox.CursorSelection.fromBody())) {
    if (this.wasBegin_) {
      // if body is empty, we return just the body selection
      return cvox.CursorSelection.fromBody().setReversed(r);
    }
    this.wasBegin_ = true;
  }

  var node = sel.start.node;

  while (node != document.body && this.stopNodeDescent(node.parentNode)) {
    node = node.parentNode;
  }

  while (!this.stopNodeDescent(node)) {
    node = cvox.DomUtil.directedFirstChild(node, r);
  }

  var n = cvox.CursorSelection.fromNode(node);
  if (!cvox.DomUtil.hasContent(node)) {
    var n = this.next(/** @type {!cvox.CursorSelection} */
        (cvox.CursorSelection.fromNode(node)).setReversed(r));
  }
  if (n) {
    return n.setReversed(r);
  }
  return this.syncToPageBeginning({reversed: r});
};

/**
 * Returns true if this is "a leaf node" or lower. That is,
 * it is at the lowest valid level or lower for this granularity.
 * RESTRICTION: true for a node => true for all child nodes
 * RESTRICTION: true if node has no children
 * @param {Node} node The node to check.
 * @return {boolean} true if this is at the "leaf node" level or lower
 * for this granularity.
 * @protected
 */
cvox.AbstractNodeWalker.prototype.stopNodeDescent = goog.abstractMethod;
