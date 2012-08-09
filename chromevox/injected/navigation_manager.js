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
 * NOTE: the purpose of this class is only to hold state
 * and delegate all of its functionality to mostly stateless classes that
 * are easy to test.
 *
 * @author clchen@google.com (Charles L. Chen)
 */


goog.provide('cvox.ChromeVoxNavigationManager');

goog.require('cvox.ActiveIndicator');
goog.require('cvox.ChromeVoxChoiceWidget');
goog.require('cvox.CursorSelection');
goog.require('cvox.DescriptionUtil');
goog.require('cvox.DomUtil');
goog.require('cvox.Interframe');
goog.require('cvox.NavDescription');
goog.require('cvox.NavigationHistory');
goog.require('cvox.NavigationShifter');
goog.require('cvox.NavigationSpeaker');
goog.require('cvox.SelectionUtil');
goog.require('cvox.WalkerDecorator');
goog.require('cvox.Widget');


/**
 * @constructor
 */
cvox.ChromeVoxNavigationManager = function() {
  this.addInterframeListener_();

  this.reset();
};

/**
 * Resets the navigation manager to the top of the page.
 */
cvox.ChromeVoxNavigationManager.prototype.reset = function() {
  if (this.activeIndicator) {
    this.activeIndicator.removeFromDom();
  }

  this.navSpeaker_ = new cvox.NavigationSpeaker();
  /**
   * @type {cvox.NavigationShifter}
   */
  this.navShifter_ = new cvox.NavigationShifter();

  /** @type {!cvox.CursorSelection} */
  this.curSel_ = this.navShifter_.syncToPageBeginning();

  /** @type {!cvox.CursorSelection} */
  this.prevSel_ = this.curSel_.clone();

  this.iframeIdMap = {};
  this.nextIframeId = 1;

  this.choiceWidget_ = new cvox.ChromeVoxChoiceWidget();

  /**
   * Keeps track of whether we have skipped while "reading from here"
   * @type {boolean}
   * @private
   */
  this.skipped_ = false;

  this.bumpedEdge_ = false;

  this.activeIndicator = new cvox.ActiveIndicator();

  this.navigationHistory_ = new cvox.NavigationHistory();

  this.updateIndicator();
};


/**
 * Determines if we are navigating from a valid node. If not, ask navigation
 * history for an acceptable restart point and go there.
 * @param {function(Node)} opt_predicate A function that takes in a node and
 *     returns true if it is a valid recovery candidate.
 * @return {boolean} True if we should continue navigation normally.
 */
cvox.ChromeVoxNavigationManager.prototype.resolve =
    function(opt_predicate) {
  var current = this.getCurrentNode();
  if (this.navigationHistory_.validate(current)) {
    return true;
  }

  // Our current node was invalid. Revert to history.
  var revert = this.navigationHistory_.revert(opt_predicate);

  // Convert to selections. If history is wiped, these will be null.
  var newSel = cvox.CursorSelection.fromNode(revert.current);
  var context = cvox.CursorSelection.fromNode(revert.previous);

  // Default to document body if selections are null.
  newSel = newSel || cvox.CursorSelection.fromBody();
  context = context || cvox.CursorSelection.fromBody();

  this.updateSel(newSel, context);
  return false;
};


/**
 * Delegates to NavigationShifter with current page state.
 * @param {boolean=} navigateIframes If true, will jump in and out of iframes.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the end of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.next = function(navigateIframes) {
  if (!this.resolve()) {
    return true;
  }
  var ret = this.navShifter_.next(this.curSel_);
  if (navigateIframes &&
      this.tryIframe_(ret && ret.start.node, !this.curSel_.isReversed())) {
    return true;
  }
  return this.tryTable_(ret);
};


/**
 * Delegates to NavigationShifter with current page state.
 * @param {boolean=} navigateIframes If true, will jump in and out of iframes.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the start of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.previous = function(navigateIframes) {
  var r = this.curSel_.isReversed();
  this.curSel_.setReversed(true);
  var ret = this.next(navigateIframes);
  this.curSel_.setReversed(r);
  return ret;
};


/**
 * Delegates to NavigationShifter with current page state.
 * @param {function(Array.<Node>)} predicate A function taking an array
 *     of unique ancestor nodes as a parameter and returning a desired node.
 *     It returns null if that node can't be found.
 * @return {boolean} True if a match was found.
 */
