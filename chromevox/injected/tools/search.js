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

goog.provide('cvox.ChromeVoxSearch');

goog.require('cvox.AbstractEarcons');
goog.require('cvox.ApiImplementation');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxNavigationManager');
goog.require('cvox.SelectionUtil');
goog.require('cvox.TraverseUtil');


/**
 * @type {Element}
 */
cvox.ChromeVoxSearch.containerNode = null;

/**
 * @type {Element}
 */
cvox.ChromeVoxSearch.txtNode = null;

/**
 * @type {string}
 * @const
 */
cvox.ChromeVoxSearch.PROMPT = 'Search:';

/**
 * @type {boolean}
 */
cvox.ChromeVoxSearch.active = false;

/**
 * @type {boolean}
 */
cvox.ChromeVoxSearch.caseSensitive = false;

/**
 * @type {Node}
 */
cvox.ChromeVoxSearch.initialNode = null;

/**
 * @type {Range}
 */
cvox.ChromeVoxSearch.initialRange = null;

/**
 * @type {Node}
 */
cvox.ChromeVoxSearch.initialFocus = null;

/**
 * @type {Range}
 */
cvox.ChromeVoxSearch.startingRange = null;

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
 * Create the container node for the search overlay.
 *
 * @return {Element} The new element, not yet added to the document.
 */
cvox.ChromeVoxSearch.createContainerNode = function() {
  var containerNode = document.createElement('div');
  containerNode.style['position'] = 'fixed';
  containerNode.style['top'] = '50%';
  containerNode.style['left'] = '50%';
  containerNode.style['-webkit-transition'] = 'all 0.3s ease-in';
  containerNode.style['opacity'] = '0.0';
  containerNode.setAttribute('aria-hidden', 'true');
  return containerNode;
};

/**
 * Create the search overlay. This should be a child of the node
 * returned from createContainerNode.
 *
 * @return {Element} The new element, not yet added to the document.
 */
cvox.ChromeVoxSearch.createOverlayNode = function() {
  var overlayNode = document.createElement('div');
  overlayNode.style['position'] = 'relative';
  overlayNode.style['left'] = '-50%';
  overlayNode.style['top'] = '-40px';
  overlayNode.style['line-height'] = '1.2em';
  overlayNode.style['z-index'] = '10001';
  overlayNode.style['font-size'] = '20px';
  overlayNode.style['padding'] = '30px';
  overlayNode.style['min-width'] = '150px';
  overlayNode.style['color'] = '#fff';
  overlayNode.style['background-color'] = 'rgba(0, 0, 0, 0.7)';
  overlayNode.style['border-radius'] = '10px';
  return overlayNode;
};

/**
 * Displays the search widget.
 */
cvox.ChromeVoxSearch.show = function() {
  cvox.ChromeVoxSearch.initialNode =
      cvox.ChromeVox.navigationManager.getCurrentNode();
  var sel = window.getSelection();
  if (sel.rangeCount >= 1) {
    cvox.ChromeVoxSearch.initialRange = sel.getRangeAt(0);
  } else {
    cvox.ChromeVoxSearch.initialRange = null;
  }

  if (cvox.ChromeVoxSearch.initialRange) {
    cvox.ChromeVoxSearch.startingRange = cvox.ChromeVoxSearch.initialRange;
  } else if (cvox.ChromeVoxSearch.initialNode) {
    cvox.ChromeVoxSearch.startingRange = document.createRange();
    cvox.ChromeVoxSearch.startingRange.setStartBefore(
        cvox.ChromeVoxSearch.initialNode);
    cvox.ChromeVoxSearch.startingRange.setEndAfter(
        cvox.ChromeVoxSearch.initialNode);
  } else {
    cvox.ChromeVoxSearch.startingRange = document.createRange();
    cvox.ChromeVoxSearch.startingRange.selectNodeContents(
        cvox.DomUtil.getFirstLeafNode());
  }
  cvox.ChromeVoxSearch.initialFocus = document.activeElement;

  var containerNode = cvox.ChromeVoxSearch.createContainerNode();
  cvox.ChromeVoxSearch.containerNode = containerNode;

  var overlayNode = cvox.ChromeVoxSearch.createOverlayNode();
  containerNode.appendChild(overlayNode);

  var promptNode = document.createElement('span');
  promptNode.innerHTML = cvox.ChromeVoxSearch.PROMPT;
  overlayNode.appendChild(promptNode);

  var txtNode = document.createElement('span');
  cvox.ChromeVoxSearch.txtNode = txtNode;
  overlayNode.appendChild(txtNode);

  document.body.appendChild(containerNode);
  cvox.ChromeVoxSearch.active = true;

  window.setTimeout(function() {
    containerNode.style['opacity'] = '1.0';
  }, 0);

  cvox.ChromeVox.tts.speak(
      'Find in page, enter a search query',
      cvox.AbstractTts.QUEUE_MODE_FLUSH,
      cvox.AbstractTts.PERSONALITY_ANNOTATION);
};

