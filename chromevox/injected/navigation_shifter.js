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
 * @fileoverview The purpose of this class is to delegate to the correct walker
 * based on the navigation state that it is in. The navigation state is a
 * simplified view of the external environment; the smallest amount of knowledge
 * needed to correctly delegate. One example is whether the user
 * is subnavigating. Note that while this class does
 * decide which walker to delegate to, it does NOT decide when its state
 * should be changed. This is done by the layer above. The reason for this
 * separation is that trying to make the decision here would require a lot
 * of knowledge about the environment, making this class harder to
 * test and maintain.
 *
 * This class knows about the public interfaces of all the walkers (rather
 * than just of the abstract class) since there are currently walker operations
 * which apply only to specific walkers.
 *
 * The navigation model is organized around having a chain of walkers with
 * increasing "granularity". This means (with a few exceptions), that if
 * walker A is more granular than walker B, then every valid selection in A
 * is a subset of a valid selection in B. For example, characters are
 * more granular than words, because every character is either a word or
 * inside a word.
 *
 * Note that while any callers may assume the granularity chain exists (after
 * all, there is a method makeMoreGranular()), they may not assume anything
 * about the order in which the walkers occur in this chain. This is because
 * the order may depend on the navigation state, and having external interaction
 * would slow down the changes we could make to this class (which is a problem,
 * since this is one of the core classes that impacts user-perceptible
 * navigation).
 *
 * Tables are an exception to this chain. When we are in table mode, the default
 * low-granularity GroupWalker gets replaced with a TableWalker. This is not
 * an ideal design choice, but tables just don't fit cleanly into the
 * chained navigation model. It would not make sense for the user if the
 * TableWalker was either above or below the GroupWalker because they have
 * "kind of" the same granularity.
 *
 * There is another kink in this design. All the walkers are decorated
 * by a WalkerDecorator in order to provide filtering functionality.
 * However, since the walkers have varying interfaces (which must be visible),
 * the decorator does not properly wrap the walkers and instead just stomps
 * on the methods that it decorates. This increases maintenance cost since
 * all walkers must now know that they are going to be decorated and account
 * for that interaction. It can also lead to hard-to-find bugs when a walker
 * doesn't account for this. For example, if a walker decides to use next()
 * expecting that it is its own method. Eventually, this should
 * either be changed or removed.
 *
 * Thinking of adding something here? Ask these questions:
 * Is it exposing functionality in some walker, the execution of which depends
 * on navigation state?
 *  Then it is a good candidate.
 * Does it require knowing more about the environment?
 *  If you are sure that it belongs here, then the minimum amount of knowledge
 *  to make the delegation decision should be added as state to this class.
 *  The decision for when this state changes should not be made in this class.
 *
 * @author stoarca@google.com (Sergiu Toarca)
 */


goog.provide('cvox.NavigationShifter');

goog.require('cvox.CharacterWalker');
goog.require('cvox.GroupWalker');
goog.require('cvox.ObjectWalker');
goog.require('cvox.SentenceWalker');
goog.require('cvox.TableWalker');
goog.require('cvox.VisualWalker');
goog.require('cvox.WalkerDecorator');
goog.require('cvox.WordWalker');


/**
 * @constructor
 */
cvox.NavigationShifter = function() {
  this.reset_();
};

// These "const" literals may be used, but no order may be assumed
// between them by any outside callers.
/**
 * @type {Object.<string, number>}
 */
cvox.NavigationShifter.GRANULARITIES = {
  'CHARACTER': 0,
  'WORD': 1,
  'SENTENCE': 2,
  'OBJECT': 3,
  'GROUP': 4,
  'VISUAL': 5
};

/**
 * Delegates to currentWalker_.
 * @param {!cvox.CursorSelection} sel The selection to go next from.
 * @return {cvox.CursorSelection} The resulting selection.
 */
cvox.NavigationShifter.prototype.next = function(sel) {
  return this.currentWalker_.next(sel);
};

/**
 * Delegates to objectWalker.
 * @param {!cvox.CursorSelection} sel The selection.
 * @param {function(Array.<Node>):boolean} predicate A function taking a
 * unique ancestor tree and outputting boolean if the ancestor tree matches
 * the desired node to find.
 * @return {cvox.CursorSelection} The next valid selection that matches
 * predicate.
 */
