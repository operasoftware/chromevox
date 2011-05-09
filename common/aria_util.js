// Copyright 2010 Google Inc.
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
 * @fileoverview A collection of JavaScript utilities used to simplify working
 * with ARIA (http://www.w3.org/TR/wai-aria).
 * @author clchen@google.com (Charles L. Chen)
 */


goog.provide('cvox.AriaUtil');


/**
 * Create the namespace
 * @constructor
 */
cvox.AriaUtil = function() {
};

/**
 * @type {string}
 */
cvox.AriaUtil.MIN = 'Min ';

/**
 * @type {string}
 */
cvox.AriaUtil.MAX = 'Max ';

/**
 * @type {Object.<string, string>}
 */
cvox.AriaUtil.WIDGET_ROLE_TO_NAME = {
  'alert' : 'Alert',
  'alertdialog' : 'Alert dialog',
  'button' : 'Button',
  'checkbox' : 'Check box',
  'combobox' : 'Combo box',
  'dialog' : 'Dialog',
  'gridcell' : 'Grid cell',
  'link' : 'Link',
  'log' : 'Log',
  'marquee' : 'Marquee',
  'menuitem' : 'Menu item',
  'menuitemcheckbox' : 'Menu item check box',
  'menuitemradio' : 'Menu item radio button',
  'option' : 'Option',
  'progressbar' : 'Progress bar',
  'radio' : 'Radio button',
  'radiogroup' : 'Radio button group',
  'scrollbar' : 'Scroll bar',
  'slider' : 'Slider',
  'spinbutton' : 'Spin button',
  'status' : 'Status',
  'tab' : 'Tab',
  'tabpanel' : 'Tab panel',
  'textbox' : 'Text box',
  'timer' : 'Timer',
  'toolbar' : 'Tool bar',
  'tooltip' : 'Tool tip',
  'treeitem' : 'Tree item'
};

/**
 * @type {Object.<string, string>}
 */
cvox.AriaUtil.STRUCTURE_ROLE_TO_NAME = {
  'article' : 'Article',
  'columnheader' : 'Column header',
  'definition' : 'Definition',
  'directory' : 'Directory',
  'document' : 'Document',
  'group' : 'Group',
  'heading' : 'Heading',
  'img' : 'Image',
  'list' : 'List',
  'listitem' : 'List item',
  'math' : 'Math',
  'note' : 'Note',
  'region' : 'Region',
  'row' : 'Row',
  'rowheader' : 'Row header',
  'separator' : 'Separator'
};

/**
 * @type {Array.<Object>}
 */
cvox.AriaUtil.ATTRIBUTE_VALUE_TO_STATUS = [
  { name: 'aria-autocomplete', values:
        {'inline': 'Autocompletion inline', 'list': 'Autocompletion list',
          'both': 'Autocompletion inline and list'} },
  { name: 'aria-checked', values:
        {'true': 'Checked', 'false': 'Not checked',
          'mixed': 'Partially checked'} },
  { name: 'aria-disabled', values: {'true': 'Disabled'} },
  { name: 'aria-expanded', values:
        {'true': 'Expanded', 'false': 'Collapsed'} },
  { name: 'aria-haspopup', values: {'true': 'Has pop up'} },
  { name: 'aria-invalid', values:
        {'true': 'Invalid input', 'grammar': 'Grammatical mistake detected',
          'spelling': 'Spelling mistake detected'} },
  { name: 'aria-multiline', values: {'true': 'Multi line'} },
  { name: 'aria-multiselectable', values: {'true': 'Multi select'} },
  { name: 'aria-pressed', values:
        {'true': 'Pressed', 'false': 'Not pressed',
          'mixed': 'Partially pressed'} },
  { name: 'aria-readonly', values: {'true': 'Read only'} },
  { name: 'aria-required', values: {'true': 'Required'} },
  { name: 'aria-selected', values:
        {'true': 'Selected', 'false': 'Not selected'} }
];

/**
 * Checks if a node should be treated as a hidden node because of its ARIA
 * markup.
 *
 * @param {Object} targetNode The node to check.
 * @return {boolean} True if the targetNode should be treated as hidden.
 */
cvox.AriaUtil.isHidden = function(targetNode) {
  while (targetNode) {
    if (targetNode.getAttribute) {
      if (targetNode.getAttribute('role') == 'presentation') {
        return true;
      }
      if (targetNode.getAttribute('aria-hidden') == 'true') {
        return true;
      }
    }
    targetNode = targetNode.parentNode;
  }
  return false;
};

/**
 * Returns a string to be presented to the user that identifies what the
 * targetNode's role is.
 *
 * @param {Object} targetNode The node to get the role name for.
 * @return {string} The role name for the targetNode.
 */
cvox.AriaUtil.getRoleName = function(targetNode) {
  var roleName;
  if (targetNode && targetNode.getAttribute) {
    var role = targetNode.getAttribute('role');
    roleName = cvox.AriaUtil.WIDGET_ROLE_TO_NAME[role];
    if (!roleName) {
      roleName = cvox.AriaUtil.STRUCTURE_ROLE_TO_NAME[role];
    }
  }
  if (!roleName) {
    roleName = '';
  }
  return roleName;
};

/**
 * Returns a string that gives information about the state of the targetNode.
 *
 * @param {Object} targetNode The node to get the state information for.
 * @return {string} The status information about the node.
 */
cvox.AriaUtil.getState = function(targetNode) {
  var state = '';
  if (targetNode && targetNode.getAttribute) {
    for (var i = 0, attr; attr = cvox.AriaUtil.ATTRIBUTE_VALUE_TO_STATUS[i];
        i++) {
      var value = targetNode.getAttribute(attr.name);
      var status = attr.values[value];
      if (status) {
        state = state + ' ' + status;
      }
    }
    // Add in the numeric/textual values
    if (targetNode.getAttribute('aria-valuetext')) {
      state = state + ' ' + targetNode.getAttribute('aria-valuetext');
    } else if (targetNode.getAttribute('aria-valuenow')) {
      state = state + ' ' + targetNode.getAttribute('aria-valuenow');
    }
    if (targetNode.getAttribute('aria-valuemin')) {
      state = state + ' ' + cvox.AriaUtil.MIN +
          targetNode.getAttribute('aria-valuemin');
    }
    if (targetNode.getAttribute('aria-valuemax')) {
      state = state + ' ' + cvox.AriaUtil.MAX +
          targetNode.getAttribute('aria-valuemax');
    }
  }
  return state;
};

/**
 * Given a node, returns true if it's an ARIA control widget.
 *
 * @param {Object} targetNode The node to be checked.
 * @return {boolean} Whether the targetNode is an ARIA control widget.
 */
cvox.AriaUtil.isControlWidget = function(targetNode) {
  if (targetNode && targetNode.getAttribute) {
    var role = targetNode.getAttribute('role');
    switch (role) {
      case 'button':
      case 'checkbox':
      case 'combobox':
      case 'menuitemcheckbox':
      case 'menuitemradio':
      case 'radio':
      case 'slider':
      case 'spinbutton':
      case 'textbox':
        return true;
    }
  }
  return false;
};

/**
 * Given a node, returns its live region value.
 *
 * @param {Node} node The node to be checked.
 * @return {?string} The live region value, like 'polite' or
 *     'assertive', or null if none.
 */
cvox.AriaUtil.getLiveRegionValue = function(node) {
  if (!node.hasAttribute)
    return null;
  var value = node.getAttribute('aria-live');
  if (value) {
    return value;
  }
  var role = node.getAttribute('role');
  switch (role) {
    case 'alert':
      return 'assertive';
    case 'log':
    case 'status':
      return 'polite';
    default:
      return null;
  }
};

/**
 * Given a node, return all live regions that are either rooted at this
 * node or contain this node.
 *
 * @param {Node} node The node to be checked.
 * @return {Array.<Element>} All live regions affected by this node changing.
 */
cvox.AriaUtil.getLiveRegions = function(node) {
  var result = [];
  if (node.querySelectorAll) {
    var nodes = node.querySelectorAll(
        '[role="alert"], [role="log"],  [role="marquee"], ' +
        '[role="status"], [role="timer"],  [aria-live]');
    if (nodes) {
      for (var i = 0; i < nodes.length; i++) {
        result.push(nodes[i]);
      }
    }
  }

  while (node) {
    if (cvox.AriaUtil.getLiveRegionValue(node)) {
      result.push(node);
      return result;
    }
    node = node.parentElement;
  }

  return result;
};
