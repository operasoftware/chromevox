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
 * @fileoverview A JavaScript class for walking the DOM in a "smart" way.
 * Includes special DOM navigation for tables.
 * @author rshearer@google.com (Rachel Shearer)
 */


goog.provide('cvox.SmartDomWalker');

goog.require('cvox.AriaUtil');
goog.require('cvox.DomUtil');
goog.require('cvox.LinearDomWalker');
goog.require('cvox.TraverseTable');
goog.require('cvox.XpathUtil');


/**
 * A subclass of LinearDomWalker that walks the DOM in a smarter way. Includes
 * special smart navigation for tables and richer content descriptions.
 * @extends {cvox.LinearDomWalker}
 * @constructor
 */
cvox.SmartDomWalker = function() {
  this.tables = [];
  this.currentTableNavigator = null;
  this.tableMode = false;
  this.isGrid = false;

  this.announceTable = false;

  // Whether we've just bumped the edge (first or last row, first or last
  // column) of the table.
  this.bumpedEdge = false;

  // Whether we've bumped the bottom or top edge of the table twice.
  this.bumpedTwice = false;
};
goog.inherits(cvox.SmartDomWalker, cvox.LinearDomWalker);


/**
 * @type {number}
 * If a node contains more characters than this, it should not be treated
 * as a leaf node by the smart navigation algorithm.
 *
 * This number was determined by looking at the average number of
 * characters in a paragraph:
 * http://www.fullondesign.co.uk/design/usability/
 * 285-how-many-characters-per-a-page-is-normal.htm
 * and then trying it out on a few popular websites (CNN, BBC,
 * Google Search, etc.) and making sure it made sense.
 */
cvox.SmartDomWalker.SMARTNAV_MAX_CHARCOUNT = 1500;


/**
 * @type {string}
 * If a node contains any of these elements, it should not be treated
 * as a leaf node by the smart navigation algorithm.
 */
cvox.SmartDomWalker.SMARTNAV_BREAKOUT_XPATH = './/blockquote |' +
    './/button |' +
    './/code |' +
    './/form |' +
    './/frame |' +
    './/h1 |' +
    './/h2 |' +
    './/h3 |' +
    './/h4 |' +
    './/h5 |' +
    './/h6 |' +
    './/hr |' +
    './/iframe |' +
    './/input |' +
    './/object |' +
    './/ol |' +
    './/p |' +
    './/pre |' +
    './/select |' +
    './/table |' +
    './/tr |' +
    './/ul |' +
    // Aria widget roles
    './/*[@role="alert"] |' +
    './/*[@role="alertdialog"] |' +
    './/*[@role="button"] |' +
    './/*[@role="checkbox"] |' +
    './/*[@role="combobox"] |' +
    './/*[@role="dialog"] |' +
    './/*[@role="log"] |' +
    './/*[@role="marquee"] |' +
    './/*[@role="menubar"] |' +
    './/*[@role="progressbar"] |' +
    './/*[@role="radio"] |' +
    './/*[@role="radiogroup"] |' +
    './/*[@role="scrollbar"] |' +
    './/*[@role="slider"] |' +
    './/*[@role="spinbutton"] |' +
    './/*[@role="status"] |' +
    './/*[@role="tab"] |' +
    './/*[@role="tabpanel"] |' +
    './/*[@role="textbox"] |' +
    './/*[@role="toolbar"] |' +
    './/*[@role="tooltip"] |' +
    './/*[@role="treeitem"] |' +
    // Aria structure roles
    './/*[@role="article"] |' +
    './/*[@role="document"] |' +
    './/*[@role="group"] |' +
    './/*[@role="heading"] |' +
    './/*[@role="img"] |' +
    './/*[@role="list"] |' +
    './/*[@role="math"] |' +
    './/*[@role="region"] |' +
    './/*[@role="row"] |' +
    './/*[@role="separator"]';


/**
 * Starts table navigation
 * @param {Node} tableNode A table node.
 */
