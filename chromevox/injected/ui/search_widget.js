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
 * @fileoverview JavaScript for poppup up a search widget and performing
 * search within a page.
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.SearchWidget');

goog.require('cvox.AbstractEarcons');
goog.require('cvox.ApiImplementation');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxNavigationManager');
goog.require('cvox.Cursor');
goog.require('cvox.SelectionUtil');
goog.require('cvox.TraverseUtil');
goog.require('cvox.Widget');


/**
 * Initializes the search widget.
 * @constructor
 * @extends {cvox.Widget}
 */
cvox.SearchWidget = function() {
  /**
   * @type {Element}
   * @private
   */
  this.containerNode_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.txtNode_ = null;

  /**
   * @type {string}
   * @const
   * @private
   */
  this.PROMPT_ = 'Search:';

  /**
   * @type {boolean}
   * @private
   */
  this.caseSensitive_ = false;

  /**
   * @type {Node}
   * @private
   */
  this.initialNode_ = null;

  /**
   * @type {Range}
   * @private
   */
  this.initialRange_ = null;

  /**
   * @type {Node}
   * @private
   */
  this.initialFocus_ = null;

  /**
   * @type {Range}
   * @private
   */
  this.startingRange_ = null;
};
goog.inherits(cvox.SearchWidget, cvox.Widget);
goog.addSingletonGetter(cvox.SearchWidget);

/**
 * Displays the search widget.
 * @override
 */
cvox.SearchWidget.prototype.show = function() {
  cvox.SearchWidget.superClass_.show.call(this);

  this.initialNode_ =
      cvox.ChromeVox.navigationManager.getCurrentNode();
  var sel = window.getSelection();
  if (sel.rangeCount >= 1) {
    this.initialRange_ = sel.getRangeAt(0);
  } else {
    this.initialRange_ = null;
  }

  if (this.initialRange_) {
    this.startingRange_ = this.initialRange_;
  } else if (this.initialNode_) {
    this.startingRange_ = document.createRange();
    this.startingRange_.setStartBefore(this.initialNode_);
    this.startingRange_.setEndAfter(this.initialNode_);
  } else {
    this.startingRange_ = document.createRange();
    this.startingRange_.selectNodeContents(cvox.DomUtil.getFirstLeafNode());
  }
  this.initialFocus_ = document.activeElement;

  var containerNode = this.createContainerNode_();
  this.containerNode_ = containerNode;

  var overlayNode = this.createOverlayNode_();
  containerNode.appendChild(overlayNode);

  var promptNode = document.createElement('span');
  promptNode.innerHTML = this.PROMPT_;
  overlayNode.appendChild(promptNode);

  this.txtNode_ = document.createElement('span');
  overlayNode.appendChild(this.txtNode_);

  document.body.appendChild(containerNode);

  window.setTimeout(function() {
    containerNode.style['opacity'] = '1.0';
  }, 0);
};

/**
 * Dismisses the search widget
 * @override
 */
cvox.SearchWidget.prototype.hide = function() {
  if (this.isActive()) {
    var containerNode = this.containerNode_;
    containerNode.style.opacity = '0.0';
    window.setTimeout(function() {
      document.body.removeChild(containerNode);
    }, 1000);
    this.txtNode_ = null;
    cvox.SearchWidget.containerNode = null;
  }
  cvox.$m('search_widget_outro').speakFlush();

  cvox.SearchWidget.superClass_.hide.call(this, true);
};

/**
 * @override
 */
cvox.SearchWidget.prototype.getName = function() {
  return 'search_widget_intro';
};

/**
 * @override
 */
cvox.SearchWidget.prototype.getHelp = function() {
  return 'search_widget_intro_help';
};

/**
 * Handles the keyDown event when the search widget is active.
 *
 * @override
 */
