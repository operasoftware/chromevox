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

goog.require('cvox.ChromeVoxNavigationManager');
goog.require('cvox.DomUtil');
goog.require('cvox.SpokenMessages');

/**
   @type {number}
 */
cvox.ChromeVoxFiltering.currentSelection;

/**
   @type {boolean}
*/
cvox.ChromeVoxFiltering.active;

/**
 * Initializes the filtering widget.
 */
cvox.ChromeVoxFiltering.init = function() {
  cvox.ChromeVoxFiltering.active = false;
  cvox.ChromeVoxFiltering.currentSelection = -1;
};

/**
 * Returns whether or not the filtering widget is active.
 *
 * @return {boolean} True if the filtering widget is active.
 */
cvox.ChromeVoxFiltering.isActive = function() {
  return cvox.ChromeVoxFiltering.active;
};

/**
 * Displays the filtering widget.
 */
cvox.ChromeVoxFiltering.show = function() {
  document.addEventListener('keydown', cvox.ChromeVoxFiltering.processKeyDown,
                            true);
  cvox.ChromeVoxFiltering.active = true;

  // The filtering intro chain.
  cvox.$m('filtering_intro')
      .andMessage('filtering_intro_help')
      .andMessage('filter')
      .withCount(
          cvox.ChromeVox.navigationManager.walkerDecorator.filters.length);

  // Places selection on the first item (and flushes the speech chain).
  cvox.ChromeVoxFiltering.next();
};

/**
 * Dismisses the filtering widget
 */
cvox.ChromeVoxFiltering.hide = function() {
  document.removeEventListener('keydown',
                               cvox.ChromeVoxFiltering.processKeyDown,
                               true);

  if (cvox.ChromeVoxFiltering.active) {
    cvox.ChromeVoxFiltering.currentSelection = -1;
    cvox.ChromeVoxFiltering.active = false;
  }
  cvox.$m('filtering_outro').speakFlush();
};

/**
 * Handles the keyDown event when the filtering widget is active.
 *
 * @param {Object} evt The keyDown event.
 * @return {boolean} Whether or not the event was handled.
 */
cvox.ChromeVoxFiltering.processKeyDown = function(evt) {
  if (!cvox.ChromeVoxFiltering.active) {
    return false;
  }

  var handled = false;
  var decorator = cvox.ChromeVox.navigationManager.walkerDecorator;
  var filters = cvox.ChromeVox.navigationManager.walkerDecorator.filters;
  if (evt.keyCode == 40) { // Down arrow
    cvox.ChromeVoxFiltering.next();
    handled = true;
  } else if (evt.keyCode == 38) { // Up arrow
    cvox.ChromeVoxFiltering.prev();
    handled = true;
  } else if (evt.keyCode == 13) { // Enter
    cvox.ChromeVoxFiltering.hide();
    handled = true;
  } else if (evt.keyCode == 27) { // Escape
    cvox.ChromeVoxFiltering.hide();
    handled = true;
  } else if (evt.keyCode == 46) { // delete
    if (cvox.ChromeVox.navigationManager.walkerDecorator.removeFilter(
        cvox.ChromeVox.navigationManager.walkerDecorator.filters[
            cvox.ChromeVoxFiltering.currentSelection])) {
      cvox.$m('removed_filter').speakFlush();
    }
    cvox.ChromeVoxFiltering.next();
    handled = true;
  }
  if (handled) {
    evt.preventDefault();
    evt.stopPropagation();
  }
  return handled;
};

/**
 * Goes to the next matching result.
 */
cvox.ChromeVoxFiltering.next = function() {
  var i = cvox.ChromeVoxFiltering.currentSelection;

  i = i >= cvox.ChromeVox.navigationManager.walkerDecorator.filters.length - 1 ?
      i : i + 1;
  cvox.ChromeVoxFiltering.currentSelection = i;
  cvox.ChromeVoxFiltering.selectionMoved();
};

/**
 * Goes to the previous matching result.
 */
cvox.ChromeVoxFiltering.prev = function() {
  cvox.ChromeVoxFiltering.currentSelection =
  cvox.ChromeVoxFiltering.currentSelection > 0 ?
  cvox.ChromeVoxFiltering.currentSelection - 1 : 0;
  cvox.ChromeVoxFiltering.selectionMoved();
};

/**
 * Speaks the new selection.
 * @return {boolean} Whether the move occurred successfully.
 */
cvox.ChromeVoxFiltering.selectionMoved = function() {
  if (cvox.ChromeVox.navigationManager.walkerDecorator.filters.length == 0) {
    cvox.ChromeVoxFiltering.hide();
    return false;
  }

  var selector =
  cvox.ChromeVox.navigationManager.walkerDecorator.filters[
      cvox.ChromeVoxFiltering.currentSelection];

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
  var spokenIndex = cvox.ChromeVoxFiltering.currentSelection + 1;
  cvox.SpokenMessages.andIndexTotal(spokenIndex,
          cvox.ChromeVox.navigationManager.walkerDecorator.filters.length)
      .speakFlush();

  return true;
};
