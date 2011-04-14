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


goog.provide('cvox.DomUtil');

goog.require('cvox.AriaUtil');
goog.require('cvox.XpathUtil');



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
  'H1' : 'Heading 1',
  'H2' : 'Heading 2',
  'H3' : 'Heading 3',
  'H4' : 'Heading 4',
  'H5' : 'Heading 5',
  'H6' : 'Heading 6',
  'BUTTON' : 'Button',
  'SELECT' : 'Combo box',
  'TABLE' : 'Table',
  'TEXTAREA' : 'Text area'
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
    if (node.tagName == 'LABEL') {
      return true;
    }
    if (node.tagName == 'IFRAME') {
      return true;
    }
    if (node.tagName == 'FRAME') {
      return true;
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
 * Get the label of a node.
 *
 * Not recursive.
 *
 * @param {Node} node The node to get the title from.
 * @param {boolean} useHeuristics Whether or not to use heuristics to guess at
 * the label if one is not explicitly set in the DOM.
 * @return {string} The label of the node.
 */
cvox.DomUtil.getLabel = function(node, useHeuristics) {
  var label = '';
  if (!node) {
    return '';
  }
  // Find any labels that are associated with this text control.
  // aria-labelledby takes precedence and overrides any label for= elements.
  if (node.hasAttribute && node.hasAttribute('aria-labelledby')) {
    var labelNodeIds = node.getAttribute('aria-labelledby').split(' ');
    for (var labelNodeId, i = 0; labelNodeId = labelNodeIds[i]; i++) {
      var labelNode = document.getElementById(labelNodeId);
      label += cvox.DomUtil.getText(labelNode) + ' ';
    }
  } else if (node && node.id) {
    var labels = cvox.XpathUtil.evalXPath('//label[@for="' +
        node.id + '"]', document.body);
    if (labels.length > 0) {
      label += cvox.DomUtil.getText(labels[0]) + ' ';
    }
  }

  // If the node is an ARIA button without an explicit label, then the text of
  // its child nodes should be treated as its label.
  if ((label.length < 1) && node.hasAttribute &&
      (node.getAttribute('role') == 'button')) {
    for (var i = 0, child; child = node.childNodes[i]; i++) {
      var childStyle = window.getComputedStyle(child, null);
      if (!cvox.DomUtil.isInvisibleStyle(childStyle) &&
          !cvox.AriaUtil.isHidden(node)) {
        label += ' ' + cvox.DomUtil.getText(child);
      }
    }
  }

  // If no description has been found yet and heuristics are enabled,
  // then try using table heuristics if possible.
  // TODO (clchen, rshearer): Implement heuristics for getting the label
  // information from the table headers once the code for getting table
  // headers quickly is implemented.
  //if (useHeuristics && (label.length < 1)) {
  //}

  // If no description has been found yet and heuristics are enabled,
  // then try getting the content from the closest node.
  if (useHeuristics && (label.length < 1)) {
    var prevNode = cvox.DomUtil.previousLeafNode(node);
    var prevTraversalCount = 0;
    while (prevNode && (!cvox.DomUtil.hasContent(prevNode) ||
        cvox.DomUtil.isControl(prevNode))) {
      prevNode = cvox.DomUtil.previousLeafNode(prevNode);
      prevTraversalCount++;
    }
    var nextNode = cvox.DomUtil.previousLeafNode(node);
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
      label += cvox.DomUtil.getText(guessedLabelNode) + ' ';
    }
  }

  return label;
};


/**
 * Get the title of a node.  In many cases this is equivalent to the
 * text of the node, but it can be overridden by a title tag or alt tag,
 * and for some form controls (like submit buttons) the title is actually
 * the value.
 *
 * Not recursive.
 *
 * @param {Node} node The node to get the title from.
 * @return {string} The title of the node.
 */
