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
 * @fileoverview Manages navigation within a page.
 * This unifies navigation by the DOM walker and by WebKit selection.
 *
 * @author clchen@google.com (Charles L. Chen)
 */


goog.provide('cvox.ChromeVoxNavigationManager');

goog.require('cvox.ChromeVoxChoiceWidget');
goog.require('cvox.DomUtil');
goog.require('cvox.Interframe');
goog.require('cvox.LinearDomWalker');
goog.require('cvox.SelectionUtil');
goog.require('cvox.SelectionWalker');
goog.require('cvox.SmartDomWalker');



/**
 * @constructor
 */
cvox.ChromeVoxNavigationManager = function() {
  this.currentNode = null;
  this.nodeInformationArray = new Array();
  this.currentNavStrategy = 2;
  this.lastUsedNavStrategy = 2;
  this.linearDomWalker = new cvox.LinearDomWalker();
  this.smartDomWalker = new cvox.SmartDomWalker();
  this.selectionWalker = new cvox.SelectionWalker();
  this.customWalker = null;
  this.selectionUniqueAncestors = [];
  this.choiceWidget = new cvox.ChromeVoxChoiceWidget();
  this.iframeIdMap = {};
  this.nextIframeId = 1;
  this.addInterframeListener_();
};


/**
 * @type {Object.<string, number>}
 */
cvox.ChromeVoxNavigationManager.STRATEGIES =
    {'SELECTION' : 0, 'LINEARDOM' : 1, 'SMART' : 2, 'CUSTOM' : 3};


/**
 * @type {Array.<string>}
 */
cvox.ChromeVoxNavigationManager.STRATEGY_NAMES =
    ['SELECTION', 'OBJECT', 'GROUP', 'CUSTOM'];


/**
 * Moves forward using the current navigation strategy.
 * @param {boolean} navigateIframes If true, will jump in and out of iframes.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the end of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.next = function(navigateIframes) {
  switch (this.currentNavStrategy) {
    default:
    case cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM:
      var customNode = this.customWalker.next();
      if (navigateIframes && this.tryEnterExitIframe_(customNode, true)) {
        return true;
      }
      if (customNode) {
        return true;
      }
      return false;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SMART:
      var smartNode = this.smartDomWalker.next();
      if (navigateIframes && this.tryEnterExitIframe_(smartNode, true)) {
        return true;
      }
      if (smartNode) {
        cvox.SelectionUtil.selectAllTextInNode(smartNode);
        this.currentNode = smartNode;
        return true;
      }
      return false;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      var node = this.linearDomWalker.next();
      if (navigateIframes && this.tryEnterExitIframe_(node, true)) {
        return true;
      }
      if (node) {
        cvox.SelectionUtil.selectAllTextInNode(node);
        this.currentNode = node;
        return true;
      }
      return false;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      this.selectionUniqueAncestors = [];
      var movedOk = this.selectionWalker.next();
      if (!movedOk) {
        var selectionNode = this.linearDomWalker.next();
        if (navigateIframes && this.tryEnterExitIframe_(selectionNode, true)) {
          return true;
        }
        this.selectionUniqueAncestors =
            this.linearDomWalker.getUniqueAncestors();
        if (selectionNode) {
          this.currentNode = selectionNode;
          this.selectionWalker.setCurrentNode(this.currentNode);
          this.selectionWalker.next();
          return true;
        }
        return false;
      }
      return true;
  }
};


/**
 * Assuming we are in table mode, checks whether the current position is within
 * the boundaries of the current cell.
 * @return {boolean} True if the current position is within the boundaries of
 * the current cell. False if it is not.
 */
cvox.ChromeVoxNavigationManager.prototype.checkCellBoundaries = function() {
  return cvox.DomUtil.isDescendantOfNode(this.currentNode,
      this.smartDomWalker.currentTableNavigator.getCell());
};


