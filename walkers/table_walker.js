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
 * @fileoverview A class for walking tables.
 * NOTE: This class has a very different interface than the other walkers.
 * This means it does not lend itself easily to e.g. decorators.
 * TODO (stoarca): This might be able to be fixed by breaking it up into
 * separate walkers for cell, row and column.
 * @author stoarca@google.com (Sergiu Toarca)
 */


goog.provide('cvox.TableWalker');

goog.require('cvox.AbstractWalker');
goog.require('cvox.DescriptionUtil');
goog.require('cvox.DomUtil');
goog.require('cvox.NavDescription');
goog.require('cvox.TraverseTable');

/**
 * @constructor
 * @extends {cvox.AbstractWalker}
 */
cvox.TableWalker = function() {
  cvox.AbstractWalker.call(this);

  /**
   * Only used as a cache for faster lookup.
   * @type {!cvox.TraverseTable}
   * @private
   */
  this.tt_ = new cvox.TraverseTable(null);
};
goog.inherits(cvox.TableWalker, cvox.AbstractWalker);

/**
 * @override
 */
cvox.TableWalker.prototype.next = function(sel) {
  // TODO (stoarca): See bug 6677953
  return this.nextRow(sel);
};

/**
 * @override
 */
cvox.TableWalker.prototype.sync = function(sel) {
  return this.goTo_(sel, goog.bind(function(position) {
      return this.tt_.goToCell(position);
  }, this));
};

/**
 * @override
 */
cvox.TableWalker.prototype.getDescription = function(prevSel, sel) {
  var tableNode = this.getTableNode_(sel);
  this.tt_.initialize(tableNode);
  // we need to align the TraverseTable with our sel because our description
  // uses parts of it (for example isSpanned relies on being at a specific cell)
  var position = this.tt_.findNearestCursor(sel.end.node);
  if (!position) {
    return [];
  }
  this.tt_.goToCell(position);
  var descs = cvox.DescriptionUtil.getCollectionDescription(prevSel, sel);
  if (descs.length == 0) {
    descs.push(new cvox.NavDescription({
      annotation: cvox.ChromeVox.msgs.getMsg('empty_cell')
    }));
  }
  // if prevSel isn't in this table, we should announce the table
  if (cvox.DomUtil.getContainingTable(prevSel.start.node) != tableNode ||
      cvox.DomUtil.getContainingTable(prevSel.end.node) != tableNode) {
    var len = descs.length;
    var summaryText = this.tt_.summaryText();
    var locationInfo = this.getLocationInfo_(sel);
    if (locationInfo != null) {
      descs.push(new cvox.NavDescription({
        context: cvox.ChromeVox.msgs.getMsg('table_location', locationInfo),
        annotation: summaryText ? summaryText + ' ' : ''
      }));
      descs[0].pushEarcon(cvox.AbstractEarcons.OBJECT_ENTER);
    }

    if (this.tt_.isSpanned()) {
      descs.push(new cvox.NavDescription({
        annotation: cvox.ChromeVox.msgs.getMsg('spanned')
      }));
    }

    // TODO (stoarca): descriptions shouldn't be dependent on one another.
    if (this.tt_.isRowHeader() ||
        this.tt_.isColHeader()) {
      descs.push(new cvox.NavDescription({
        personality: cvox.AbstractTts.PERSONALITY_H2
      }));
    }
  } else {
    // if prevsel was in this table and the next selection (in the direction
    // we were headed) is the same selection or outside of the table, then add
    // an earcon saying that we hit the edge.
    if (sel.equals(prevSel)) {
      descs[0].pushEarcon(cvox.AbstractEarcons.WRAP_EDGE);
    }
  }
  return descs;
};

/**
 * Returns the location description.
 * @param {!cvox.CursorSelection} sel A valid selection.
 * @return {Array.<cvox.NavDescription>} The location description.
 */
cvox.TableWalker.prototype.getLocationDescription = function(sel) {
  var locationInfo = this.getLocationInfo_(sel);
  if (locationInfo == null) {
    return null;
  }
  return [new cvox.NavDescription({
    text: cvox.ChromeVox.msgs.getMsg('table_location', locationInfo)
  })];
};