cvox.DomUtil.getTitle = function(node) {
  if (node.constructor == Text) {
    return node.data;
  } else if (node.constructor == HTMLImageElement) {
    return cvox.DomUtil.getImageTitle(node);
  } else if (node.hasAttribute && node.hasAttribute('title')) {
    return node.getAttribute('title');
  } else if (node.constructor == HTMLInputElement) {
    if (node.type == 'image') {
      return cvox.DomUtil.getImageTitle(node);
    } else if (node.type == 'submit') {
      if (node.hasAttribute && node.hasAttribute('value')) {
        return node.getAttribute('value');
      } else {
        return 'Submit';
      }
    } else if (node.type == 'reset') {
      if (node.hasAttribute && node.hasAttribute('value')) {
        return node.getAttribute('value');
      } else {
        return 'Reset';
      }
    }
  } else if (node.constructor == HTMLButtonElement) {
    var titleText = '';
    for (var i = 0, child; child = node.childNodes[i]; i++) {
      titleText += cvox.DomUtil.getText(child) + ' ';
    }
    return titleText;
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
 * Given a node, return its complete text as a string.  This is recursive;
 * it will extract the text from all child nodes and concatenate it,
 * removing extraneous whitespace.
 *
 * This is similar to accessing the textContent property of a node, but
 * that doesn't handle nodes that override the text with a title attribute,
 * or nodes that can have both a title and a value.
 *
 * This function concatenates the value and title of a node (value first,
 * if both are present) and recursively concatenates the text of children
 * of any node that doesn't have either a value or title.

 * @param {Node} node The node to extract the text from.
 * @return {string} The text of the node.
 */
cvox.DomUtil.getText = function(node) {
  var title = cvox.DomUtil.getTitle(node);
  var value = cvox.DomUtil.getValue(node);
  if (title.length == 0) {
    title = cvox.DomUtil.getLabel(node, false);
  }

  var text = '';
  if (title && value) {
    text = value + ' ' + title;
  } else if (title) {
    text = title;
  } else if (value) {
    text = value;
  } else if (!cvox.DomUtil.isControl(node)) {
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      var childStyle = window.getComputedStyle(child, null);
      if (!cvox.DomUtil.isInvisibleStyle(childStyle) &&
          !cvox.AriaUtil.isHidden(node)) {
        text += ' ' + cvox.DomUtil.getText(child);
      }
    }
  }
  // Remove all whitespace from the beginning and end, and collapse all
  // inner strings of whitespace to a single space.
  text = text.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
  return text;
};


/**
 * Given an image node, return its title as a string. The preferred title
 * is always the alt text, and if that's not available, then the title
 * attribute. If neither of those are available, it attempts to construct
 * a title from the filename, and if all else fails returns the word Image.
 * @param {Node} node The image node.
 * @return {string} The title of the image.
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
  return text;
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

  // We always want to try to jump into an iframe.
  if (node.tagName == 'IFRAME') {
    return true;
  }

  var text = cvox.DomUtil.getText(node);
  if (text === '') {
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
 * Returns a string of basic information about the target node.
 * This information is only about the node itself and does not take into
 * account any of the node's ancestors.
 *
 * @param {Object} targetNode The node to get information about.
 * @return {string} A string of basic information about the current node.
 */
cvox.DomUtil.getBasicNodeInformation = function(targetNode) {
  var info = cvox.DomUtil.getBasicNodeRole(targetNode);
  if (info.length > 0) {
    info = info + ' ' + cvox.DomUtil.getBasicNodeState(targetNode);
  }
  return info;
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
cvox.DomUtil.getBasicNodeRole = function(targetNode) {
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
 * Returns a string that gives information about the state of the targetNode.
 *
 * @param {Object} targetNode The node to get the state information for.
 * @return {string} The status information about the node.
 */
cvox.DomUtil.getBasicNodeState = function(targetNode) {
  var info;
  info = cvox.AriaUtil.getState(targetNode);
  if (!info) {
    info = '';
  } else {
    info = info + ' ';
  }

  if (targetNode.tagName == 'INPUT') {
    if (targetNode.type == 'checkbox' || targetNode.type == 'radio') {
      if (targetNode.checked) {
        info = info + ' checked';
      } else {
        info = info + ' not checked';
      }
    }
  } else if (targetNode.tagName == 'SELECT') {
    info = info + ' ' + (targetNode.selectedIndex + 1) + ' of ' +
        targetNode.options.length;
  }

  return info;
};


/**
 * Returns a string of detailed information given an array of
 * ancestor nodes.
 *
 * @param {Object} ancestorsArray An array of ancestor nodes.
 * @return {string} A string of detailed information given the
 * array of ancestor nodes.
 */
cvox.DomUtil.getInformationFromAncestors = function(ancestorsArray) {
  var info = '';
  for (var i = 0, node; node = ancestorsArray[i]; i++) {
    var nodeInfo = cvox.DomUtil.getBasicNodeInformation(node);
    if (nodeInfo.length > 0) {
      info = info + ' ' + nodeInfo;
    }
  }
  return info;
};


/**
 * Sets the browser focus to the targetNode or its closest ancestor that is
 * able to get focus.
 *
 * @param {Object} targetNode The node to move the browser focus to.
 */
cvox.DomUtil.setFocus = function(targetNode) {
  if (document.activeElement &&
      !cvox.DomUtil.isDescendantOfNode(targetNode, document.activeElement)) {
    document.activeElement.blur();
  }
  while (targetNode && ((typeof(targetNode.tabIndex) == 'undefined') ||
          (targetNode.tabIndex == -1))) {
    // If the target is a label for a control, focus the control.
    if (targetNode.tagName && (targetNode.tagName == 'LABEL')) {
      if (targetNode.htmlFor && document.getElementById(targetNode.htmlFor)) {
        targetNode = document.getElementById(targetNode.htmlFor);
      } else {
        // Handle the case if a label is wrapping a control
        var inputElems = targetNode.getElementsByTagName('INPUT');
        if (inputElems && (inputElems.length > 0)) {
          // In case there are multiple controls, focus on the first one.
          // The user can always read through to the next control.
          targetNode = inputElems[0];
        } else {
          // No wrapped controls found. In this case, keep moving
          // because it means the page author was misusing label
          // and failed to associate it with anything.
          targetNode = targetNode.parentNode;
        }
      }
    } else {
      targetNode = targetNode.parentNode;
    }

  }
  if (targetNode && (typeof(targetNode.tabIndex) != 'undefined') &&
      (targetNode.tabIndex != -1)) {
    targetNode.focus();
  } else {
    if (document.activeElement && (document.activeElement.tagName != 'BODY')) {
      // Chrome will lose the selection if there is a blur, even if the blur
      // does not touch the selection. To work around this, backup the
      // selection, do the blur, then restore the selection.
      var sel = window.getSelection();
      if (sel.rangeCount > 0) {
        var range = sel.getRangeAt(0);
        document.activeElement.blur();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
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
  //Use a try block here so that if the AJAX fails and it is a link,
  //it can still fall through and retry by setting the document.location.
  try {
    targetNode.dispatchEvent(evt);
  } catch (e) {}
  //Send a mouse up
  evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('mouseup', true, true, document.defaultView,
                     1, 0, 0, 0, 0, false, false, shiftKey, false, 0, null);
  //Use a try block here so that if the AJAX fails and it is a link,
  //it can still fall through and retry by setting the document.location.
  try {
    targetNode.dispatchEvent(evt);
  } catch (e) {}
  //Send a click
  evt = document.createEvent('MouseEvents');
  evt.initMouseEvent('click', true, true, document.defaultView,
                     1, 0, 0, 0, 0, false, false, shiftKey, false, 0, null);
  //Use a try block here so that if the AJAX fails and it is a link,
  //it can still fall through and retry by setting the document.location.
  try {
    targetNode.dispatchEvent(evt);
  } catch (e) {}
  //Clicking on a link does not cause traversal because of script
  //privilege limitations. The traversal has to be done by setting
  //document.location.
  var href = targetNode.getAttribute('href');
  if ((targetNode.tagName == 'A') &&
      href &&
      (href != '#')) {
    if (shiftKey) {
      window.open(targetNode.href);
    } else {
      document.location = targetNode.href;
    }
  }

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
  if (node.constructor != HTMLInputElement) {
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
  if (cvox.AriaUtil.isControlWidget(node)) {
    return true;
  }
  if (node.tagName) {
    switch (node.tagName) {
      case 'BUTTON':
      case 'INPUT':
      case 'TEXTAREA':
      case 'SELECT':
        return true;
    }
  }
  return false;
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
 * Get a string representing a control's value and state.
 * @param {Element} control A control.
 * @return {string} A string representing a control's value and state.
 */
cvox.DomUtil.getControlValueAndStateString = function(control) {
  var controlValue = cvox.DomUtil.getValue(control);
  var controlState = cvox.DomUtil.getBasicNodeState(control);
  var controlTitle = cvox.DomUtil.getTitle(control);
  var controlLabel = cvox.DomUtil.getLabel(control, false);
  if ((controlTitle.length < 1) && (controlLabel.length < 1)) {
    controlLabel = cvox.DomUtil.getLabel(control, true);
  }
  return controlLabel + ' ' + controlTitle + ' ' + controlValue + ' ' +
      controlState;
};

