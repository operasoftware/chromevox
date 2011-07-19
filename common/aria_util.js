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


cvoxgoog.provide('cvox.AriaUtil');


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
  'listbox' : 'List box',
  'log' : 'Log',
  'marquee' : 'Marquee',
  'menu' : 'Menu',
  'menubar' : 'Menu bar',
  'menuitemcheckbox' : 'Menu item check box',
  'menuitemradio' : 'Menu item radio button',
  'option': ' ',
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
  'application' : 'Application',
  'banner' : 'Banner',
  'columnheader' : 'Column header',
  'complementary' : 'Complementary',
  'contentinfo' : 'Content info',
  'definition' : 'Definition',
  'directory' : 'Directory',
  'document' : 'Document',
  'form' : 'Form',
  'group' : 'Group',
  'heading' : 'Heading',
  'img' : 'Image',
  'list' : 'List',
  'listitem' : 'List item',
  'main' : 'Main',
  'math' : 'Math',
  'navigation' : 'Navigation',
  'note' : 'Note',
  'region' : 'Region',
  'row' : 'Row',
  'rowheader' : 'Row header',
  'search' : 'Search',
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
 * Checks if a node should be treated as a leaf node because of its ARIA
 * markup.
 *
 * @param {Object} targetNode The node to check.
 * @return {boolean} True if the targetNode should be treated as a leaf node.
 */
