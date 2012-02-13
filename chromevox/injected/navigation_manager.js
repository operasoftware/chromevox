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
 * @fileoverview Manages navigation within a page.
 * This unifies navigation by the DOM walker and by WebKit selection.
 *
 * @author clchen@google.com (Charles L. Chen)
 */


goog.provide('cvox.ChromeVoxNavigationManager');

goog.require('cvox.ActiveIndicator');
goog.require('cvox.ChromeVoxChoiceWidget');
goog.require('cvox.DomUtil');
goog.require('cvox.Interframe');
goog.require('cvox.LinearDomWalker');
goog.require('cvox.NavDescription');
goog.require('cvox.SelectionUtil');
goog.require('cvox.SelectionWalker');
goog.require('cvox.SmartDomWalker');
goog.require('cvox.WalkerDecorator');



/**
 * @constructor
 */
cvox.ChromeVoxNavigationManager = function() {
  this.currentNode = null;
  this.nodeInformationArray = new Array();

  this.currentNavStrategy = 2;
  this.subNavigating = false;

  this.addInterframeListener_();

  this.reset();
  this.navigateForward(false);
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
 * Resets the navigation manager to the top of the page.
 */
cvox.ChromeVoxNavigationManager.prototype.reset = function() {
  if (this.activeIndicator) {
    this.activeIndicator.removeFromDom();
  }

  this.currentNode = null;
  this.nodeInformationArray = new Array();
  this.walkerDecorator = new cvox.WalkerDecorator();
  this.linearDomWalker = new cvox.LinearDomWalker();
  this.smartDomWalker = new cvox.SmartDomWalker();
  this.selectionWalker = new cvox.SelectionWalker();
  this.customWalker = null;
  this.walkerDecorator.decorate(this.linearDomWalker);
  this.walkerDecorator.decorate(this.smartDomWalker);
  this.walkerDecorator.decorate(this.selectionWalker);

  this.selectionUniqueAncestors = [];

  this.iframeIdMap = {};
  this.nextIframeId = 1;
  this.currentDialog = null;

  // Keeps track of whether we are currently navigating inside of a table (even
  // if we are not in table mode).
  this.currentTable_ = null;

  // TODO (deboer): Technically the choice widget could (and should) be
  // initialized here, but there is a problem with the tests not pulling in
  // PowerKey.
  this.choiceWidget = null;

  this.currentTable_ = null;
  this.activeIndicator = new cvox.ActiveIndicator();
};


/**
 * Moves forward. Stops any subnavigation. Depending on whether we are in table
 * mode, either moves forward using the current navigation strategy or moves to
 * the next row inside the table.
 * @param {boolean} navigateIframes If true, will jump in and out of iframes.
 * @param {boolean=} opt_navigateTables If true, will jump into tables. Default
 * is false.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the end of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.navigateForward =
    function(navigateIframes, opt_navigateTables) {
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART && this.inTableMode()) {
    return this.navigateNextRow();
  } else {
    if (this.subNavigating) {
      this.stopSubNavigating();
    }
    return this.next(navigateIframes, opt_navigateTables);
  }
};


/**
 * Moves backward. Stops any subnavigation. Depending on whether we are in
 * table mode, either moves backward using the current navigation strategy or
 * moves to the previous row inside the table.
 * @param {boolean} navigateIframes If true, will jump in and out of iframes.
 * @param {boolean=} opt_navigateTables If true, will jump into tables. Default
 * is false.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the start of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.navigateBackward =
    function(navigateIframes, opt_navigateTables) {
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART && this.inTableMode()) {
    return this.navigatePreviousRow();
  } else {
    if (this.subNavigating) {
      this.stopSubNavigating();
    }
    return this.previous(navigateIframes, opt_navigateTables);
  }
};


/**
 * Starts subnavigating, specifying that we should navigate at a more granular
 * level than the current navigation strategy.
 * @param {boolean} forwards True if we're moving forwards, false if backwards.
 */
cvox.ChromeVoxNavigationManager.prototype.startSubNavigating =
    function(forwards) {
  switch (this.currentNavStrategy) {
    case cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM:
      this.currentNavStrategy =
        cvox.ChromeVoxNavigationManager.STRATEGIES.SMART;
    break;
    case cvox.ChromeVoxNavigationManager.STRATEGIES.SMART:
      this.currentNavStrategy =
        cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM;
    break;
    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      this.currentNavStrategy =
        cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION;
      this.selectionWalker.currentGranularity = 0; // sentence
    break;
    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      // Sets selection to a more granular level.
      this.selectionWalker.changeGranularity(true);
    break;
  }

  this.subNavigating = true;

  // Syncs the node we're at with a more granular strategy.
  this.syncDown(forwards);
};


/**
 * Stops subnavigating, specifying that we should navigate at a less granular
 * level than the current navigation strategy.
 */
cvox.ChromeVoxNavigationManager.prototype.stopSubNavigating = function() {
  switch (this.currentNavStrategy) {
    case cvox.ChromeVoxNavigationManager.STRATEGIES.SMART:
      this.currentNavStrategy =
        cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM;
    break;
    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      this.currentNavStrategy =
        cvox.ChromeVoxNavigationManager.STRATEGIES.SMART;
    break;
    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      // Sets granularity to a less granular level.
      if (!this.selectionWalker.changeGranularity(false)) {
        this.currentNavStrategy =
            cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM;
      }
    break;
  }

  this.subNavigating = false;

  // Syncs the node we're at with a less granular strategy.
  this.syncUp();
};


/**
 * Syncs the current position with the current navigation strategy. Syncs from
 * a more granular navigation strategy to a less granular navigation strategy.
 */
cvox.ChromeVoxNavigationManager.prototype.syncUp = function() {
  var node;
  switch (this.currentNavStrategy) {
    case cvox.ChromeVoxNavigationManager.STRATEGIES.SMART:
      // We've been navigating linearly, so need to sync linear with smart.
      node = this.currentNode;
      while (!!node && this.linearDomWalker.isLeafNode(node)) {
        this.currentNode = node;
        node = node.parentNode;
      }
      // Check if we are now inside a table. If so, switch start table nav.
      if ((node !== null) && this.tryEnterTable_(this.currentNode, true)) {
        break;
      }
      this.smartDomWalker.setCurrentNode(this.currentNode);
      if (this.currentNode !== null) {
        this.navigateBackward(false);
      }
      this.navigateForward(false);
    break;
  }

  this.updateIndicator();
};


/**
 * Syncs the current position with the current navigation strategy. Syncs from a
 * less granular navigation strategy to a more granular navigation strategy.
 * @param {boolean=} opt_forwards True if we're moving forwards, false if
 * backwards.
 */
cvox.ChromeVoxNavigationManager.prototype.syncDown = function(opt_forwards) {
  switch (this.currentNavStrategy) {
    default:
    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      // We've been navigating with smart navigation, so need to sync down
      // to linear navigation.
      if (this.smartDomWalker.getCurrentNode() != null) {
        this.currentNode = this.smartDomWalker.getCurrentNode();
        this.linearDomWalker.setCurrentNode(this.currentNode);
        this.updateIndicator();
      }
      break;
    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      // Selects the whole range.
      this.selectionWalker.setCurrentNode(this.currentNode);
      break;
  }
};


/**
 * Moves to the next row of the currently navigated table.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the end of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.navigateNextRow = function() {
  var nextRow = this.nextRow();
  if (!nextRow && this.smartDomWalker.bumpedTwice) {
    this.exitTable(true);
  }
  return true;
};


/**
 * Moves forward using the current navigation strategy.
 * @param {boolean} navigateIframes If true, will jump in and out of iframes.
 * @param {boolean=} opt_navigateTables If true, will jump into tables. Default
 * is false.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the end of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.next =
    function(navigateIframes, opt_navigateTables) {
  switch (this.currentNavStrategy) {
    default:
    case cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM:
      var customNode = this.customWalker.next();
      if (navigateIframes && this.tryEnterExitIframe_(customNode, true)) {
        return true;
      }
      if (opt_navigateTables && this.tryEnterTable_(customNode, true)) {
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
      if (opt_navigateTables && this.tryEnterTable_(smartNode, true)) {
        return true;
      }
      if (smartNode) {
        this.currentNode = smartNode;
        this.updateIndicator();
        return true;
      }
      return false;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      var node = this.linearDomWalker.next();
      if (navigateIframes && this.tryEnterExitIframe_(node, true)) {
        return true;
      }
      if (opt_navigateTables && this.tryEnterTable_(node, true)) {
        return true;
      }
      if (node) {
        this.currentNode = node;
        this.updateIndicator();
        return true;
      }
      return false;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      this.selectionUniqueAncestors = [];
      var movedOk = this.selectionWalker.next();
      if (movedOk) {
        this.updateIndicator();
      } else {
        var selectionNode = this.linearDomWalker.next();
        if (navigateIframes && this.tryEnterExitIframe_(selectionNode, true)) {
          return true;
        }
        if (opt_navigateTables && this.tryEnterTable_(selectionNode, true)) {
          return true;
        }
        this.selectionUniqueAncestors =
            this.linearDomWalker.getUniqueAncestors();
        if (selectionNode) {
          this.currentNode = selectionNode;
          this.selectionWalker.setCurrentNode(this.currentNode);
          this.selectionWalker.initRange(true);
          // Make sure we don't skip over controls when moving selection.
          if (cvox.DomUtil.isControl(selectionNode)) {
            selectionNode.focus();
          }
          this.updateIndicator();
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
 * Moves to the next row of the currently navigated table.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the end of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.navigatePreviousRow = function() {
  var previousRow = this.previousRow();
  if (!previousRow && this.smartDomWalker.bumpedTwice) {
    this.exitTable(false);
  }
  return true;
};


/**
 * Moves backward using the current navigation strategy.
 * @param {boolean} navigateIframes If true, will jump in and out of iframes.
 * @param {boolean=} opt_navigateTables If true, will jump into tables. Default
 * is false.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the start of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.previous =
    function(navigateIframes, opt_navigateTables) {
  switch (this.currentNavStrategy) {
    default:
    case cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM:
      var customNode = this.customWalker.previous();
      if (navigateIframes && this.tryEnterExitIframe_(customNode, false)) {
        return true;
      }
      if (opt_navigateTables && this.tryEnterTable_(customNode, false)) {
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
      if (opt_navigateTables && this.tryEnterTable_(smartNode, false)) {
        return true;
      }
      if (smartNode) {
        this.currentNode = smartNode;
        this.updateIndicator();
        return true;
      }
      return false;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      var node = this.linearDomWalker.previous();
      if (navigateIframes && this.tryEnterExitIframe_(node, false)) {
        return true;
      }
      if (opt_navigateTables && this.tryEnterTable_(node, false)) {
        return true;
      }
      if (node) {
        this.currentNode = node;
        this.updateIndicator();
        return true;
      }
      return false;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      this.selectionUniqueAncestors = [];
      var movedOk = this.selectionWalker.previous();
      if (movedOk) {
        this.updateIndicator();
      } else {
        var selectionNode = this.linearDomWalker.previous();
        if (navigateIframes && this.tryEnterExitIframe_(selectionNode, false)) {
          return true;
        }
        if (opt_navigateTables && this.tryEnterTable_(selectionNode, false)) {
          return true;
        }
        this.selectionUniqueAncestors =
            this.linearDomWalker.getUniqueAncestors();
        if (selectionNode) {
          this.currentNode = selectionNode;
          this.selectionWalker.setCurrentNode(this.currentNode);
          this.selectionWalker.initRange(false);
          // Make sure we don't skip over controls when moving selection.
          if (cvox.DomUtil.isControl(selectionNode)) {
            selectionNode.focus();
          }
          this.updateIndicator();
          return true;
        }
        return false;
      }
      return true;
  }
};


/**
 * Depending on whether we are in table mode, either starts subnavigating
 * forward (moving forward using a more granular strategy) or moves to the
 * next column inside the table.
 * @param {boolean} navigateIframes If true, will jump in and out of iframes.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the start of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.navigateRight =
    function(navigateIframes) {
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART && this.inTableMode()) {
    this.nextCol();
    return true;
  } else {
    if (!this.subNavigating) {
      this.startSubNavigating(true);
    }
    return this.next(navigateIframes);
  }
};


/**
 * Depending on whether we are in table mode, either starts subnavigating
 * backward (moving backward using a more granular strategy) or moves to the
 * previous column inside the table.
 * @param {boolean} navigateIframes If true, will jump in and out of iframes.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the start of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.navigateLeft =
    function(navigateIframes) {
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART && this.inTableMode()) {
    this.previousCol();
    return true;
  } else {
    if (!this.subNavigating) {
      this.startSubNavigating(false);
    }
    return this.previous(navigateIframes);
  }
};


/**
 * Moves up a level of granularity.
 */
cvox.ChromeVoxNavigationManager.prototype.up = function() {
  if (this.subNavigating) {
    // If we are currently subnavigating, that means we are currently moving
    // at a level below the specified navigation level. So we need to move
    // to a less granular strategy *twice*.
    this.subNavigating = false;
    this.up();
  }
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
      this.syncUp();
      break;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      var changed = this.selectionWalker.lessGranular(true);
      if (!changed) {
        this.lastUsedNavStrategy = this.currentNavStrategy;
        this.currentNavStrategy =
            cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM;
      }
      break;
  }

  this.updateIndicator();
};


