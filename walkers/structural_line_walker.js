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
 * @fileoverview A JavaScript class for walking lines.
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.StructuralLineWalker');

goog.require('cvox.AbstractSelectionWalker');
goog.require('cvox.TraverseContent');

/**
 * @constructor
 * @extends {cvox.AbstractSelectionWalker}
 */
cvox.StructuralLineWalker = function() {
  goog.base(this);
  this.grain = cvox.TraverseContent.kLine;
};
goog.inherits(cvox.StructuralLineWalker, cvox.AbstractSelectionWalker);


/**
 * @override
 */
cvox.StructuralLineWalker.prototype.getGranularityMsg = function() {
  return cvox.ChromeVox.msgs.getMsg('structural_line');
};


/**
 * @override
 */
cvox.StructuralLineWalker.prototype.getDescription = function(prevSel, sel) {
  var desc = goog.base(this, 'getDescription', prevSel, sel);
  desc[0].text = cvox.DomUtil.getPrefixText(
      sel.absStart().node, sel.absStart().index) + desc[0].text;
  return desc;
};


/**
 * @override
 */
cvox.StructuralLineWalker.prototype.getBraille = function(prevSel, sel) {
  var braille = goog.base(this, 'getBraille', prevSel, sel);

  var objNode = this.objWalker_.sync(sel).absStart().node;
  var node = sel.absStart().node;
  var prevNode = prevSel.absEnd().node;

  // Show only the visible line in braille for DOM ranges. This overrides any
  // labels computed for the node.
  //
  // <textarea> needs to be treated specially. It may have TextNode children,
  // but these reflect the initial value of the node only, and are not updated
  // as content changes.
  var name = undefined;
  if (!sel.start.equals(sel.end) &&
      !cvox.DomPredicates.editTextPredicate([objNode])) {
    var prefix =
        cvox.DomUtil.getPrefixText(sel.absStart().node, sel.absStart().index);
    name = prefix + sel.getText();
  }
  var spannable =
      cvox.BrailleUtil.getTemplated(prevNode, objNode, {name: name});
  spannable.setSpan(objNode, 0, spannable.getLength());
  braille.text = spannable;

  // Remove any selections.
  braille.startIndex = 0;
  braille.endIndex = 0;
  return braille;
};