cvox.SmartDomWalker.prototype.startTableNavigation = function(tableNode) {
  this.currentTableNavigator =
      new cvox.TraverseTable(tableNode);
  this.tables.push(this.currentTableNavigator);
  this.tableMode = true;

  this.announceTable = true;

  if (tableNode.getAttribute('role') == 'grid') {
    this.isGrid = true;
  }
};


/**
 * Stops traversing the current table.
 */
cvox.SmartDomWalker.prototype.exitTable = function() {
  this.bumpedEdge = false;
  this.bumpedTwice = false;
  this.tableMode = false;
  this.isGrid = false;
};


/**
 * Navigates to the first cell of the table.
 * @return {Node} Returns the first cell. Null if the table does not have
 * a valid first cell.
 */
cvox.SmartDomWalker.prototype.goToFirstCell = function() {
  if (!this.tableMode) {
    return null;
  }
  if (this.currentTableNavigator.goToCell([0, 0])) {

    this.previousNode = this.currentNode;
    this.setCurrentNode(this.currentTableNavigator.getCell());

    return this.currentNode;
  }
  return null;
};


/**
 * Navigates to the last cell of the table.
 * @return {Node} Returns the last cell. Null if the table does not have
 * a valid last cell.
 */
cvox.SmartDomWalker.prototype.goToLastCell = function() {
  if (!this.tableMode) {
    return null;
  }
  if (this.currentTableNavigator.goToLastCell()) {

    this.previousNode = this.currentNode;
    this.setCurrentNode(this.currentTableNavigator.getCell());

    return this.currentNode;
  }
  return null;
};


/**
 * Navigates to the first cell of current row of the table.
 * @return {Node} Returns the first cell of the row. Null if the table row does
 * not have a valid first cell.
 */
cvox.SmartDomWalker.prototype.goToRowFirstCell = function() {
  if (!this.tableMode) {
    return null;
  }
  var cursor = this.currentTableNavigator.currentCellCursor;
  if (this.currentTableNavigator.goToCell([cursor[0], 0])) {
    this.previousNode = this.currentNode;
    this.setCurrentNode(this.currentTableNavigator.getCell());

    if (this.announceTable) {
      this.announceTable = false;
    }

    return this.currentNode;
  }
  return null;
};


/**
 * Navigates to the last cell of the current column of the table.
 * @return {Node} Returns the last cell of the row. Null if the table row
 * does not have a valid last cell.
 */
cvox.SmartDomWalker.prototype.goToRowLastCell = function() {
  if (!this.tableMode) {
    return null;
  }
  if (this.currentTableNavigator.goToRowLastCell()) {
    this.previousNode = this.currentNode;
    this.setCurrentNode(this.currentTableNavigator.getCell());

    if (this.announceTable) {
      this.announceTable = false;
    }

    return this.currentNode;
  }
  return null;
};


/**
 * Navigates to the first cell of current column of the table.
 * @return {Node} Returns the first cell of the column. Null if the table column
 * does not have a valid first cell.
 */
cvox.SmartDomWalker.prototype.goToColFirstCell = function() {
  if (!this.tableMode) {
    return null;
  }
  var cursor = this.currentTableNavigator.currentCellCursor;
  if (this.currentTableNavigator.goToCell([0, cursor[1]])) {
    this.previousNode = this.currentNode;
    this.setCurrentNode(this.currentTableNavigator.getCell());

    if (this.announceTable) {
      this.announceTable = false;
    }

    return this.currentNode;
  }
  return null;
};


/**
 * Navigates to the last cell of the current column of the table.
 * @return {Node} Returns the last cell of the column. Null if the table column
 * does not have a valid last cell.
 */
cvox.SmartDomWalker.prototype.goToColLastCell = function() {
  if (!this.tableMode) {
    return null;
  }
  if (this.currentTableNavigator.goToColLastCell()) {

    this.previousNode = this.currentNode;
    this.setCurrentNode(this.currentTableNavigator.getCell());

    if (this.announceTable) {
      this.announceTable = false;
    }

    return this.currentNode;
  }
  return null;
};


/**
 * Navigates to the previous row of the table. If table traversal has not
 * started, navigates to the first cell of the table.
 * @return {Node} Returns the cell in the previous row (same column) of the
 * table. Null if the table does not have a cell in that location.
 */
