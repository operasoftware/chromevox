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
 * @fileoverview A DOM traversal interface for moving a selection around a
 * webpage. Provides multiple granularities:
 * 1. Move by paragraph.
 * 2. Move by sentence.
 * 3. Move by line.
 * 4. Move by word.
 * 5. Move by character.
 * @author rshearer@google.com (Rachel Shearer)
 */

goog.provide('cvox.TraverseContent');

goog.require('cvox.DomUtil');
goog.require('cvox.SelectionUtil');
goog.require('cvox.TraverseUtil');

/**
 * Moves a selection around a document or within a provided DOM object.
 *
 * @constructor
 * @param {Node=} domObj a DOM node (optional).
 */
cvox.TraverseContent = function(domObj) {
  if (domObj != null) {
    this.currentDomObj = domObj;
  } else {
    this.currentDomObj = document.body;
  }
};

/**
 * Whether the last navigated selection only contained whitespace.
 * @type {boolean}
 */
cvox.TraverseContent.prototype.lastSelectionWasWhitespace = false;

/**
 * Whether we should skip whitespace when traversing individual characters.
 * @type {boolean}
 */
cvox.TraverseContent.prototype.skipWhitespace = false;

/**
 * The maximum number of characters that can be on one line when doing
 * line-based traversal.
 * @type {number}
 */
cvox.TraverseContent.prototype.lineLength = 40;

/**
 * If moveNext and movePrev should skip past an invalid selection,
 * so the user never gets stuck. Ideally the navigation code should never
 * return a range that's not a valid selection, but this keeps the user from
 * getting stuck if that code fails.  This is set to false for unit testing.
 * @type {boolean}
 */
cvox.TraverseContent.prototype.skipInvalidSelections = true;

/**
 * If line and sentence navigation should break at <a> links.
 * @type {boolean}
 */
cvox.TraverseContent.prototype.breakAtLinks = false;

/**
 * The string constant for character granularity.
 * @type {string}
 * @const
 */
cvox.TraverseContent.kCharacter = 'character';

/**
 * The string constant for word granularity.
 * @type {string}
 * @const
 */
cvox.TraverseContent.kWord = 'word';

/**
 * The string constant for sentence granularity.
 * @type {string}
 * @const
 */
cvox.TraverseContent.kSentence = 'sentence';

/**
 * The string constant for line granularity.
 * @type {string}
 * @const
 */
cvox.TraverseContent.kLine = 'line';

/**
 * The string constant for paragraph granularity.
 * @type {string}
 * @const
 */
cvox.TraverseContent.kParagraph = 'paragraph';

/**
 * A constant array of all granularities.
 * @type {Array.<string>}
 * @const
 */
cvox.TraverseContent.kAllGrains =
    [cvox.TraverseContent.kParagraph,
     cvox.TraverseContent.kSentence,
     cvox.TraverseContent.kLine,
     cvox.TraverseContent.kWord,
     cvox.TraverseContent.kCharacter];

/**
 * Moves selection forward.
 *
 * @param {string} grain specifies "sentence", "word", "character",
 *     or "paragraph" granularity.
 * @return {Selection} Either:
 *                1) The fixed-up selection.
 *                2) null if the end of the domObj has been reached.
 */
