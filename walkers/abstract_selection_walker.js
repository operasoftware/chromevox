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
 * @fileoverview An abstract class for walking at the sub-element level.
 * For example, walking at the sentence, word, or character level.
 * This class is an adapter around TraverseContent which exposes the interface
 * required by walkers. Subclasses must override the this.grain attribute
 * on initialization.
 * @author stoarca@google.com (Sergiu Toarca)
 */


goog.provide('cvox.AbstractSelectionWalker');

goog.require('cvox.AbstractWalker');
goog.require('cvox.BareObjectWalker');
goog.require('cvox.DescriptionUtil');
goog.require('cvox.DomUtil');
goog.require('cvox.TraverseContent');

/**
 * @constructor
 * @extends {cvox.AbstractWalker}
 */
cvox.AbstractSelectionWalker = function() {
  cvox.AbstractWalker.call(this);
  this.jumper_ = new cvox.BareObjectWalker();
  this.tc_ = new cvox.TraverseContent();
  this.grain /** @protected */ = ''; // child must override
};
goog.inherits(cvox.AbstractSelectionWalker, cvox.AbstractWalker);

/**
 * @override
 */
cvox.AbstractSelectionWalker.prototype.next = function(sel) {
  var r = sel.isReversed();
  this.tc_.syncToCursorSelection(sel.clone().setReversed(false));
  var ret;
  if (r) {
    ret = this.tc_.prevElement(this.grain);
  } else {
    ret = this.tc_.nextElement(this.grain);
  }
  if (ret == null) {
    return null;
  }
  var retsel = this.tc_.getCurrentCursorSelection().setReversed(r);
  if (!cvox.DomUtil.isDescendantOfNode(retsel.end.node, sel.end.node)) {
    var temp = this.jumper_.next(sel);
    while (temp && temp.start.node != retsel.end.node) {
      if (temp && cvox.DomUtil.isControl(temp.start.node)) {
        temp.start.node.focus();
        return temp;
      }
      temp = this.jumper_.next(temp);
    }
  }
  // TODO(stoarca): This doesn't belong here. We shouldn't know anything about
  // when the selection should be highlighted. Move this up to
  // NavigationManager.
  this.tc_.updateSelection();
  return retsel;
};

/**
 * @override
 */
cvox.AbstractSelectionWalker.prototype.sync = function(sel) {
  var r = sel.isReversed();
  var newSel = null;
  if (sel.start.equals(sel.end)) {
    var node = sel.start.node;
    while (node && cvox.DomUtil.directedFirstChild(node, r)) {
      node = cvox.DomUtil.directedFirstChild(node, r);
    }
    newSel = cvox.CursorSelection.fromNode(node);
  } else {
    newSel = sel.clone();
    newSel.end = newSel.start;
  }

  if (r) {
    newSel.start.index = newSel.start.text.length;
    newSel.end.index = newSel.start.index;
    newSel.setReversed(true);
  }

  // Selection syncs to the beginning when a page boundary is reached.
  // TODO(dtseng): The sync invariant appears to be violated here; should be a
  // previous + next pair to sync to current selection.
  return this.next(/** @type {!cvox.CursorSelection} */ (newSel)) ||
      cvox.CursorSelection.fromBody().setReversed(sel.isReversed());
};

/**
 * @override
 */
cvox.AbstractSelectionWalker.prototype.getDescription = function(prevSel, sel) {
  var description = cvox.DescriptionUtil.getDescriptionFromAncestors(
      cvox.DomUtil.getUniqueAncestors(prevSel.end.node, sel.start.node),
      true,
      cvox.ChromeVox.verbosity);
  description.text = sel.getText();
  return [description];
};
