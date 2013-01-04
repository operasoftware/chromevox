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
 * @fileoverview A JavaScript class for walking the leaf nodes of the dom.
 * @author stoarca@google.com (Sergiu Toarca)
 */


goog.provide('cvox.ObjectWalker');

goog.require('cvox.AbstractNodeWalker');
goog.require('cvox.BrailleUtil');
goog.require('cvox.DescriptionUtil');

/**
 * @constructor
 * @extends {cvox.AbstractNodeWalker}
 */
cvox.ObjectWalker = function() {
  goog.base(this);
};
goog.inherits(cvox.ObjectWalker, cvox.AbstractNodeWalker);

// TODO(stoarca): Doesn't belong here. Not using anything out of this class.
/**
 * Finds the next selection that matches the predicate function starting from
 * sel. Undefined if the nodes in sel are not attached to the document.
 * @param {!cvox.CursorSelection} sel The selection from which to start.
 * @param {function(Array.<Node>):Node} predicate A function taking a
 * unique ancestor tree and outputting Node if the ancestor tree matches
 * the desired node to find.
 * @return {cvox.CursorSelection} The selection that was found.
 * null if end of document reached.
 */
cvox.ObjectWalker.prototype.findNext = function(sel, predicate) {
  var r = sel.isReversed();
  var cur = sel.clone();

  // We may have been sync'ed into a subtree of the current predicate match.
  // Find our ancestor that matches the predicate.
  var ancestor;
  if (ancestor = predicate(cvox.DomUtil.getAncestors(cur.start.node))) {
    cur = cvox.CursorSelection.fromNode(ancestor).setReversed(r);
  }
  // TODO(stoarca): replace this with a nicer construct for safe infinite loop
  for (var i = 0; i < 1000; ++i) {
    // Use ObjectWalker's traversal which guarantees us a stable iteration of
    // the DOM including returning null at page bounds.
    cur = this.next(cur || this.syncToPageBeginning({reversed: r}));
    var retNode = null;

    if (!cur ||
        (retNode = predicate(cvox.DomUtil.getAncestors(cur.start.node)))) {
      return retNode ? cvox.CursorSelection.fromNode(retNode) : null;
    }
  }
  if (i == 1000) {
    window.console.log('INFINITE LOOP!');
  }
  return null;
};

/**
 * @override
 */
cvox.ObjectWalker.prototype.stopNodeDescent = function(node) {
  return cvox.DomUtil.isLeafNode(node);
};

// TODO(dtseng): Causes a circular dependency if put into AbstractNodeWalker.
/**
 * @override
 */
cvox.AbstractNodeWalker.prototype.getDescription = function(prevSel, sel) {
  return [cvox.DescriptionUtil.getDescriptionFromAncestors(
      cvox.DomUtil.getUniqueAncestors(prevSel.end.node, sel.start.node),
      true,
      cvox.ChromeVox.verbosity)];
};

/**
 * @override
 */
cvox.ObjectWalker.prototype.getBraille = function(prevSel, sel) {
  return cvox.BrailleUtil.getBraille(prevSel, sel);
};

/**
 * @override
 */
cvox.ObjectWalker.prototype.getGranularityMsg = function() {
  return cvox.ChromeVox.msgs.getMsg('object_strategy');
};