/**
 * Moves backward using the current navigation strategy.
 * @param {boolean} navigateIframes If true, will jump in and out of iframes.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the start of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.previous = function(navigateIframes) {
  switch (this.currentNavStrategy) {
    default:
    case cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM:
      var customNode = this.customWalker.previous();
      if (navigateIframes && this.tryEnterExitIframe_(customNode, false)) {
        return true;
      }
      if (customNode) {
        return true;
      }
      return false;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SMART:
      var smartNode = this.smartDomWalker.previous();
      if (navigateIframes && this.tryEnterExitIframe_(smartNode, false)) {
        return true;
      }
      if (smartNode) {
        cvox.SelectionUtil.selectAllTextInNode(smartNode);
        this.currentNode = smartNode;
        return true;
      }
      return false;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      var node = this.linearDomWalker.previous();
      if (navigateIframes && this.tryEnterExitIframe_(node, false)) {
        return true;
      }
      if (node) {
        cvox.SelectionUtil.selectAllTextInNode(node);
        this.currentNode = node;
        return true;
      }
      return false;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      this.selectionUniqueAncestors = [];
      var movedOk = this.selectionWalker.previous();
      if (!movedOk) {
        var selectionNode = this.linearDomWalker.previous();
        if (navigateIframes && this.tryEnterExitIframe_(selectionNode, false)) {
          return true;
        }
        this.selectionUniqueAncestors =
            this.linearDomWalker.getUniqueAncestors();
        if (selectionNode) {
          this.currentNode = selectionNode;
          this.selectionWalker.setCurrentNode(this.currentNode);
          cvox.SelectionUtil.selectAllTextInNode(this.currentNode);
          cvox.SelectionUtil.collapseToEnd(this.currentNode);
          this.selectionWalker.previous();
          return true;
        }
        return false;
      }
      return true;
  }
};


/**
 * Moves up a level of granularity.
 */
cvox.ChromeVoxNavigationManager.prototype.up = function() {
  switch (this.currentNavStrategy) {
    default:
    case cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM:
      break;
    case cvox.ChromeVoxNavigationManager.STRATEGIES.SMART:
      if (!!this.customWalker) {
        this.lastUsedNavStrategy = this.currentNavStrategy;
        this.currentNavStrategy =
            cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM;
        this.customWalker.setCurrentNode(this.currentNode);
        this.customWalker.goToCurrentItem();
      }
      break;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      this.lastUsedNavStrategy = this.currentNavStrategy;
      this.currentNavStrategy =
          cvox.ChromeVoxNavigationManager.STRATEGIES.SMART;

      var node = this.currentNode;
      while (!!node && this.linearDomWalker.isLeafNode(node)) {
        this.currentNode = node;
        node = node.parentNode;
      }
      this.smartDomWalker.setCurrentNode(this.currentNode);
      if (this.currentNode !== null) {
        this.previous(false);
      }
      this.next(false);
      break;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      var changed = this.selectionWalker.lessGranular(true);
      if (!changed) {
        this.lastUsedNavStrategy = this.currentNavStrategy;
        this.currentNavStrategy =
            cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM;
        cvox.SelectionUtil.selectAllTextInNode(this.currentNode);
      }
      break;
  }
};


/**
 * Moves down a level of granularity.
 */
cvox.ChromeVoxNavigationManager.prototype.down = function() {
  switch (this.currentNavStrategy) {
    default:
    case cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM:
      this.lastUsedNavStrategy = this.currentNavStrategy;
      this.currentNavStrategy =
          cvox.ChromeVoxNavigationManager.STRATEGIES.SMART;
      if (this.customWalker.getCurrentNode() != null) {
        this.currentNode = this.customWalker.getCurrentNode();
        this.smartDomWalker.setCurrentNode(this.currentNode);
      }
      break;
    case cvox.ChromeVoxNavigationManager.STRATEGIES.SMART:
      this.lastUsedNavStrategy = this.currentNavStrategy;
      this.currentNavStrategy =
          cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM;

      if (this.smartDomWalker.getCurrentNode() != null) {
        this.currentNode = this.smartDomWalker.getCurrentNode();
        this.linearDomWalker.setCurrentNode(this.currentNode);
      }
      if (this.currentNode !== null) {
        this.previous(false);
      }
      this.next(false);
      break;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      this.lastUsedNavStrategy = this.currentNavStrategy;
      this.currentNavStrategy =
          cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION;
      this.selectionWalker.setCurrentNode(this.currentNode);
      if (!!this.currentNode) {
        cvox.SelectionUtil.selectAllTextInNode(this.currentNode);
        cvox.SelectionUtil.collapseToStart(this.currentNode);
      }
      this.selectionWalker.next();
      break;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      var changed = this.selectionWalker.moreGranular(true);
      break;
  }
};


/**
 * Switches to smart navigation and attempts to access a table. If
 * a table is found, starts table traversal and moves to the first cell of that
 * table. If a table is not found, returns to the original navigation strategy.
 * @return {boolean} Whether or not a table was found and traversal was started
 * successfully.
 */