cvox.NavigationShifter.prototype.findNext = function(sel, predicate) {
  return this.objectWalker_.findNext(sel, predicate);
};

/**
 * Delegates to currentWalker_.
 * @param {{reversed: (undefined|boolean)}=} kwargs Extra arguments.
 *  reversed: If true, syncs to the page end and returns a reversed selection.
 *    False by default.
 * @return {!cvox.CursorSelection} The valid selection.
 */
cvox.NavigationShifter.prototype.syncToPageBeginning = function(kwargs) {
  this.ensureNotTableMode();
  return this.currentWalker_.syncToPageBeginning(kwargs);
};

/**
 * Delegates to currentWalker_.
 * @param {!cvox.CursorSelection} sel The selection.
 * @param {!cvox.ChromeVoxChoiceWidget} choiceWidget For disambiguation.
 * @return {boolean} True if some action that could be taken exists.
 */
cvox.NavigationShifter.prototype.act = function(sel, choiceWidget) {
  return this.currentWalker_.act(sel, choiceWidget);
};

/**
 * Delegates to currentWalker_.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {boolean} True if some action that could be take exists.
 */
cvox.NavigationShifter.prototype.canAct = function(sel) {
  return this.currentWalker_.canAct(sel);
};

/**
 * Delegates to currentWalker_.
 * @param {!cvox.CursorSelection} sel The selection to sync to.
 * @return {cvox.CursorSelection} The resulting selection.
 */
cvox.NavigationShifter.prototype.sync = function(sel) {
  return this.currentWalker_.sync(sel);
};

/**
 * Delegates to currentWalker_.
 * @param {!cvox.CursorSelection} prevSel The previous selection, for context.
 * @param {!cvox.CursorSelection} sel The current selection.
 * @return {Array.<cvox.NavDescription>} The description array.
 */
cvox.NavigationShifter.prototype.getDescription = function(prevSel, sel) {
  return this.currentWalker_.getDescription(prevSel, sel);
};

/**
 * Delegates to currentWalker_.
 * @return {string} The message string.
 */
cvox.NavigationShifter.prototype.getGranularityMsg = function() {
  return this.currentWalker_.getGranularityMsg();
};

/**
 * Delegates to TableWalker.
 * @param {cvox.CursorSelection} sel A selection inside the desired table.
 * @return {cvox.CursorSelection} The selection for the first cell of the table.
 * null if sel is not inside a table.
 */
cvox.NavigationShifter.prototype.goToFirstCell = function(sel) {
  return this.tableWalker_.goToFirstCell(sel);
};

/**
 * Delegates to TableWalker.
 * @param {cvox.CursorSelection} sel A selection inside the desired table.
 * @return {cvox.CursorSelection} The selection for the last sel of the table.
 * null if sel is not inside a table.
 */
cvox.NavigationShifter.prototype.goToLastCell = function(sel) {
  return this.tableWalker_.goToLastCell(sel);
};

/**
 * Delegates to TableWalker.
 * @param {cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the first cell in the row.
 */
cvox.NavigationShifter.prototype.goToRowFirstCell = function(sel) {
  return this.tableWalker_.goToRowFirstCell(sel);
};

/**
 * Delegates to TableWalker.
 * @param {cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the last cell in the row.
 */
cvox.NavigationShifter.prototype.goToRowLastCell = function(sel) {
  return this.tableWalker_.goToRowLastCell(sel);
};

/**
 * Delegates to TableWalker.
 * @param {cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the first cell in the col.
 */
cvox.NavigationShifter.prototype.goToColFirstCell = function(sel) {
  return this.tableWalker_.goToColFirstCell(sel);
};

/**
 * Delegates to TableWalker.
 * @param {cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the last cell in the col.
 */
cvox.NavigationShifter.prototype.goToColLastCell = function(sel) {
  return this.tableWalker_.goToColLastCell(sel);
};

/**
 * Delegates to TableWalker.
 * @param {cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the first cell in the
 * next row.
 */
cvox.NavigationShifter.prototype.nextRow = function(sel) {
  return this.tableWalker_.nextRow(sel);
};

/**
 * Delegates to TableWalker.
 * @param {cvox.CursorSelection} sel The selection.
 * @return {cvox.CursorSelection} The selection for the first cell in the
 * next column.
 */
