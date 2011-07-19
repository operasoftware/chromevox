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
 * with the DOM.
 * @author clchen@google.com (Charles L. Chen)
 */


cvoxgoog.provide('cvox.DomUtil');

cvoxgoog.require('cvox.AriaUtil');
cvoxgoog.require('cvox.NavDescription');
cvoxgoog.require('cvox.XpathUtil');



/**
 * Create the namespace
 * @constructor
 */
cvox.DomUtil = function() {
};


/**
 * @type {Object}
 */
cvox.DomUtil.INPUT_TYPE_TO_INFORMATION_TABLE = {
  'button' : 'Button',
  'checkbox' : 'Check box',
  'color' : 'Color picker',
  'datetime' : 'Date time control',
  'datetime-local' : 'Date time control',
  'date' : 'Date control',
  'email' : 'Edit text for email',
  'file' : 'File selection',
  'hidden' : '',
  'image' : 'Button',
  'month' : 'Month control',
  'number' : 'Edit text numeric only',
  'password' : 'Password edit text',
  'radio' : 'Radio button',
  'range' : 'Slider',
  'reset' : 'Reset',
  'search' : 'Edit text for search',
  'submit' : 'Button',
  'tel' : 'Edit text for telephone number',
  'text' : 'Edit text',
  'url' : 'Edit text for URL',
  'week' : 'Week of the year control'
};


/**
 * @type {Object}
 */
cvox.DomUtil.TAG_TO_INFORMATION_TABLE = {
  'A' : 'Link',
  'BUTTON' : 'Button',
  'H1' : 'Heading 1',
  'H2' : 'Heading 2',
  'H3' : 'Heading 3',
  'H4' : 'Heading 4',
  'H5' : 'Heading 5',
  'H6' : 'Heading 6',
  'LI' : 'List item',
  'OL' : 'List',
  'SELECT' : 'List box',
  'TABLE' : 'Table',
  'TEXTAREA' : 'Text area',
  'UL' : 'List'
};


/**
 * Determines whether or not a style is invisible according to any CSS
 * criteria that can hide a node.
 *
 * @param {Object} style An object's style.
 * @return {boolean} True if the style is invisible.
 */
cvox.DomUtil.isInvisibleStyle = function(style) {
  if (!style) {
    return false;
  }
  if (style.display == 'none') {
    return true;
  }
  if (style.visibility == 'hidden') {
    return true;
  }
  if (style.opacity == 0) {
    return true;
  }
  return false;
};


/**
 * Determines whether a control is disabled.
 *
 * @param {Node} node The node to be examined.
 * @return {boolean} Whether or not the node is disabled.
 *
 */
cvox.DomUtil.isDisabled = function(node) {
  // TODO (gkonyukh) When http://b/issue?id=5021204 is fixed in Chrome, do the
  // respective fix here. For spec, see http://dev.w3.org/html5/
  // spec-author-view/attributes-common-to-form-controls.html#attr-fe-disabled
  if (node.getAttribute('disabled') != null) {
    return true;
  } else {
    return false;
  }
};


/**
 * Determines whether or not a node is a leaf node.
 *
 * @param {Node} node The node to be checked.
 * @return {boolean} True if the node is a leaf node.
 */
cvox.DomUtil.isLeafNode = function(node) {
  // Think of hidden nodes as spacer nodes; leaf node with no content.
  if (node.nodeType == 1) { // nodeType:1 == ELEMENT_NODE
    var style = document.defaultView.getComputedStyle(node, null);
    if (cvox.DomUtil.isInvisibleStyle(style)) {
      return true;
    }
  }
  if (cvox.AriaUtil.isHidden(node)) {
    return true;
  }
  if (cvox.AriaUtil.isLeafNode(node)) {
    return true;
  }
  if (node.tagName) {
    if (node.tagName == 'OBJECT') {
      return true;
    }
    if (node.tagName == 'EMBED') {
      return true;
    }
    if (node.tagName == 'VIDEO') {
      return true;
    }
    if (node.tagName == 'AUDIO') {
      return true;
    }
    if (node.tagName == 'IFRAME') {
      return true;
    }
    if (node.tagName == 'FRAME') {
      return true;
    }
    if (node.tagName == 'A' && node.getAttribute('href')) {
      var children = node.childNodes;
      var noChildrenWithContent = true;
      for (var i = 0; i < children.length; i++) {
        if (cvox.DomUtil.hasContent(children[i])) {
          noChildrenWithContent = false;
          break;
        }
      }
      if (noChildrenWithContent) {
        return true;
      }
    }
  }
  if (cvox.DomUtil.isControl(node)) {
    return true;
  }
  if (!node.firstChild) {
    return true;
  }
  return false;
};