cvox.ChromeVoxNavigationManager.prototype.enterTable = function() {
  // If we aren't in smart navigation mode, switch
  var originalNavStrategy = this.currentNavStrategy;
  var originalGranularity = this.selectionWalker.currentGranularity;

  this.switchToStrategy(cvox.ChromeVoxNavigationManager.STRATEGIES.SMART);

  if (this.smartDomWalker.enterTable()) {
    // Go to the first cell of the table
    var smartNode = this.smartDomWalker.goToFirstCell();
    if (smartNode) {
      cvox.SelectionUtil.selectAllTextInNode(smartNode);
      this.currentNode = smartNode;
    }
    return true;
  } else {
    this.switchToStrategy(originalNavStrategy, originalGranularity);
    return false;
  }
};


/**
 * Stops traversing a table. Moves the cursor to the first element (found by
 * smart navigation) after the end of the table.
 */
cvox.ChromeVoxNavigationManager.prototype.exitTable = function() {
  if (this.smartDomWalker.tableMode) {
    // Go to the last cell of the table
    var smartNode = this.smartDomWalker.goToLastCell();
    if (smartNode) {
      cvox.SelectionUtil.selectAllTextInNode(smartNode);
      this.currentNode = smartNode;

      this.next(true);
    }
    this.smartDomWalker.exitTable();
  }
};


/**
 * Traverses to the cell in the previous row (same column) of the current table.
 * @return {boolean} Whether or not a cell was found in the previous row and
 * traversal was successful.
 */
cvox.ChromeVoxNavigationManager.prototype.previousRow = function() {
  return this.trySwitchToStrategyAndSelect_(
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART,
      this.smartDomWalker.previousRow, this.smartDomWalker);
};


/**
 * Traverses to the cell in the next row (same column) of the current table.
 * @return {boolean} Whether or not a cell was found in the next row and
 * traversal was successful.
 */
cvox.ChromeVoxNavigationManager.prototype.nextRow = function() {
  return this.trySwitchToStrategyAndSelect_(
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART,
      this.smartDomWalker.nextRow, this.smartDomWalker);
};


/**
 * Traverses to the cell in the previous column (same row) of the current table.
 * @return {boolean} Whether or not a cell was found in the previous column and
 * traversal was successful.
 */
cvox.ChromeVoxNavigationManager.prototype.previousCol = function() {
  return this.trySwitchToStrategyAndSelect_(
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART,
      this.smartDomWalker.previousCol, this.smartDomWalker);
};


/**
 * Traverses to the cell in the next column (same row) of the current table.
 * @return {boolean} Whether or not a cell was found in the next column and
 * traversal was successful.
 */
cvox.ChromeVoxNavigationManager.prototype.nextCol = function() {
  return this.trySwitchToStrategyAndSelect_(
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART,
      this.smartDomWalker.nextCol, this.smartDomWalker);
};


/**
 * Returns the text content of the row header(s) of the current cell.
 * @return {string} The text content of the row header(s) of the current cell
 * or '' if the cell has no row headers.
 */
cvox.ChromeVoxNavigationManager.prototype.getRowHeaderText = function() {
  this.switchToStrategy(cvox.ChromeVoxNavigationManager.STRATEGIES.SMART);
  return this.smartDomWalker.getRowHeaderText();
};


/**
 * Returns the text content of best-guess row header of the current cell.
 * This is used when the table does not specify row and column headers.
 * @return {string} The text content of the guessed row header of the current
 * cell.
 */
cvox.ChromeVoxNavigationManager.prototype.getRowHeaderGuess = function() {
  this.switchToStrategy(cvox.ChromeVoxNavigationManager.STRATEGIES.SMART);
  return this.smartDomWalker.getRowHeaderGuess();
};


/**
 * Returns the text content of the col header(s) of the current cell.
 * @return {string} The text content of the col header(s) of the current cell
 * or '' if the cell has no col headers.
 */
cvox.ChromeVoxNavigationManager.prototype.getColHeaderText = function() {
  this.switchToStrategy(cvox.ChromeVoxNavigationManager.STRATEGIES.SMART);
  return this.smartDomWalker.getColHeaderText();
};


/**
 * Returns the text content of best-guess col header of the current cell.
 * This is used when the table does not specify col and column headers.
 * @return {string} The text content of the guessed col header of the current
 * cell.
 */