/**
 * Dismisses the search widget
 */
cvox.ChromeVoxSearch.hide = function() {
  if (cvox.ChromeVoxSearch.active) {
    var containerNode = cvox.ChromeVoxSearch.containerNode;
    containerNode.style.opacity = '0.0';
    window.setTimeout(function() {
      document.body.removeChild(containerNode);
    }, 1000);
    cvox.ChromeVoxSearch.txtNode = null;
    cvox.ChromeVoxSearch.containerNode = null;
    cvox.ChromeVoxSearch.active = false;

    cvox.ChromeVox.tts.speak(
        'Exiting find in page',
        cvox.AbstractTts.QUEUE_MODE_FLUSH,
        cvox.AbstractTts.PERSONALITY_ANNOTATION);
  }
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
  var searchStr = cvox.ChromeVoxSearch.txtNode.textContent;
  var handled = false;
  if (evt.keyCode == 8) { // Backspace
    if (searchStr.length > 0) {
      searchStr = searchStr.substring(0, searchStr.length - 1);
      cvox.ChromeVoxSearch.txtNode.textContent = searchStr;
      cvox.ChromeVoxSearch.beginSearch(searchStr);
    }
    handled = true;
  } else if (evt.keyCode == 40) { // Down arrow
    cvox.ChromeVoxSearch.next(searchStr);
    handled = true;
  } else if (evt.keyCode == 38) { // Up arrow
    cvox.ChromeVoxSearch.prev(searchStr);
    handled = true;
  } else if (evt.keyCode == 13) { // Enter
    cvox.ChromeVoxSearch.hide();
    handled = true;
  } else if (evt.keyCode == 27) { // Escape
    cvox.ChromeVoxSearch.hide();
    cvox.ApiImplementation.syncToNode(
        cvox.ChromeVoxSearch.initialNode,
        true,
        cvox.AbstractTts.QUEUE_MODE_QUEUE);
    window.getSelection().removeAllRanges();
    if (cvox.ChromeVoxSearch.initialRange) {
      window.getSelection().addRange(cvox.ChromeVoxSearch.initialRange);
    }
    if (cvox.ChromeVoxSearch.initialFocus) {
      cvox.ChromeVox.markInUserCommand();
      cvox.DomUtil.setFocus(cvox.ChromeVoxSearch.initialFocus);
    } else if (document.activeElement) {
      document.activeElement.blur();
    }
    handled = true;
  } else if (evt.ctrlKey && evt.keyCode == 67) { // ctrl + c
    cvox.ChromeVoxSearch.toggleCaseSensitivity();
    handled = true;
  }
  if (handled) {
    evt.preventDefault();
    evt.stopPropagation();
  }
  return handled;
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
  cvox.ChromeVoxSearch.txtNode.textContent += String.fromCharCode(evt.charCode);
  var searchStr = cvox.ChromeVoxSearch.txtNode.textContent;
  cvox.ChromeVoxSearch.beginSearch(searchStr);
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
    cvox.ChromeVox.tts.speak('Ignoring case.', 0, null);
  } else {
    cvox.ChromeVoxSearch.caseSensitive = true;
    cvox.ChromeVox.tts.speak('Case sensitive.', 0, null);
  }
};

/**
 * Gets the next result.
 *
 * @param {string} searchStr The text to search for.
 * @param {Range} startRange The range where the search should begin.
 * @param {boolean} forwards Search forwards (true) or backwards (false).
 * @return {Range?} The next result, if any, or null if none were found.
 */
cvox.ChromeVoxSearch.getNextResult = function(
    searchStr, startRange, forwards) {
  if (!cvox.ChromeVoxSearch.caseSensitive) {
    searchStr = searchStr.toLowerCase();
  }

  // Special case: search for the next result within the same text node.
  if (startRange.endContainer.constructor == Text && forwards) {
    var node = startRange.endContainer;
    var index = startRange.endOffset;
    var remainder = node.data.substr(index);
    if (!cvox.ChromeVoxSearch.caseSensitive) {
      remainder = remainder.toLowerCase();
    }
    var found = remainder.indexOf(searchStr);
    if (found >= 0) {
      var result = document.createRange();
      result.setStart(node, index + found);
      result.setEnd(node, index + found + searchStr.length);
      return result;
    }
  }

  // Special case: search for the previous result within the same text node.
  if (startRange.startContainer.constructor == Text && !forwards) {
    var node = startRange.startContainer;
    var index = startRange.startOffset;
    var remainder = node.data.substr(0, index);
    if (!cvox.ChromeVoxSearch.caseSensitive) {
      remainder = remainder.toLowerCase();
    }
    var found = remainder.indexOf(searchStr);
    if (found >= 0) {
      var result = document.createRange();
      result.setStart(node, found);
      result.setEnd(node, found + searchStr.length);
      return result;
    }
  }

  // Otherwise, start searching for a match.
  var current =
      forwards ?
      cvox.DomUtil.nextLeafNode(startRange.endContainer) :
      cvox.DomUtil.previousLeafNode(startRange.startContainer);
  while (current && current != document.body) {
    if (cvox.DomUtil.hasContent(current)) {
      var text = current.constructor == Text ?
                 current.data :
                 cvox.DomUtil.getName(current);
      if (!cvox.ChromeVoxSearch.caseSensitive) {
        text = text.toLowerCase();
      }
      var found = forwards ?
                  text.indexOf(searchStr) :
                  text.lastIndexOf(searchStr);
      if (found >= 0) {
        var result = document.createRange();
        if (current.constructor == Text) {
          result.setStart(current, found);
          result.setEnd(current, found + searchStr.length);
        } else {
          result.setStartBefore(current);
          result.setEndAfter(current);
        }
        return result;
      }
    }
    if (forwards) {
      current = cvox.DomUtil.nextLeafNode(current);
    } else {
      current = cvox.DomUtil.previousLeafNode(current);
    }
  };

  // Edge of document reached, no matches found.
  return null;
};