cvox.ChromeVoxNavigationManager.prototype.findNext = function(predicate) {
  var ret = this.navShifter_.findNext(this.curSel_, predicate);
  if (ret) {
    return this.tryTable_(ret);
  }
  return false;
};


/**
 * Delegates to NavigationShifter. Tries to enter any iframes or tables.
 */
cvox.ChromeVoxNavigationManager.prototype.syncToPageBeginning = function() {
  var ret = this.navShifter_.syncToPageBeginning({
      reversed: this.curSel_.isReversed()
  });
  if (this.tryIframe_(ret && ret.start.node, true)) {
    return;
  }
  this.tryTable_(ret);
};


/**
 * Delegates to NavigationShifter with current page state.
 * @return {boolean} True if some action that could be taken exists.
 */
cvox.ChromeVoxNavigationManager.prototype.act = function() {
  return this.navShifter_.act(this.curSel_, this.choiceWidget_);
};


/**
 * Delegates to NavigationShifter with current page state.
 * @return {boolean} True if some action that could be taken exists.
 */
cvox.ChromeVoxNavigationManager.prototype.canAct = function() {
  return this.navShifter_.canAct(this.curSel_);
};


/**
 * Delegates to NavigationShifter with current page state.
 */
cvox.ChromeVoxNavigationManager.prototype.sync = function() {
  var ret = this.navShifter_.sync(this.curSel_);
  if (ret) {
    this.curSel_ = ret;
  }
};


/**
 * Delegates to NavigationShifter with the current page state.
 * @return {Array.<cvox.NavDescription>} The summary of the current position.
 */
cvox.ChromeVoxNavigationManager.prototype.getDescription = function() {
  var desc = this.navShifter_.getDescription(this.prevSel_, this.curSel_);
  var earcons = [];

  if (this.skipped_) {
    earcons.push(cvox.AbstractEarcons.PARAGRAPH_BREAK);
    this.skipped_ = false;
  }
  if (this.bumpedEdge_) {
    earcons.push(cvox.AbstractEarcons.WRAP);
  }
  if (earcons.length > 0 && desc.length > 0) {
    earcons.forEach(function(earcon) {
    desc[0].pushEarcon(earcon);
    });
  }
  return desc;
};


/**
 * Returns the current navigation strategy.
 *
 * @return {string} The name of the strategy used.
 */
cvox.ChromeVoxNavigationManager.prototype.getGranularityMsg = function() {
  return this.navShifter_.getGranularityMsg();
};


/**
 * Traverses to the first cell of the current table.
 * @return {boolean} Whether or not the traversal was successful. False implies
 * that we are not currently inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.goToFirstCell = function() {
  var ret = this.navShifter_.goToFirstCell(this.curSel_);
  if (!ret) {
    return false;
  }
  this.updateSel(ret);
  return true;
};


/**
 * Traverses to the last cell of the current table.
 * @return {boolean} Whether or not the traversal was successful. False implies
 * that we are not currently inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.goToLastCell = function() {
  var ret = this.navShifter_.goToLastCell(this.curSel_);
  if (!ret) {
    return false;
  }
  this.updateSel(ret);
  return true;
};


/**
 * Traverses to the first cell of the current row of the current table.
 * @return {boolean} Whether or not the traversal was successful. False implies
 * that we are not currently inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.goToRowFirstCell = function() {
  var ret = this.navShifter_.goToRowFirstCell(this.curSel_);
  if (!ret) {
    return false;
  }
  this.updateSel(ret);
  return true;
};


/**
 * Traverses to the last cell of the current row of the current table.
 * @return {boolean} Whether or not the traversal was successful. False implies
 * that we are not currently inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.goToRowLastCell = function() {
  var ret = this.navShifter_.goToRowLastCell(this.curSel_);
  if (!ret) {
    return false;
  }
  this.updateSel(ret);
  return true;
};


/**
 * Traverses to the first cell of the current column of the current table.
 * @return {boolean} Whether or not the traversal was successful. False implies
 * that we are not currently inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.goToColFirstCell = function() {
  var ret = this.navShifter_.goToColFirstCell(this.curSel_);
  if (!ret) {
    return false;
  }
  this.updateSel(ret);
  return true;
};


/**
 * Traverses to the last cell of the current column of the current table.
 * @return {boolean} Whether or not the traversal was successful. False implies
 * that we are not currently inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.goToColLastCell = function() {
  var ret = this.navShifter_.goToColLastCell(this.curSel_);
  if (!ret) {
    return false;
  }
  this.updateSel(ret);
  return true;
};


/**
 * Delegates to NavigationShifter.
 * @return {boolean} Whether or not the command was successful. False implies
 * either we were already on the last row or not in table.
 */
