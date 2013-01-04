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
 * @fileoverview A walker that clusters groups by visual attributes.
 * The walker uses CursorSelection to bound a visual region from the
 * selection's start node to its end node.
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.VisualWalker');

goog.require('cvox.AbstractNodeWalker');
goog.require('cvox.ChromeVox');
goog.require('cvox.CssDimension');
goog.require('cvox.DomUtil');
goog.require('cvox.GroupWalker');

/**
* @constructor
* @extends {cvox.AbstractNodeWalker}
*/
cvox.VisualWalker = function() {
  cvox.AbstractNodeWalker.call(this);

/**
 * @const
* @private
*/
this.HEADER_TAG_LIST_ = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

  /**
   * @type {!cvox.GroupWalker}
   * @private
   */
  this.subWalker_ = new cvox.GroupWalker();

  /**
   * @type {Array.<cvox.CssDimension>}
   * @private
   */
  this.dimensions_ =
      [
        /** A measure of horizontal distance between two client rectangles. */
        {name: 'deltaX', threshold: 50, distance: this.getDeltaX_},

        /** A measure of vertical distance between two client rectangles. */
        {name: 'deltaY', threshold: 10, distance: this.getDeltaY_},

        /** A measure of common ancestry between two nodes. The threshold is the
         * percentage of levels to search (from one node to the root).
         */
        {name: 'commonAncestry',
         threshold: .5,
         distance: this.getCommonAncestry_},

        /** A boolean measure of breaking tags. */
        {name: 'breakingTags',
         threshold: 1,
         distance: this.getBreakingTags_}
      ];
};
goog.inherits(cvox.VisualWalker, cvox.AbstractNodeWalker);

/**
 * @override
 */
cvox.VisualWalker.prototype.next = function(sel) {
  var r = sel.isReversed();
  // Collapse the previous selection to the ending node.
  var prevSel = /** @type {!cvox.CursorSelection} */ (
      cvox.CursorSelection.fromNode(sel.end.node)).setReversed(r);

  // Move to the beginning of the new selection.
  var currentSel = this.subWalker_.next(prevSel);

  // Reached the end.
  if (!currentSel) {
    return null;
  }

  // Keep the beginning of the selection.
  var startSel = currentSel;

  // Attempt to increase the selection up to the next visual region ending at
  // endSel.
  var endSel = null;
  var a = null;
  var b = null;
  do {
    endSel = currentSel;
    currentSel = this.subWalker_.next(endSel);
    // Because compare_ is NOT symmetric in its arguments.
    if (r) {
      a = currentSel;
      b = endSel;
    } else {
      a = endSel;
      b = currentSel;
    }
  } while (endSel &&
           currentSel &&
           (this.compare_(a.end.node, b.start.node) >= 0 ||
               endSel.end.node == document.body));

  return new cvox.CursorSelection(startSel.start, endSel.end, r);
};

/**
 * @override
 */
cvox.VisualWalker.prototype.getDescription = function(prevSel, sel) {
  if (sel.start.node == sel.end.node) {
    // Degenerate case: clustering is as good as the subWalker_.
    return this.subWalker_.getDescription(prevSel, sel);
  }

  // Collapse the selection to the start which is always non-null.
  var startSel = /** @type {!cvox.CursorSelection} */ (
      cvox.CursorSelection.fromNode(sel.absStart().node));

  // The iterator of the prior group.
  var priorSel = this.subWalker_.next(startSel.clone().setReversed(true)) ||
      cvox.CursorSelection.fromBody();
  priorSel.setReversed(false);

  // The iterator of the current group.
  var currentSel = startSel;

  var ret = [];
  // Walk up to the end of the selection and accumulate descriptions.
  do {
    ret = ret.concat(this.subWalker_.getDescription(priorSel, currentSel));
    priorSel = currentSel;
    currentSel =
        this.subWalker_.next(priorSel) || cvox.CursorSelection.fromBody();
  } while (priorSel.absEnd().node != sel.absEnd().node);

  return ret;
};

/**
 * @override
 */
cvox.VisualWalker.prototype.stopNodeDescent = function(node) {
  if (!node || node.nodeType != Node.ELEMENT_NODE) {
    return true;
  }

  return this.subWalker_.stopNodeDescent(node);
};

/**
 * @override
 */
cvox.VisualWalker.prototype.sync = function(sel) {
  if (sel.start.node == document.body || sel.end.node == document.body) {
    // The selection spans from the first/last element to the body. Align to
    // the subwalker.
    sel = this.subWalker_.sync(sel) || cvox.CursorSelection.fromBody();
  }
  var r = sel.isReversed();
  // Move back once then move forwards once.
  var s = sel.clone();
  s.setReversed(!r);
  // TODO(dtseng): Figure out what expectations walkers have about the body
  // node. Sometimes, it's used as a boundary point between a walker's first
  // and last elements.
  var back = this.next(s) || cvox.CursorSelection.fromBody().setReversed(!r);
  back.setReversed(r);
  return this.next(back) || cvox.CursorSelection.fromBody().setReversed(r);
};

/**
 * @override
 */
cvox.VisualWalker.prototype.getGranularityMsg = function() {
  return cvox.ChromeVox.msgs.getMsg('visual_strategy');
};