/**
 * Performs the search starting from the initial position.
 *
 * @param {string} searchStr The text to search for.
 */
cvox.ChromeVoxSearch.beginSearch = function(searchStr) {
  var result = cvox.ChromeVoxSearch.getNextResult(
      searchStr, cvox.ChromeVoxSearch.startingRange, true);
  cvox.ChromeVoxSearch.outputSearchResult(result);
};

/**
 * Goes to the next matching result.
 *
 * @param {string} searchStr The text to search for.
 */
cvox.ChromeVoxSearch.next = function(searchStr) {
  var range = window.getSelection().getRangeAt(0);
  var result = cvox.ChromeVoxSearch.getNextResult(searchStr, range, true);
  cvox.ChromeVoxSearch.outputSearchResult(result);
};

/**
 * Goes to the previous matching result.
 *
 * @param {string} searchStr The text to search for.
 */
cvox.ChromeVoxSearch.prev = function(searchStr) {
  var range = window.getSelection().getRangeAt(0);
  var result = cvox.ChromeVoxSearch.getNextResult(searchStr, range, false);
  cvox.ChromeVoxSearch.outputSearchResult(result);
};

/**
 * Given a range corresponding to a search result, highlight the result,
 * speak it, focus the node if applicable, and speak some instructions
 * at the end.
 *
 * @param {Range?} result The DOM range where the next result was found.
 *     If null, no more results were found and an error will be presented.
 */
cvox.ChromeVoxSearch.outputSearchResult = function(result) {
  if (!result) {
    cvox.ChromeVox.tts.stop();
    cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.WRAP);
    return;
  }

  if (result.endContainer.constructor == Text) {
    // Extend to the end of the sentence or to the end of the text block.
    var endCursor = new Cursor(
        result.endContainer,
        result.endOffset,
        result.endContainer.data);
    var startCursor = endCursor.clone();
    if (cvox.TraverseUtil.getNextSentence(startCursor, endCursor, [], {}) &&
        endCursor.node == result.endContainer) {
      result.setEnd(endCursor.node, endCursor.index);
    } else {
      result.setEndAfter(result.endContainer);
    }
  }

  // Sync to the original node and then to the current search result
  // so that the previous node is set correctly for ancestor calculations.
  cvox.ChromeVox.navigationManager.syncToNode(cvox.ChromeVoxSearch.initialNode);
  cvox.ChromeVox.navigationManager.syncToNode(result.endContainer);
  var description = cvox.DomUtil.getDescriptionFromAncestors(
      cvox.ChromeVox.navigationManager.getChangedAncestors(),
      true,
      cvox.ChromeVox.verbosity);

  // Now set the selection.
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(result);
  cvox.SelectionUtil.scrollToSelection(sel);
  var anchorNode = sel.anchorNode;

  // If the result is in a pure-Text node, replace the full text of the
  // target node with just the selection portion.
  if (result.endContainer.constructor == Text) {
    description.text = (sel + '');
  }

  // Speak the description and some instructions.
  cvox.ChromeVox.navigationManager.speakDescriptionArray(
      [description],
      cvox.AbstractTts.QUEUE_MODE_FLUSH,
      null);
  cvox.ChromeVox.tts.speak(
      'Press enter to accept or escape to cancel, ' +
          'down for next and up for previous.',
      cvox.AbstractTts.QUEUE_MODE_QUEUE,
      cvox.AbstractTts.PERSONALITY_ANNOTATION);

  // Try to set focus if possible (ie, if the user lands on a link).
  window.setTimeout(function() {
    cvox.ChromeVox.markInUserCommand();
    cvox.DomUtil.setFocus(anchorNode);
  }, 0);
};