cvox.ChromeVoxNavigationManager.prototype.getColHeaderGuess = function() {
  this.switchToStrategy(cvox.ChromeVoxNavigationManager.STRATEGIES.SMART);
  return this.smartDomWalker.getColHeaderGuess();
};


/**
 * Returns the current row index.
 * @return {?number} The current row index. Null if we aren't in table mode.
 */
cvox.ChromeVoxNavigationManager.prototype.getRowIndex = function() {
  this.switchToStrategy(cvox.ChromeVoxNavigationManager.STRATEGIES.SMART);
  return this.smartDomWalker.getRowIndex();
};


/**
 * Returns the current column index.
 * @return {?number} The current column index. Null if we aren't in table mode.
 */
cvox.ChromeVoxNavigationManager.prototype.getColIndex = function() {
  this.switchToStrategy(cvox.ChromeVoxNavigationManager.STRATEGIES.SMART);
  return this.smartDomWalker.getColIndex();
};


/**
 * Returns the current number of rows.
 * @return {?number} The number of rows. Null if we aren't in table mode.
 */
cvox.ChromeVoxNavigationManager.prototype.getRowCount = function() {
  this.switchToStrategy(cvox.ChromeVoxNavigationManager.STRATEGIES.SMART);
  return this.smartDomWalker.getRowCount();
};


/**
 * Returns the current number of columns.
 * @return {?number} The number of columns. Null if we aren't in table mode.
 */
cvox.ChromeVoxNavigationManager.prototype.getColCount = function() {
  this.switchToStrategy(cvox.ChromeVoxNavigationManager.STRATEGIES.SMART);
  return this.smartDomWalker.getColCount();
};


/**
 * Traverses to the first cell of the current table.
 * @return {boolean} Whether or not the traversal was successful. False implies
 * that we are not currently inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.goToFirstCell = function() {
  return this.trySwitchToStrategyAndSelect_(
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART,
      this.smartDomWalker.goToFirstCell, this.smartDomWalker);
};


/**
 * Traverses to the last cell of the current table.
 * @return {boolean} Whether or not the traversal was successful. False implies
 * that we are not currently inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.goToLastCell = function() {
  return this.trySwitchToStrategyAndSelect_(
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART,
      this.smartDomWalker.goToLastCell, this.smartDomWalker);
};


/**
 * Traverses to the first cell of the current row of the current table.
 * @return {boolean} Whether or not the traversal was successful. False implies
 * that we are not currently inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.goToRowFirstCell = function() {
  return this.trySwitchToStrategyAndSelect_(
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART,
      this.smartDomWalker.goToRowFirstCell, this.smartDomWalker);
};


/**
 * Traverses to the last cell of the current row of the current table.
 * @return {boolean} Whether or not the traversal was successful. False implies
 * that we are not currently inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.goToRowLastCell = function() {
  return this.trySwitchToStrategyAndSelect_(
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART,
      this.smartDomWalker.goToRowLastCell, this.smartDomWalker);
};


/**
 * Traverses to the first cell of the current column of the current table.
 * @return {boolean} Whether or not the traversal was successful. False implies
 * that we are not currently inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.goToColFirstCell = function() {
  return this.trySwitchToStrategyAndSelect_(
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART,
      this.smartDomWalker.goToColFirstCell, this.smartDomWalker);
};


/**
 * Traverses to the last cell of the current column of the current table.
 * @return {boolean} Whether or not the traversal was successful. False implies
 * that we are not currently inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.goToColLastCell = function() {
  return this.trySwitchToStrategyAndSelect_(
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART,
      this.smartDomWalker.goToColLastCell, this.smartDomWalker);
};


/**
 * Helper function to try switching to a strategy, given that the provided
 * function executes successfully.
 * @param {number} strategy The strategy to switch to.
 * @param {function()} functionToTry The method to execute after switching.
 * @param {Object} obj The object to which the method belongs.
 * @return {boolean} True if the strategy was switched and the provided
 * function executed successfully. Otherwise false.
 * @private
 */