cvox.ChromeVoxNavigationManager.prototype.nextRow = function() {
  var ret = this.navShifter_.nextRow(this.curSel_);
  if (!ret) {
    if (this.bumpedEdge_) {
      return false;
    }
    this.bumpedEdge_ = true;
    return true;
  }
  this.updateSel(ret);
  return true;
};


/**
 * Delegates to NavigationShifter.
 * @return {boolean} Whether or not the command was successful. False implies
 * either we were already on the last col or not in table.
 */
cvox.ChromeVoxNavigationManager.prototype.nextCol = function() {
  var ret = this.navShifter_.nextCol(this.curSel_);
  this.updateSel(ret || this.curSel_);
  if (!ret) {
    return false;
  }
  return true;
};


/**
 * Returns the text content of the row header(s) of the current cell.
 * @return {?string} The text content of the row header(s) of the current cell
 * or null if the cell has no row headers.
 */
cvox.ChromeVoxNavigationManager.prototype.getRowHeaderText = function() {
  return this.navShifter_.getRowHeaderText(this.curSel_);
};


/**
 * Returns the text content of best-guess row header of the current cell.
 * This is used when the table does not specify row and column headers.
 * @return {?string} The text content of the guessed row header of the current
 * cell.
 */
cvox.ChromeVoxNavigationManager.prototype.getRowHeaderGuess = function() {
  return this.navShifter_.getRowHeaderGuess(this.curSel_);
};


/**
 * Returns the text content of the col header(s) of the current cell.
 * @return {?string} The text content of the col header(s) of the current cell
 * or null if the cell has no col headers.
 */
cvox.ChromeVoxNavigationManager.prototype.getColHeaderText = function() {
  return this.navShifter_.getColHeaderText(this.curSel_);
};


/**
 * Returns the text content of best-guess col header of the current cell.
 * This is used when the table does not specify col and column headers.
 * @return {?string} The text content of the guessed col header of the current
 * cell.
 */
cvox.ChromeVoxNavigationManager.prototype.getColHeaderGuess = function() {
  return this.navShifter_.getColHeaderGuess(this.curSel_);
};


/**
 * Returns the current row index.
 * @return {Array.<cvox.NavDescription>} The description of our location in
 * a table, or null if not in a table.
 */
cvox.ChromeVoxNavigationManager.prototype.getLocationDescription = function() {
  return this.navShifter_.getLocationDescription(this.curSel_);
};


/**
 * Returns true if curSel_ is inside a table.
 * @return {boolean} true if inside a table.
 */
cvox.ChromeVoxNavigationManager.prototype.isInTable = function() {
  return this.navShifter_.isInTable(this.curSel_);
};


/**
 * Returns true if curSel_ is inside a grid.
 * @return {boolean} true if inside a grid.
 */
cvox.ChromeVoxNavigationManager.prototype.isInGrid = function() {
  return this.navShifter_.isInGrid(this.curSel_);
};


/**
 * Delegates to NavigationShifter.
 */
cvox.ChromeVoxNavigationManager.prototype.makeMoreGranular = function() {
  this.navShifter_.makeMoreGranular();
  this.sync();
};


/**
 * Delegates to NavigationShifter.
 */
cvox.ChromeVoxNavigationManager.prototype.makeLessGranular = function() {
  this.navShifter_.makeLessGranular();
  this.sync();
};


/**
 * Delegates to NavigationShifter. Behavior is not defined if granularity
 * was not previously gotten from a call to getGranularity();
 * @param {number} granularity The desired granularity.
 */
cvox.ChromeVoxNavigationManager.prototype.setGranularity =
    function(granularity) {
  this.navShifter_.setGranularity(granularity);
};