/**
 * Moves down a level of granularity.
 */
cvox.ChromeVoxNavigationManager.prototype.down = function() {
  if (this.subNavigating) {
    // If we are currently subnavigating, that means we are currently moving
    // at a level below the specified navigation level. So we don't need to
    // change the level any further - we're already doing the right thing.
    this.subNavigating = false;
    return;
  }
  switch (this.currentNavStrategy) {
    default:
    case cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM:
      this.lastUsedNavStrategy = this.currentNavStrategy;
      this.currentNavStrategy =
          cvox.ChromeVoxNavigationManager.STRATEGIES.SMART;
      if (this.customWalker.getCurrentNode() != null) {
        this.currentNode = this.customWalker.getCurrentNode();

        // Check if we are now inside a table. If so, switch start table nav.
        if (this.tryEnterTable_(this.currentNode, true)) {
          break;
        }
        this.smartDomWalker.setCurrentNode(this.currentNode);
      }
      break;
    case cvox.ChromeVoxNavigationManager.STRATEGIES.SMART:
      // If we are in table mode, exit table mode.
      if (this.smartDomWalker.tableMode) {
        this.smartDomWalker.exitTable();
      }
      this.lastUsedNavStrategy = this.currentNavStrategy;
      this.currentNavStrategy =
          cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM;
      this.syncDown();
      if (this.currentNode !== null) {
        this.navigateBackward(false);
      }
      this.navigateForward(false);
      break;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      this.lastUsedNavStrategy = this.currentNavStrategy;
      this.currentNavStrategy =
          cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION;
      this.syncDown(false);
      this.selectionWalker.next();
      break;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      var changed = this.selectionWalker.moreGranular(true);
      break;
  }

  this.updateIndicator();
};


