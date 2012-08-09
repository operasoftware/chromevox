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
 * @fileoverview Navigation history tracks recently visited nodes. The
 * state of this class (the node history), is used to ensure the user is
 * navigating to and from valid nodes.
 * NOTE: The term "valid node" is simply a heuristic, defined in isValidNode_.
 *
 * @author adu@google.com (Adu Bhandaru)
 */


goog.provide('cvox.NavigationHistory');

goog.require('cvox.DomUtil');


/**
 * @constructor
 */
cvox.NavigationHistory = function() {
  this.reset_();
};


/**
 * The maximum length of history tracked for recently visited nodes.
 * @const
 * @type {number}
 * @private
 */
cvox.NavigationHistory.MAX_HISTORY_LEN_ = 30;


/**
 * Resets the navigation history.
 * @private
 */
cvox.NavigationHistory.prototype.reset_ = function() {
  var startNode = document.body;

  /**
   * An array of nodes ordered from newest to oldest in the history. For
   * clarity, the most recent nodes are at the start of the array.
   * @type {Array.<Node>}
   * @private
   */
  this.history_ = [startNode];
};


/**
 * Update the navigation history with the current element.
 * The most recent elements are at the start of the array.
 * @param {Node} newNode The new node to update the history with.
 */
cvox.NavigationHistory.prototype.update = function(newNode) {
  var previousNode = this.history_[0];

  // Avoid pushing consecutive duplicate elements.
  if (newNode && newNode != previousNode) {
    this.history_.unshift(newNode);
  }

  // If list is too long, pop the last (oldest) item.
  if (this.history_.length >
      cvox.NavigationHistory.MAX_HISTORY_LEN_) {
    this.history_.pop();
  }
};


/**
 * Routinely clean out history and determine if the given node is valid.
 * @param {Node} node The node to validate (resolve).
 * @return {boolean} True if the current navigation state is valid.
 */
cvox.NavigationHistory.prototype.validate = function(node) {
  // Remove any invalid nodes from history_.
  this.clean_();

  // Run the validation method on the given node.
  return this.isValidNode_(node);
};


/**
 * Determine a valid reversion for the current navigation track. A reversion
 * provides both a current node to sync to and a previous node as context.
 * @param {function(Node)} opt_predicate A function that takes in a node and
 *     returns true if it is a valid recovery candidate. Nodes that do not
 *     match the predicate are removed as we search for a match. If no
 *     predicate is provided, return the two most recent nodes.
 * @return {{current: ?Node, previous: ?Node}}
 *     The two nodes to override default navigation behavior with. Returning
 *     null or undefined means the history is empty.
 */
cvox.NavigationHistory.prototype.revert = function(opt_predicate) {
  // Remove the most-recent-nodes that do not match the predicate.
  if (opt_predicate) {
    while (this.history_.length > 0) {
      var node = this.history_[0];
      if (opt_predicate(node)) {
        break;
      }
      this.history_.shift();
    }
  }

  // The reversion is just the first two nodes in the history.
  var reversion = {
    current: this.history_[0],
    previous: this.history_[1]
  };
  return reversion;
};


/**
 * Remove any and all nodes from history_ that are no longer valid.
 * @return {boolean} True if any changes were made to the history.
 * @private
 */
cvox.NavigationHistory.prototype.clean_ = function() {
  var changed = false;
  for (var i = this.history_.length - 1; i >= 0; i--) {
    var valid = this.isValidNode_(this.history_[i]);
    if (!valid) {
      this.history_.splice(i, 1);
      changed = true;
    }
  }
  return changed;
};


/**
 * Determine if the given node is valid based on a heuristic.
 * A valid node must be attached to the DOM and
 * not hidden by CSS: (display:none, visibility:hidden, opacity:0)
 * @param {Node} node The node to validate.
 * @return {boolean} True if node is valid.
 * @private
 */
cvox.NavigationHistory.prototype.isValidNode_ = function(node) {
  // Confirm that the element is in the DOM.
  if (!cvox.DomUtil.isAttachedToDocument(node)) {
    return false;
  }

  // TODO (adu): In the future we may change this to just let users know the
  // node is invisible instead of restoring focus.
  if (!this.isVisibleNode_(node)) {
    return false;
  }

  return true;
};


/**
 * Determine if the given node is visible on the page. This does not check if
 * it is inside the document view-port as some sites try to communicate with
 * screen readers with such elements.
 * @param {Node} node The node to determine as visible or not.
 * @return {boolean} True if the node is visible.
 * @private
 */
cvox.NavigationHistory.prototype.isVisibleNode_ = function(node) {
  var ancestors = cvox.DomUtil.getAncestors(node);
  // No reason to check the current node twice, remove from ancestor array.
  var current = /** @type {Element} */ ancestors.pop();

  // Confirm that no subtree containing node is hidden via style.
  for (var i = 0; i < ancestors.length; i++) {
    if (this.isInvisibleSubtree_(ancestors[i])) {
      return false;
    }
  }

  // Confirm current node is visible, including the visibility hidden check.
  var style = document.defaultView.getComputedStyle(current, null);
  if (cvox.DomUtil.isInvisibleStyle(style)) {
    return false;
  }

  // The node is visible.
  return true;
};


/**
 * Determine if a DOM subtree, defined by its root, must be invisible.
 * NOTE: We do not have to check every node in the subtree. It is sufficient to
 * check if the root node has either display none or opacity 0. If so, then all
 * decendents (including the root) must be invisible.
 * @param {Node} root The root of the DOM tree.
 * @return {boolean} True if the DOM tree and the root inclusive must be
 *     invisible.
 * @private
 */
cvox.NavigationHistory.prototype.isInvisibleSubtree_ = function(root) {
  // Cast because getComputedStyle expects an Element.
  var element = /** @type {Element} */ root;
  var style = document.defaultView.getComputedStyle(element, null);

  // If no style was computed, the node must be visible by default.
  if (!style) {
    return false;
  }
  if (style.display == 'none') {
    return true;
  }
  if (parseInt(style.opacity, 10) == 0) {
    return true;
  }
  return false;
};