/**
 * Delegates to NavigationShifter.
 * @return {number} The current granularity.
 */
cvox.ChromeVoxNavigationManager.prototype.getGranularity = function() {
  return this.navShifter_.getGranularity();
};


/**
 * Delegates to NavigationShifter.
 */
cvox.ChromeVoxNavigationManager.prototype.ensureSubnavigating = function() {
  if (!this.navShifter_.isSubnavigating()) {
    this.navShifter_.ensureSubnavigating();
    this.sync();
  }
};


/**
 * Stops subnavigating, specifying that we should navigate at a less granular
 * level than the current navigation strategy.
 */
cvox.ChromeVoxNavigationManager.prototype.ensureNotSubnavigating = function() {
  if (this.navShifter_.isSubnavigating()) {
    this.navShifter_.ensureNotSubnavigating();
    this.sync();
  }
};


/**
 * Returns true if currently in subnavigation mode
 * @return {boolean} If subnavigating.
 */
cvox.ChromeVoxNavigationManager.prototype.isSubnavigating = function() {
  return this.navShifter_.isSubnavigating();
};


/**
 * Delegates to NavigationShifter.
 * @return {boolean} true if in table mode.
 */
cvox.ChromeVoxNavigationManager.prototype.isTableMode = function() {
  return this.navShifter_.isTableMode();
};


/**
 * Delegates to NavigationSpeaker.
 * @param {Array.<cvox.NavDescription>} descriptionArray The array of
 *     NavDescriptions to speak.
 * @param {number} initialQueueMode The initial queue mode.
 * @param {Function} completionFunction Function to call when finished speaking.
 *
 */
cvox.ChromeVoxNavigationManager.prototype.speakDescriptionArray = function(
    descriptionArray, initialQueueMode, completionFunction) {
  this.navSpeaker_.speakDescriptionArray(
      descriptionArray, initialQueueMode, completionFunction);
};


// TODO(stoarca): The stuff below belongs in its own layer.
/**
 * Moves forward. Stops any subnavigation.
 * @param {boolean} navigateIframes If true, will jump in and out of iframes.
 * @return {boolean} Whether or not navigation was performed successfully. Note
 * that failure indicates that the end of the document has been reached.
 */
cvox.ChromeVoxNavigationManager.prototype.navigate =
    function(navigateIframes) {
  // TODO(stoarca): This complies with the old navigation model, but it doesn't
  // make sense from the user's point of view. Upon entering a table, pressing
  // forward now starts skipping content on the page. This should be a separate
  // command.
  // TODO(stoarca, adu): Why does this not call resolveCurrentNode?
  if (this.isTableMode()) {
    if (this.nextRow()) {
      return true;
    }
    return this.tryExitTable();
  }
  this.ensureNotSubnavigating();
  if (!this.next(navigateIframes)) {
    this.syncToPageBeginning();
  }
  return true;
};


/**
 * Moves forward. Starts reading the page from that node.
 * Uses QUEUE_MODE_FLUSH to flush any previous speech.
 */
cvox.ChromeVoxNavigationManager.prototype.skipForward = function() {
  if (this.next(true)) {
    this.updateIndicator();
    this.skipped_ = true;
    this.startReadingFromCurrentNode(cvox.AbstractTts.QUEUE_MODE_FLUSH);
  }
};


/**
 * Moves forward. Starts reading the page from that node.
 * Uses QUEUE_MODE_FLUSH to flush any previous speech.
 */