cvox.ChromeVoxNavigationManager.prototype.trySwitchToStrategyAndSelect_ =
    function(strategy, functionToTry, obj) {
  var originalNavStrategy = this.currentNavStrategy;
  var originalGranularity = this.selectionWalker.currentGranularity;

  this.switchToStrategy(strategy);

  var smartNode = functionToTry.call(obj);
  if (smartNode) {
    cvox.SelectionUtil.selectAllTextInNode(smartNode);
    this.currentNode = smartNode;
    return true;
  } else {
    this.switchToStrategy(originalNavStrategy, originalGranularity);
    return false;
  }
};


/**
 * Moves to the next occurrence of a node that matches the given predicate,
 * if one exists, using the linearDomWalker.
 * @param {function(Array.<Node>)} predicate A function taking an array
 *     of unique ancestor nodes as a parameter and returning true if it's
 *     what to search for.
 * @return {boolean} True if a match was found.
 */
cvox.ChromeVoxNavigationManager.prototype.findNext = function(predicate) {
  this.syncPosition();
  var node = undefined;
  while (true) {
    node = this.linearDomWalker.next();
    if (!node) {
      break;
    }

    if ((node = predicate(this.linearDomWalker.getUniqueAncestors()))) {
      break;
    }
  }

  if (node) {
    cvox.SelectionUtil.selectAllTextInNode(node);
    this.currentNode = node;
    this.linearDomWalker.setCurrentNode(this.currentNode);
    this.smartDomWalker.setCurrentNode(this.currentNode);
    return true;
  }

  return false;
};


/**
 * Moves to the previous occurrence of a node that matches the given predicate,
 * if one exists, using the linearDomWalker.
 * @param {function(Array.<Node>)} predicate A function taking an array
 *     of unique ancestor nodes as a parameter and returning true if it's
 *     what to search for.
 * @return {boolean} True if a match was found.
 */
cvox.ChromeVoxNavigationManager.prototype.findPrevious = function(predicate) {
  this.syncPosition();
  var node = undefined;
  while (true) {
    node = this.linearDomWalker.previous();
    if (!node) {
      break;
    }

    if ((node = predicate(this.linearDomWalker.getUniqueAncestors()))) {
      break;
    }
  }

  if (node) {
    cvox.SelectionUtil.selectAllTextInNode(node);
    this.currentNode = node;
    this.linearDomWalker.setCurrentNode(this.currentNode);
    this.smartDomWalker.setCurrentNode(this.currentNode);
    return true;
  }

  return false;
};


/**
 * Returns the current navigation strategy.
 *
 * @return {string} The strategy that is being used.
 */
cvox.ChromeVoxNavigationManager.prototype.getStrategy = function() {
  return cvox.ChromeVoxNavigationManager.STRATEGY_NAMES[
      this.currentNavStrategy];
};


/**
 * Returns the current selection granularity.
 *
 * @return {string} The selection granularity that is being used.
 */
cvox.ChromeVoxNavigationManager.prototype.getGranularity = function() {
  return this.selectionWalker.getGranularity();
};


/**
 * Returns whether we are currently navigating a table.
 *
 * @return {boolean} If we are currently navigating a table.
 */
cvox.ChromeVoxNavigationManager.prototype.inTableMode = function() {
  return this.smartDomWalker.tableMode;
};


/**
 * Synchronizes the current position between the different navigation
 * strategies.
 */
cvox.ChromeVoxNavigationManager.prototype.syncPosition = function() {
  if (!this.currentNode) {
    this.currentNode = document.body;
  }
  if (this.currentNavStrategy != this.lastUsedNavStrategy) {
    if ((this.lastUsedNavStrategy ==
             cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM) ||
        (this.lastUsedNavStrategy ==
             cvox.ChromeVoxNavigationManager.STRATEGIES.SMART)) {
      this.syncToNode(this.currentNode);
    } else {
      this.syncToSelection();
    }
  }
  this.lastUsedNavStrategy = this.currentNavStrategy;
};


/**
 * Synchronizes the navigation strategies to the current selection.
 */
cvox.ChromeVoxNavigationManager.prototype.syncToSelection = function() {
  // Don't attempt syncing to the selection when smart nav is active.
  // Syncing to the selection will break badly since smart nav is often
  // navigating at a level higher than the leaf nodes.
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART) {
    return;
  }
  // Only try to sync with the selection if there is a valid selection and
  // if current node is not part of the selection (ie, never sync to something
  // less specific).
  if (window.getSelection() && window.getSelection().anchorNode &&
      !cvox.DomUtil.isDescendantOfNode(this.currentNode,
      window.getSelection().anchorNode)) {
    this.currentNode = window.getSelection().anchorNode;
    // For composite controls, the anchorNode will often fall below the leaf
    // level. Set it to the earliest ancestor that is considered a leaf node.
    var ancestors = cvox.DomUtil.getAncestors(this.currentNode);
    for (var i = 0, node; node = ancestors[i]; i++) {
      if (cvox.DomUtil.isControl(node)) {
        this.currentNode = node;
        break;
      }
    }

    this.linearDomWalker.setCurrentNode(this.currentNode);
    this.smartDomWalker.setCurrentNode(this.currentNode);
  }
};