cvox.SmartDomWalker.prototype.previousRow = function() {
  if (!this.tableMode) {
    return null;
  }
  var activeIndex = this.currentTableNavigator.currentCellCursor;
  if ((activeIndex) &&
      (this.currentTableNavigator.goToCell([(activeIndex[0] - 1),
                                            activeIndex[1]]))) {
    this.previousNode = this.currentNode;

    if (this.findNearestValidElement_(false)) {
      this.exitTable();
      return this.currentNode;
    }

    this.setCurrentNode(this.currentTableNavigator.getCell());

    if (this.announceTable) {
      this.announceTable = false;
    }

    this.bumpedEdge = false;
    this.bumpedTwice = false;
    return this.currentNode;
  }
  if (this.bumpedEdge) {
    this.bumpedTwice = true;
  }
  this.bumpedEdge = true;
  return null;
};


/**
 * Navigates to the next row of the table. If table traversal has not
 * started, navigates to the first cell of the table.
 * @return {Node} Returns the cell in the next row (same column) of the
 * table. Null if the table does not have a cell in that location.
 */
cvox.SmartDomWalker.prototype.nextRow = function() {
  if (!this.tableMode) {
    return null;
  }
  var activeIndex = this.currentTableNavigator.currentCellCursor;
  if ((activeIndex) &&
      (this.currentTableNavigator.goToCell([(activeIndex[0] + 1),
                                              activeIndex[1]]))) {
    this.previousNode = this.currentNode;

    if (this.findNearestValidElement_(true)) {
      this.exitTable();
      return this.currentNode;
    }

    this.setCurrentNode(this.currentTableNavigator.getCell());

    if (this.announceTable) {
      this.announceTable = false;
    }

    this.bumpedEdge = false;
    this.bumpedTwice = false;
    return this.currentNode;
  }
  if (this.bumpedEdge) {
    this.bumpedTwice = true;
  }
  this.bumpedEdge = true;
  return null;
};


/**
 * Navigates to the previous column of the table. If table traversal has not
 * started, navigates to the first cell of the table.
 * @return {Node} Returns the cell in the previous column (same row) of the
 * table. Null if the table does not have a cell in that location.
 */
cvox.SmartDomWalker.prototype.previousCol = function() {
  if (!this.tableMode) {
    return null;
  }
  var activeIndex = this.currentTableNavigator.currentCellCursor;
  if ((activeIndex) &&
      (this.currentTableNavigator.goToCell([activeIndex[0],
                                            (activeIndex[1] - 1)]))) {
    this.previousNode = this.currentNode;

    if (this.findNearestValidElement_(false)) {
      this.exitTable();
      return this.currentNode;
    }

    this.setCurrentNode(this.currentTableNavigator.getCell());

    if (this.announceTable) {
      this.announceTable = false;
    }

    this.bumpedEdge = false;
    this.bumpedTwice = false;
    return this.currentNode;
  }
  this.bumpedEdge = true;
  return null;
};


/**
 * Navigates to the next column of the table. If table traversal has not
 * started, navigates to the first cell of the table.
 * @return {Node} Returns the cell in the next column (same row) of the
 * table. Null if the table does not have a cell in that location.
 */
cvox.SmartDomWalker.prototype.nextCol = function() {
  if (!this.tableMode) {
    return null;
  }
  var activeIndex = this.currentTableNavigator.currentCellCursor;
  if ((activeIndex) &&
      (this.currentTableNavigator.goToCell([activeIndex[0],
                                            (activeIndex[1] + 1)]))) {
    this.previousNode = this.currentNode;

    if (this.findNearestValidElement_(true)) {
      this.exitTable();
      return this.currentNode;
    }

    this.setCurrentNode(this.currentTableNavigator.getCell());

    if (this.announceTable) {
      this.announceTable = false;
    }

    this.bumpedEdge = false;
    this.bumpedTwice = false;
    return this.currentNode;
  }
  this.bumpedEdge = true;
  return null;
};


/** @override */
cvox.SmartDomWalker.prototype.next = function() {
  this.previousNode = this.currentNode;
  this.findNearestValidElement_(true);
  return this.nextContentNode();
};