cvox.ChromeVoxNavigationManager.prototype.skipBackward = function() {
  if (this.previous(true)) {
    this.updateIndicator();
    this.skipped_ = true;
    this.startReadingFromCurrentNode(cvox.AbstractTts.QUEUE_MODE_FLUSH);
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
cvox.ChromeVoxNavigationManager.prototype.subnavigate =
    function(navigateIframes) {
  if (!this.resolve()) {
    return true;
  }
  this.ensureSubnavigating();
  if (!this.next(navigateIframes)) {
    this.syncToPageBeginning();
  }
  return true;
};


/**
 * Starts reading the page from the current node.
 *
 * @param {number} queueMode Indicates whether queue mode or flush mode should
 * be used.
 */
cvox.ChromeVoxNavigationManager.prototype.startReadingFromCurrentNode =
    function(queueMode) {
  var currentDesc = this.getDescription();
  this.speakDescriptionArray(currentDesc, queueMode, goog.bind(function() {
    if (this.next(false)) {
      this.updateIndicator();
      this.startReadingFromCurrentNode(cvox.AbstractTts.QUEUE_MODE_QUEUE);
    }
  }, this));
};


/**
 * Returns a complete description of the current position, including
 * the text content and annotations such as "link", "button", etc.
 * Unlike getDescription, this does not shorten the position based on the
 * previous position.
 *
 * @return {Array.<cvox.NavDescription>} The summary of the current position.
 */
cvox.ChromeVoxNavigationManager.prototype.getFullDescription = function() {
  return [cvox.DescriptionUtil.getDescriptionFromAncestors(
      cvox.DomUtil.getAncestors(this.curSel_.start.node),
      true,
      cvox.ChromeVox.verbosity)];
};

/**
 * Sets the browser's focus to the current node.
 */
cvox.ChromeVoxNavigationManager.prototype.setFocus = function() {
  if (this.isTableMode()) {
    // If there is a control element inside a cell, we want to give focus to
    // it so that it can be activated without getting out of table mode.
    cvox.DomUtil.setFocus(this.curSel_.start.node, true);
  } else {
    cvox.DomUtil.setFocus(this.curSel_.start.node);
  }
};


/**
 * Returns the node of the directed start of the selection.
 * @return {Node} The current node.
 */
cvox.ChromeVoxNavigationManager.prototype.getCurrentNode = function() {
  return this.curSel_.start.node;
};


/**
 * Listen to messages from other frames and respond to messages that
 * tell our frame to take focus and preseve the navigation granularity
 * from the other frame.
 * @private
 */
cvox.ChromeVoxNavigationManager.prototype.addInterframeListener_ = function() {
  /**
   * @type {!cvox.ChromeVoxNavigationManager}
   */
  var self = this;

  cvox.Interframe.addListener(function(message) {
    if (message['command'] != 'enterIframe' &&
        message['command'] != 'exitIframe') {
      return;
    }

    window.focus();

    self.setGranularity(message['strategy']);

    if (message['command'] == 'exitIframe') {
      var id = message['sourceId'];
      var iframeElement = self.iframeIdMap[id];
      if (iframeElement) {
        self.updateSel(cvox.CursorSelection.fromNode(iframeElement));
      }
      self.curSel_.setReversed(!message['forwards']);
      self.sync();
      self.navigate(true);
    } else {
      self.curSel_.setReversed(!message['forwards']);
      self.syncToPageBeginning();

      // if we have an empty body, then immediately exit the iframe
      if (!cvox.DomUtil.hasContent(document.body)) {
        self.tryIframe_(null, message['forwards']);
        return;
      }
    }

    // Now speak what ended up being selected.
    self.setFocus();
    self.updateIndicator();
    self.speakDescriptionArray(
        self.getDescription(),
        cvox.AbstractTts.QUEUE_MODE_FLUSH,
        null);
  });
};


/**
 * Tries to enter a table.
 * @param {{force: (undefined|boolean)}=} kwargs Extra arguments.
 *  force: If true, enters table even if it's a layout table. False by default.
 */
cvox.ChromeVoxNavigationManager.prototype.tryEnterTable = function(kwargs) {
  var ret = this.navShifter_.tryEnterTable(this.curSel_, kwargs);
  if (ret) {
    this.curSel_ = ret;
  }
};


/**
 * Exits a table in the direction of sel.
 * @return {boolean} False if moving out of the table makes us hit the end of
 * the page. True otherwise.
 */
cvox.ChromeVoxNavigationManager.prototype.tryExitTable = function() {
  // TODO (deboer): Move this method to cvox.NavigationShifter.
  // TODO (stoarca): I don't think it makes sense that when we switch out of
  // table mode, we jump out of the table. This means that I can't toggle
  // between table mode and not, despite the user command that claims to do
  // so. Keeping it for now to comply with old tests.
  this.navShifter_.ensureNotTableMode();
  if (this.isInTable()) {
    var r = this.curSel_.isReversed();
    r ? this.goToFirstCell() : this.goToLastCell();
    this.sync();
    this.curSel_.setReversed(r);

    var ret = this.navigate(true);
    this.bumpedEdge_ = false;
    return ret;
  }
  return true;
};


/**
 * Enters or exits a table (updates the selection) if sel is significant.
 * @param {cvox.CursorSelection} sel The selection (possibly null).
 * @return {boolean} False means the end of the page was reached.
 * @private
 */
cvox.ChromeVoxNavigationManager.prototype.tryTable_ = function(sel) {
  if (this.isTableMode()) {
    if (sel) {
      this.updateSel(sel);
      return true;
    }
    return this.tryExitTable();
  } else {
    if (!sel) {
      return false;
    }
    this.updateSel(sel);
    this.tryEnterTable();
    return true;
  }
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
cvox.ChromeVoxNavigationManager.prototype.tryIframe_ = function(
    node, forwards) {
  if (node == null && window.parent != window) {
    var message = {
      'command': 'exitIframe',
      'forwards': forwards,
      'strategy': this.navShifter_.getGranularity()
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
    'strategy': this.navShifter_.getGranularity(),
    'id': iframeId
  };
  cvox.Interframe.sendMessageToIFrame(message, iframeElement);

  return true;
};


/**
 * Checks if the choice widget is currently active.
 * @return {boolean} True if the choice widget is active.
 */
cvox.ChromeVoxNavigationManager.prototype.isChoiceWidgetActive = function() {
  return this.choiceWidget_.isActive();
};


/**
 * Returns the filteredWalker.
 * @return {!cvox.WalkerDecorator} The filteredWalker.
 */
cvox.ChromeVoxNavigationManager.prototype.getFilteredWalker = function() {
  // TODO (stoarca): Should not be exposed. Delegate instead.
  return this.navShifter_.filteredWalker;
};


/**
 * Update the active indicator to reflect the current node or selection.
 */
cvox.ChromeVoxNavigationManager.prototype.updateIndicator = function() {
  cvox.SelectionUtil.scrollElementsToView(this.curSel_.start.node);
  this.activeIndicator.syncToCursorSelection(this.curSel_);
};


/**
 * Show or hide the active indicator based on whether ChromeVox is
 * active or not.
 */
cvox.ChromeVoxNavigationManager.prototype.showOrHideIndicator = function() {
  this.activeIndicator.setVisible(cvox.ChromeVox.isActive);
};


/**
 * This is used to update the selection to arbitrary nodes because there are
 * some callers who have the expectation that this works.
 * TODO (stoarca): The implementation is currently a hack. The walkers don't
 * currently support arbitrary nodes (nor did they previously, but there
 * was no comment about it).
 * @param {Node} node The node to update to.
 */
cvox.ChromeVoxNavigationManager.prototype.updateSelToArbitraryNode =
    function(node) {
  // We assume ObjectWalker is magical and does what we want (and is the
  // only one with such properties). This assumption is wrong, but we'll
  // have to make it until we have a better way to do this.
  this.setGranularity(cvox.NavigationShifter.GRANULARITIES.OBJECT);
  if (node) {
    this.updateSel(cvox.CursorSelection.fromNode(node));
  } else {
    this.syncToPageBeginning();
  }
};


/**
 * Updates curSel_ to the new selection and sets prevSel_ to the old curSel_.
 * This should be called exactly when something user-perceivable happens.
 * @param {cvox.CursorSelection} sel The selection to update to.
 * @param {cvox.CursorSelection} opt_context An optional override for prevSel_.
 * Used to override both curSel_ and prevSel_ when jumping back in nav history.
 */
cvox.ChromeVoxNavigationManager.prototype.updateSel =
    function(sel, opt_context) {
  var r = this.curSel_.isReversed();
  if (sel) {
    this.prevSel_ = opt_context || this.curSel_;
    this.curSel_ = sel;
  }
  // Always update the navigation history.
  var currentNode = this.getCurrentNode();
  this.navigationHistory_.update(currentNode);
};

/**
 * Sets the direction.
 * @param {!boolean} r True to reverse.
 */
cvox.ChromeVoxNavigationManager.prototype.setReversed = function(r) {
  this.curSel_.setReversed(r);
};

/**
 * Returns true if currently reversed.
 * @return {boolean} True if reversed.
 */
cvox.ChromeVoxNavigationManager.prototype.isReversed = function() {
  return this.curSel_.isReversed();
};