/**
 * Synchronizes the navigation strategies to the targetNode.
 *
 * @param {Node} targetNode The node that the navigation strategies should be
 * synced to.
 */
cvox.ChromeVoxNavigationManager.prototype.syncToNode = function(targetNode) {
  if (cvox.DomUtil.isDescendantOfNode(this.currentNode, targetNode)) {
    // User is already synced at a more specific level than the target;
    // therefore ignore the sync request.
    return;
  }
  this.linearDomWalker.setCurrentNode(targetNode);
  this.smartDomWalker.setCurrentNode(targetNode);

  // Don't touch the selection of control nodes as those could have serious
  // side effects (such as making it impossible to type in an input field).
  if (targetNode != null && !cvox.DomUtil.isControl(targetNode)) {
    this.selectionWalker.setCurrentNode(targetNode);
  }
  this.currentNode = targetNode;
};


/**
 * Returns only the text content for the current position.
 *
 * @return {string} The current text content.
 */
cvox.ChromeVoxNavigationManager.prototype.getCurrentContent = function() {
  switch (this.currentNavStrategy) {
    default:
    case cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM:
      return this.customWalker.getCurrentContent();
      break;
    case cvox.ChromeVoxNavigationManager.STRATEGIES.SMART:
      return this.smartWalker.getCurrentContent();
      break;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      if (this.currentNode !== null) {
        return cvox.DomUtil.getText(this.currentNode);
      } else {
        return '';
      }
      break;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      return this.selectionWalker.getCurrentContent();
      break;
  }
};


/**
 * Returns a complete description of the current position, including
 * the text content and annotations such as "link", "button", etc.
 *
 * @return {Array.<string>} The summary of the current position. This is an
 * array of length 2 containing the current text content in the first cell and
 * the description annotations in the second cell in the form [<content>,
 * <description>].
 */
cvox.ChromeVoxNavigationManager.prototype.getCurrentDescription = function() {
  switch (this.currentNavStrategy) {
    default:
    case cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM:
      return this.customWalker.getCurrentDescription();
      break;
    case cvox.ChromeVoxNavigationManager.STRATEGIES.SMART:
      return this.smartDomWalker.getCurrentDescription();
      break;

    // Return '' for description part because linear and selection navigation
    // strategies only generally include text content for the current position.
    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      return [this.getCurrentContent() + ' ' +
            cvox.DomUtil.getInformationFromAncestors(
            this.getChangedAncestors()), ''];

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      return [this.getCurrentContent() + ' ' +
            cvox.DomUtil.getInformationFromAncestors(
            this.selectionUniqueAncestors), ''];
  }
};


/**
 * Returns an array of ancestor nodes that have been changed between the
 * previous position and the current current position.
 *
 * @return {Array.<Node>} The current content.
 */
cvox.ChromeVoxNavigationManager.prototype.getChangedAncestors = function() {
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART) {
    return this.smartDomWalker.getUniqueAncestors();
  } else {
    return this.linearDomWalker.getUniqueAncestors();
  }
};


/**
 * Sets the browser's focus to the current node.
 */
cvox.ChromeVoxNavigationManager.prototype.setFocus = function() {
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART) {
    cvox.DomUtil.setFocus(this.smartDomWalker.getCurrentNode());
  } else {
    cvox.DomUtil.setFocus(this.linearDomWalker.getCurrentNode());
  }
};


/**
 * Returns the current node depending upon the nav strategy.
 *
 * @return {Node} The current node.
 */
cvox.ChromeVoxNavigationManager.prototype.getCurrentNode = function() {
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART) {
    return this.smartDomWalker.getCurrentNode();
  } else {
    return this.linearDomWalker.getCurrentNode();
  }
};


/**
 * Acts on the current item and displays a disambiguation dialog
 * if more than one action is possible.
 *
 * @return {boolean} True if an action was taken.
 */