cvox.NavigationShifter.prototype.nextCol = function(sel) {
  return this.tableWalker_.nextCol(sel);
};

/**
 * Delegates to TableWalker.
 * @param {cvox.CursorSelection} sel The selection for which to look up headers.
 * @return {?string} The text inside the row header(s) or null if no headers
 * or not in table.
 */
cvox.NavigationShifter.prototype.getRowHeaderText = function(sel) {
  return this.tableWalker_.getRowHeaderText(sel);
};

/**
 * Delegates to TableWalker.
 * @param {cvox.CursorSelection} sel The selection for which to guess headers.
 * @return {?string} A guess for row headers. null if sel is not in table.
 */
cvox.NavigationShifter.prototype.getRowHeaderGuess = function(sel) {
  return this.tableWalker_.getRowHeaderGuess(sel);
};

/**
 * Delegates to TableWalker.
 * @param {cvox.CursorSelection} sel The selection for which to look up headers.
 * @return {?string} The text inside the col header(s) or null if no headers
 * or not in table.
 */
cvox.NavigationShifter.prototype.getColHeaderText = function(sel) {
  return this.tableWalker_.getColHeaderText(sel);
};

/**
 * Delegates to TableWalker.
 * @param {cvox.CursorSelection} sel The selection for which to guess headers.
 * @return {?string} The header text.
 */
cvox.NavigationShifter.prototype.getColHeaderGuess = function(sel) {
  return this.tableWalker_.getColHeaderGuess(sel);
};

/**
 * Delegates to TableWalker.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {Array.<cvox.NavDescription>} The location description.
 */
cvox.NavigationShifter.prototype.getLocationDescription = function(sel) {
  return this.tableWalker_.getLocationDescription(sel);
};

/**
 * Returns true if the selection is inside a table.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {boolean} true if inside a table.
 */
cvox.NavigationShifter.prototype.isInTable = function(sel) {
  return this.tableWalker_.isInTable(sel);
};

/**
 * Returns true if the selection is inside a grid.
 * @param {!cvox.CursorSelection} sel The selection.
 * @return {boolean} true if inside a grid.
 */
cvox.NavigationShifter.prototype.isInGrid = function(sel) {
  return this.tableWalker_.isInGrid(sel);
};

/**
 * Shifts to a more granular level.
 * NOTE: after a shift, we are no longer subnavigating, if we were.
 */
cvox.NavigationShifter.prototype.makeMoreGranular = function() {
  this.ensureNotSubnavigating();
  this.currentWalkerIndex_ = Math.max(this.currentWalkerIndex_ - 1, 0);
  this.currentWalker_ = this.walkers_[this.currentWalkerIndex_];
};

/**
 * Shifts to a less granular level.
 * NOTE: after a shift, we are no longer subnavigating, if we were.
 */
cvox.NavigationShifter.prototype.makeLessGranular = function() {
  this.ensureNotSubnavigating();
  this.currentWalkerIndex_ =
      Math.min(this.currentWalkerIndex_ + 1, this.walkers_.length - 1);
  this.currentWalker_ = this.walkers_[this.currentWalkerIndex_];
};

/**
 * Shift to a specified granularity.
 * NOTE: after a shift, we are no longer subnavigating, if we were.
 * @param {number} granularity The granularity to shift to.
 */
cvox.NavigationShifter.prototype.setGranularity = function(granularity) {
  this.ensureNotSubnavigating();
  this.currentWalkerIndex_ = granularity;
  this.currentWalker_ = this.walkers_[this.currentWalkerIndex_];
};

/**
 * Gets the granularity.
 * @return {number} The current granularity.
 *
 */
cvox.NavigationShifter.prototype.getGranularity = function() {
  var wasSubnavigating = this.isSubnavigating();
  this.ensureNotSubnavigating();
  var ret = this.currentWalkerIndex_;
  if (wasSubnavigating) {
    this.ensureSubnavigating();
  }
  return ret;
};

/**
 * Enters subnavigation mode, if it was not already in it.
 * Subnavigation mode is where the shifter is temporarily one level
 * more granular (until either the next granularity shift or
 * ensureNotSubnavigating is called).
 */