/**
 * @override
 */
cvox.TableWalker.prototype.getGranularityMsg = function() {
  return cvox.ChromeVox.msgs.getMsg('table_strategy');
};

// TODO (stoarca): These don't belong here, but keeping them for now since
// this is how it was organized before.
/**
 * Returns the first cell of the table that this selection is inside.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for first cell of the table.
 */
cvox.TableWalker.prototype.goToFirstCell = function(sel) {
  return this.goTo_(sel, goog.bind(function(position) {
    return this.tt_.goToCell([0, 0]);
  }, this));
};

/**
 * Returns the last cell of the table that this selection is inside.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the last cell of the table.
 */
cvox.TableWalker.prototype.goToLastCell = function(sel) {
  return this.goTo_(sel, goog.bind(function(position) {
    return this.tt_.goToLastCell();
  }, this));
};

/**
 * Returns the first cell of the row that the selection is in.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the first cell in the row.
 */
cvox.TableWalker.prototype.goToRowFirstCell = function(sel) {
  return this.goTo_(sel, goog.bind(function(position) {
    return this.tt_.goToCell([position[0], 0]);
  }, this));
};

/**
 * Returns the last cell of the row that the selection is in.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the last cell in the row.
 */
cvox.TableWalker.prototype.goToRowLastCell = function(sel) {
  return this.goTo_(sel, goog.bind(function(position) {
    return this.tt_.goToRowLastCell();
  }, this));
};

/**
 * Returns the first cell of the column that the selection is in.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the first cell in the col.
 */
cvox.TableWalker.prototype.goToColFirstCell = function(sel) {
  return this.goTo_(sel, goog.bind(function(position) {
    return this.tt_.goToCell([0, position[1]]);
  }, this));
};

/**
 * Returns the last cell of the column that the selection is in.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the last cell in the col.
 */
cvox.TableWalker.prototype.goToColLastCell = function(sel) {
  return this.goTo_(sel, goog.bind(function(position) {
    return this.tt_.goToColLastCell();
  }, this));
};

/**
 * Returns the first cell in the row after the current selection.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the first cell in the next
 * row.
 */
cvox.TableWalker.prototype.nextRow = function(sel) {
  return this.goTo_(sel, goog.bind(function(position) {
    return this.tt_.goToCell([position[0] + (sel.isReversed() ? -1 : 1),
                              position[1]]);
  }, this));
};

/**
 * Returns the first cell in the column after the current selection.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the first cell in the
 * next col.
 */
cvox.TableWalker.prototype.nextCol = function(sel) {
  return this.goTo_(sel, goog.bind(function(position) {
    return this.tt_.goToCell([position[0],
                              position[1] + (sel.isReversed() ? -1 : 1)]);
  }, this));
};

/**
 * Returns the text content of the header(s) of the cell that contains sel.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {!string} The header text.
 */
cvox.TableWalker.prototype.getHeaderText = function(sel) {
  this.tt_.initialize(this.getTableNode_(sel));
  var position = this.tt_.findNearestCursor(sel.start.node);
  if (!position) {
    return cvox.ChromeVox.msgs.getMsg('not_inside_table');
  }
  if (!this.tt_.goToCell(position)) {
    return cvox.ChromeVox.msgs.getMsg('not_inside_table');
  }
  return (
      this.getRowHeaderText_(position) +
      ' ' +
      this.getColHeaderText_(position));
};

/**
 * Returns the text content of the row header(s) of the cell that contains sel.
 * @param {!Array.<number>} position The selection.
 * @return {!string} The header text.
 * @private
 */