/**
 * If the current node is inside a table, switches to smart navigation
 * (group mode) and starts table navigation.
 * @return {boolean} Whether or not the node is inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.forceEnterTable = function() {
  return this.tryEnterTable_(this.currentNode, true, true);
};


/**
 * Checks to see if a given node is inside of a data table (according to
 * heuristics defined in dom_util.js). If so, switches to smart
 * navigation (group mode) and starts table navigation.
 * @param {Node} node The provided node.
 * @param {boolean} forwards True if navigation is currently moving forwards.
 * @param {boolean=} opt_forceTableNav True if we want to force table navigation
 * whether or not the table is a layout table or if we've jumped out of it
 * before.
 * @return {boolean} Whether we are inside a table.
 * @private
 */
cvox.ChromeVoxNavigationManager.prototype.tryEnterTable_ =
    function(node, forwards, opt_forceTableNav) {
  if (!node) {
    return false;
  }
  // If this node is in a data table, switch to group mode.
  var tableNode = cvox.DomUtil.getContainingTable(node);
  if (!tableNode ||
      (!opt_forceTableNav && cvox.DomUtil.isLayoutTable(tableNode))) {
    this.currentTable_ = null;
    return false;
  }
  if ((this.currentNavStrategy !=
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART) &&
          (this.currentTable_ == tableNode)) {
    // We've already explicitly jumped out of this table by moving out of
    // group navigation. We're still not in group navigation, so don't
    // automatically jump back.
    return false;
  }
  // Switch to group mode and start table navigation.
  this.switchToStrategy(cvox.ChromeVoxNavigationManager.STRATEGIES.SMART);
  this.smartDomWalker.setCurrentNode(this.currentNode);
  this.smartDomWalker.startTableNavigation(tableNode);

  var cell = null;
  if (forwards) {
    cell = this.smartDomWalker.goToFirstCell();
  } else {
    cell = this.smartDomWalker.goToLastCell();
  }

  if (cell) {
    this.currentNode = cell;
    this.updateIndicator();
    this.currentTable_ = tableNode;
    return true;
  }
  return false;
};