cvox.ChromeVoxNavigationManager.prototype.actOnCurrentItem = function() {
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM) {
    return this.customWalker.actOnCurrentItem();
  } else if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART) {
    if (this.currentNode && this.currentNode.tagName &&
        (this.currentNode.tagName == 'A')) {
      cvox.DomUtil.clickElem(this.currentNode, false);
      return true;
    } else {
      var aNodes = this.currentNode.getElementsByTagName('A');
      if (aNodes.length == 1) {
        cvox.DomUtil.clickElem(aNodes[0], false);
        return true;
      } else if (aNodes.length > 1) {
        var descriptions = new Array();
        var functions = new Array();
        for (var i = 0, link; link = aNodes[i]; i++) {
          if (cvox.DomUtil.hasContent(link)) {
            descriptions.push(cvox.DomUtil.getText(link));
            functions.push(cvox.ChromeVoxNavigationManager
                .createSimpleClickFunction(link));
          }
        }
        this.choiceWidget.show(descriptions, functions,
            descriptions.toString());
        return true;
      }
    }
  }
  return false;
};


/**
 * Checks if the navigation manager is able to act on the current item.
 *
 * @return {boolean} True if some action is possible.
 */
cvox.ChromeVoxNavigationManager.prototype.canActOnCurrentItem = function() {
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM) {
    return this.customWalker.canActOnCurrentItem();
  }
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART) {
    if (this.currentNode && this.currentNode.tagName &&
        (this.currentNode.tagName == 'A')) {
      return true;
    } else {
      var aNodes = this.currentNode.getElementsByTagName('A');
      if (aNodes.length > 0) {
        return true;
      }
    }
  }
  // Anything that is DOM level or lower will always be handled by the browser.
  return false;
};


/**
 * Creates a simple function that will click on the given targetNode when
 * invoked.
 * Note that we are using this function because functions created inside a loop
 * have to be created by another function and not within the loop directly.
 *
 * See: http://joust.kano.net/weblog/archive/2005/08/08/
 * a-huge-gotcha-with-javascript-closures/
 * @param {Node} targetNode The target node to click on.
 * @return {function()} A function that will click on the given targetNode.
 */
cvox.ChromeVoxNavigationManager.createSimpleClickFunction = function(
    targetNode) {
  var target = targetNode.cloneNode(true);
  return function() { cvox.DomUtil.clickElem(target, false); };
};


/**
 * Sets the custom walker to use for the current site.
 *
 * @param {Object} customWalkerObj The custom walker to use.
 */
cvox.ChromeVoxNavigationManager.prototype.setCustomWalker =
    function(customWalkerObj) {
  this.customWalker = customWalkerObj;
  this.currentNavStrategy = 3;
  this.lastUsedNavStrategy = 3;
};


/**
 * Switches to the given navigation strategy and granularity,
 *
 * @param {number} newStrategy The desired navigation strategy.
 * @param {number=} opt_newGranularity The desired navigation granularity
 *     (optional).
 * @param {boolean=} opt_forwards True if the selection is moving forwards
 *     (affects whether the beginning or end of the current selection is
 *     selected).
 */
cvox.ChromeVoxNavigationManager.prototype.switchToStrategy =
    function(newStrategy, opt_newGranularity, opt_forwards) {

  if (opt_forwards !== true && opt_forwards !== false) {
    opt_forwards = true;
  }

  var currentStrategy = this.currentNavStrategy;

  if (newStrategy < currentStrategy) {
    while (currentStrategy != newStrategy) {
      this.down();
      currentStrategy = this.currentNavStrategy;
    }
  } else if (newStrategy > currentStrategy) {
    if (currentStrategy ==
        cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION) {
      var changed = this.selectionWalker.lessGranular(opt_forwards);
      while (changed) {
        changed = this.selectionWalker.lessGranular(opt_forwards);
      }
    }
    while (currentStrategy != newStrategy) {
      this.up();
      currentStrategy = this.currentNavStrategy;
    }
  }

  if ((newStrategy == cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION) &&
      (opt_newGranularity != undefined)) {
    if (!opt_forwards) {
      var node = this.linearDomWalker.getCurrentNode();
      if (!!node) {
        cvox.SelectionUtil.selectAllTextInNode(node);
        cvox.SelectionUtil.collapseToEnd(node);
      }
      this.selectionWalker.previous();
    }

    var currentGranularity = this.selectionWalker.currentGranularity;
    if (opt_newGranularity < currentGranularity) {
      while (currentGranularity != opt_newGranularity) {
        this.selectionWalker.lessGranular(opt_forwards);
        currentGranularity = this.selectionWalker.currentGranularity;
      }
    } else if (opt_newGranularity > currentGranularity) {
      while (currentGranularity != opt_newGranularity) {
        this.selectionWalker.moreGranular(opt_forwards);
        currentGranularity = this.selectionWalker.currentGranularity;
      }
    }
  }
};