cvox.AriaUtil.isLeafNode = function(targetNode) {
  while (targetNode) {
    if (targetNode.getAttribute) {
      var role = targetNode.getAttribute('role');
      if (role == 'img' ||
          role == 'progressbar') {
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
      if ((role == 'heading') && (targetNode.hasAttribute('aria-level'))) {
        roleName = roleName + ' ' + targetNode.getAttribute('aria-level');
      }
    }

    // To a user, a menu item within a menu bar is called a "menu";
    // any other menu item is called a "menu item".
    if (role == 'menuitem') {
      var container = targetNode.parentElement;
      while (container) {
        if (container.getAttribute &&
            (container.getAttribute('role') == 'menu' ||
             container.getAttribute('role') == 'menubar')) {
          break;
        }
        container = container.parentElement;
      }
      if (container && container.getAttribute('role') == 'menubar') {
        roleName = 'Menu';
      } else {
        roleName = 'Menu item';
      }
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
 * @param {boolean} primary Whether this is the primary node we're
 *     interested in, where we might want extra information - as
 *     opposed to an ancestor, where we might be more brief.
 * @return {string} The status information about the node.
 */
cvox.AriaUtil.getState = function(targetNode, primary) {
  var state = '';
  if (!targetNode || !targetNode.getAttribute) {
    return state;
  }

  for (var i = 0, attr; attr = cvox.AriaUtil.ATTRIBUTE_VALUE_TO_STATUS[i];
      i++) {
    var value = targetNode.getAttribute(attr.name);
    var status = attr.values[value];
    if (status) {
      state = state + ' ' + status;
    }
  }

  var role = targetNode.getAttribute('role');
  if (targetNode.getAttribute('aria-haspopup') == 'true') {
    if (role == 'menu') {
      state = state + ' has submenu';
    } else {
      state = state + ' has pop up';
    }
  }

  var valueText = targetNode.getAttribute('aria-valuetext');
  if (valueText) {
    // If there is a valueText, that always wins.
    return state + ' ' + valueText;
  }

  var valueNow = targetNode.getAttribute('aria-valuenow');
  var valueMin = targetNode.getAttribute('aria-valuemin');
  var valueMax = targetNode.getAttribute('aria-valuemax');

  // Scrollbar and progressbar should speak the percentage.
  // http://www.w3.org/TR/wai-aria/roles#scrollbar
  // http://www.w3.org/TR/wai-aria/roles#progressbar
  if ((valueNow != null) && (valueMin != null) && (valueMax != null)) {
    if ((role == 'scrollbar') || (role == 'progressbar')) {
      var percent = Math.round((valueNow / (valueMax - valueMin)) * 100);
      return state + ' ' + percent + '%';
    }
  }

  // Return as many of the value attributes as possible.
  if (valueNow != null) {
    state = state + ' ' + valueNow;
  }
  if (valueMin != null) {
    state = state + ' ' + cvox.AriaUtil.MIN + valueMin;
  }
  if (valueMax != null) {
    state = state + ' ' + cvox.AriaUtil.MAX + valueMax;
  }

  // If this is a composite control or an item within a composite control,
  // get the index and count of the current descendant or active
  // descendant.
  var parentControl = targetNode;
  var currentDescendant = null;

  if (cvox.AriaUtil.isCompositeControl(parentControl) && primary) {
    currentDescendant = cvox.AriaUtil.getActiveDescendant(parentControl);
  } else {
    var role = targetNode.getAttribute('role');
    if (role == 'option' ||
        role == 'menuitem' ||
        role == 'menuitemcheckbox' ||
        role == 'menuitemradio' ||
        role == 'radio' ||
        role == 'tab' ||
        role == 'treeitem') {
      currentDescendant = targetNode;
      parentControl = targetNode.parentElement;
      while (parentControl &&
             !cvox.AriaUtil.isCompositeControl(parentControl)) {
        parentControl = parentControl.parentElement;
      }
    }
  }

  if (parentControl &&
      cvox.AriaUtil.isCompositeControl(parentControl) &&
      currentDescendant) {
    var parentRole = parentControl.getAttribute('role');
    var descendantSelector;
    switch (parentRole) {
      case 'combobox':
        descendantSelector = '*[role~="option"]';
        break;
      case 'grid':
      case 'listbox':
        descendantSelector = '*[role~="option"]';
        break;
      case 'menu':
        descendantSelector = '*[role~="menuitem"] ' +
                             '*[role~="menuitemcheck"] ' +
                             '*[role~="menuitemradio"]';
        break;
      case 'radiogroup':
        descendantSelector = '*[role~="radio"]';
        break;
      case 'tablist':
        descendantSelector = '*[role~="tab"]';
        break;
      case 'tree':
      case 'treegrid':
        descendantSelector = '*[role~="treeitem"]';
        break;
    }

    if (descendantSelector) {
      var descendants = parentControl.querySelectorAll(descendantSelector);
      var currentIndex = null;
      for (var j = 0; j < descendants.length; j++) {
        if (descendants[j] == currentDescendant) {
          currentIndex = j + 1;
        }
      }
      if (currentIndex) {
        state = state + ' ' + currentIndex + ' of ' + descendants.length;
      }
    }
  }

  return state;
};

/**
 * If the node is an object with an active descendant, returns the
 * descendant node.
 *
 * @param {Object} targetNode The node to get descendant information for.
 * @return {Node} The descendant node.
 */
cvox.AriaUtil.getActiveDescendant = function(targetNode) {
  if (!targetNode.getAttribute) {
    return null;
  }

  var activeId = targetNode.getAttribute('aria-activedescendant');
  if (!activeId) {
    return null;
  }
  var activeNode = document.getElementById(activeId);
  return activeNode;
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
      case 'listbox':
      case 'menu':
      case 'menuitemcheckbox':
      case 'menuitemradio':
      case 'radio':
      case 'slider':
      case 'progressbar':
      case 'scrollbar':
      case 'spinbutton':
      case 'tab':
      case 'tablist':
      case 'textbox':
        return true;
    }
  }
  return false;
};

/**
 * Given a node, returns true if it's an ARIA composite control.
 *
 * @param {Object} targetNode The node to be checked.
 * @return {boolean} Whether the targetNode is an ARIA composite control.
 */
cvox.AriaUtil.isCompositeControl = function(targetNode) {
  if (targetNode && targetNode.getAttribute) {
    var role = targetNode.getAttribute('role');
    switch (role) {
      case 'combobox':
      case 'grid':
      case 'listbox':
      case 'menu':
      case 'menubar':
      case 'radiogroup':
      case 'tablist':
      case 'tree':
      case 'treegrid':
        return true;
    }
  }
  return false;
};

/**
 * Given a node, returns its 'aria-live' value if it's a live region, or
 * null otherwise.
 *
 * @param {Node} node The node to be checked.
 * @return {?string} The live region value, like 'polite' or
 *     'assertive', or null if 'off' or none.
 */
cvox.AriaUtil.getAriaLive = function(node) {
  if (!node.hasAttribute)
    return null;
  var value = node.getAttribute('aria-live');
  if (value == 'off') {
    return null;
  } else if (value) {
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
 * Given a node, returns its 'aria-atomic' value.
 *
 * @param {Node} node The node to be checked.
 * @return {boolean} The aria-atomic live region value, either true or false.
 */
cvox.AriaUtil.getAriaAtomic = function(node) {
  if (!node.hasAttribute)
    return false;
  var value = node.getAttribute('aria-atomic');
  if (value) {
    return (value === 'true');
  }
  var role = node.getAttribute('role');
  if (role == 'alert') {
    return true;
  }
  return false;
};

/**
 * Given a node, returns its 'aria-busy' value.
 *
 * @param {Node} node The node to be checked.
 * @return {boolean} The aria-busy live region value, either true or false.
 */
cvox.AriaUtil.getAriaBusy = function(node) {
  if (!node.hasAttribute)
    return false;
  var value = node.getAttribute('aria-busy');
  if (value) {
    return (value === 'true');
  }
  return false;
};

/**
 * Given a node, checks its aria-relevant attribute (with proper inheritance)
 * and determines whether the given change (additions, removals, text, all)
 * is relevant and should be announced.
 *
 * @param {Node} node The node to be checked.
 * @param {string} change The name of the change to check - one of
 *     'additions', 'removals', 'text', 'all'.
 * @return {boolean} True if that change is relevant to that node as part of
 *     a live region.
 */
cvox.AriaUtil.getAriaRelevant = function(node, change) {
  if (!node.hasAttribute)
    return false;
  var value;
  if (node.hasAttribute('aria-relevant')) {
    value = node.getAttribute('aria-relevant');
  } else {
    value = 'additions text';
  }
  if (value == 'all') {
    value = 'additions removals text';
  }

  var tokens = value.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').split(' ');

  if (change == 'all') {
    return (tokens.indexOf('additions') >= 0 &&
            tokens.indexOf('text') >= 0 &&
            tokens.indexOf('removals') >= 0);
  } else {
    return (tokens.indexOf(change) >= 0);
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
    if (cvox.AriaUtil.getAriaLive(node)) {
      result.push(node);
      return result;
    }
    node = node.parentElement;
  }

  return result;
};

/**
 * Checks to see whether or not a node is an ARIA landmark.
 *
 * @param {Node} node The node to be checked.
 * @return {boolean} Whether or not the node is an ARIA landmark.
 */
cvox.AriaUtil.isLandmark = function(node) {
    if (!node || !node.getAttribute) {
      return false;
    }
    var role = node.getAttribute('role');
    switch (role) {
      case 'application':
      case 'banner':
      case 'complementary':
      case 'contentinfo':
      case 'form':
      case 'main':
      case 'navigation':
      case 'search':
        return true;
    }
    return false;
};

