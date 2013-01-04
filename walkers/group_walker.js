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
 * @fileoverview A class for walking "groups". Groups, intuitively, are logical
 * collections of dom elements. See AbstractNodeWalker and the
 * stopNodeDescent() method here for how groups are defined.
 * @author stoarca@google.com (Sergiu Toarca)
 */


goog.provide('cvox.GroupWalker');

goog.require('cvox.AbstractNodeWalker');
goog.require('cvox.BrailleUtil');
goog.require('cvox.ChoiceWidget');
goog.require('cvox.CursorSelection');
goog.require('cvox.DescriptionUtil');
goog.require('cvox.DomUtil');
goog.require('cvox.GroupUtil');


/**
 * @constructor
 * @extends {cvox.AbstractNodeWalker}
 */
cvox.GroupWalker = function() {
  cvox.AbstractNodeWalker.call(this);
};
goog.inherits(cvox.GroupWalker, cvox.AbstractNodeWalker);

/**
 * @override
 */
cvox.GroupWalker.prototype.act = function(sel) {
  var node = sel.start.node;
  if (node && node.tagName && node.tagName == 'A') {
    cvox.DomUtil.clickElem(node, false);
    return true;
  } else {
    var aNodes = node.getElementsByTagName('A');
    if (aNodes.length == 1) {
      cvox.DomUtil.clickElem(aNodes[0], false);
      return true;
    } else if (aNodes.length > 1) {
      var descriptions = new Array();
      var functions = new Array();
      for (var i = 0; i < aNodes.length; ++i) {
        var link = aNodes[i];
        if (cvox.DomUtil.hasContent(link)) {
          descriptions.push(
              cvox.DomUtil.collapseWhitespace(cvox.DomUtil.getName(link)));
          functions.push(cvox.DomUtil.createSimpleClickFunction(link));
        }
      }
      var widget = new cvox.ChoiceWidget(descriptions, functions);
      widget.show();
      return true;
    }
    return false;
  }
};

/**
 * @override
 */
cvox.GroupWalker.prototype.getDescription = function(prevSel, sel) {
  return cvox.DescriptionUtil.getCollectionDescription(prevSel, sel);
};


/**
 * @override
 */
cvox.GroupWalker.prototype.getBraille = function(prevSel, sel) {
  return cvox.BrailleUtil.getBraille(prevSel, sel);
};

/**
 * @override
 */
cvox.GroupWalker.prototype.getGranularityMsg = function() {
  return cvox.ChromeVox.msgs.getMsg('group_strategy');
};

/**
 * @override
 */
cvox.GroupWalker.prototype.stopNodeDescent = function(node) {
  return cvox.GroupUtil.isLeafNode(node);
};
