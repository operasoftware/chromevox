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
 * @fileoverview JavaScript for poppup up a search widget and performing
 * search within a page.
 * @author clchen@google.com (Charles L. Chen)
 */

cvoxgoog.provide('cvox.ChromeVoxSearch');

cvoxgoog.require('cvox.AbstractEarcons');
cvoxgoog.require('cvox.ChromeVox');
cvoxgoog.require('cvox.SelectionUtil');
cvoxgoog.require('cvox.XpathUtil');

/**
 * @type {Object}
 */
cvox.ChromeVoxSearch.txtNode = null;

/**
 * @type {boolean}
 */
cvox.ChromeVoxSearch.active = false;

/**
 * @type {Array?}
 */
cvox.ChromeVoxSearch.matchNodes = null;

/**
 * @type {number?}
 */
cvox.ChromeVoxSearch.matchNodesIndex = null;

/**
 * @type {boolean}
 */
cvox.ChromeVoxSearch.caseSensitive = false;

/**
 * Initializes the search widget.
 */
cvox.ChromeVoxSearch.init = function() {
  cvox.ChromeVoxSearch.active = false;
  cvox.ChromeVoxSearch.caseSensitive = false;
  window.addEventListener('keypress', cvox.ChromeVoxSearch.processKeyPress,
      true);
  window.addEventListener('keydown', cvox.ChromeVoxSearch.processKeyDown,
      true);
  window.addEventListener('scroll', cvox.ChromeVoxSearch.scrollHandler,
      true);
};

/**
 * Returns whether or not the search widget is active.
 *
 * @return {boolean} True if the search widget is active.
 */
cvox.ChromeVoxSearch.isActive = function() {
  return cvox.ChromeVoxSearch.active;
};

/**
 * Displays the search widget.
 */
cvox.ChromeVoxSearch.show = function() {
  cvox.ChromeVoxSearch.txtNode = document.createElement('div');
  cvox.ChromeVoxSearch.txtNode.style['display'] = 'block';
  cvox.ChromeVoxSearch.txtNode.style['position'] = 'absolute';
  cvox.ChromeVoxSearch.txtNode.style['left'] = '2px';
  cvox.ChromeVoxSearch.txtNode.style['top'] = (window.scrollY + 2) + 'px';
  cvox.ChromeVoxSearch.txtNode.style['line-height'] = '1.2em';
  cvox.ChromeVoxSearch.txtNode.style['z-index'] = '10001';
  cvox.ChromeVoxSearch.txtNode.style['font-size'] = '20px';

  document.body.insertBefore(cvox.ChromeVoxSearch.txtNode,
      document.body.firstChild);
  cvox.ChromeVoxSearch.active = true;
};

/**
 * Keeps the search widget at the upperleft hand corner of the screen when
 * the page scrolls.
 */
cvox.ChromeVoxSearch.scrollHandler = function() {
  if (!cvox.ChromeVoxSearch.active) {
    return;
  }
  cvox.ChromeVoxSearch.txtNode.style['top'] = (window.scrollY + 2) + 'px';
};

/**
 * Handles the keyDown event when the search widget is active.
 *
 * @param {Object} evt The keyDown event.
 * @return {boolean} Whether or not the event was handled.
 */
cvox.ChromeVoxSearch.processKeyDown = function(evt) {
  if (!cvox.ChromeVoxSearch.active) {
    return false;
  }
  if (evt.keyCode == 8) { // Backspace
    var searchStr = cvox.ChromeVoxSearch.txtNode.textContent;
    if (searchStr.length > 0) {
      searchStr = searchStr.substring(searchStr, searchStr.length - 1);
      cvox.ChromeVoxSearch.doSearch(searchStr,
          cvox.ChromeVoxSearch.caseSensitive);
    }
    // Don't go to the previous page!
    evt.preventDefault();
    return true;
  } else if (evt.keyCode == 40) { // Down arrow
    cvox.ChromeVoxSearch.next();
    return true;
  } else if (evt.keyCode == 38) { // Up arrow
    cvox.ChromeVoxSearch.prev();
    return true;
  } else if (evt.ctrlKey && evt.keyCode == 67) { // ctrl + c
    cvox.ChromeVoxSearch.toggleCaseSensitivity();
    return true;
  }
  return false;
};

