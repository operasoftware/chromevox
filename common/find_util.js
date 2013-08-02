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
 * @fileoverview Utilities for finding DOM nodes and CursorSelection's.
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.FindUtil');

goog.require('cvox.BareObjectWalker');
goog.require('cvox.CursorSelection');


/**
 * @type {!cvox.BareObjectWalker}
 * @private
 */
cvox.FindUtil.objectWalker_ = new cvox.BareObjectWalker();


/**
 * Finds the next selection that matches the predicate function starting from
 * sel. Undefined if the nodes in sel are not attached to the document.
 * @param {!cvox.CursorSelection} sel The selection from which to start.
 * @param {function(Array.<Node>):Node} predicate A function taking a
 * unique ancestor tree and outputting Node if the ancestor tree matches
 * the desired node to find.
 * @param {boolean=} opt_initialNode Whether to start the search from node
 * (true), or the next node (false); defaults to false.
 * @return {cvox.CursorSelection} The selection that was found.
 * null if end of document reached.
 */
cvox.FindUtil.findNext = function(sel, predicate, opt_initialNode) {
  var r = sel.isReversed();
  var cur = new cvox.CursorSelection(sel.absStart(), sel.absStart())
      .setReversed(r);

  // We may have been sync'ed into a subtree of the current predicate match.
  // Find our ancestor that matches the predicate.
  var ancestor;
  if (ancestor = predicate(cvox.DomUtil.getAncestors(cur.start.node))) {
    cur = cvox.CursorSelection.fromNode(ancestor).setReversed(r);
    if (opt_initialNode) {
      return cur;
    }
  }

  while (cur) {
    // Use ObjectWalker's traversal which guarantees us a stable iteration of
    // the DOM including returning null at page bounds.
    cur = cvox.FindUtil.objectWalker_.next(cur);
    var retNode = null;
    if (!cur ||
        (retNode = predicate(cvox.DomUtil.getAncestors(cur.start.node)))) {
      return retNode ? cvox.CursorSelection.fromNode(retNode) : null;
    }

    // Iframes require inter-frame messaging.
    if (cur.start.node.tagName == 'IFRAME') {
      return cur;
    }
  }
  return null;
};