/** @override */
cvox.SmartDomWalker.prototype.previous = function() {
  this.previousNode = this.currentNode;
  this.findNearestValidElement_(true);
  return this.prevContentNode();
};


/**
 * Returns the text content of the row header(s) of the active table cell.
 * @return {?string} The text content of the row header(s) of the current cell
 * or null if the cell has no row headers. If there is more than one header,
 * their text content is concatenated into one string which is returned.
 */
cvox.SmartDomWalker.prototype.getRowHeaderText = function() {
  var rowHeaderText = '';
  if (this.tableMode) {
    var rowHeaders = this.currentTableNavigator.getCellRowHeaders();
    if (rowHeaders == null) {
      return null;
    }
    for (var i = 0; i < rowHeaders.length; i++) {
      rowHeaderText += cvox.DomUtil.collapseWhitespace(
          cvox.DomUtil.getValue(rowHeaders[i]) + ' ' +
              cvox.DomUtil.getName(rowHeaders[i]));
    }
    return rowHeaderText;
  }
  return null;
};


/**
 * Returns the text content for the first cell in the current row. This is
 * used as the 'best guess' at a row header for the current cell, when no
 * row header is explicitly specified.
 * @return {?string} The text content of the guessed row header of the current
 * cell or null if we aren't in table mode.
 */
cvox.SmartDomWalker.prototype.getRowHeaderGuess = function() {
  var rowHeaderText = '';
  if (this.tableMode) {
    var currentCursor = this.currentTableNavigator.currentCellCursor;
    var firstCellInRow =
        this.currentTableNavigator.getCellAt([currentCursor[0], 0]);
    rowHeaderText += cvox.DomUtil.collapseWhitespace(
        cvox.DomUtil.getValue(firstCellInRow) + ' ' +
            cvox.DomUtil.getName(firstCellInRow));
    return rowHeaderText;
  }
  return null;
};


/**
 * Returns the text content of the col header(s) of the active table cell.
 * @return {?string} The text content of the col header(s) of the current cell
 * or null if the cell has no col headers. If there is more than one header,
 * their text content is concatenated into one string which is returned.
 */
cvox.SmartDomWalker.prototype.getColHeaderText = function() {
  var colHeaderText = '';
  if (this.tableMode) {
    var colHeaders = this.currentTableNavigator.getCellColHeaders();
    for (var i = 0; i < colHeaders.length; i++) {
      colHeaderText += cvox.DomUtil.collapseWhitespace(
          cvox.DomUtil.getValue(colHeaders[i]) + ' ' +
          cvox.DomUtil.getName(colHeaders[i]));
    }
    return colHeaderText;
  }
  return null;
};


/**
 * Returns the text content for the first cell in the current col. This is
 * used as the 'best guess' at a col header for the current cell, when no
 * col header is explicitly specified.
 * @return {?string} The text content of the guessed col header of the current
 * cell or null if we aren't in table mode.
 */
cvox.SmartDomWalker.prototype.getColHeaderGuess = function() {
  var colHeaderText = '';
  if (this.tableMode) {
    var currentCursor = this.currentTableNavigator.currentCellCursor;
    var firstCellInCol =
        this.currentTableNavigator.getCellAt([0, currentCursor[1]]);
    colHeaderText += cvox.DomUtil.collapseWhitespace(
        cvox.DomUtil.getValue(firstCellInCol) + ' ' +
        cvox.DomUtil.getName(firstCellInCol));
    return colHeaderText;
  }
  return null;
};


/**
 * Returns the current row index.
 * @return {?number} The current row index. Null if we aren't in table mode.
 */
cvox.SmartDomWalker.prototype.getRowIndex = function() {
  if (this.tableMode) {
    // Add 1 because the table navigator is zero-indexed.
    return this.currentTableNavigator.currentCellCursor[0] + 1;
  }
  return null;
};


/**
 * Returns the current column index.
 * @return {?number} The current column index. Null if we aren't in table mode.
 */