/**
 * Stops traversing a table. Moves the cursor to the first element (found by
 * smart navigation) after the end of the table.
 * @param {boolean} forwards True if we should exit the table by moving to the
 * end, false if we should exit the table by moving to the beginning.
 */
cvox.ChromeVoxNavigationManager.prototype.exitTable = function(forwards) {
  if (this.smartDomWalker.tableMode) {
    var cell = null;
    if (forwards) {
      cell = this.smartDomWalker.goToLastCell();
    } else {
      cell = this.smartDomWalker.goToFirstCell();
    }
    if (cell) {
      this.currentNode = cell;
      this.updateIndicator();
      this.currentTable_ = null;
      this.smartDomWalker.exitTable();
      forwards ? this.next(true) : this.previous(true);
    }
  }
};


/**
 * Traverses to the cell in the previous row (same column) of the current table.
 * @return {boolean} Whether or not a cell was found in the previous row and
 * traversal was successful.
 */
cvox.ChromeVoxNavigationManager.prototype.previousRow = function() {
  var previousRowNode = this.smartDomWalker.previousRow();
  if (previousRowNode) {
    this.currentNode = previousRowNode;
    this.updateIndicator();
    return true;
  } else {
    return false;
  }
};


/**
 * Traverses to the cell in the next row (same column) of the current table.
 * @return {boolean} Whether or not a cell was found in the next row and
 * traversal was successful.
 */