cvox.SearchWidget.prototype.onKeyDown = function(evt) {
  if (!this.isActive()) {
    return false;
  }

  var searchStr = this.txtNode_.textContent;
  var handled = false;
  if (evt.keyCode == 8) { // Backspace
    if (searchStr.length > 0) {
      searchStr = searchStr.substring(0, searchStr.length - 1);
      this.txtNode_.textContent = searchStr;
      this.beginSearch_(searchStr);
    }
    handled = true;
  } else if (evt.keyCode == 40) { // Down arrow
    this.next_(searchStr);
    handled = true;
  } else if (evt.keyCode == 38) { // Up arrow
    this.prev_(searchStr);
    handled = true;
  } else if (evt.keyCode == 13) { // Enter
    this.hide();
    handled = true;
  } else if (evt.keyCode == 27) { // Escape
    this.hide();
    cvox.ApiImplementation.syncToNode(this.initialNode_,
                                      true,
                                      cvox.AbstractTts.QUEUE_MODE_QUEUE);
    window.getSelection().removeAllRanges();
    if (this.initialRange_) {
      window.getSelection().addRange(this.initialRange_);
    }
    if (this.initialFocus_) {
      cvox.ChromeVox.markInUserCommand();
      cvox.DomUtil.setFocus(this.initialFocus_);
    } else if (document.activeElement) {
      document.activeElement.blur();
    }
    handled = true;
  } else if (evt.ctrlKey && evt.keyCode == 67) { // ctrl + c
    this.toggleCaseSensitivity_();
    handled = true;
  } else {
    return cvox.SearchWidget.superClass_.onKeyDown.call(this, evt);
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
 * @override
 */
cvox.SearchWidget.prototype.onKeyPress = function(evt) {
  if (!this.isActive()) {
    return false;
  }

  this.txtNode_.textContent += String.fromCharCode(evt.charCode);
  var searchStr = this.txtNode_.textContent;
  this.beginSearch_(searchStr);
  evt.preventDefault();
  evt.stopPropagation();
  return true;
};

/**
 * Create the container node for the search overlay.
 *
 * @return {!Element} The new element, not yet added to the document.
 * @private
 */
cvox.SearchWidget.prototype.createContainerNode_ = function() {
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
 * @return {!Element} The new element, not yet added to the document.
 * @private
 */
cvox.SearchWidget.prototype.createOverlayNode_ = function() {
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
 * Toggles whether or not searches are case sensitive.
 * @private
 */
cvox.SearchWidget.prototype.toggleCaseSensitivity_ = function() {
  if (this.caseSensitive_) {
    cvox.SearchWidget.caseSensitive_ = false;
    cvox.ChromeVox.tts.speak('Ignoring case.', 0, null);
  } else {
    this.caseSensitive_ = true;
    cvox.ChromeVox.tts.speak('Case sensitive.', 0, null);
  }
};

/**
 * Gets the next result.
 *
 * @param {string} searchStr The text to search for.
 * @param {Range} startRange The range where the search should begin.
 * @param {boolean} forwards Search forwards (true) or backwards (false).
 * @return {Range} The next result, if any, or null if none were found.
 * @private
 */
cvox.SearchWidget.prototype.getNextResult_ = function(
    searchStr, startRange, forwards) {
  if (!this.caseSensitive_) {
    searchStr = searchStr.toLowerCase();
  }

  // Special case: search for the next result within the same text node.
  if (startRange.endContainer.constructor == Text && forwards) {
    var node = startRange.endContainer;
    var index = startRange.endOffset;
    var remainder = node.data.substr(index);
    if (!this.caseSensitive_) {
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
    if (!this.caseSensitive_) {
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
      cvox.DomUtil.directedNextLeafNode(startRange.endContainer) :
      cvox.DomUtil.previousLeafNode(startRange.startContainer);
  while (current && current != document.body) {
    if (cvox.DomUtil.hasContent(current)) {
      var text = current.constructor == Text ?
                 current.data :
                 cvox.DomUtil.getName(current);
      if (!this.caseSensitive_) {
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
      current = cvox.DomUtil.directedNextLeafNode(current);
    } else {
      current = cvox.DomUtil.previousLeafNode(current);
    }
  }

  // Edge of document reached, no matches found.
  return null;
};

/**
 * Performs the search starting from the initial position.
 *
 * @param {string} searchStr The text to search for.
 * @private
 */
cvox.SearchWidget.prototype.beginSearch_ = function(searchStr) {
  var result = this.getNextResult_(searchStr, this.startingRange_, true);
  this.outputSearchResult_(result);
};

/**
 * Goes to the next matching result.
 *
 * @param {string} searchStr The text to search for.
 * @private
 */
cvox.SearchWidget.prototype.next_ = function(searchStr) {
  var range = window.getSelection().getRangeAt(0);
  var result = this.getNextResult_(searchStr, range, true);
  this.outputSearchResult_(result);
};

/**
 * Goes to the previous matching result.
 *
 * @param {string} searchStr The text to search for.
 * @private
 */
cvox.SearchWidget.prototype.prev_ = function(searchStr) {
  var range = window.getSelection().getRangeAt(0);
  var result = this.getNextResult_(searchStr, range, false);
  this.outputSearchResult_(result);
};

/**
 * Given a range corresponding to a search result, highlight the result,
 * speak it, focus the node if applicable, and speak some instructions
 * at the end.
 *
 * @param {Range?} result The DOM range where the next result was found.
 *     If null, no more results were found and an error will be presented.
 * @private
 */
cvox.SearchWidget.prototype.outputSearchResult_ = function(result) {
  if (!result) {
    cvox.ChromeVox.tts.stop();
    cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.WRAP);
    return;
  }

  if (result.endContainer.constructor == Text) {
    // Extend to the end of the sentence or to the end of the text block.
    var endCursor = new cvox.Cursor(
        result.endContainer,
        result.endOffset,
        result.endContainer.data);
    var startCursor = endCursor.clone();
    if (cvox.TraverseUtil.getNextSentence(startCursor, endCursor, [], [], {}) &&
        endCursor.node == result.endContainer) {
      result.setEnd(endCursor.node, endCursor.index);
    } else {
      result.setEndAfter(result.endContainer);
    }
  }

  // Sync to the original node and then to the current search result
  // so that the previous node is set correctly for ancestor calculations.
  cvox.ChromeVox.navigationManager.updateSel(
      cvox.CursorSelection.fromNode(this.initialNode_));
  cvox.ChromeVox.navigationManager.updateSel(
      cvox.CursorSelection.fromNode(result.endContainer));
  var description = cvox.ChromeVox.navigationManager.getDescription();

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
      description,
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