/**
 * Adds the letter the user typed to the search string and updates the search.
 *
 * @param {Object} evt The keyPress event.
 * @return {boolean} Whether or not the event was handled.
 */
cvox.ChromeVoxSearch.processKeyPress = function(evt) {
  if (!cvox.ChromeVoxSearch.active) {
    return false;
  }
  var searchStr = cvox.ChromeVoxSearch.txtNode.textContent +
      String.fromCharCode(evt.charCode);
  cvox.ChromeVoxSearch.doSearch(searchStr,
      cvox.ChromeVoxSearch.caseSensitive);
  evt.preventDefault();
  evt.stopPropagation();
  return true;
};

/**
 * Toggles whether or not searches are case sensitive.
 */
cvox.ChromeVoxSearch.toggleCaseSensitivity = function() {
  if (cvox.ChromeVoxSearch.caseSensitive) {
    cvox.ChromeVoxSearch.caseSensitive = false;
    cvox.ChromeVox.tts.speak('Ignoring case', 0, null);
  } else {
    cvox.ChromeVoxSearch.caseSensitive = true;
    cvox.ChromeVox.tts.speak('Case sensitive', 0, null);
  }
};

/**
 * Performs the search and highlights and speaks the first result.
 *
 * @param {string} searchStr The text to search for.
 * @param {boolean} caseSensitive Whether or not the search is case sensitive.
 */
cvox.ChromeVoxSearch.doSearch = function(searchStr, caseSensitive) {
  cvox.ChromeVoxSearch.txtNode.textContent = '';

  cvox.ChromeVoxSearch.matchNodes = new Array();
  var potentialMatchNodes;
  if (caseSensitive) {
    potentialMatchNodes = cvox.XpathUtil.evalXPath(
        './/text()[contains(.,"' + searchStr + '")]',
        document.body);
  } else {
    searchStr = searchStr.toLowerCase();
    potentialMatchNodes = cvox.XpathUtil.evalXPath(
        './/text()[contains(translate(., "ABCDEFGHIJKLMNOPQRSTUVWXYZ", ' +
        '"abcdefghijklmnopqrstuvwxyz"), "' + searchStr + '")]',
        document.body);
  }
  // Only accept nodes that are considered to have content.
  for (var i = 0, node; node = potentialMatchNodes[i]; i++) {
    if (cvox.DomUtil.hasContent(node)) {
      cvox.ChromeVoxSearch.matchNodes.push(node);
    }
  }
  var firstNode = cvox.ChromeVoxSearch.matchNodes[0];
  if (firstNode) {
    cvox.ChromeVoxSearch.matchNodesIndex = 0;
    var startIndex = 0;
    if (caseSensitive) {
      startIndex = firstNode.textContent.indexOf(searchStr);
    } else {
      startIndex = firstNode.textContent.toLowerCase().indexOf(searchStr);
    }
    cvox.SelectionUtil.selectText(firstNode, startIndex,
        startIndex + searchStr.length);
    cvox.ChromeVox.traverseContent.moveNext('sentence');
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    range.setStart(firstNode, startIndex);
    sel.removeAllRanges();
    sel.addRange(range);
    cvox.SelectionUtil.scrollToSelection(sel);
    var selectionText = window.getSelection() + '';
    var anchorNode = window.getSelection().anchorNode;
    cvox.ChromeVox.navigationManager.syncToNode(anchorNode);
    cvox.ChromeVox.tts.speak(selectionText, 0, null);
    // Try to set focus if possible (ie, if the user lands on a link).
    window.setTimeout(function() {
         cvox.DomUtil.setFocus(anchorNode);
       }, 0);
  } else {
    // TODO (clchen): Replace this with an error sound once we have one defined.
    cvox.ChromeVox.tts.stop();
    cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.WRAP);
  }
  cvox.ChromeVoxSearch.txtNode.textContent = searchStr;
};

/**
 * Dismisses the search widget
 */
cvox.ChromeVoxSearch.hide = function() {
  if (cvox.ChromeVoxSearch.active) {
    cvox.ChromeVoxSearch.txtNode.parentNode.removeChild(
        cvox.ChromeVoxSearch.txtNode);
    cvox.ChromeVoxSearch.txtNode = null;
    cvox.ChromeVoxSearch.active = false;
  }
};