cvox.NavigationShifter.prototype.ensureSubnavigating = function() {
  if (this.isSubnavigating_ == false) {
    this.makeMoreGranular();
    this.isSubnavigating_ = true;
  }
};

/**
 * Exits subnavigation mode, if it was in it.
 */
cvox.NavigationShifter.prototype.ensureNotSubnavigating = function() {
  if (this.isSubnavigating_ == true) {
    this.isSubnavigating_ = false;
    this.makeLessGranular();
  }
};

/**
 * Returns true if the shifter is currently in subnavigation mode.
 * @return {boolean} If in subnavigation mode.
 */
cvox.NavigationShifter.prototype.isSubnavigating = function() {
  return this.isSubnavigating_;
};

/**
 * Forces table mode.
 */
cvox.NavigationShifter.prototype.ensureTableMode = function() {
  this.isTableMode_ = true;
  this.walkers_[cvox.NavigationShifter.GRANULARITIES.GROUP] = this.tableWalker_;
  this.currentWalkerIndex_ = cvox.NavigationShifter.GRANULARITIES.GROUP;
  this.currentWalker_ = this.walkers_[this.currentWalkerIndex_];
};

/**
 * Forces not table mode.
 */
cvox.NavigationShifter.prototype.ensureNotTableMode = function() {
  this.isTableMode_ = false;
  this.walkers_[cvox.NavigationShifter.GRANULARITIES.GROUP] = this.groupWalker_;
  this.currentWalker_ = this.walkers_[this.currentWalkerIndex_];
};

/**
 * Returns true if the shifter is currently in table mode.
 * @return {boolean} true if in table mode.
 */
cvox.NavigationShifter.prototype.isTableMode = function() {
  return this.isTableMode_ && (this.currentWalker_ == this.tableWalker_);
};

/**
 * Tries to enter a table.
 * @param {cvox.CursorSelection} curSel The current selection.
 * @param {{force: (undefined|boolean)}=} kwargs Extra arguments.
 *  force: If true, enters table even if it's a layout table. False by default.
 * @return {cvox.CursorSelection} A selection, or null if we did nothing.
 */
cvox.NavigationShifter.prototype.tryEnterTable = function(curSel, kwargs) {
  kwargs = kwargs || {force: false};

  // Don't enter a table if we are already in one.
  if (this.isTableMode_) {
    return null;
  }

  var tableNode = cvox.DomUtil.getContainingTable(curSel.start.node);
  if (tableNode) {
    if (kwargs.force || !cvox.DomUtil.isLayoutTable(tableNode)) {
      this.ensureTableMode();
      return this.sync(curSel);
    }
  }
  return null;
};

/**
 * Resets navigation shifter to a "new" state. Makes testing easier.
 * @private
 */
cvox.NavigationShifter.prototype.reset_ = function() {
  this.isSubnavigating_ = false;
  this.isTableMode_ = false;


  this.tableWalker_ = new cvox.TableWalker();
  this.visualWalker_ = new cvox.VisualWalker();
  this.groupWalker_ = new cvox.GroupWalker();
  this.objectWalker_ = new cvox.ObjectWalker();
  this.sentenceWalker_ = new cvox.SentenceWalker();
  this.wordWalker_ = new cvox.WordWalker();
  this.characterWalker_ = new cvox.CharacterWalker();

  // TODO(stoarca): this decorator is poorly designed; it modifies the
  // original object. It also allows the Walkers to have messy
  // interfaces, since it doesn't force them to stick to the clean
  // public interface provided by AbstractWalker
  this.filteredWalker = new cvox.WalkerDecorator();
  this.filteredWalker.decorate(this.groupWalker_);
  this.filteredWalker.decorate(this.objectWalker_);
  this.filteredWalker.decorate(this.sentenceWalker_);
  this.filteredWalker.decorate(this.wordWalker_);
  this.filteredWalker.decorate(this.characterWalker_);

  this.walkers_ = [
      this.characterWalker_,
      this.wordWalker_,
      this.sentenceWalker_,
      this.objectWalker_,
      this.groupWalker_,
      this.visualWalker_
  ];
  this.currentWalkerIndex_ = this.walkers_.indexOf(this.groupWalker_);

  /**
   * @type {cvox.AbstractWalker}
   * @private
   */
  this.currentWalker_ = this.walkers_[this.currentWalkerIndex_];
};