cvox.TableWalker.prototype.getRowHeaderText_ = function(position) {
  // TODO(stoarca): OPTMZ Replace with join();
  var rowHeaderText = '';

  var rowHeaders = this.tt_.getCellRowHeaders();
  if (!rowHeaders) {
    var firstCellInRow = this.tt_.getCellAt([position[0], 0]);
    rowHeaderText += cvox.DomUtil.collapseWhitespace(
        cvox.DomUtil.getValue(firstCellInRow) + ' ' +
            cvox.DomUtil.getName(firstCellInRow));
    return cvox.ChromeVox.msgs.getMsg('row_header') + rowHeaderText;
  }

  for (var i = 0; i < rowHeaders.length; ++i) {
    rowHeaderText += cvox.DomUtil.collapseWhitespace(
        cvox.DomUtil.getValue(rowHeaders[i]) + ' ' +
            cvox.DomUtil.getName(rowHeaders[i]));
  }
  if (rowHeaderText == '') {
    return cvox.ChromeVox.msgs.getMsg('empty_row_header');
  }
  return cvox.ChromeVox.msgs.getMsg('row_header') + rowHeaderText;
};

/**
 * Returns the text content of the col header(s) of the cell that contains sel.
 * @param {!Array.<number>} position The selection.
 * @return {!string} The header text.
 * @private
 */
cvox.TableWalker.prototype.getColHeaderText_ = function(position) {
  // TODO(stoarca): OPTMZ Replace with join();
  var colHeaderText = '';

  var colHeaders = this.tt_.getCellColHeaders();
  if (!colHeaders) {
    var firstCellInCol = this.tt_.getCellAt([0, position[1]]);
    colHeaderText += cvox.DomUtil.collapseWhitespace(
        cvox.DomUtil.getValue(firstCellInCol) + ' ' +
        cvox.DomUtil.getName(firstCellInCol));
    return cvox.ChromeVox.msgs.getMsg('column_header') + colHeaderText;
  }

  for (var i = 0; i < colHeaders.length; ++i) {
    colHeaderText += cvox.DomUtil.collapseWhitespace(
        cvox.DomUtil.getValue(colHeaders[i]) + ' ' +
            cvox.DomUtil.getName(colHeaders[i]));
  }
  if (colHeaderText == '') {
    return cvox.ChromeVox.msgs.getMsg('empty_row_header');
  }
  return cvox.ChromeVox.msgs.getMsg('column_header') + colHeaderText;
};

/**
 * Returns the location info of sel within the containing table.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {Array.<number>} The location info:
 *  [row index, row count, col index, col count].
 * @private
 */
cvox.TableWalker.prototype.getLocationInfo_ = function(sel) {
  this.tt_.initialize(this.getTableNode_(sel));
  var position = this.tt_.findNearestCursor(sel.start.node);
  if (!position) {
    return null;
  }
  // + 1 to account for 0-indexed
  return [
    position[0] + 1,
    this.tt_.rowCount,
    position[1] + 1,
    this.tt_.colCount
  ].map(function(x) {return cvox.ChromeVox.msgs.getNumber(x);});
};

/**
 * Returns true if sel is inside a table.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {boolean} True if inside a table node.
 */
cvox.TableWalker.prototype.isInTable = function(sel) {
  return this.getTableNode_(sel) != null;
};

/**
 * Wrapper for going to somewhere so that boilerplate is not repeated.
 * @param {!cvox.CursorSelection} sel The selection from which to base the
 * movement.
 * @param {function(Array.<number>):boolean} f The function to use for moving.
 * Returns true on success and false on failure.
 * @return {cvox.CursorSelection} The resulting selection.
 * @private
 */
cvox.TableWalker.prototype.goTo_ = function(sel, f) {
  this.tt_.initialize(this.getTableNode_(sel));
  var position = this.tt_.findNearestCursor(sel.end.node);
  if (!position) {
    return null;
  }
  this.tt_.goToCell(position);
  if (!f(position)) {
    return null;
  }
  return cvox.CursorSelection.fromNode(this.tt_.getCell()).
      setReversed(sel.isReversed());
};

/**
 * Returns the nearest table node containing the end of the selection
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {Node} The table node containing sel. null if not in a table.
 * @private
 */
cvox.TableWalker.prototype.getTableNode_ = function(sel) {
  return cvox.DomUtil.getContainingTable(sel.end.node);
};