cvox.SmartDomWalker.prototype.getColIndex = function() {
  if (this.tableMode) {
    // Add 1 because the table navigator is zero-indexed.
    return this.currentTableNavigator.currentCellCursor[1] + 1;
  }
  return null;
};


/**
 * Returns the current number of rows.
 * @return {?number} The number of rows. Null if we aren't in table mode.
 */
cvox.SmartDomWalker.prototype.getRowCount = function() {
  if (this.tableMode) {
    // Add 1 because the table navigator is zero-indexed.
    return this.currentTableNavigator.rowCount;
  }
  return null;
};


/**
 * Returns the current number of columns.
 * @return {?number} The number of columns. Null if we aren't in table mode.
 */
cvox.SmartDomWalker.prototype.getColCount = function() {
  if (this.tableMode) {
    // Add 1 because the table navigator is zero-indexed.
    return this.currentTableNavigator.colCount;
  }
  return null;
};


/**
 * Returns true if this annotation should be grouped as a collection,
 * meaning that instead of repeating the annotation for each item, we
 * just announce <annotation> collection with <n> items at the front.
 *
 * Currently enabled for links, but could be extended to support other
 * roles that make sense.
 *
 * @param {string} annotation The annotation text.
 * @return {boolean} If this annotation should be a collection.
 */
cvox.SmartDomWalker.prototype.isAnnotationCollection = function(annotation) {
  return (annotation == cvox.ChromeVox.msgs.getMsg('tag_link'));
};


/**
 * Returns a description of the navigation to the current element.
 * @return {Array.<cvox.NavDescription>} The description of the navigation.
 */
cvox.SmartDomWalker.prototype.getCurrentDescription = function() {
  // Use a linear DOM walker in non-smart mode to traverse all of the
  // nodes inside the current smart node and return their annotations.
  var results = [];

  var walker = new cvox.LinearDomWalker();
  walker.currentNode = this.currentNode;
  walker.previous();
  walker.next();

  function incrementKey(map, key) {
    var value = map[key];
    value = value ? value + 1 : 1;
    map[key] = value;
  }

  var annotations = [];
  while (cvox.DomUtil.isDescendantOfNode(
      walker.currentNode, this.currentNode)) {
    var ancestors;
    if (results.length == 0) {
      ancestors = cvox.DomUtil.getUniqueAncestors(
          this.previousNode, walker.currentNode);
    } else {
      ancestors = walker.getUniqueAncestors();
    }
    var description = cvox.DomUtil.getDescriptionFromAncestors(ancestors,
        true, cvox.ChromeVox.verbosity);
    results.push(description);
    if (annotations.indexOf(description.annotation) == -1) {
      // If we have an Internal link collection, call it Link collection
      // NOTE(deboer): The message comparison is a symptom of a bad design.
      // I suspect this code belongs elsewhere but I don't know where, yet.
      if (description.annotation ==
              cvox.ChromeVox.msgs.getMsg('internal_link')) {
        var linkMsg = cvox.ChromeVox.msgs.getMsg('tag_link');
        if (annotations.indexOf(linkMsg) == -1) {
          annotations.push(linkMsg);
        }
      } else {
        annotations.push(description.annotation);
      }
    }
    walker.next();
  }

  // If all of the items have the same annotation, describe it as a
  // <annotation> collection with <n> items. Currently only enabled
  // for links, but support should be added for any other type that
  // makes sense.
  if (results.length >= 3 &&
      annotations.length == 1 &&
      annotations[0].length > 0 &&
      this.isAnnotationCollection(annotations[0])) {
    var commonAnnotation = annotations[0];
    var firstContext = results[0].context;
    results[0].context = '';
    for (var i = 0; i < results.length; i++) {
      results[i].annotation = '';
    }

    results.splice(0, 0, new cvox.NavDescription(
        firstContext,
        '',
        '',
        cvox.ChromeVox.msgs.getMsg('collection',
            [commonAnnotation, cvox.ChromeVox.msgs.getNumber(results.length)]),
        []));
  }

  if (this.tableMode) {
    if (results.length == 0) {
      results.push(new cvox.NavDescription(
          '', '', '', 'empty cell', []));
    }

    if (this.announceTable) {
      var len = results.length;
      var summaryText = this.currentTableNavigator.summaryText();
      var rowIndex = this.getRowIndex();
      var colIndex = this.getColIndex();
      var rowCount = this.currentTableNavigator.rowCount;
      var colCount = this.currentTableNavigator.colCount;
      if (rowIndex != null && colIndex != null &&
          rowCount != null && colCount != null) {
        results.push(new cvox.NavDescription(
            cvox.ChromeVox.msgs.getMsg(
                'table_location',
                [cvox.ChromeVox.msgs.getNumber(rowIndex),
                 cvox.ChromeVox.msgs.getNumber(rowCount),
                 cvox.ChromeVox.msgs.getNumber(colIndex),
                 cvox.ChromeVox.msgs.getNumber(colCount)]),
            '',
            '',
            summaryText ? summaryText + ' ' : '',
            []));
      }
    }

    // Deal with spanned cells
    if (this.currentTableNavigator.isSpanned()) {
      results.push(new cvox.NavDescription(
          '', '', '', 'spanned', []));
    }

    // Make cells that are row or column headers speak with a different
    // personality
    if (this.currentTableNavigator.isRowHeader() ||
        this.currentTableNavigator.isColHeader()) {
      results.push(new cvox.NavDescription(
          '',
          '',
          '',
          '',
          [],
          cvox.AbstractTts.PERSONALITY_H2));
    }
  }
  return results;
};