/**
 * Determines whether or not a node is or is the descendant of a node
 * with a particular tag or class name.
 *
 * @param {Node} node The node to be checked.
 * @param {?string} tagName The tag to check for, or null if the tag
 * doesn't matter.
 * @param {?string=} className The class to check for, or null if the class
 * doesn't matter.
 * @return {boolean} True if the node or one of its ancestor has the specified
 * tag.
 */
cvox.DomUtil.isDescendantOf = function(node, tagName, className) {
  while (node) {

    if (tagName && className &&
        (node.tagName && (node.tagName == tagName)) &&
        (node.className && (node.className == className))) {
      return true;
    } else if (tagName && !className &&
               (node.tagName && (node.tagName == tagName))) {
      return true;
    } else if (!tagName && className &&
               (node.className && (node.className == className))) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};


/**
 * Determines whether or not a node is or is the descendant of another node.
 *
 * @param {Object} node The node to be checked.
 * @param {Object} ancestor The node to see if it's a descendant of.
 * @return {boolean} True if the node is ancestor or is a descendant of it.
 */
cvox.DomUtil.isDescendantOfNode = function(node, ancestor) {
  while (node && ancestor) {
    if (node.isSameNode(ancestor)) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};


/**
 * Remove all whitespace from the beginning and end, and collapse all
 * inner strings of whitespace to a single space.
 * @param {string} str The input string.
 * @return {string} The string with whitespace collapsed.
 */
cvox.DomUtil.collapseWhitespace = function(str) {
  return str.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
};


/**
 * Get the name of a node: this includes all static text content and any
 * HTML-author-specified label, title, alt text, aria-label, etc. - but
 * does not include:
 * - the user-generated control value (use getValue)
 * - the current state (use getState)
 * - the role (use getRole)
 *
 * Order of precedence:
 *   Text content if it's a text node.
 *   aria-labelledby
 *   aria-label
 *   alt (for an image)
 *   title
 *   label (for a control)
 *   placeholder (for an input element)
 *   recursive calls to getName on all children
 *
 * @param {Node} node The node to get the name from.
 * @param {boolean=} recursive Whether or not the element's subtree should
 *     be used; true by default.
 * @param {boolean=} includeControls Whether or not controls in the subtree
 *     should be included; true by default.
 * @return {string} The name of the node, with whitespace collapsed.
 */
cvox.DomUtil.getName = function(node, recursive, includeControls) {
  if (typeof(recursive) === 'undefined') {
    recursive = true;
  }

  if (node.constructor == Text) {
    return cvox.DomUtil.collapseWhitespace(node.data);
  }

  var label = '';
  if (node.hasAttribute && node.hasAttribute('aria-labelledby')) {
    var labelNodeIds = node.getAttribute('aria-labelledby').split(' ');
    for (var labelNodeId, i = 0; labelNodeId = labelNodeIds[i]; i++) {
      var labelNode = document.getElementById(labelNodeId);
      if (labelNode) {
        label += ' ' + cvox.DomUtil.getName(
            labelNode, recursive, includeControls);
      }
    }
  } else if (node.hasAttribute && node.hasAttribute('aria-label')) {
    label = node.getAttribute('aria-label');
  } else if (node.constructor == HTMLImageElement) {
    label = cvox.DomUtil.getImageTitle(node);
  } else if (node.hasAttribute && node.hasAttribute('title')) {
    label = node.getAttribute('title');
  }

  if (label.length == 0 && node && node.id) {
    var labels = cvox.XpathUtil.evalXPath('//label[@for="' +
        node.id + '"]', document.body);
    if (labels.length > 0) {
      label = cvox.DomUtil.getName(labels[0], recursive, includeControls);
    }
  }

  if (label.length == 0 && cvox.DomUtil.isControl(node)) {
    var enclosingLabel = node;
    while (enclosingLabel && enclosingLabel.tagName != 'LABEL') {
      enclosingLabel = enclosingLabel.parentElement;
    }
    if (enclosingLabel && !enclosingLabel.hasAttribute('for')) {
      // Get all text from the label but don't include any controls.
      label = cvox.DomUtil.getName(enclosingLabel, true, false);
    }
  }

  if (label.length == 0 && node.constructor == HTMLInputElement) {
    if (node.type == 'image') {
      label = cvox.DomUtil.getImageTitle(node);
    } else if (node.type == 'submit') {
      if (node.hasAttribute && node.hasAttribute('value')) {
        label = cvox.DomUtil.collapseWhitespace(node.getAttribute('value'));
      } else {
        label = 'Submit';
      }
    } else if (node.type == 'reset') {
      if (node.hasAttribute && node.hasAttribute('value')) {
        label = cvox.DomUtil.collapseWhitespace(node.getAttribute('value'));
      } else {
        label = 'Reset';
      }
    }
  }

  label = cvox.DomUtil.collapseWhitespace(label);

  if (cvox.DomUtil.isInputTypeText(node) && node.hasAttribute('placeholder')) {
    var placeholder = cvox.DomUtil.collapseWhitespace(
        node.getAttribute('placeholder'));
    if (label.length > 0) {
      return label + ' with hint ' + placeholder;
    } else {
      return placeholder;
    }
  }

  if (label.length > 0) {
    return label;
  }

  if (!recursive) {
    return '';
  }

  var getTextFromSubtree = !cvox.DomUtil.isLeafNode(node);
  if (node.tagName == 'BUTTON') {
    getTextFromSubtree = true;
  }
  if (cvox.AriaUtil.isControlWidget(node)) {
    getTextFromSubtree = true;
  }
  if (cvox.AriaUtil.isCompositeControl(node)) {
    getTextFromSubtree = false;
  }
  if (getTextFromSubtree) {
    var name = '';
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      if (!includeControls && cvox.DomUtil.isControl(child)) {
        continue;
      }
      var childStyle = window.getComputedStyle(child, null);
      if (!cvox.DomUtil.isInvisibleStyle(childStyle) &&
          !cvox.AriaUtil.isHidden(child)) {
        name += ' ' + cvox.DomUtil.getName(child, recursive, includeControls);
      }
    }

    name = cvox.DomUtil.collapseWhitespace(name);
    if (name.length > 0) {
      return name;
    }
  }

  return '';
};

/**
 * Use heuristics to guess at the label of a control, to be used if one
 * is not explicitly set in the DOM. This is useful when a control
 * field gets focus, but probably not useful when browsing the page
 * element at a time.
 * @param {Node} node The node to get the label from.
 * @return {string} The name of the control, using heuristics.
 */
cvox.DomUtil.getControlLabelHeuristics = function(node) {
  // TODO (clchen, rshearer): Implement heuristics for getting the label
  // information from the table headers once the code for getting table
  // headers quickly is implemented.

  // If no description has been found yet and heuristics are enabled,
  // then try getting the content from the closest node.
  var prevNode = cvox.DomUtil.previousLeafNode(node);
  var prevTraversalCount = 0;
  while (prevNode && (!cvox.DomUtil.hasContent(prevNode) ||
      cvox.DomUtil.isControl(prevNode))) {
    prevNode = cvox.DomUtil.previousLeafNode(prevNode);
    prevTraversalCount++;
  }
  var nextNode = cvox.DomUtil.nextLeafNode(node);
  var nextTraversalCount = 0;
  while (nextNode && (!cvox.DomUtil.hasContent(nextNode) ||
      cvox.DomUtil.isControl(nextNode))) {
    nextNode = cvox.DomUtil.nextLeafNode(nextNode);
    nextTraversalCount++;
  }
  var guessedLabelNode;
  if (prevNode && nextNode) {
    var parentNode = node;
    // Count the number of parent nodes until there is a shared parent; the
    // label is most likely in the same branch of the DOM as the control.
    // TODO (chaitanyag): Try to generalize this algorithm and move it to
    // its own function in DOM Utils.
    var prevCount = 0;
    while (parentNode) {
      if (cvox.DomUtil.isDescendantOfNode(prevNode, parentNode)) {
        break;
      }
      parentNode = parentNode.parentNode;
      prevCount++;
    }
    parentNode = node;
    var nextCount = 0;
    while (parentNode) {
      if (cvox.DomUtil.isDescendantOfNode(nextNode, parentNode)) {
        break;
      }
      parentNode = parentNode.parentNode;
      nextCount++;
    }
    guessedLabelNode = nextCount < prevCount ? nextNode : prevNode;
  } else {
    guessedLabelNode = prevNode || nextNode;
  }
  if (guessedLabelNode) {
    return cvox.DomUtil.collapseWhitespace(
        cvox.DomUtil.getValue(guessedLabelNode) + ' ' +
        cvox.DomUtil.getName(guessedLabelNode));
  }

  return '';
};


/**
 * Get the text value of a node: the selected value of a select control or the
 * current text of a text control. Does not return the state of a checkbox
 * or radio button.
 *
 * Not recursive.
 *
 * @param {Node} node The node to get the value from.
 * @return {string} The value of the node.
 */
cvox.DomUtil.getValue = function(node) {
  var activeDescendant = cvox.AriaUtil.getActiveDescendant(node);
  if (activeDescendant) {
    return cvox.DomUtil.collapseWhitespace(
        cvox.DomUtil.getValue(activeDescendant) + ' ' +
        cvox.DomUtil.getName(activeDescendant));
  }

  if (node.constructor == HTMLSelectElement) {
    if (node.selectedIndex >= 0 &&
        node.selectedIndex < node.options.length) {
      return node.options[node.selectedIndex].text + '';
    } else {
      return '';
    }
  }

  if (node.constructor == HTMLTextAreaElement) {
    return node.value;
  }

  if (node.constructor == HTMLInputElement) {
    switch (node.type) {
      // Returning '' for the submit button since it is covered by getText.
      case 'hidden':
      case 'image':
      case 'submit':
      case 'reset':
      case 'checkbox':
      case 'radio':
        return '';
      case 'password':
        return node.value.replace(/./g, '*');
      default:
        return node.value;
    }
  }

  return '';
};


/**
 * Given an image node, return its title as a string. The preferred title
 * is always the alt text, and if that's not available, then the title
 * attribute. If neither of those are available, it attempts to construct
 * a title from the filename, and if all else fails returns the word Image.
 * @param {Node} node The image node.
 * @return {string} The title of the image, with whitespace collapsed.
 */
cvox.DomUtil.getImageTitle = function(node) {
  var text;
  if (node.hasAttribute('alt')) {
    text = node.alt;
  } else if (node.hasAttribute('title')) {
    text = node.title;
  } else {
    var url = node.src;
    if (url.substring(0, 4) != 'data') {
      var filename = url.substring(
          url.lastIndexOf('/') + 1, url.lastIndexOf('.'));

      // Hack to not speak the filename if it's ridiculously long.
      if (filename.length >= 1 && filename.length <= 16) {
        text = filename + ' Image';
      } else {
        text = 'Image';
      }
    } else {
      text = 'Image';
    }
  }
  return cvox.DomUtil.collapseWhitespace(text);
};


/**
 * Determines whether or not a node has content.
 *
 * @param {Node} node The node to be checked.
 * @return {boolean} True if the node has content.
 */
cvox.DomUtil.hasContent = function(node) {
  // nodeType:8 == COMMENT_NODE
  if (node.nodeType == 8) {
    return false;
  }

  // Exclude anything in the head
  if (cvox.DomUtil.isDescendantOf(node, 'HEAD')) {
    return false;
  }

  // Exclude script nodes
  if (cvox.DomUtil.isDescendantOf(node, 'SCRIPT')) {
    return false;
  }

  // Exclude noscript nodes
  if (cvox.DomUtil.isDescendantOf(node, 'NOSCRIPT')) {
    return false;
  }

  // Exclude style nodes that have been dumped into the body
  if (cvox.DomUtil.isDescendantOf(node, 'STYLE')) {
    return false;
  }

  // Check the style to exclude undisplayed/hidden nodes
  var closestStyledParent = node;
  // nodeType:3 == TEXT_NODE
  while (closestStyledParent && (closestStyledParent.nodeType == 3)) {
    closestStyledParent = closestStyledParent.parentNode;
  }
  if (closestStyledParent) {
    var style =
        document.defaultView.getComputedStyle(closestStyledParent, null);
    if (cvox.DomUtil.isInvisibleStyle(style)) {
      return false;
    }
    // TODO (clchen, raman): Look into why WebKit has a problem here.
    // The issue is that getComputedStyle does not always return the correct
    // result; manually going up the parent chain sometimes produces a different
    // result than just using getComputedStyle.
    var tempNode = closestStyledParent;
    while (tempNode && tempNode.tagName != 'BODY') {
      style = document.defaultView.getComputedStyle(tempNode, null);
      if (cvox.DomUtil.isInvisibleStyle(style)) {
        return false;
      }
      tempNode = tempNode.parentNode;
    }
  }

  // Ignore anything that is hidden by ARIA
  if (cvox.AriaUtil.isHidden(node)) {
    return false;
  }

  // We need to speak controls, including those with no value entered. We
  // therefore treat visible controls as if they had content, and return true
  // below.
  if (cvox.DomUtil.isControl(node)) {
    return true;
  }

  // We want to try to jump into an iframe iff it has a src attribute.
  // For right now, we will avoid iframes without src since ChromeVox
  // is not being injected in those cases and will cause the user to get stuck.
  // TODO (clchen, dmazzoni): Manually inject ChromeVox for iframes without src.
  if ((node.tagName == 'IFRAME') && (node.src)) {
    return true;
  }

  // Skip any non-control content inside of a label if the label is
  // correctly associated with a control, the label text will get spoken
  // when the control is reached.
  var enclosingLabel = node.parentElement;
  while (enclosingLabel && enclosingLabel.tagName != 'LABEL') {
    enclosingLabel = enclosingLabel.parentElement;
  }
  if (enclosingLabel) {
    var embeddedControl = enclosingLabel.querySelector(
        'button,input,select,textarea');
    if (enclosingLabel.hasAttribute('for')) {
      var targetId = enclosingLabel.getAttribute('for');
      var targetNode = document.getElementById(targetId);
      if (targetNode &&
          cvox.DomUtil.isControl(targetNode) &&
          !embeddedControl) {
        return false;
      }
    } else if (embeddedControl) {
      return false;
    }
  }

  if (node.tagName == 'A' && node.getAttribute('href') != '') {
    return true;
  }

  var text = cvox.DomUtil.getValue(node) + ' ' + cvox.DomUtil.getName(node);
  text = cvox.DomUtil.collapseWhitespace(text);
  var state = cvox.DomUtil.getState(node, true);
  if (text === '' && state === '') {
    // Text only contains whitespace
    return false;
  }

  return true;
};


/**
 * Returns a list of all the ancestors of a given node.
 *
 * @param {Object} targetNode The node to get ancestors for.
 * @return {Object} An array of ancestors for the targetNode.
 */
cvox.DomUtil.getAncestors = function(targetNode) {
  var ancestors = new Array();
  while (targetNode) {
    ancestors.push(targetNode);
    targetNode = targetNode.parentNode;
  }
  ancestors.reverse();
  while (ancestors.length && !ancestors[0].tagName && !ancestors[0].nodeValue) {
    ancestors.shift();
  }
  return ancestors;
};


/**
 * Compares Ancestors of A with Ancestors of B and returns
 * the index value in B at which B diverges from A.
 * If there is no divergence, the result will be -1.
 * Note that if B is the same as A except B has more nodes
 * even after A has ended, that is considered a divergence.
 * The first node that B has which A does not have will
 * be treated as the divergence point.
 *
 * @param {Object} ancestorsA The array of ancestors for Node A.
 * @param {Object} ancestorsB The array of ancestors for Node B.
 * @return {number} The index of the divergence point (the first node that B has
 * which A does not have in B's list of ancestors).
 */
cvox.DomUtil.compareAncestors = function(ancestorsA, ancestorsB) {
  var i = 0;
  while (ancestorsA[i] && ancestorsB[i] && (ancestorsA[i] == ancestorsB[i])) {
    i++;
  }
  if (!ancestorsA[i] && !ancestorsB[i]) {
    i = -1;
  }
  return i;
};


/**
 * Returns an array of ancestors that are unique for the currentNode when
 * compared to the previousNode. Having such an array is useful in generating
 * the node information (identifying when interesting node boundaries have been
 * crossed, etc.).
 *
 * @param {Object} previousNode The previous node.
 * @param {Object} currentNode The current node.
 * @return {Array.<Node>} An array of unique ancestors for the current node.
 */
cvox.DomUtil.getUniqueAncestors = function(previousNode, currentNode) {
  var prevAncestors = cvox.DomUtil.getAncestors(previousNode);
  var currentAncestors = cvox.DomUtil.getAncestors(currentNode);
  var divergence = cvox.DomUtil.compareAncestors(prevAncestors,
      currentAncestors);
  return currentAncestors.slice(divergence);
};


/**
 * Returns a string to be presented to the user that identifies what the
 * targetNode's role is.
 * ARIA roles are given priority; if there is no ARIA role set, the role
 * will be determined by the HTML tag for the node.
 *
 * @param {Object} targetNode The node to get the role name for.
 * @return {string} The role name for the targetNode.
 */
cvox.DomUtil.getRole = function(targetNode) {
  var info;
  info = cvox.AriaUtil.getRoleName(targetNode);
  if (!info) {
    if (targetNode.tagName == 'INPUT') {
      info = cvox.DomUtil.INPUT_TYPE_TO_INFORMATION_TABLE[targetNode.type];
    } else {
      info = cvox.DomUtil.TAG_TO_INFORMATION_TABLE[targetNode.tagName];
    }
  }
  if (!info) {
    info = '';
  }
  return info;
};


/**
 * Count the number of items in a list node.
 *
 * @param {Node} targetNode The list node.
 * @return {number} The number of items in the list.
 */
cvox.DomUtil.getListLength = function(targetNode) {
  var count = 0;
  for (var node = targetNode.firstChild;
       node;
       node = node.nextSibling) {
    if (node.tagName == 'LI' ||
        (node.getAttribute && node.getAttribute('role') == 'listitem')) {
      count++;
    }
  }
  return count;
};


/**
 * Returns a string that gives information about the state of the targetNode.
 *
 * @param {Node} targetNode The node to get the state information for.
 * @param {boolean} primary Whether this is the primary node we're
 *     interested in, where we might want extra information - as
 *     opposed to an ancestor, where we might be more brief.
 * @return {string} The status information about the node.
 */
cvox.DomUtil.getState = function(targetNode, primary) {
  var info;
  var role = targetNode.getAttribute ? targetNode.getAttribute('role') : '';
  info = cvox.AriaUtil.getState(targetNode, primary);
  if (!info) {
    info = '';
  }

  if (targetNode.tagName == 'INPUT') {
    if (targetNode.type == 'checkbox' || targetNode.type == 'radio') {
      if (targetNode.checked) {
        info = info + ' checked';
      } else {
        info = info + ' not checked';
      }
    }
    if (cvox.DomUtil.isDisabled(targetNode)) {
      info += ' disabled ';
    }
  } else if (targetNode.tagName == 'SELECT') {
    info = info + ' ' + (targetNode.selectedIndex + 1) + ' of ' +
        targetNode.options.length;
  } else if (targetNode.tagName == 'UL' ||
             targetNode.tagName == 'OL' ||
             role == 'list') {
    info = info + ' with ' + cvox.DomUtil.getListLength(targetNode) + ' items';
  }

  return info;
};


/**
 * Returns a description of a navigation from an array of changed
 * ancestor nodes. The ancestors are in order from the highest in the
 * tree to the lowest, i.e. ending with the current leaf node.
 *
 * @param {Array.<Node>} ancestorsArray An array of ancestor nodes.
 * @param {boolean=} recursive Whether or not the element's subtree should
 *     be used; true by default.
 * @return {cvox.NavDescription} The description of the navigation action.
 */
cvox.DomUtil.getDescriptionFromAncestors = function(
    ancestorsArray, recursive) {
  if (typeof(recursive) === 'undefined') {
    recursive = true;
  }
  var len = ancestorsArray.length;
  var context = '';
  var text = '';
  var userValue = '';
  var annotation = '';

  if (len > 0) {
    text = cvox.DomUtil.getName(ancestorsArray[len - 1], recursive);
    userValue = cvox.DomUtil.getValue(ancestorsArray[len - 1]);
  }
  for (var i = len - 1; i >= 0; i--) {
    var node = ancestorsArray[i];
    var role = cvox.DomUtil.getRole(node);
    if (i < len - 1) {
      var name = cvox.DomUtil.getName(node, false);
      if (name) {
        role = name + ' ' + role;
      }
    }
    if (role.length > 0) {
      if (annotation.length > 0) {
        context = role + ' ' + cvox.DomUtil.getState(node, false) +
                  ' ' + context;
      } else {
        annotation = role + ' ' + cvox.DomUtil.getState(node, true);
      }
    }
  }

  return new cvox.NavDescription(
      cvox.DomUtil.collapseWhitespace(context),
      cvox.DomUtil.collapseWhitespace(text),
      cvox.DomUtil.collapseWhitespace(userValue),
      cvox.DomUtil.collapseWhitespace(annotation));
};


/**
 * Return whether a node is focusable. This includes nodes whose tabindex
 * attribute is set to "-1" explicitly - these nodes are not in the tab
 * order, but they should still be focused if the user navigates to them
 * using linear or smart DOM navigation.
 *
 * Note that when the tabIndex property of an Element is -1, that doesn't
 * tell us whether the tabIndex attribute is missing or set to "-1" explicitly,
 * so we have to check the attribute.
 *
 * @param {Object} targetNode The node to check if it's focusable.
 * @return {boolean} True if the node is focusable.
 */
cvox.DomUtil.isFocusable = function(targetNode) {
  if (!targetNode || typeof(targetNode.tabIndex) != 'number') {
    return false;
  }

  if (targetNode.tabIndex >= 0) {
    return true;
  }

  if (targetNode.hasAttribute &&
      targetNode.hasAttribute('tabindex') &&
      targetNode.getAttribute('tabindex') == '-1') {
    return true;
  }

  return false;
};


/**
 * Sets the browser focus to the targetNode or its closest ancestor that is
 * able to get focus.
 *
 * @param {Object} targetNode The node to move the browser focus to.
 */
cvox.DomUtil.setFocus = function(targetNode) {
  // Save the selection because Chrome will lose it if there's a focus or blur.
  var sel = window.getSelection();
  var range;
  if (sel.rangeCount > 0) {
    range = sel.getRangeAt(0);
  }

  // Blur the currently-focused element if the target node is not a
  // descendant.
  if (document.activeElement &&
      !cvox.DomUtil.isDescendantOfNode(targetNode, document.activeElement)) {
    document.activeElement.blur();
  }

  // Search up the parent chain until a focusable node is found.x
  while (targetNode && !cvox.DomUtil.isFocusable(targetNode)) {
    targetNode = targetNode.parentNode;
  }

  // If we found something focusable, focus it - otherwise, blur it.
  if (cvox.DomUtil.isFocusable(targetNode)) {
    targetNode.focus();
  } else if (document.activeElement &&
             document.activeElement.tagName != 'BODY') {
    document.activeElement.blur();
  }

  // Restore the selection, unless the focused item is a text box.
  if (cvox.DomUtil.isInputTypeText(targetNode)) {
    targetNode.select();
  } else if (range) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
};


/**
 * Checks if the targetNode is still attached to the document.
 * A node can become detached because of AJAX changes.
 *
 * @param {Object} targetNode The node to check.
 * @return {boolean} True if the targetNode is still attached.
 */
cvox.DomUtil.isAttachedToDocument = function(targetNode) {
  while (targetNode) {
    if (targetNode.tagName && (targetNode.tagName == 'HTML')) {
      return true;
    }
    targetNode = targetNode.parentNode;
  }
  return false;
};


/**
 * Dispatches a left click event on the element that is the targetNode.
 * Clicks go in the sequence of mousedown, mouseup, and click.
 * @param {Node} targetNode The target node of this operation.
 * @param {boolean} shiftKey Specifies if shift is held down.
 */
cvox.DomUtil.clickElem = function(targetNode, shiftKey) {
  //Send a mousedown
  var evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('mousedown', true, true, document.defaultView,
                     1, 0, 0, 0, 0, false, false, shiftKey, false, 0, null);
  try {
    targetNode.dispatchEvent(evt);
  } catch (e) {}
  //Send a mouse up
  evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('mouseup', true, true, document.defaultView,
                     1, 0, 0, 0, 0, false, false, shiftKey, false, 0, null);
  try {
    targetNode.dispatchEvent(evt);
  } catch (e) {}
  //Send a click
  evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('click', true, true, document.defaultView,
                     1, 0, 0, 0, 0, false, false, shiftKey, false, 0, null);
  try {
    targetNode.dispatchEvent(evt);
  } catch (e) {}
};


/**
 * Given an HTMLInputElement, returns true if it's an editable text type.
 * This includes input type='text' and input type='password' and a few
 * others.
 *
 * @param {Node} node The node to check.
 * @return {boolean} True if the node is an INPUT with an editable text type.
 */
cvox.DomUtil.isInputTypeText = function(node) {
  if (!node || node.constructor != HTMLInputElement) {
    return false;
  }

  switch (node.type) {
    case 'email':
    case 'number':
    case 'password':
    case 'search':
    case 'text':
    case 'tel':
    case 'url':
    case '':
      return true;
    default:
      return false;
  }
};


/**
 * Given a node, returns true if it's a control.
 * Note that controls are all leaf level widgets; they
 * are NOT containers.
 *
 * @param {Node} node The node to check.
 * @return {boolean} True if the node is a control.
 */
cvox.DomUtil.isControl = function(node) {
  if (cvox.AriaUtil.isControlWidget(node) &&
      cvox.DomUtil.isFocusable(node)) {
    return true;
  }
  if (node.tagName) {
    switch (node.tagName) {
      case 'BUTTON':
      case 'TEXTAREA':
      case 'SELECT':
        return true;
      case 'INPUT':
        return node.type != 'hidden';
    }
  }
  if (node.isContentEditable) {
    return true;
  }
  return false;
};


/**
 * Given a node that might be inside of a composite control like a listbox,
 * return the surrounding control.
 * @param {Node} node The node from which to start looking.
 * @return {Node} The surrounding composite control node, or null if none.
 */
cvox.DomUtil.getSurroundingControl = function(node) {
  var surroundingControl = null;
  if (!cvox.DomUtil.isControl(node) && node.hasAttribute('role')) {
    surroundingControl = node.parentElement;
    while (surroundingControl &&
        !cvox.AriaUtil.isCompositeControl(surroundingControl)) {
      surroundingControl = surroundingControl.parentElement;
    }
  }
  return surroundingControl;
};


/**
 * Given a node, returns the next leaf node.
 *
 * @param {Node} node The node from which to start looking
 * for the next leaf node.
 * @return {Node} The next leaf node.
 * Null if there is no next leaf node.
 */
cvox.DomUtil.nextLeafNode = function(node) {
  var tempNode = node;
  while (tempNode && (!tempNode.nextSibling)) {
    tempNode = tempNode.parentNode;
  }
  if (tempNode && tempNode.nextSibling) {
    tempNode = tempNode.nextSibling;
    while (!cvox.DomUtil.isLeafNode(tempNode)) {
      tempNode = tempNode.firstChild;
    }
  }
  return tempNode;
};


/**
 * Given a node, returns the previous leaf node.
 *
 * @param {Node} node The node from which to start looking
 * for the previous leaf node.
 * @return {Node} The previous leaf node.
 * Null if there is no previous leaf node.
 */
cvox.DomUtil.previousLeafNode = function(node) {
  var tempNode = node;
  while (tempNode && (!tempNode.previousSibling)) {
    tempNode = tempNode.parentNode;
  }
  if (tempNode && tempNode.previousSibling) {
    tempNode = tempNode.previousSibling;
    while (!cvox.DomUtil.isLeafNode(tempNode)) {
      tempNode = tempNode.lastChild;
    }
  }
  return tempNode;
};

/**
 * Get a control's complete description in the same format as if you
 *     navigated to the node.
 * @param {Element} control A control.
 * @param {Array.<Node>} opt_changedAncestors The changed ancestors that will be
 * used to determine what needs to be spoken. If this is not provided, the
 * ancestors used to determine what needs to be spoken will just be the control
 * itself and its surrounding control if it has one.
 * @return {cvox.NavDescription} The description of the control.
 */
cvox.DomUtil.getControlDescription = function(control, opt_changedAncestors) {
  var ancestors = [control];
  if (opt_changedAncestors && (opt_changedAncestors.length > 0)) {
    ancestors = opt_changedAncestors;
  } else {
    var surroundingControl = cvox.DomUtil.getSurroundingControl(control);
    if (surroundingControl) {
      ancestors = [surroundingControl, control];
    }
  }

  var description = cvox.DomUtil.getDescriptionFromAncestors(ancestors);

  // Use heuristics if the control doesn't otherwise have a name.
  if (surroundingControl) {
    var name = cvox.DomUtil.getName(surroundingControl);
    if (name.length == 0) {
      name = cvox.DomUtil.getControlLabelHeuristics(surroundingControl);
      if (name.length > 0) {
        description.context = name + ' ' + description.context;
      }
    }
  } else {
    var name = cvox.DomUtil.getName(control);
    if (name.length == 0) {
      name = cvox.DomUtil.getControlLabelHeuristics(control);
      if (name.length > 0) {
        description.text = cvox.DomUtil.collapseWhitespace(name);
      }
    }
    var value = cvox.DomUtil.getValue(control);
    if (value.length > 0) {
      description.userValue = cvox.DomUtil.collapseWhitespace(value);
    }
  }

  return description;
};


/**
 * Get a string representing a control's value and state, i.e. the part
 *     that changes while interacting with the control
 * @param {Element} control A control.
 * @return {string} The value and state string.
 */
cvox.DomUtil.getControlValueAndStateString = function(control) {
  var parentControl = cvox.DomUtil.getSurroundingControl(control);
  if (parentControl) {
    return cvox.DomUtil.collapseWhitespace(
        cvox.DomUtil.getValue(control) + ' ' +
        cvox.DomUtil.getName(control) + ' ' +
        cvox.DomUtil.getState(control, true));
  } else {
    return cvox.DomUtil.collapseWhitespace(
        cvox.DomUtil.getValue(control) + ' ' +
        cvox.DomUtil.getState(control, true));
  }
};

/**
 * Get a string containing the currently selected link's URL.
 * @param {Node} node The link from which URL needs to be extracted.
 * @return {string} The value of the URL.
 */
cvox.DomUtil.getLinkURL = function(node) {
  if (node.tagName == 'A') {
    if (node.getAttribute('href')) {
      if (node.getAttribute('href').indexOf('#') == 0) {
        return 'Internal link';
      } else {
        return node.getAttribute('href');
      }
    } else {
      return '';
    }
  } else if (cvox.AriaUtil.getRoleName(node) == 'Link') {
    return 'Unknown link';
  }

  return '';
};