/**
 * Goes to the next matching result, highlights it, and speaks it.
 */
cvox.ChromeVoxSearch.next = function() {
  if (cvox.ChromeVoxSearch.matchNodes &&
      (cvox.ChromeVoxSearch.matchNodes.length > 0)) {
    cvox.ChromeVoxSearch.matchNodesIndex++;
    if (cvox.ChromeVoxSearch.matchNodes.length >
        cvox.ChromeVoxSearch.matchNodesIndex) {
      var searchStr = cvox.ChromeVoxSearch.txtNode.textContent;
      var targetNode = cvox.ChromeVoxSearch.matchNodes[
          cvox.ChromeVoxSearch.matchNodesIndex];
      var startIndex = 0;
      if (cvox.ChromeVoxSearch.caseSensitive) {
        startIndex = targetNode.textContent.indexOf(searchStr);
      } else {
        startIndex = targetNode.textContent.toLowerCase().indexOf(
            searchStr.toLowerCase());
      }
      cvox.SelectionUtil.selectText(targetNode, startIndex,
          startIndex + searchStr.length);
      cvox.ChromeVox.traverseContent.moveNext('sentence');
      var sel = window.getSelection();
      var range = sel.getRangeAt(0);
      range.setStart(targetNode, startIndex);
      sel.removeAllRanges();
      sel.addRange(range);
      cvox.SelectionUtil.scrollToSelection(sel);
      var selectionText = window.getSelection() + '';
      var anchorNode = window.getSelection().anchorNode;
      cvox.ChromeVox.navigationManager.syncToNode(anchorNode);
      cvox.ChromeVox.tts.speak(selectionText, 0, null);
      // Try to set focus if possible (ie, if the user lands on a link).
      window.setTimeout(function() {
          cvox.DomUtil.setFocus(anchorNode);
        }, 0);
    } else {
      cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.WRAP);
      cvox.ChromeVoxSearch.matchNodesIndex = -1;
      cvox.ChromeVoxSearch.next();
    }
  }
};

/**
 * Goes to the previous matching result, highlights it, and speaks it.
 */
cvox.ChromeVoxSearch.prev = function() {
  if (cvox.ChromeVoxSearch.matchNodes &&
      (cvox.ChromeVoxSearch.matchNodes.length > 0)) {
    cvox.ChromeVoxSearch.matchNodesIndex--;
    if (cvox.ChromeVoxSearch.matchNodesIndex > -1) {
      var searchStr = cvox.ChromeVoxSearch.txtNode.textContent;
      var targetNode = cvox.ChromeVoxSearch.matchNodes[
          cvox.ChromeVoxSearch.matchNodesIndex];
      var startIndex = 0;
      if (cvox.ChromeVoxSearch.caseSensitive) {
        startIndex = targetNode.textContent.indexOf(searchStr);
      } else {
        startIndex = targetNode.textContent.toLowerCase().indexOf(
            searchStr.toLowerCase());
      }
      cvox.SelectionUtil.selectText(targetNode, startIndex,
          startIndex + searchStr.length);
      cvox.ChromeVox.traverseContent.moveNext('sentence');
      var sel = window.getSelection();
      var range = sel.getRangeAt(0);
      range.setStart(targetNode, startIndex);
      sel.removeAllRanges();
      sel.addRange(range);
      cvox.SelectionUtil.scrollToSelection(sel);
      var selectionText = window.getSelection() + '';
      var anchorNode = window.getSelection().anchorNode;
      cvox.ChromeVox.navigationManager.syncToNode(anchorNode);
      cvox.ChromeVox.tts.speak(selectionText, 0, null);
      // Try to set focus if possible (ie, if the user lands on a link).
      window.setTimeout(function() {
          cvox.DomUtil.setFocus(anchorNode);
        }, 0);
    } else {
      cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.WRAP);
      cvox.ChromeVoxSearch.matchNodesIndex =
          cvox.ChromeVoxSearch.matchNodes.length;
      cvox.ChromeVoxSearch.prev();
    }
  }
};