// TODO(dtseng): Consider moving these to a util file with their own unit tests
// refactored/reused from CSSSpace. Then, we can delete css_space.js.
/**
 * Calculates Euclidean distance between the input nodes.
 * @param {Element} node1 A start position.
 * @param {Element} node2 An end position.
 * @return {number} The distance between startingNode and endingNode; -1
 * if  any dimension does not fall within its dimensional threshold.
 * @private
 */
cvox.VisualWalker.prototype.compare_ = function(node1, node2) {
  node1 = this.toNearestElement_(node1);
  node2 = this.toNearestElement_(node2);

  var totalMeasure = 0;
  for (var dim = 0; dim < this.dimensions_.length; ++dim) {
    var current = this.dimensions_[dim];
    var measure = current.distance.call(this, node1, node2);

    // Return -1 if we are not within our threshold for this dimension.
    if (measure > current.threshold || measure < 0) {
      return -1;
    }

    totalMeasure += measure;
  }

  return measure;
};

/**
 * Provides the horizontal distance between two rectangles.
 * @param {!Node} node1 A node whose rectangle to use.
 * @param {!Node} node2 Another node whose rectangle to use.
 * @return {number} The horizontal distance.
 * @private
 */
cvox.VisualWalker.prototype.getDeltaX_ = function(node1, node2) {
  if (node1.nodeType != Node.ELEMENT_NODE ||
      node2.nodeType != Node.ELEMENT_NODE) {
    return -1;
  }

  var rect1 = node1.getBoundingClientRect();
  var rect2 = node2.getBoundingClientRect();

  var measure1 = Math.abs(rect1.right - rect2.left);
  var measure2 = Math.abs(rect1.left - rect2.right);
  var measure3 = Math.abs(rect1.left - rect2.left);
  var measure4 = Math.abs(rect1.right - rect2.right);
  return Math.min(measure1, measure2, measure3, measure4);
};

/**
 * Provides the vertical distance between two rectangles.
 * @param {!Node} node1 A node whose rectangle to use.
 * @param {!Node} node2 Another node whose rectangle to use.
 * @return {number} The vertical distance.
 * @private
 */
cvox.VisualWalker.prototype.getDeltaY_ = function(node1, node2) {
  if (node1.nodeType != Node.ELEMENT_NODE ||
      node2.nodeType != Node.ELEMENT_NODE) {
    return -1;
  }

  var rect1 = node1.getBoundingClientRect();
  var rect2 = node2.getBoundingClientRect();

  var measure1 = Math.abs(rect1.bottom - rect2.top);
  var measure2 = Math.abs(rect1.top - rect2.bottom);
  var measure3 = Math.abs(rect1.top - rect2.top);
  var measure4 = Math.abs(rect1.bottom - rect2.bottom);

  // Give headings an advantage when grouping.
  if (this.HEADER_TAG_LIST_.indexOf(node1.tagName) != -1) {
    measure1 /= 5;
    measure2 /= 5;
    measure3 /= 5;
    measure4 /= 5;
  }

  return Math.min(measure1, measure2, measure3, measure4);
};

// TODO(dtseng): Convert this over to use getUniqueAncestors. Need to ensure
// the visual regions remain consistent with existing tests.
/**
 * The minimum levels of parentage for which two nodes have a common parent.
 * @param {!Node} node1 A node whose parentage to use.
 * @param {!Node} node2 Another node whose parentage to use.
 * @return {number} The distance.
 * @private
 */
cvox.VisualWalker.prototype.getCommonAncestry_ = function(node1, node2) {
  // Mark the parent chain.
  var walker1 = node1;
  var totalDepth = 0;
  while (walker1 != document.documentElement) {
    walker1['cvox-mark'] = true;
    ++totalDepth;
    walker1 = walker1.parentNode;
  }

  // Now, find the common ancestor.
  var walker2 = node2;
  var depth = 0;
  var maxCommonAncestor = -1;

  while (walker2 != document.documentElement && depth <= totalDepth) {
    if (walker2['cvox-mark']) {
      maxCommonAncestor = depth;
      break;
    }

    ++depth;
    walker2 = walker2.parentNode;
  }

  // Unmark previous parent chain.
  while (walker1) {
    walker1['cvox-mark'] = false;
    walker1 = walker1.parentNode;
  }

  return maxCommonAncestor / totalDepth;
};

/**
 * A boolean measure of if two elements are close based on tagName.
 * @param {Node} start A node earlier in doc order.
 * @param {Node} end A node later in doc order.
 * @return {number} The distance (-1 or 0).
 * @private
 */
cvox.VisualWalker.prototype.getBreakingTags_ = function(start, end) {
  // End is the target of the break.
  return this.isBreakingTag_(end) &&
      !this.isBreakingTag_(start) ? -1 : 0;
};

/**
 * Given a linearization of the DOM, these node tags signify the start of a new
 * grouping.
 * @param {Node} node The node to check.
 * @return {boolean} Whether the node is a breaking tag.
 * @private
 */
cvox.VisualWalker.prototype.isBreakingTag_ = function(node) {
  if (this.HEADER_TAG_LIST_.indexOf(node.tagName) != -1 ||
      node.tagName == 'TR') {
    return true;
  }

  return false;
};

/**
 * Returns the nearest element.
 * @param {Node} node A node.
 * @return {Element} Nearest element in ancestry chain inclusive.
 * @private
 */
cvox.VisualWalker.prototype.toNearestElement_ = function(node) {
  if (node.nodeType != Node.ELEMENT_NODE) {
    node = node.parentElement;
  }

  return /** @type {Element} */ (node);
};