/**
 * Attempts to sync the navigation with the hashtag in the URL location.
 * This is a no-op if there is no hashtag in the URL or if the hashtag
 * is being used for AJAX data storage and not anchoring.
 */
cvox.ChromeVoxNavigationManager.prototype.syncToHashTagAnchor = function() {
  var hash = document.location.hash;
  if (hash) {
    var hashContentId = hash.substring(1);
    var anchorNode = document.getElementById(hashContentId);
    if (anchorNode) {
      // Clear this now so that if the same anchor link is clicked,
      // it will still work. Clearing this is safe since if we have reached
      // this point, the hash tag is definitely being used for anchoring and
      // not AJAX data storage.
      document.location.hash = '';
      this.syncToNode(anchorNode);
      anchorNode.scrollIntoView(true);
    }
  }
};


/**
 * Listen to messages from other frames and respond to messages that
 * tell our frame to take focus and preseve the navigation granularity
 * from the other frame.
 * @private
 */
cvox.ChromeVoxNavigationManager.prototype.addInterframeListener_ = function() {
  var self = this;
  cvox.Interframe.addListener(function(message) {
    if (message['command'] != 'enterIframe' &&
        message['command'] != 'exitIframe') {
      return;
    }

    window.focus();

    // First switch to linear DOM and focus the right starting element.
    self.switchToStrategy(
        cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM);

    if (message['command'] == 'exitIframe') {
      var id = message['sourceId'];
      var iframeElement = self.iframeIdMap[id];
      if (iframeElement) {
        self.syncToNode(iframeElement);
      }
    } else {
      self.syncToNode(null);
    }

    // Move by one element.
    if (message['forwards']) {
      self.next(false);
    } else {
      self.previous(false);
    }

    // Switch to the same strategy & granularity as before the iframe jump.
    self.switchToStrategy(message['strategy'],
                          message['granularity'],
                          message['forwards']);

    // Now speak what ended up being selected.
    cvox.ChromeVox.executeUserCommand('speakCurrentPosition');
  });
};


/**
 * Given a node that we just navigated to, try to jump in and out of iframes
 * as needed. If the node is an iframe, jump into it. If the node is null,
 * assume we reached the end of an iframe and try to jump out of it.
 * @param {Node} node The node to try to jump into.
 * @param {boolean} forwards True if navigation is currently moving forwards.
 * @return {boolean} True if we jumped into an iframe.
 * @private
 */
cvox.ChromeVoxNavigationManager.prototype.tryEnterExitIframe_ = function(
    node, forwards) {
  if (node == null && window.parent != window) {
    cvox.SelectionUtil.collapseToStart(document.body);

    var message = {
      'command': 'exitIframe',
      'forwards': forwards,
      'strategy': this.currentNavStrategy,
      'granularity': this.selectionWalker.currentGranularity
    };
    cvox.Interframe.sendMessageToParentWindow(message);
    return true;
  }

  if (node == null || node.tagName != 'IFRAME') {
    return false;
  }

  cvox.SelectionUtil.collapseToStart(document.body);

  var iframeElement = /** @type {HTMLIFrameElement} */(node);

  var iframeId = undefined;
  for (var id in this.iframeIdMap) {
    if (this.iframeIdMap[id] == iframeElement) {
      iframeId = id;
      break;
    }
  }
  if (iframeId == undefined) {
    iframeId = this.nextIframeId;
    this.nextIframeId++;
    this.iframeIdMap[iframeId] = iframeElement;
    cvox.Interframe.sendIdToIFrame(iframeId, iframeElement);
  }

  var message = {
    'command': 'enterIframe',
    'forwards': forwards,
    'strategy': this.currentNavStrategy,
    'granularity': this.selectionWalker.currentGranularity
  };
  cvox.Interframe.sendMessageToIFrame(message, iframeElement);

  return true;
};