cvox.TraverseContent.prototype.moveNext = function(grain) {
  this.normalizeSelection();

  var selection = window.getSelection();
  var startCursor = new Cursor(
      selection.anchorNode, selection.anchorOffset,
      cvox.TraverseUtil.getNodeText(selection.anchorNode));
  var endCursor = new Cursor(
      selection.focusNode, selection.focusOffset,
      cvox.TraverseUtil.getNodeText(selection.focusNode));
  var breakTags = this.getBreakTags();
  // As a special case, if the current selection is empty or all
  // whitespace, ensure that the next returned selection will NOT be
  // only whitespace - otherwise you can get trapped.
  var skipWhitespace = this.skipWhitespace;

  if (!cvox.SelectionUtil.isSelectionValid(selection)) {
    skipWhitespace = true;
  }

  var nodesCrossed = [];
  var str;

  do {
    if (grain === cvox.TraverseContent.kSentence) {
      str = cvox.TraverseUtil.getNextSentence(
          startCursor, endCursor, nodesCrossed, breakTags);
    } else if (grain === cvox.TraverseContent.kWord) {
      str = cvox.TraverseUtil.getNextWord(startCursor, endCursor,
          nodesCrossed);
    } else if (grain === cvox.TraverseContent.kCharacter) {
      str = cvox.TraverseUtil.getNextChar(startCursor, endCursor,
          nodesCrossed, skipWhitespace);
    } else if (grain === cvox.TraverseContent.kParagraph) {
      str = cvox.TraverseUtil.getNextParagraph(startCursor, endCursor,
          nodesCrossed);
    } else if (grain === cvox.TraverseContent.kLine) {
      str = cvox.TraverseUtil.getNextLine(
        startCursor, endCursor, nodesCrossed, this.lineLength, breakTags);
    } else {
      // User has provided an invalid string.
      // Fall through to default: extend by sentence
      console.log('Invalid selection granularity: "' + grain + '"');
      grain = cvox.TraverseContent.kSentence;
      str = cvox.TraverseUtil.getNextSentence(
          startCursor, endCursor, nodesCrossed, breakTags);
    }

    // Select the new object.
    selection = cvox.TraverseUtil.setSelection(startCursor, endCursor);

    if (str == null) {
      // We reached the end of the document.
      return null;
    }
  } while (this.skipInvalidSelections && selection.isCollapsed);

  if (!cvox.SelectionUtil.isSelectionValid(selection)) {
    // It's OK if the selection navigation lands on whitespace once, but if it
    // hits whitespace more than once, then skip forward until there is real
    // content.
    if (!this.lastSelectionWasWhitespace) {
      this.lastSelectionWasWhitespace = true;
    } else {
      while (!cvox.SelectionUtil.isSelectionValid(
          selection = window.getSelection())) {
        this.moveNext(grain);
      }
    }
  } else {
    this.lastSelectionWasWhitespace = false;
  }

  if (!cvox.DomUtil.isDescendantOfNode(
      selection.focusNode, selection.anchorNode)) {
    // Selection spans more than a single node, trim it back.
    if (selection.anchorNode.nodeType == 3) { // NODETYPE 3 == text node
      cvox.SelectionUtil.selectText(selection.anchorNode,
          selection.anchorOffset,
          selection.anchorNode.textContent.length);
      return window.getSelection();
    }
  }
  return selection;
};


/**
 * Moves selection backward.
 *
 * @param {string} grain specifies "sentence", "word", "character",
 *     or "paragraph" granularity.
 * @return {Selection} Either:
 *                1) The fixed-up selection.
 *                2) null if the beginning of the domObj has been reached.
 */
cvox.TraverseContent.prototype.movePrev = function(grain) {
  this.normalizeSelection();

  var selection = window.getSelection();
  var startCursor = new Cursor(
      selection.anchorNode, selection.anchorOffset,
      cvox.TraverseUtil.getNodeText(selection.anchorNode));
  var endCursor = new Cursor(
      selection.focusNode, selection.focusOffset,
      cvox.TraverseUtil.getNodeText(selection.focusNode));
  var breakTags = this.getBreakTags();
  // As a special case, if the current selection is empty or all
  // whitespace, ensure that the next returned selection will NOT be
  // only whitespace - otherwise you can get trapped.
  var skipWhitespace = this.skipWhitespace;
  if (!cvox.SelectionUtil.isSelectionValid(selection))
    skipWhitespace = true;

  var nodesCrossed = [];
  var str;

  do {
    if (grain === cvox.TraverseContent.kSentence) {
      str = cvox.TraverseUtil.getPreviousSentence(
          startCursor, endCursor, nodesCrossed, breakTags);
    } else if (grain === cvox.TraverseContent.kWord) {
      str = cvox.TraverseUtil.getPreviousWord(startCursor, endCursor,
          nodesCrossed);
    } else if (grain === cvox.TraverseContent.kCharacter) {
      var skipWhitespace = this.skipWhitespace;
      if (!cvox.SelectionUtil.isSelectionValid(selection))
        skipWhitespace = true;
      str = cvox.TraverseUtil.getPreviousChar(startCursor, endCursor,
          nodesCrossed, skipWhitespace);
    } else if (grain === cvox.TraverseContent.kParagraph) {
      str = cvox.TraverseUtil.getPreviousParagraph(
        startCursor, endCursor, nodesCrossed);
    } else if (grain === cvox.TraverseContent.kLine) {
      str = cvox.TraverseUtil.getPreviousLine(
        startCursor, endCursor, nodesCrossed, this.lineLength, breakTags);
    } else {
      // User has provided an invalid string.
      // Fall through to default: extend by sentence
      console.log('Invalid selection granularity: "' + grain + '"');
      grain = cvox.TraverseContent.kSentence;
      str = cvox.TraverseUtil.getPreviousSentence(
          startCursor, endCursor, nodesCrossed, breakTags);
    }

    // Select the new object.
    selection = cvox.TraverseUtil.setSelection(startCursor, endCursor);

    if (str == null) {
      // We reached the end of the document.
      return null;
    }
  } while (this.skipInvalidSelections && selection.isCollapsed);

  if (!cvox.SelectionUtil.isSelectionValid(selection)) {
    // It's OK if the selection navigation lands on whitespace once, but if it
    // hits whitespace more than once, then skip forward until there is real
    // content.
    if (!this.lastSelectionWasWhitespace) {
      this.lastSelectionWasWhitespace = true;
    } else {
      while (!cvox.SelectionUtil.isSelectionValid(
          selection = window.getSelection())) {
        this.movePrev(grain);
      }
    }
  } else {
    this.lastSelectionWasWhitespace = false;
  }

  if (!cvox.DomUtil.isDescendantOfNode(
      selection.focusNode, selection.anchorNode)) {
    // Selection spans more than a single node, trim it back.
    if (selection.focusNode.nodeType == 3) { // NODETYPE 3 == text node
      cvox.SelectionUtil.selectText(selection.focusNode,
          0, selection.focusOffset);
      return window.getSelection();
    }
  }

  return selection;
};

