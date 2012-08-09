// Copyright 2011 Google Inc.
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
 * @fileoverview Subclasses cvox.BaseModifier to style the page in a clean,
 * simple way that helps sighted users understand what it'd be like to
 * experience this page as a blind user.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.ShadesModifier');
goog.require('cvox.XpathUtil');

/**
 * @constructor
 * @extends {cvox.BaseModifier}
 */
cvox.ShadesModifier = function() {
  cvox.BaseModifier.call(this);

  this.forceBlock = false;
};
goog.inherits(cvox.ShadesModifier, cvox.BaseModifier);


/**
 * @param {Node} node The node to check.
 * @return {boolean} True if this node is a control.
 */
cvox.ShadesModifier.prototype.isControl = function(node) {
  var role = '';
  if (node.style) {
    role = node.getAttribute('role');
  }
  if (node.constructor == HTMLButtonElement ||
      node.constructor == HTMLSelectElement ||
      (node.constructor == HTMLAnchorElement && node.href) ||
      (node.constructor == HTMLInputElement && node.type != 'hidden') ||
      role == 'alert' ||
      role == 'alertdialog' ||
      role == 'button' ||
      role == 'checkbox' ||
      role == 'dialog' ||
      role == 'gridcell' ||
      role == 'link' ||
      role == 'log' ||
      role == 'marquee' ||
      role == 'menuitem' ||
      role == 'menuitemcheckbox' ||
      role == 'menuitemradio' ||
      role == 'option' ||
      role == 'progressbar' ||
      role == 'radio' ||
      role == 'scrollbar' ||
      role == 'slider' ||
      role == 'spinbutton' ||
      role == 'status' ||
      role == 'tab' ||
      role == 'tabpanel' ||
      role == 'textbox' ||
      role == 'timer' ||
      role == 'tooltip' ||
      role == 'treeitem') {
    return true;
  }

  return false;
};

/**
 * @param {Node} node The node to check.
 * @return {boolean} True if this node should be considered a leaf node.
 */
cvox.ShadesModifier.prototype.isLeafNode = function(node) {
  if (cvox.DomUtil.isLeafNode(node)) {
    return true;
  }

  if (this.isControl(node)) {
    return true;
  }

  return false;
};

/**
 * Extend processDOM by breaking apart tables in "quirks mode" docs.
 * In standards mode we can do this more easily with CSS.
 * @param {Element=} root The root node.
 * @override
 */
cvox.ShadesModifier.prototype.processDOM = function(root) {
  if (document.compatMode == 'BackCompat') {
    this.applyQuirksModeHacks();
  }

  this.forceBlock = false;

  cvox.BaseModifier.prototype.processDOM.call(this, root);
};

/**
 * Extend processNode to almost totally linearize the document and
 * organize it hierarchically. Tables are flattened and nodes are kept
 * to a minimal width.
 * @param {Node} node The node to examine.
 * @param {CSSStyleDeclaration} computedStyle The computed style before
 *     processing.
 * @param {number} indent The indent level of this node, relative to its
 *     offset parent.
 * @return {string} The new CSS style as text.
 */
cvox.ShadesModifier.prototype.processNode = function(
    node, computedStyle, indent) {
  var newStyle = cvox.BaseModifier.prototype.processNode.call(
      this, node, computedStyle, indent);

  // To avoid lots of extra whitespace, when we encounter a BR element,
  // just force the next element to be a block rather than adding an
  // explicit break.
  if (node.constructor == HTMLBRElement) {
    newStyle += ' display: none !important;';
    this.forceBlock = true;
  }
  if (this.forceBlock) {
    newStyle += ' display:block;';
  }
  this.forceBlock = false;

  if (node.style) {
    node.removeAttribute('align');
  }

  if (computedStyle && computedStyle.display == 'inline-block') {
    newStyle += ' display:block;';
  }

  if (node.constructor == HTMLInputElement &&
      !node.hasAttribute('placeholder')) {
    var label = cvox.DomUtil.getName(node);
    if (label) {
      node.setAttribute('placeholder', label);
    }
  }

  // Put each link on its own line.
  if ((node.constructor == HTMLAnchorElement && node.href) ||
      (node.style && node.getAttribute('role') == 'link')) {
    var isFirstInBlock = true;
    var inlineNode = node;
    var inlineDisplay = computedStyle.display;
    while (inlineDisplay != 'block' &&
           inlineNode != document.body) {
      if (inlineNode.previousSibling) {
        isFirstInBlock = false;
        break;
      }
      inlineNode = inlineNode.parentNode;
      var inlineStyle = window.getComputedStyle(
          /** @type {Element} */(inlineNode), null);
      if (inlineStyle) {
        inlineDisplay = inlineStyle.display;
      }
    }

    if (!isFirstInBlock) {
      node.setAttribute('forceNewline', ' ');
    }
  }

  if (node.constructor == HTMLIFrameElement) {
    newStyle += ' width: 40em !important;';
  } else {
    newStyle += ' max-width: 30em;';
  }

  if (node.constructor == HTMLUListElement ||
      node.constructor == HTMLOListElement ||
      node.constructor == HTMLImageElement ||
      node.constructor == HTMLIFrameElement ||
      node.constructor == HTMLTableCellElement ||
      node.constructor == HTMLTableRowElement ||
      (this.isLeafNode(node) && cvox.DomUtil.getName(node))) {
    newStyle += ' display:block;';
  }

  if (node.constructor == HTMLLIElement) {
    newStyle += ' display:list-item;';
  }

  if (indent != 0) {
    newStyle += ' margin-left: ' + indent + 'em !important;';
  }

  return newStyle;
};

/**
 * Break apart tables in "quirks mode" docs.  In standards mode we can
 * do this more easily with CSS.
 */
cvox.ShadesModifier.prototype.applyQuirksModeHacks = function() {
  var tables = document.getElementsByTagName('TABLE');
  for (var i = 0; i < tables.length; i++) {
    var table = tables[i];
    var rows = cvox.XpathUtil.evalXPath('child::tbody/tr', table);
    for (var j = 0; j < rows.length; j++) {
      var row = rows[j];
      var cells = cvox.XpathUtil.evalXPath('child::td | child::th', row);
      for (var k = 1; k < cells.length; k++) {
        var cell = cells[k];
        var newRow = document.createElement('TR');
        if (row.nextSibling) {
          row.parentElement.insertBefore(newRow, row.nextSibling);
        } else {
          row.parentElement.appendChild(newRow);
        }
        newRow.appendChild(cell);
        row = newRow;
      }
    }
  }
};