cvox.ChromeVoxNavigationManager.prototype.nextRow = function() {
  var nextRowNode = this.smartDomWalker.nextRow();
  if (nextRowNode) {
    this.currentNode = nextRowNode;
    this.updateIndicator();
    return true;
  } else {
    return false;
  }
};


/**
 * Traverses to the cell in the previous column (same row) of the current table.
 * @return {boolean} Whether or not a cell was found in the previous column and
 * traversal was successful.
 */
cvox.ChromeVoxNavigationManager.prototype.previousCol = function() {
  var previousColNode = this.smartDomWalker.previousCol();
  if (previousColNode) {
    this.currentNode = previousColNode;
    this.updateIndicator();
    return true;
  } else {
    return false;
  }
};


/**
 * Traverses to the cell in the next column (same row) of the current table.
 * @return {boolean} Whether or not a cell was found in the next column and
 * traversal was successful.
 */
cvox.ChromeVoxNavigationManager.prototype.nextCol = function() {
  var nextColNode = this.smartDomWalker.nextCol();
  if (nextColNode) {
    this.currentNode = nextColNode;
    this.updateIndicator();
    return true;
  } else {
    return false;
  }
};


/**
 * Returns the text content of the row header(s) of the current cell.
 * @return {?string} The text content of the row header(s) of the current cell
 * or null if the cell has no row headers.
 */
cvox.ChromeVoxNavigationManager.prototype.getRowHeaderText = function() {
  return this.smartDomWalker.getRowHeaderText();
};


/**
 * Returns the text content of best-guess row header of the current cell.
 * This is used when the table does not specify row and column headers.
 * @return {?string} The text content of the guessed row header of the current
 * cell.
 */