/**
 * Get the tag names that should break a sentence or line. Currently
 * just an anchor 'A' should break a sentence or line if the breakAtLinks
 * flag is true, but in the future we might have other rules for breaking.
 *
 * @return {Object} An associative array mapping a tag name to true if
 *     it should break a sentence or line.
 */
cvox.TraverseContent.prototype.getBreakTags = function() {
  return this.breakAtLinks ? {'A': true} : {};
};

/**
 * Selects the next element of the document or within the provided DOM object.
 * Scrolls the window as appropriate.
 *
 * @param {string} grain specifies "sentence", "word", "character",
 *     or "paragraph" granularity.
 * @param {Node=} domObj a DOM node (optional).
 * @return {Selection} Either:
 *               1) The current selection.
 *               2) null if the end of the domObj has been reached.
 */
cvox.TraverseContent.prototype.nextElement = function(grain, domObj) {
  if (domObj != null) {
    this.currentDomObj = domObj;
  }

  if (! ((grain === 'sentence') || (grain === 'word') ||
      (grain === 'character') || (grain === 'paragraph'))) {
    // User has provided an invalid string.
    // Fall through to default: extend by sentence
    console.log('Invalid selection granularity: "' + grain + '"');
    grain = 'sentence';
  }

  var sel = this.moveNext(grain);
  if (sel != null &&
      (!cvox.DomUtil.isDescendantOfNode(sel.anchorNode, this.currentDomObj) ||
       !cvox.DomUtil.isDescendantOfNode(sel.focusNode, this.currentDomObj))) {
    return null;
  }

  if (sel != null) {
    // Force window scroll to current selection
    cvox.SelectionUtil.scrollToSelection(window.getSelection());
  }

  return sel;
};


/**
 * Selects the previous element of the document or within the provided DOM
 * object. Scrolls the window as appropriate.
 *
 * @param {string} grain specifies "sentence", "word", "character",
 *     or "paragraph" granularity.
 * @param {Node=} domObj a DOM node (optional).
 * @return {Selection} Either:
 *               1) The current selection.
 *               2) null if the beginning of the domObj has been reached.
 */
cvox.TraverseContent.prototype.prevElement = function(grain, domObj) {

  if (domObj != null) {
    this.currentDomObj = domObj;
  }

  if (! ((grain === 'sentence') || (grain === 'word') ||
      (grain === 'character') || (grain === 'paragraph'))) {
    // User has provided an invalid string.
    // Fall through to default: extend by sentence
    console.log('Invalid selection granularity: "' + grain + '"');
    grain = 'sentence';
  }

  var sel = this.movePrev(grain);

  if (sel != null &&
      (!cvox.DomUtil.isDescendantOfNode(sel.anchorNode, this.currentDomObj) ||
       !cvox.DomUtil.isDescendantOfNode(sel.focusNode, this.currentDomObj))) {
    return null;
  }

  if (sel != null) {
    // Force window scroll to current selection
    cvox.SelectionUtil.scrollToSelection(window.getSelection());
  }

  return sel;
};

/**
 * Make sure that exactly one item is selected. If there's no selection,
 * set the selection to the start of the document.
 */
cvox.TraverseContent.prototype.normalizeSelection = function() {
  var selection = window.getSelection();
  if (selection.rangeCount < 1) {
    // Before the user has clicked a freshly-loaded page

    var range = document.createRange();
    range.setStart(this.currentDomObj, 0);
    range.setEnd(this.currentDomObj, 0);

    selection.removeAllRanges();
    selection.addRange(range);

  } else if (selection.rangeCount > 1) {
    //  Multiple ranges exist - remove all ranges but the last one
    for (var i = 0; i < (selection.rangeCount - 1); i++) {
      selection.removeRange(selection.getRangeAt(i));
    }
  }
};

/**
 * Resets the selection.
 *
 * @param {Node=} domObj a DOM node.  Optional.
 *
 */
cvox.TraverseContent.prototype.reset = function(domObj) {
  window.getSelection().removeAllRanges();
};
