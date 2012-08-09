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
goog.require('cvox.AriaUtil');
goog.require('cvox.CursorSelection');
goog.require('cvox.DescriptionUtil');
goog.require('cvox.DomUtil');


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
cvox.GroupWalker.prototype.act = function(sel, choiceWidget) {
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
      choiceWidget.init(descriptions, functions, descriptions.toString());
      choiceWidget.show();
      return true;
    }
    return false;
  }
};

/**
 * @override
 */
cvox.GroupWalker.prototype.canAct = function(sel) {
  if (sel.start.node.tagName && sel.start.node.tagName == 'A') {
    return true;
  }
  if (sel.start.node.getElementsByTagName) {
    var aNodes = sel.start.node.getElementsByTagName('A');
    if (aNodes.length > 0) {
      return true;
    }
  }
  return false;
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
cvox.GroupWalker.prototype.getGranularityMsg = function() {
  return cvox.ChromeVox.msgs.getMsg('group_strategy');
};

/**
 * @type {number}
 * @const
 * If a node contains more characters than this, it should not be treated
 * as a leaf node by the smart navigation algorithm.
 *
 * This number was determined by looking at the average number of
 * characters in a paragraph:
 * http://www.fullondesign.co.uk/design/usability/
 * 285-how-many-characters-per-a-page-is-normal.htm
 * and then trying it out on a few popular websites (CNN, BBC,
 * Google Search, etc.) and making sure it made sense.
 * @private
 */
cvox.GroupWalker.SMARTNAV_MAX_CHARCOUNT_ = 1500;


/**
 * @type {string}
 * If a node contains any of these elements, it should not be treated
 * as a leaf node by the smart navigation algorithm.
 * @private
 * @const
 */
cvox.GroupWalker.SMARTNAV_BREAKOUT_SELECTOR_ = 'blockquote,' +
    'button,' +
    'code,' +
    'form,' +
    'frame,' +
    'h1,' +
    'h2,' +
    'h3,' +
    'h4,' +
    'h5,' +
    'h6,' +
    'hr,' +
    'iframe,' +
    'input,' +
    'object,' +
    'ol,' +
    'p,' +
    'pre,' +
    'select,' +
    'table,' +
    'tr,' +
    'ul,' +
    // Aria widget roles
    '[role~="alert ' +
    'alertdialog ' +
    'button ' +
    'checkbox ' +
    'combobox ' +
    'dialog ' +
    'log ' +
    'marquee ' +
    'menubar ' +
    'progressbar ' +
    'radio ' +
    'radiogroup ' +
    'scrollbar ' +
    'slider ' +
    'spinbutton ' +
    'status ' +
    'tab ' +
    'tabpanel ' +
    'textbox ' +
    'toolbar ' +
    'tooltip ' +
    'treeitem ' +
    // Aria structure roles
    'article ' +
    'document ' +
    'group ' +
    'heading ' +
    'img ' +
    'list ' +
    'math ' +
    'region ' +
    'row ' +
    'separator"]';


/**
 * @override
 */
cvox.GroupWalker.prototype.stopNodeDescent = function(node) {
  // TODO (stoarca): Write test to make sure that this function satisfies
  // the restriction in the base class.
  if (node.tagName == 'LABEL') {
    return cvox.DomUtil.isLeafNode(node);
  }
  if (cvox.DomUtil.isLeafNode(node)) {
    return true;
  }

  if (!cvox.DomUtil.isSemanticElt(node)) {
    var breakingNodes = node.querySelectorAll(
        cvox.GroupWalker.SMARTNAV_BREAKOUT_SELECTOR_);

    for (var i = 0; i < breakingNodes.length; ++i) {
      if (cvox.DomUtil.hasContent(breakingNodes[i])) {
        return false;
      }
    }
  }

  if (cvox.AriaUtil.isCompositeControl(node) &&
      !cvox.DomUtil.isFocusable(node)) {
    return false;
  }

  var content = cvox.DomUtil.collapseWhitespace(
      cvox.DomUtil.getValue(node) + ' ' +
      cvox.DomUtil.getName(node));
  if (content.length > cvox.GroupWalker.SMARTNAV_MAX_CHARCOUNT_) {
    return false;
  }

  if (content.replace(/\s/g, '') === '') {
    // Text only contains whitespace
    return false;
  }

  return true;
};