/** @override */
cvox.SmartDomWalker.prototype.isLeafNode = function(targetNode) {
  if (targetNode.tagName == 'LABEL') {
    return cvox.DomUtil.isLeafNode(targetNode);
  }
  if (cvox.DomUtil.isLeafNode(targetNode)) {
    return true;
  }
  if (!cvox.XpathUtil.xpathSupported()) {
    // If there is no xpath, don't bother trying to do the other checks, just
    // return false. While this is not strictly correct, it will at least allow
    // this to fail gracefully in cases where xpath is not available (ie, older
    // versions of Android) by making it behave the same way as linear DOM
    // walker.
    return false;
  }
  var content = cvox.DomUtil.collapseWhitespace(
      cvox.DomUtil.getValue(targetNode) + ' ' +
      cvox.DomUtil.getName(targetNode));
  if (content.length > cvox.SmartDomWalker.SMARTNAV_MAX_CHARCOUNT) {
    return false;
  }
  if (content.replace(/\s/g, '') === '') {
    // Text only contains whitespace
    return false;
  }
  var breakingNodes = cvox.XpathUtil.evalXPath(
      cvox.SmartDomWalker.SMARTNAV_BREAKOUT_XPATH, targetNode);
  for (var i = 0, node; node = breakingNodes[i]; i++) {
    if (cvox.DomUtil.hasContent(node)) {
      return false;
    }
  }
  if (cvox.AriaUtil.isCompositeControl(targetNode) &&
      !cvox.DomUtil.isFocusable(targetNode)) {
    return false;
  }
  return true;
};


/**
 * Utility method to make sure the current node is still attached to the
 * document.
 * If not, then uses the cached list of ancestors to find a valid node and set
 * that as the current node. The current node can be invalidated by AJAX
 * changing content.
 * @param {boolean} forwards True if we are moving forwards, false if we are
 * not.
 * @return {?boolean} True if we found a nearest valid node. False if we didn't
 * find one or if the current node is valid anyway.
 * @private
 */
cvox.SmartDomWalker.prototype.findNearestValidElement_ = function(forwards) {
  if (this.currentNode &&
      !cvox.DomUtil.isAttachedToDocument(this.currentNode)) {
    for (var i = this.currentAncestors.length - 1, ancestor;
         ancestor = this.currentAncestors[i]; i--) {
      if (cvox.DomUtil.isAttachedToDocument(ancestor)) {
        this.setCurrentNode(ancestor);
        // Next-previous sequence to put us back at the correct level.
        if (forwards) {
          this.previous();
          this.next();
        } else {
          this.next();
          this.previous();
        }
        return true;
      }
    }
  }
  return false;
};

