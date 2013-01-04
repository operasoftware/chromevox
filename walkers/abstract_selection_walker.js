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
  this.objWalker_ = new cvox.BareObjectWalker();
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
  var ret = r ? this.tc_.prevElement(this.grain) :
      this.tc_.nextElement(this.grain);
  if (ret == null) {
    return null;
  }
  var retSel = this.tc_.getCurrentCursorSelection().setReversed(r);
  var objSel = this.objWalker_.next(sel);

  // ObjectWalker wins when there's a discrepancy between it and
  // TraverseContent. The only exception is with an end cursor on a text node.
  // In all other cases, this makes sure we visit the same selections as
  // object walker.
  if (objSel &&
      (retSel.end.node.constructor != Text ||
          objSel.end.node.constructor != Text) &&
      !cvox.DomUtil.isDescendantOfNode(retSel.end.node, sel.end.node) &&
      !cvox.DomUtil.isDescendantOfNode(retSel.end.node, objSel.end.node)) {
    return objSel;
  }
  // TODO(stoarca): This doesn't belong here. We shouldn't know anything about
  // when the selection should be highlighted. Move this up to
  // NavigationManager.
  this.tc_.updateSelection();
  return retSel;
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
    if (r) {
      newSel.start = newSel.end;
    } else {
      newSel.end = newSel.start;
    }
  }

  // Selection syncs to the beginning when a page boundary is reached.
  // this.next places us at the correct initial position.
  return (this.next(newSel.setReversed(false)) ||
      cvox.CursorSelection.fromBody()).setReversed(r);
};

/**
 * @override
 */
cvox.AbstractSelectionWalker.prototype.getDescription = function(prevSel, sel) {
  var description = cvox.DescriptionUtil.getDescriptionFromAncestors(
      cvox.DomUtil.getUniqueAncestors(prevSel.end.node, sel.start.node),
      true,
      cvox.ChromeVox.verbosity);
  description.text = sel.getText() || description.text;
  return [description];
};

/**
 * @override
 */
cvox.AbstractSelectionWalker.prototype.getBraille = function(prevSel, sel) {
  return new cvox.NavBraille({
      text: cvox.TraverseUtil.getNodeText(sel.absStart().node),
      startIndex: sel.absStart().index,
      endIndex: sel.absEnd().index
    });
};