cvox.ChromeVoxNavigationManager.prototype.getRowHeaderGuess = function() {
  return this.smartDomWalker.getRowHeaderGuess();
};


/**
 * Returns the text content of the col header(s) of the current cell.
 * @return {?string} The text content of the col header(s) of the current cell
 * or null if the cell has no col headers.
 */
cvox.ChromeVoxNavigationManager.prototype.getColHeaderText = function() {
  return this.smartDomWalker.getColHeaderText();
};


/**
 * Returns the text content of best-guess col header of the current cell.
 * This is used when the table does not specify col and column headers.
 * @return {?string} The text content of the guessed col header of the current
 * cell.
 */
cvox.ChromeVoxNavigationManager.prototype.getColHeaderGuess = function() {
  return this.smartDomWalker.getColHeaderGuess();
};


/**
 * Returns the current row index.
 * @return {?number} The current row index. Null if we aren't in table mode.
 */
cvox.ChromeVoxNavigationManager.prototype.getRowIndex = function() {
  return this.smartDomWalker.getRowIndex();
};


/**
 * Returns the current column index.
 * @return {?number} The current column index. Null if we aren't in table mode.
 */
cvox.ChromeVoxNavigationManager.prototype.getColIndex = function() {
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
    this.currentNode = smartNode;
    this.updateIndicator();
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
 *     of unique ancestor nodes as a parameter and returning a desired node.
 *     It returns null if that node can't be found.
 * @return {boolean} True if a match was found.
 */
cvox.ChromeVoxNavigationManager.prototype.findNext = function(predicate) {
  this.syncPosition();
  var originalNode = this.getCurrentNode();
  var nodeToTry = undefined;
  // Sync the linear DOM walker before running find to make sure it starts
  // from the right spot.
  if (this.currentNavStrategy !=
      cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM) {
    this.linearDomWalker.syncToNode(this.getCurrentNode());
  }
  while (true) {
    nodeToTry = this.linearDomWalker.next();
    if (!nodeToTry) {
      break;
    }

    if ((nodeToTry = predicate(this.linearDomWalker.getUniqueAncestors()))) {
      break;
    }
  }

  if (nodeToTry) {
    this.currentNode = nodeToTry;
    this.updateIndicator();
    this.linearDomWalker.syncToNode(this.currentNode);
    this.smartDomWalker.syncToNode(this.currentNode);
    return true;
  } else {
    // No matching node was found. Need to sync the linear walker back to
    // original position.
    this.linearDomWalker.syncToNode(originalNode);
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
  var originalNode = this.getCurrentNode();
  var nodeToTry = undefined;
  // Sync the linear DOM walker before running find to make sure it starts
  // from the right spot.
  if (this.currentNavStrategy !=
      cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM) {
    this.linearDomWalker.syncToNode(this.getCurrentNode());
  }
  while (true) {
    nodeToTry = this.linearDomWalker.previous();
    if (!nodeToTry) {
      break;
    }

    if ((nodeToTry = predicate(this.linearDomWalker.getUniqueAncestors()))) {
      break;
    }
  }

  if (nodeToTry) {
    this.currentNode = nodeToTry;
    this.updateIndicator();
    this.linearDomWalker.syncToNode(this.currentNode);
    this.smartDomWalker.syncToNode(this.currentNode);
    return true;
  } else {
    // No matching node was found. Need to sync the linear walker back to
    // original position.
    this.linearDomWalker.syncToNode(originalNode);
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
 * @return {string} The selection granularity that is being used.
 */
cvox.ChromeVoxNavigationManager.prototype.getGranularity = function() {
  return this.selectionWalker.getGranularity();
};


/**
 * Returns whether we are currently navigating a table.
 * @return {boolean} If we are currently navigating a table.
 */
cvox.ChromeVoxNavigationManager.prototype.inTableMode = function() {
  return this.smartDomWalker.tableMode;
};


/**
 * Returns whether we are currently navigating a grid.
 * @return {boolean} If we are currently navigating a grid.
 */
cvox.ChromeVoxNavigationManager.prototype.insideGrid = function() {
  return this.smartDomWalker.isGrid;
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
  var sel = window.getSelection();
  if (sel && (sel.toString().length > 0) &&
      sel.anchorNode &&
      !cvox.DomUtil.isDescendantOfNode(this.currentNode, sel.anchorNode)) {
    this.currentNode = sel.anchorNode;
    // For composite controls, the anchorNode will often fall below the leaf
    // level. Set it to the earliest ancestor that is considered a leaf node.
    var ancestors = cvox.DomUtil.getAncestors(this.currentNode);
    for (var i = 0, node; node = ancestors[i]; i++) {
      if (cvox.DomUtil.isLeafNode(node)) {
        this.currentNode = node;
        break;
      }
    }

    this.linearDomWalker.syncToNode(this.currentNode);
    this.smartDomWalker.syncToNode(this.currentNode);
    this.updateIndicator();
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
  this.linearDomWalker.syncToNode(targetNode);
  this.smartDomWalker.syncToNode(targetNode);
  this.selectionWalker.setCurrentNode(targetNode);
  this.currentNode = targetNode;

  this.activeIndicator.syncToNode(targetNode);
};


/**
 * Speak all of the NavDescriptions in the given array (as returned by
 * getCurrentDescription), including playing earcons.
 *
 * @param {Array.<cvox.NavDescription>} descriptionArray The array of
 *     NavDescriptions to speak.
 * @param {number} initialQueueMode The initial queue mode.
 * @param {Function} completionFunction Function to call when finished speaking.
 */
cvox.ChromeVoxNavigationManager.prototype.speakDescriptionArray = function(
    descriptionArray, initialQueueMode, completionFunction) {
  function speakOneDescription(i, queueMode) {
    var description = descriptionArray[i];
    function startCallback() {
      for (var j = 0; j < description.earcons.length; j++) {
        cvox.ChromeVox.earcons.playEarcon(description.earcons[j]);
      }
    }
    function endCallback() {
      if (i == descriptionArray.length - 1 && completionFunction) {
        completionFunction();
      }
    }
    description.speak(queueMode, startCallback, endCallback);
  };

  var queueMode = initialQueueMode;
  for (var i = 0; i < descriptionArray.length; i++) {
    speakOneDescription(i, queueMode);
    queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
  }

  if ((descriptionArray.length == 0) && completionFunction) {
    completionFunction();
  }
};


/**
 * Starts reading the page from the current node.
 *
 * @param {number} queueMode Indicates whether queue mode or flush mode should
 * be used.
 */
cvox.ChromeVoxNavigationManager.prototype.startReadingFromCurrentNode =
    function(queueMode) {
  var currentDesc = cvox.ChromeVox.navigationManager.getCurrentDescription();
  var self = this;
  this.speakDescriptionArray(currentDesc, queueMode, function() {
    if (self.next()) {
      self.startReadingFromCurrentNode(cvox.AbstractTts.QUEUE_MODE_QUEUE);
    }
  });
};


/**
 * Returns a complete description of the current position, including
 * the text content and annotations such as "link", "button", etc.
 *
 * @return {Array.<cvox.NavDescription>} The summary of the current position.
 */
cvox.ChromeVoxNavigationManager.prototype.getCurrentDescription = function() {
  switch (this.currentNavStrategy) {
    default:
    case cvox.ChromeVoxNavigationManager.STRATEGIES.CUSTOM:
      return [this.customWalker.getCurrentDescription()];

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SMART:
      var navDescriptions = this.smartDomWalker.getCurrentDescription();
      if (this.inTableMode()) {
        if (this.smartDomWalker.bumpedEdge) {
          // We have reached the edge of the table and need an earcon here
          if (navDescriptions.length > 0) {
            navDescriptions[0].pushEarcon(cvox.AbstractEarcons.WRAP_EDGE);
          }
        }
        if (this.smartDomWalker.announceTable) {
          // We have entered a table and need an earcon here
          if (navDescriptions.length > 0) {
            navDescriptions[0].pushEarcon(cvox.AbstractEarcons.WRAP);
          }
        }
      }
      return navDescriptions;

    case cvox.ChromeVoxNavigationManager.STRATEGIES.LINEARDOM:
      return [cvox.DomUtil.getDescriptionFromAncestors(
                  this.getChangedAncestors(), true, cvox.ChromeVox.verbosity)];

    case cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION:
      return [this.selectionWalker.getCurrentDescription(
                  this.selectionUniqueAncestors)];
  }
};

/**
 * Returns a complete description of the current position, including
 * the text content and annotations such as "link", "button", etc.
 * Unlike getCurrentDescription, this does not shorten the position based on the
 * previous position.
 *
 * @return {Array.<cvox.NavDescription>} The summary of the current position.
 */
cvox.ChromeVoxNavigationManager.prototype.getCurrentFullDescription =
    function() {
  return [cvox.DomUtil.getDescriptionFromAncestors(
      this.getAllAncestors(), true, cvox.ChromeVox.verbosity)];
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
 * Returns an array of all ancestor nodes for the current current position.
 *
 * @return {Array.<Node>} The current content.
 */
cvox.ChromeVoxNavigationManager.prototype.getAllAncestors = function() {
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART) {
    return cvox.DomUtil.getAncestors(this.smartDomWalker.getCurrentNode());
  } else {
    return cvox.DomUtil.getAncestors(this.linearDomWalker.getCurrentNode());
  }
};

/**
 * Sets the browser's focus to the current node.
 */
cvox.ChromeVoxNavigationManager.prototype.setFocus = function() {
  if (this.currentNavStrategy ==
      cvox.ChromeVoxNavigationManager.STRATEGIES.SMART) {
    if (this.inTableMode()) {
      cvox.DomUtil.setFocus(this.smartDomWalker.getCurrentNode(), true);
    } else {
      cvox.DomUtil.setFocus(this.smartDomWalker.getCurrentNode());
    }
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
            descriptions.push(cvox.DomUtil.collapseWhitespace(
                cvox.DomUtil.getName(link)));
            functions.push(cvox.ChromeVoxNavigationManager
                .createSimpleClickFunction(link));
          }
        }
        this.choiceWidget = new cvox.ChromeVoxChoiceWidget();
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
    if (!this.currentNode) {
      // Don't try to do anything if the currentNode is not set.
      return false;
    }
    if (this.currentNode.tagName && (this.currentNode.tagName == 'A')) {
      return true;
    } else {
      if (this.currentNode.getElementsByTagName) {
        var aNodes = this.currentNode.getElementsByTagName('A');
        if (aNodes.length > 0) {
          return true;
        }
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
        this.selectionWalker.setCurrentNode(node);
      }
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
    var message = {
      'command': 'exitIframe',
      'forwards': forwards,
      'strategy': this.currentNavStrategy,
      'granularity': this.selectionWalker.currentGranularity
    };
    cvox.Interframe.sendMessageToParentWindow(message);
    return true;
  }

  if (node == null || node.tagName != 'IFRAME' || !node.src) {
    return false;
  }

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

/**
 * Checks if the choice widget is currently active.
 * @return {boolean} True if the choice widget is active.
 */
cvox.ChromeVoxNavigationManager.prototype.isChoiceWidgetActive = function() {
  if (this.choiceWidget) {
    return this.choiceWidget.isActive();
  }
  return false;
};

/**
 * Update the active indicator to reflect the current node or selection.
 */
cvox.ChromeVoxNavigationManager.prototype.updateIndicator = function() {
  cvox.SelectionUtil.scrollElementsToView(this.currentNode);
  if (this.currentNavStrategy ==
          cvox.ChromeVoxNavigationManager.STRATEGIES.SELECTION) {
    this.activeIndicator.syncToRange(this.selectionWalker.getCurrentRange());
  } else {
    this.activeIndicator.syncToNode(this.currentNode);
  }
};

/**
 * Show or hide the active indicator based on whether ChromeVox is
 * active or not.
 */
cvox.ChromeVoxNavigationManager.prototype.showOrHideIndicator = function() {
  this.activeIndicator.setVisible(cvox.ChromeVox.isActive);
};
