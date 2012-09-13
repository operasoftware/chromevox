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
 * @fileoverview JavaScript popup filtering widget for selection of filters to
 * apply to the page.
 * @author dtseng@google.com (David Tseng)
 */

goog.provide('cvox.ChromeVoxFiltering');

goog.require('cvox.DomUtil');
goog.require('cvox.NavigationManager');
goog.require('cvox.SpokenMessages');
goog.require('cvox.Widget');

/**
 * Initializes the filtering widget.
 * @constructor
 * @extends {cvox.Widget}
 */
cvox.ChromeVoxFiltering = function() {
  /**
   * @type {number}
   * @private
   */
  this.currentSelection_ = -1;
};
goog.inherits(cvox.ChromeVoxFiltering, cvox.Widget);

/**
 * Displays the filtering widget.
 * @override
 */
cvox.ChromeVoxFiltering.prototype.show = function() {
  cvox.ChromeVoxFiltering.superClass_.show.call(this);
  this.active_ = true;

  // Filtering specifics announcements.
  cvox.$m('filter').withCount(
      cvox.ChromeVox.navigationManager.getFilteredWalker().filters.length);

  // Places selection on the first item.
  this.next();
};

/**
 * Dismisses the filtering widget
 * @override
 */
cvox.ChromeVoxFiltering.prototype.hide = function() {
  if (this.isActive()) {
    this.currentSelection_ = -1;
  }
  cvox.$m('filtering_outro').speakFlush();

  cvox.ChromeVoxFiltering.superClass_.hide.call(this);
};

/**
 * @override
 */
cvox.ChromeVoxFiltering.prototype.getNameMsg = function() {
  return 'filtering_intro';
};

/**
 * @override
 */
cvox.ChromeVoxFiltering.prototype.getHelp = function() {
  return 'filtering_intro_help';
};

/**
 * @override
 */
cvox.ChromeVoxFiltering.prototype.onKeyDown = function(evt) {
  if (!this.active_) {
    return false;
  }

  // Quiet speech on user interaction.
  cvox.ChromeVox.tts.stop();

  var handled = false;
  var decorator = cvox.ChromeVox.navigationManager.getFilteredWalker();
  var filters = cvox.ChromeVox.navigationManager.getFilteredWalker().filters;
  if (evt.keyCode == 40) { // Down arrow
    this.next();
    handled = true;
  } else if (evt.keyCode == 38) { // Up arrow
    this.prev();
    handled = true;
  } else if (evt.keyCode == 13) { // Enter
    this.hide();
    handled = true;
  } else if (evt.keyCode == 46) { // delete
    if (cvox.ChromeVox.navigationManager.getFilteredWalker().removeFilter(
        cvox.ChromeVox.navigationManager.getFilteredWalker().filters[
            this.currentSelection_])) {
      cvox.$m('removed_filter').speakFlush();
    }
    this.next();
    handled = true;
  }
  if (handled) {
    evt.preventDefault();
    evt.stopPropagation();
    return true;
  } else {
    return cvox.ChromeVoxFiltering.superClass_.onKeyDown.call(this, evt);
  }
};

/**
 * Goes to the next matching result.
 */
cvox.ChromeVoxFiltering.prototype.next = function() {
  var i = this.currentSelection_;

  var len = cvox.ChromeVox.navigationManager.getFilteredWalker().filters.length;
  i = (i >= len - 1) ? i : i + 1;
  this.currentSelection_ = i;
  this.selectionMoved();
};

/**
 * Goes to the previous matching result.
 */
cvox.ChromeVoxFiltering.prototype.prev = function() {
  this.currentSelection_ =
      this.currentSelection_ > 0 ? this.currentSelection_ - 1 : 0;
  this.selectionMoved();
};

/**
 * Speaks the new selection.
 * @return {boolean} Whether the move occurred successfully.
 */
cvox.ChromeVoxFiltering.prototype.selectionMoved = function() {
  var len = cvox.ChromeVox.navigationManager.getFilteredWalker().filters.length;
  if (len == 0) {
    this.hide();
    return false;
  }

  var selector = cvox.ChromeVox.navigationManager.getFilteredWalker().filters[
      this.currentSelection_];

  var currentList = document.querySelectorAll(selector);
  var MAX_SPOKEN_NODES = 20;
  var indicateNodes = [];
  var spokenSet = {};
  for (var i = 0; i < currentList.length && i < MAX_SPOKEN_NODES; ++i) {
    indicateNodes.push(currentList[i]);
    var description = cvox.DomUtil.getName(currentList[i]);

    // Do not speak identical or empty sounding items.
    if (description && !spokenSet[description]) {
      cvox.SpokenMessages.andRawMessage(description);
      spokenSet[description] = true;
    }
  }

  cvox.ChromeVox.navigationManager.activeIndicator.syncToNodes(indicateNodes);
  var spokenIndex = this.currentSelection_ + 1;
  cvox.SpokenMessages.andIndexTotal(spokenIndex,
          cvox.ChromeVox.navigationManager.getFilteredWalker().filters.length)
      .speakQueued();

  return true;
};
