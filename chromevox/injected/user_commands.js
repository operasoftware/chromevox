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
 * @fileoverview High level commands that the user can invoke using hotkeys.
 *
 * @author clchen@google.com (Charles L. Chen)
 */


goog.provide('cvox.ChromeVoxUserCommands');

goog.require('cvox.AutoRunner');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxFiltering');
goog.require('cvox.ConsoleTts');
goog.require('cvox.CssSpace');
goog.require('cvox.DomPredicates');
goog.require('cvox.DomUtil');
goog.require('cvox.KeyboardHelpWidget');
goog.require('cvox.NodeChooserWidget');
goog.require('cvox.SearchWidget');


/**
 * @namespace
 */
cvox.ChromeVoxUserCommands = function() {
};

/**
 * @type {Object}
 */
cvox.ChromeVoxUserCommands.commands = {};


/**
 * @type {boolean}
 * TODO (clchen, dmazzoni): Implement syncing on click to avoid needing this.
 */
cvox.ChromeVoxUserCommands.wasMouseClicked = false;

/**
 * A boolean to determine if continuous reading should keep going.
 * This is only used for TTS engines without callbacks.
 *
 * @type {boolean}
 */
cvox.ChromeVoxUserCommands.keepReading = false;


/**
 * Stops speech.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['stopSpeech'] = function() {
  cvox.ChromeVox.tts.stop();
  return false;
};


/**
 * Toggles ChromeVox Sticky Nav mode. In the sticky nav mode, the user can
 * navigate without pressing the modifier keys.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['toggleStickyMode'] = function() {
  cvox.ChromeVox.isStickyOn = !cvox.ChromeVox.isStickyOn;
  cvox.ChromeVox.tts.speak(
      cvox.ChromeVox.isStickyOn ?
          cvox.ChromeVox.msgs.getMsg('sticky_mode_enabled') :
          cvox.ChromeVox.msgs.getMsg('sticky_mode_disabled'),
      0,
      cvox.AbstractTts.PERSONALITY_ANNOTATION);

  return false;
};


/**
 * Toggles the ChromeVox modifier key prefix. If the prefix is on, then for the
 * next key will behave as if the user had pressed the modifier key combination.
 * After that, the modifier key combination will go back to being off unless
 * pressed.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['toggleKeyPrefix'] = function() {
  cvox.ChromeVox.keyPrefixOn = !cvox.ChromeVox.keyPrefixOn;
  return false;
};


/**
 * Moves forward and speaks the result.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['forward'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  cvox.ChromeVoxUserCommands.keepReading = false;
  cvox.ChromeVox.navigationManager.setReversed(false);
  var navSucceeded = cvox.ChromeVox.navigationManager.navigate(true);
  cvox.ChromeVoxUserCommands.finishNavCommand('');
  return !navSucceeded;
});


/**
 * Skips forward to the next result while in "read from here" mode.
 *
 * @return {boolean} If we are in "read from here" mode, return false since
 * we want to prevent the default action. Otherwise return true.
 */
cvox.ChromeVoxUserCommands.commands['skipForward'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  cvox.ChromeVox.navigationManager.setReversed(false);
  if (cvox.ChromeVoxUserCommands.keepReading) {
    if (cvox.ChromeVox.host.hasTtsCallback()) {
      cvox.ChromeVox.navigationManager.skipForward();
      return false;
    } else {
      // Skimming does not work for TTS that don't have callbacks.
      return false;
    }
  } else {
    return true;
  }
});


/**
 * Moves right and speaks the result.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['right'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  cvox.ChromeVox.navigationManager.setReversed(false);
  var navSucceeded = false;
  if (cvox.ChromeVox.navigationManager.isTableMode()) {
    navSucceeded = cvox.ChromeVox.navigationManager.nextCol();
  } else {
    navSucceeded = cvox.ChromeVox.navigationManager.subnavigate(true);
  }
  cvox.ChromeVoxUserCommands.finishNavCommand('');
  return !navSucceeded;
});


/**
 * Moves backward and speaks the result.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['backward'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  cvox.ChromeVoxUserCommands.keepReading = false;
  cvox.ChromeVox.navigationManager.setReversed(true);
  var navSucceeded = cvox.ChromeVox.navigationManager.navigate(true);
  cvox.ChromeVoxUserCommands.finishNavCommand('');
  return !navSucceeded;
});


/**
 * Skips backward to the previous result while in "read from here" mode.
 *
 * @return {boolean} If we are in "read from here" mode, return false since
 * we want to prevent the default action. Otherwise return true.
 */
cvox.ChromeVoxUserCommands.commands['skipBackward'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  cvox.ChromeVox.navigationManager.setReversed(false);
  if (cvox.ChromeVoxUserCommands.keepReading) {
    if (cvox.ChromeVox.host.hasTtsCallback()) {
      cvox.ChromeVox.navigationManager.skipBackward();
      return false;
    } else {
      // Skimming does not work for TTS that don't have callbacks
      return false;
    }
  } else {
    return true;
  }
});


/**
 * Moves left and speaks the result.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['left'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  cvox.ChromeVox.navigationManager.setReversed(true);
  var navSucceeded = false;
  if (cvox.ChromeVox.navigationManager.isTableMode()) {
    navSucceeded = cvox.ChromeVox.navigationManager.nextCol();
  } else {
    navSucceeded = cvox.ChromeVox.navigationManager.subnavigate(true);
  }
  cvox.ChromeVoxUserCommands.finishNavCommand('');
  return !navSucceeded;
});


/**
 * Moves up to a different navigation strategy and speaks a summary of the
 * current position.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousGranularity'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  cvox.ChromeVox.navigationManager.makeLessGranular();
  var strategy = cvox.ChromeVox.navigationManager.getGranularityMsg();
  cvox.ChromeVoxUserCommands.finishNavCommand(strategy + ' ');
  return false;
});


/**
 * Moves down to a different navigation strategy and speaks a summary of the
 * current position.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextGranularity'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  cvox.ChromeVox.navigationManager.makeMoreGranular();
  var strategy = cvox.ChromeVox.navigationManager.getGranularityMsg();
  cvox.ChromeVoxUserCommands.finishNavCommand(strategy + ' ');
  return false;
});


/**
 * Command to do nothing but speak the current navigation position & state.
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['speakCurrentPosition'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  cvox.ChromeVoxUserCommands.finishNavCommand('');
  return false;
});


/**
 * This is a NOP command. It is needed in case we would like
 * to swallow certain keys via mapping them to a NOP operation.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nop'] = function() {
  /* do nothing */
  return false;
};


/**
 * Perform all of the actions that should happen at the end of any
 * navigation operation: update the lens, play earcons, and speak the
 * description of the object that was navigated to.
 *
 * @param {string} messagePrefixStr The string to be prepended to what
 * is spoken to the user.
 */
cvox.ChromeVoxUserCommands.finishNavCommand = function(messagePrefixStr) {
  var descriptionArray =
      cvox.ChromeVox.navigationManager.getDescription();

  cvox.ChromeVox.navigationManager.setFocus();
  cvox.ChromeVox.navigationManager.updateIndicator();

  var queueMode = cvox.AbstractTts.QUEUE_MODE_FLUSH;

  if (messagePrefixStr) {
    cvox.ChromeVox.tts.speak(
        messagePrefixStr, queueMode, cvox.AbstractTts.PERSONALITY_ANNOTATION);
    queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
  }

  cvox.ChromeVox.navigationManager.speakDescriptionArray(descriptionArray,
    queueMode, null);
};


/**
 * Find the next occurrence of an item defined by the given predicate.
 * @param {function(Array.<Node>)} predicate A function taking an array of
 * unique ancestor nodes as a parameter and returning a desired node. It
 * returns null if that node can't be found.
 * @param {string} errorStr A string to speak if the item couldn't be found.
 * @private
 */
cvox.ChromeVoxUserCommands.findNextAndSpeak_ =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function(predicate,
                                                              errorStr) {
  cvox.ChromeVox.navigationManager.setReversed(false);
  // Don't do any navigational commands if the document is hidden from
  // screen readers.
  if (cvox.ChromeVox.entireDocumentIsHidden) {
    return;
  }

  if (!cvox.ChromeVox.navigationManager.findNext(predicate)) {
    cvox.ChromeVox.tts.speak(
        errorStr, 0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
    return;
  }

  cvox.ChromeVox.navigationManager.sync();
  cvox.ChromeVoxUserCommands.finishNavCommand('');
});


/**
 * Find the next occurrence of an item defined by the given predicate.
 * @param {function(Array.<Node>)} predicate A function taking an array of
 * unique ancestor nodes as a parameter and returning a desired node. It
 * returns null if that node can't be found.
 * @param {string} errorStr A string to speak if the item couldn't be found.
 * @private
 */
cvox.ChromeVoxUserCommands.findPreviousAndSpeak_ =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function(predicate,
                                                              errorStr) {
  cvox.ChromeVox.navigationManager.setReversed(true);
  // Don't do any navigational commands if the document is hidden from
  // screen readers.
  if (cvox.ChromeVox.entireDocumentIsHidden) {
    return;
  }

  if (!cvox.ChromeVox.navigationManager.findNext(predicate)) {
    cvox.ChromeVox.tts.speak(
        errorStr, 0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
    return;
  }

  cvox.ChromeVox.navigationManager.sync();
  cvox.ChromeVoxUserCommands.finishNavCommand('');
});


/**
 * Finds the next node based on its similarity or difference from the current
 *  node.
 * @param {string} direction Way to search (backward, or forward).
 * @param {boolean} isSimilar true to search for a similar node; false to search
 * for a different node.
 */
cvox.ChromeVoxUserCommands.findBySimilarity = function(direction, isSimilar) {
  var currentNode = cvox.ChromeVox.navigationManager.getCurrentNode();
  var cssSelector = cvox.WalkerDecorator.filterForNode(currentNode);
  var incl = cvox.ChromeVox.navigationManager.getFilteredWalker().isInclusive;
  cvox.ChromeVox.navigationManager.getFilteredWalker().isInclusive = isSimilar;
  cvox.ChromeVox.navigationManager.getFilteredWalker().addFilter(cssSelector);
  cvox.ChromeVoxUserCommands.commands[direction]();
  cvox.ChromeVox.navigationManager.getFilteredWalker().
      removeFilter(cssSelector);
  cvox.ChromeVox.navigationManager.getFilteredWalker().isInclusive = incl;
  cvox.ChromeVoxUserCommands.finishNavCommand('');

  if (!cvox.ChromeVox.navigationManager.getCurrentNode()) {
    cvox.ChromeVox.navigationManager.updateSel(
        cvox.CursorSelection.fromNode(currentNode));
    var error = isSimilar ? 'no_more_similar_elements' :
        'no_more_different_elements';
    cvox.$m(error).speakFlush();
  }
};


/**
 * Handles any tab navigation by putting focus at the user's position.
 * This function will create dummy nodes if there is nothing that is focusable
 * at the current position.
 * TODO (adu): This function is too long. We need to break it up into smaller
 * helper functions.
 * @return {boolean} True if default action should be taken.
 * @private
 */
cvox.ChromeVoxUserCommands.handleTabAction_ = function() {
  cvox.ChromeVox.tts.stop();

  // Clean up after any previous runs
  cvox.ChromeVoxUserCommands.removeTabDummySpan_();

  // If we are tabbing from an invalid location, prevent the default action.
  // We pass the isFocusable function as a predicate to specify we only want to
  // revert to focusable nodes.
  if (!cvox.ChromeVox.navigationManager.resolve(cvox.DomUtil.isFocusable)) {
    cvox.ChromeVox.navigationManager.setFocus();
    return false;
  }

  // If the user is already focused on a link or control,
  // nothing more needs to be done.
  var isLinkControl = cvox.ChromeVoxUserCommands.isFocusedOnLinkControl_();
  if (isLinkControl) {
    return true;
  }

  // Try to find something reasonable to focus on.
  // Use selection if it exists because it means that the user has probably
  // clicked with their mouse and we should respect their position.
  // If there is no selection, then use the last known position based on
  // NavigationManager's currentNode.
  var anchorNode = null;
  var focusNode = null;
  var sel = window.getSelection();
  if (!cvox.ChromeVoxUserCommands.wasMouseClicked) {
    sel = null;
  } else {
    cvox.ChromeVoxUserCommands.wasMouseClicked = false;
  }
  if (sel == null || sel.anchorNode == null || sel.focusNode == null) {
    anchorNode = cvox.ChromeVox.navigationManager.getCurrentNode();
    focusNode = cvox.ChromeVox.navigationManager.getCurrentNode();
  } else {
    anchorNode = sel.anchorNode;
    focusNode = sel.focusNode;
  }

  // See if we can set focus to either anchorNode or focusNode.
  // If not, try the parents. Otherwise give up and create a dummy span.
  if (anchorNode == null || focusNode == null) {
    return true;
  }
  if (cvox.DomUtil.isFocusable(anchorNode)) {
    anchorNode.focus();
    return true;
  }
  if (cvox.DomUtil.isFocusable(focusNode)) {
    focusNode.focus();
    return true;
  }
  if (cvox.DomUtil.isFocusable(anchorNode.parentNode)) {
    anchorNode.parentNode.focus();
    return true;
  }
  if (cvox.DomUtil.isFocusable(focusNode.parentNode)) {
    focusNode.parentNode.focus();
    return true;
  }

  // Insert and focus a dummy span immediately before the current position
  // so that the default tab action will start off as close to the user's
  // current position as possible.
  var bestGuess = anchorNode;
  var dummySpan = cvox.ChromeVoxUserCommands.createTabDummySpan_();
  bestGuess.parentNode.insertBefore(dummySpan, bestGuess);
  dummySpan.focus();
  return true;
};


/**
 * @return {boolean} True if we are focused on a link or any other control.
 * @private
 */
cvox.ChromeVoxUserCommands.isFocusedOnLinkControl_ = function() {
  var tagName = 'A';
  if ((document.activeElement.tagName == tagName) ||
      cvox.DomUtil.isControl(document.activeElement)) {
    return true;
  }
  return false;
};


/**
 * If a lingering tab dummy span exists, remove it.
 * @private
 */
cvox.ChromeVoxUserCommands.removeTabDummySpan_ = function() {
  var previousDummySpan = document.getElementById('ChromeVoxTabDummySpan');
  if (previousDummySpan) {
    previousDummySpan.parentNode.removeChild(previousDummySpan);
  }
};


/**
 * Create a new tab dummy span.
 * @return {Element} The dummy span element to be inserted.
 * @private
 */
cvox.ChromeVoxUserCommands.createTabDummySpan_ = function() {
  var span = document.createElement('span');
  span.id = 'ChromeVoxTabDummySpan';
  span.tabIndex = -1;
  return span;
};


/**
 * Handles TAB navigation.
 * @return {boolean} True if the default action should be taken.
 */
cvox.ChromeVoxUserCommands.commands['handleTab'] =
    cvox.ChromeVoxUserCommands.handleTabAction_;


/**
 * Handles SHIFT+TAB navigation
 * @return {boolean} True if the default action should be taken.
 */
cvox.ChromeVoxUserCommands.commands['handleTabPrev'] =
    cvox.ChromeVoxUserCommands.handleTabAction_;


/**
 * Shows the keyboard help widget.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['showPowerKey'] = function() {
  cvox.KeyboardHelpWidget.getInstance().show();
  return false;
};


/**
 * Toggles between searching and browsing.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['toggleSearchWidget'] = function() {
  cvox.SearchWidget.getInstance().toggle();
  return false;
};


/**
 * Toggles between filtering and browsing.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['toggleFilteringWidget'] = function() {
  var filter = new cvox.ChromeVoxFiltering();
  filter.toggle();
  return false;
};


/**
 * Cycles through the Text-To-Speech Engines.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextTtsEngine'] = function() {
  // TODO: new implementation needed.
  return false;
};


/**
 * Decreases the tts rate.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['decreaseTtsRate'] = function() {
  cvox.ChromeVox.tts.increaseOrDecreaseProperty(cvox.AbstractTts.RATE, false);
  return false;
};


/**
 * Increases the tts rate.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['increaseTtsRate'] = function() {
  cvox.ChromeVox.tts.increaseOrDecreaseProperty(cvox.AbstractTts.RATE, true);
  return false;
};


/**
 * Decreases the tts pitch.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['decreaseTtsPitch'] = function() {
  cvox.ChromeVox.tts.increaseOrDecreaseProperty(cvox.AbstractTts.PITCH, false);
  return false;
};


/**
 * Increases the tts pitch.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['increaseTtsPitch'] = function() {
  cvox.ChromeVox.tts.increaseOrDecreaseProperty(cvox.AbstractTts.PITCH, true);
  return false;
};


/**
 * Decreases the tts volume.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['decreaseTtsVolume'] = function() {
  cvox.ChromeVox.tts.increaseOrDecreaseProperty(cvox.AbstractTts.VOLUME, false);
  return false;
};


/**
 * Increases the tts volume.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['increaseTtsVolume'] = function() {
  cvox.ChromeVox.tts.increaseOrDecreaseProperty(cvox.AbstractTts.VOLUME, true);
  return false;
};


/**
 * Opens the ChromeVox help documentation.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['help'] = function() {
  cvox.ChromeVox.tts.stop();
  cvox.ChromeVox.host.sendToBackgroundPage({
    'target': 'HelpDocs',
    'action': 'open'});
  return false;
};


/**
 * Shows the bookmark manager
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['showBookmarkManager'] = function() {
  cvox.ChromeVox.host.sendToBackgroundPage({
    'target': 'BookmarkManager',
    'action': 'open'});
  return false;
};


/**
 * Shows the options page.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['showOptionsPage'] = function() {
  cvox.ChromeVox.tts.stop();
  cvox.ChromeVox.host.sendToBackgroundPage({
    'target': 'Options',
    'action': 'open'});
  return false;
};


/**
 * Shows the keyboard explorer page.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['showKbExplorerPage'] = function() {
  cvox.ChromeVox.tts.stop();
  cvox.ChromeVox.host.sendToBackgroundPage({
    'target': 'KbExplorer',
    'action': 'open'});
  return false;
};


/**
 * Debug function - useful for quickly trying out some behavior
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['debug'] = function() {
  alert('ok');
  return false;
};


/**
 * Reads out the URL behind the link.
 */
cvox.ChromeVoxUserCommands.commands['readLinkURL'] = function() {
  var url;
  var activeElement = document.activeElement;
  var currentSelectionAnchor = window.getSelection().anchorNode;

  if (activeElement.tagName == 'A') {
    url = cvox.DomUtil.getLinkURL(activeElement);
  } else if (currentSelectionAnchor) {
    url = cvox.DomUtil.getLinkURL(currentSelectionAnchor.parentNode);
  } else {
    url = '';
  }

  if (url != '') {
    cvox.ChromeVox.tts.speak(url);
  } else {
    cvox.ChromeVox.tts.speak(cvox.ChromeVox.msgs.getMsg('no_url_found'));
  }
};


/**
 * Reads out the current page title.
 */
cvox.ChromeVoxUserCommands.commands['readCurrentTitle'] = function() {
  cvox.ChromeVox.tts.speak(document.title);
};


/**
 * Reads out the current page URL.
 */
cvox.ChromeVoxUserCommands.commands['readCurrentURL'] = function() {
  cvox.ChromeVox.tts.speak(document.URL);
};


/**
 * Starts reading the page contents from current location.
 */
cvox.ChromeVoxUserCommands.commands['readFromHere'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  cvox.ChromeVox.navigationManager.setReversed(false);
  cvox.ChromeVoxUserCommands.keepReading = true;
  if (cvox.ChromeVox.host.hasTtsCallback()) {
    cvox.ChromeVox.navigationManager.startReadingFromCurrentNode(
        cvox.AbstractTts.QUEUE_MODE_FLUSH);
  } else {
    cvox.ChromeVoxUserCommands.commands['readUntilStopped']();
  }
});

/**
 * Continously reads the page. Note that this is only used if callbacks are
 * not available.
 */
cvox.ChromeVoxUserCommands.commands['readUntilStopped'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  if (!cvox.ChromeVoxUserCommands.keepReading) {
    return;
  }
  if (!cvox.ChromeVox.tts.isSpeaking()) {
    var navSucceeded = cvox.ChromeVox.navigationManager.navigate(true);
    if (navSucceeded) {
      cvox.ChromeVoxUserCommands.finishNavCommand('');
    } else {
      cvox.ChromeVoxUserCommands.keepReading = false;
    }
  }
  window.setTimeout(cvox.ChromeVoxUserCommands.commands['readUntilStopped'],
                    1000);
});


/**
 * Jumps to the top of the page and reads the first thing.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['jumpToTop'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  cvox.ChromeVox.navigationManager.reset();
  cvox.ChromeVoxUserCommands.finishNavCommand('');
  return false;
});

//
// Mode commands - change modes


/**
 * Toggle table navigation on and off.
 */
cvox.ChromeVoxUserCommands.commands['toggleTable'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  if (cvox.ChromeVox.navigationManager.isTableMode()) {
    cvox.ChromeVox.navigationManager.tryExitTable();
    cvox.ChromeVoxUserCommands.finishNavCommand(
        cvox.ChromeVox.navigationManager.getGranularityMsg());
  } else {
    cvox.ChromeVox.navigationManager.tryEnterTable({force: true});
    if (cvox.ChromeVox.navigationManager.isTableMode()) {
      cvox.ChromeVoxUserCommands.finishNavCommand(
          cvox.ChromeVox.navigationManager.getGranularityMsg());
    } else {
      cvox.ChromeVoxUserCommands.finishNavCommand(
          cvox.ChromeVox.msgs.getMsg('no_tables') + ' ');
    }
  }
});


/**
 * Announce the headers of the current cell
 */
cvox.ChromeVoxUserCommands.commands['announceHeaders'] = function() {
  if (! cvox.ChromeVox.navigationManager.isTableMode()) {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('not_inside_table'),
        0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
    return;
  }
  var rowHeader = cvox.ChromeVox.navigationManager.getRowHeaderText();
  var colHeader = cvox.ChromeVox.navigationManager.getColHeaderText();
  if ((rowHeader == null) && (colHeader == null)) {
    cvox.ChromeVox.tts.speak(cvox.ChromeVox.msgs.getMsg('no_headers'), 0, null);
  } else if ((rowHeader == '') && (colHeader == '')) {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('empty_headers'), 0, null);
  } else {
    if (rowHeader != '') {
      cvox.ChromeVox.tts.speak(
          cvox.ChromeVox.msgs.getMsg('row_header') + ' ' + rowHeader, 0, null);
    } else if (rowHeader == '') {
      cvox.ChromeVox.tts.speak(
          cvox.ChromeVox.msgs.getMsg('empty_row_header'), 0, null);
    }
    if (colHeader != '') {
      cvox.ChromeVox.tts.speak(
          cvox.ChromeVox.msgs.getMsg('column_header') +
              ' ' + colHeader, 1, null);
    } else if (colHeader == '') {
      cvox.ChromeVox.tts.speak(
          cvox.ChromeVox.msgs.getMsg('empty_col_header'), 1, null);
    }
  }
};


/**
 * Announce the current location in the table and repeats table information.
 * Speaks text that identifies the current location as "row [i] of [m], column
 * [j] of [n]" where [i] is the current row number and [m] is the total number
 * of rows and [j] is the current column number and [n] is the total number of
 * columns.
 */
cvox.ChromeVoxUserCommands.commands['speakTableLocation'] = function() {
  var desc = cvox.ChromeVox.navigationManager.getLocationDescription();
  if (desc == null) {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('not_inside_table'),
        cvox.AbstractTts.QUEUE_MODE_FLUSH,
        cvox.AbstractTts.PERSONALITY_ANNOTATION);
  } else {
    cvox.ChromeVox.navigationManager.speakDescriptionArray(
        desc, cvox.AbstractTts.QUEUE_MODE_FLUSH, null);
  }
};


/**
 * Announce the row header (or best guess) of the current cell.
 */
cvox.ChromeVoxUserCommands.commands['guessRowHeader'] = function() {
  if (! cvox.ChromeVox.navigationManager.isTableMode()) {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('not_inside_table'),
        0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
    return;
  }
  var rowHeader = cvox.ChromeVox.navigationManager.getRowHeaderText();
  if (rowHeader != '') {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('row_header') + ' ' + rowHeader, 0, null);
  } else if (rowHeader == '') {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('empty_row_header') +
            ' ' + rowHeader, 0, null);
  }
  else {
    // No explicit row header, ask for best guess
    var guessRowHeader = cvox.ChromeVox.navigationManager.getRowHeaderGuess();
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('row_header') +
        ' ' + guessRowHeader, 0, null);
  }
};


/**
 * Announce the column header (or best guess) of the current cell.
 */
cvox.ChromeVoxUserCommands.commands['guessColHeader'] = function() {
  if (! cvox.ChromeVox.navigationManager.isTableMode()) {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('not_inside_table'),
        0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
    return;
  }
  var colHeader = cvox.ChromeVox.navigationManager.getColHeaderText();
  if (colHeader != '') {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('column_header') + ' ' + colHeader, 0, null);
  } else if (colHeader == '') {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('empty_column_header'), 0, null);
  }
  else {
    // No explicit col header, ask for best guess
    var guessColHeader = cvox.ChromeVox.navigationManager.getColHeaderGuess();
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('column_header') +
        ' ' + guessColHeader, 0, null);
  }
};


/**
 * Skip to the first cell of a table.
 */
cvox.ChromeVoxUserCommands.commands['skipToBeginning'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  if (cvox.ChromeVox.navigationManager.goToFirstCell()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('not_inside_table'),
        0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
  }
});


/**
 * Skip to the last cell of a table.
 */
cvox.ChromeVoxUserCommands.commands['skipToEnd'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  if (cvox.ChromeVox.navigationManager.goToLastCell()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('not_inside_table'),
        0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
  }
});


/**
 * Skip to the first cell of the current row of a table.
 */
cvox.ChromeVoxUserCommands.commands['skipToRowBeginning'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  if (cvox.ChromeVox.navigationManager.goToRowFirstCell()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('not_inside_table'),
        0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
  }
});


/**
 * Skip to the last cell of the current row of a table.
 */
cvox.ChromeVoxUserCommands.commands['skipToRowEnd'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  if (cvox.ChromeVox.navigationManager.goToRowLastCell()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('not_inside_table'),
        0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
  }
});


/**
 * Skip to the first cell of the current column of a table.
 */
cvox.ChromeVoxUserCommands.commands['skipToColBeginning'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  if (cvox.ChromeVox.navigationManager.goToColFirstCell()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('not_inside_table'),
        0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
  }
});


/**
 * Skip to the last cell of the current column of a table.
 */
cvox.ChromeVoxUserCommands.commands['skipToColEnd'] =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
  if (cvox.ChromeVox.navigationManager.goToColLastCell()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('not_inside_table'),
        0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
  }
});


//
// Jump commands - jump to the next / previous node of a certain category
//


/**
 * Next checkbox.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextCheckbox'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.checkboxPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_checkbox'));
  return false;
};


/**
 * Previous checkbox.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousCheckbox'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.checkboxPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_checkbox'));
  return false;
};


/**
 * Next radio button.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextRadio'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.radioPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_radio_button'));
  return false;
};


/**
 * Previous radio button.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousRadio'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.radioPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_radio_button'));
  return false;
};


/**
 * Next slider.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextSlider'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.sliderPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_slider'));
  return false;
};


/**
 * Previous slider.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousSlider'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.sliderPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_slider'));
  return false;
};


/**
 * Next graphic.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextGraphic'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.graphicPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_graphic'));
  return false;
};


/**
 * Previous graphic.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousGraphic'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.graphicPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_graphic'));
  return false;
};


/**
 * Next button.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextButton'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.buttonPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_button'));
  return false;
};


/**
 * Previous button.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousButton'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.buttonPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_button'));
  return false;
};


/**
 * Next combo box.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextComboBox'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.comboBoxPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_combo_box'));
  return false;
};


/**
 * Previous combo box.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousComboBox'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.comboBoxPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_combo_box'));
  return false;
};


/**
 * Next editable text field.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextEditText'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.editTextPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_edit_text'));
  return false;
};


/**
 * Previous editable text field.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousEditText'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.editTextPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_edit_text'));
  return false;
};


/**
 * Next heading.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextHeading'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.headingPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_heading'));
  return false;
};


/**
 * Previous heading.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousHeading'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.headingPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_heading'));
  return false;
};


/**
 * Next heading level 1.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextHeading1'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.heading1Predicate,
      cvox.ChromeVox.msgs.getMsg('no_next_heading_1'));
  return false;
};


/**
 * Previous heading level 1.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousHeading1'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.heading1Predicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_heading_1'));
  return false;
};


/**
 * Next heading level 2.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextHeading2'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.heading2Predicate,
      cvox.ChromeVox.msgs.getMsg('no_next_heading_2'));
  return false;
};


/**
 * Previous heading level 2.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousHeading2'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.heading2Predicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_heading_2'));
  return false;
};


/**
 * Next heading level 3.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextHeading3'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.heading3Predicate,
      cvox.ChromeVox.msgs.getMsg('no_next_heading_3'));
  return false;
};


/**
 * Previous heading level 3.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousHeading3'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.heading3Predicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_heading_3'));
  return false;
};


/**
 * Next heading level 4.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextHeading4'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.heading4Predicate,
      cvox.ChromeVox.msgs.getMsg('no_next_heading_4'));
  return false;
};


/**
 * Previous heading level 4.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousHeading4'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.heading4Predicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_heading_4'));
  return false;
};


/**
 * Next heading level 5.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextHeading5'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.heading5Predicate,
      cvox.ChromeVox.msgs.getMsg('no_next_heading_5'));
  return false;
};


/**
 * Previous heading level 5.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousHeading5'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.heading5Predicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_heading_5'));
  return false;
};


/**
 * Next heading level 6.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextHeading6'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.heading6Predicate,
      cvox.ChromeVox.msgs.getMsg('no_next_heading_6'));
  return false;
};


/**
 * Previous heading level 6.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousHeading6'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.heading6Predicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_heading_6'));
  return false;
};


/**
 * Next not-link.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextNotLink'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.notLinkPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_not_link'));
  return false;
};


/**
 * Previous not-link.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousNotLink'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.notLinkPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_not_link'));
  return false;
};


/**
 * Next anchor.
 *
 * @return {boolean} Always return false to prevent default action.
 */
cvox.ChromeVoxUserCommands.commands['nextAnchor'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.anchorPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_anchor'));
  return false;
};


/**
 * Previous anchor.
 *
 * @return {boolean} Always return false to prevent default action.
 */
cvox.ChromeVoxUserCommands.commands['previousAnchor'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.anchorPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_anchor'));
  return false;
};


/**
 * Next link.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextLink'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.linkPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_link'));
  return false;
};


/**
 * Previous link.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousLink'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.linkPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_link'));
  return false;
};


/**
 * Next table.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextTable'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.tablePredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_table'));
  return false;
};


/**
 * Previous table.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousTable'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.tablePredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_table'));
  return false;
};


/**
 * Next list.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextList'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.listPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_list'));
  return false;
};


/**
 * Previous list.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousList'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.listPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_list'));
  return false;
};


/**
 * Next list item.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextListItem'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.listItemPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_list_item'));
  return false;
};


/**
 * Previous list item.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousListItem'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.listItemPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_list_item'));
  return false;
};


/**
 * Next blockquote.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextBlockquote'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.blockquotePredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_blockquote'));
  return false;
};


/**
 * Previous blockquote.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousBlockquote'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.blockquotePredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_blockquote'));
  return false;
};


/**
 * Next form field.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextFormField'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.formFieldPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_form_field'));
  return false;
};


/**
 * Previous form field.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousFormField'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.formFieldPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_form_field'));
  return false;
};


/**
 * Next jump point (heading or ARIA landmark).
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextJump'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.jumpPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_jump'));
  return false;
};


/**
 * Previous jump point (heading or ARIA landmark).
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousJump'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.jumpPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_jump'));
  return false;
};


/**
 * Next ARIA landmark.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextLandmark'] = function() {
  cvox.ChromeVoxUserCommands.findNextAndSpeak_(
      cvox.DomPredicates.landmarkPredicate,
      cvox.ChromeVox.msgs.getMsg('no_next_landmark'));
  return false;
};


/**
 * Previous ARIA landmark.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousLandmark'] = function() {
  cvox.ChromeVoxUserCommands.findPreviousAndSpeak_(
      cvox.DomPredicates.landmarkPredicate,
      cvox.ChromeVox.msgs.getMsg('no_previous_landmark'));
  return false;
};



/**
 * Next different element.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextDifferentElement'] = function() {
  cvox.ChromeVoxUserCommands.findBySimilarity('forward', false);
  return false;
};

/**
 * Previous different element.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousDifferentElement'] = function() {
  cvox.ChromeVoxUserCommands.findBySimilarity('backward', false);
  return false;
};


/**
 * Next similar element.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextSimilarElement'] = function() {
  cvox.ChromeVoxUserCommands.findBySimilarity('forward', true);
  return false;
};

/**
 * Previous similar element.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousSimilarElement'] = function() {
  cvox.ChromeVoxUserCommands.findBySimilarity('backward', true);
  return false;
};


/**
 * Attempts to do something reasonable given the current item that the user is
 * on.
 * For example, if the user is on a chunk of text that contains a link, navigate
 * to that link. If there are multiple links in that chunk, bring up a menu to
 * let the user choose which link they meant to click on.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['actOnCurrentItem'] = function() {
  var actionTaken = cvox.ChromeVox.navigationManager.act();
  if (!actionTaken) {
    cvox.ChromeVox.tts.speak(cvox.ChromeVox.msgs.getMsg('no_actions'),
        0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
  }
  return false;
};


/**
 * Forces a click event on the current item.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['forceClickOnCurrentItem'] = function() {
  cvox.ChromeVox.tts.speak(
      cvox.ChromeVox.msgs.getMsg('element_clicked'),
      0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
  cvox.DomUtil.clickElem(
      cvox.ChromeVox.navigationManager.getCurrentNode(), false);
  return false;
};


/**
 * Show the lens.
 *
 * @return {boolean} Always return false to prevent the default action.
 */
cvox.ChromeVoxUserCommands.commands['showLens'] = function() {
  cvox.ChromeVox.lens.showLens(true);
  cvox.ChromeVox.host.sendToBackgroundPage({
    'target': 'Prefs',
    'action': 'setPref',
    'pref': 'lensVisible',
    'value': true
  });
  return false;
};


/**
 * Hide the lens.
 *
 * @return {boolean} Always return false to prevent the default action.
 */
cvox.ChromeVoxUserCommands.commands['hideLens'] = function() {
  cvox.ChromeVox.lens.showLens(false);
  cvox.ChromeVox.host.sendToBackgroundPage({
    'target': 'Prefs',
    'action': 'setPref',
    'pref': 'lensVisible',
    'value': false
  });
  return false;
};


/**
 * Toggle showing the lens.
 *
 * @return {boolean} Always return false to prevent the default action.
 */
cvox.ChromeVoxUserCommands.commands['toggleLens'] = function() {
  if (cvox.ChromeVox.lens.isLensDisplayed()) {
    cvox.ChromeVoxUserCommands.commands['hideLens']();
  } else {
    cvox.ChromeVoxUserCommands.commands['showLens']();
  }
  return false;
};


/**
 * Float the lens.
 *
 * @return {boolean} Always return false to prevent the default action.
 */
cvox.ChromeVoxUserCommands.commands['floatLens'] = function() {
  try {
    cvox.ChromeVox.lens.setAnchoredLens(false);
    cvox.ChromeVox.lens.showLens(false);
    cvox.ChromeVox.lens.showLens(true);
  } catch (err) {
  }
  cvox.ChromeVox.host.sendToBackgroundPage({
    'target': 'Prefs',
    'action': 'setPref',
    'pref': 'lensAnchored',
    'value': false
  });

  return false;
};


/**
 * Anchor the lens
 *
 * @return {boolean} Always return false to prevent the default action.
 */
cvox.ChromeVoxUserCommands.commands['anchorLens'] = function() {
  try {
    cvox.ChromeVox.lens.setAnchoredLens(true);
    cvox.ChromeVox.lens.showLens(false);
    cvox.ChromeVox.lens.showLens(true);
  } catch (err) {
  }
  cvox.ChromeVox.host.sendToBackgroundPage({
    'target': 'Prefs',
    'action': 'setPref',
    'pref': 'lensAnchored',
    'value': true
  });

  return false;
};


/**
 * Toggle ChromeVox active or inactive.
 *
 * @return {boolean} Always return false to prevent the default action.
 */
cvox.ChromeVoxUserCommands.commands['toggleChromeVox'] = function() {
  cvox.ChromeVox.host.sendToBackgroundPage({
    'target': 'Prefs',
    'action': 'setPref',
    'pref': 'active',
    'value': !cvox.ChromeVox.isActive
  });

  return false;
};


/**
 * Uses PowerKey to show a list of elements that can be navigated to.
 *
 * @param {string} errorStr A string to speak if there is nothing in the list.
 * @param {Array} elementsArray The array of elements to populate the navigation
 * list.
 * @param {Array} opt_descriptionsArray Optional array of descriptions for the
 * elements; if this is null, the text of the elements will be used.
 */
cvox.ChromeVoxUserCommands.showNavigationList = function(errorStr,
    elementsArray, opt_descriptionsArray) {
  if (elementsArray.length < 1) {
    cvox.ChromeVox.tts.speak(errorStr, 0,
        cvox.AbstractTts.PERSONALITY_ANNOTATION);
    return;
  }

  var nodeChooser =
      new cvox.NodeChooserWidget(elementsArray, opt_descriptionsArray);
  nodeChooser.show();
};


/**
 * Show headings list with PowerKey.
 */
cvox.ChromeVoxUserCommands.commands['showHeadingsList'] = function() {
  var xpath = '//*[@role="heading"] | //h1 | //h2 | //h3 | //h4 | //h5 | //h6';
  cvox.ChromeVoxUserCommands.showNavigationList(
      cvox.ChromeVox.msgs.getMsg('powerkey_no_headings'),
      cvox.XpathUtil.evalXPath(xpath, document.body), null);
};


/**
 * Show links list with PowerKey.
 */
cvox.ChromeVoxUserCommands.commands['showLinksList'] = function() {
  var xpath = '//a';
    cvox.ChromeVoxUserCommands.showNavigationList(
        cvox.ChromeVox.msgs.getMsg('powerkey_no_links'),
        cvox.XpathUtil.evalXPath(xpath, document.body), null);
  };


  /**
   * Show forms list with PowerKey.
   */
  cvox.ChromeVoxUserCommands.commands['showFormsList'] = function() {
    var xpath = '//form';
    cvox.ChromeVoxUserCommands.showNavigationList(
        cvox.ChromeVox.msgs.getMsg('powerkey_no_forms'),
        cvox.XpathUtil.evalXPath(xpath, document.body), null);
};


/**
 * Show tables list with PowerKey.
 */
cvox.ChromeVoxUserCommands.commands['showTablesList'] = function() {
  var xpath = '//table';
  var tableNodes = cvox.XpathUtil.evalXPath(xpath, document.body);
  var descriptions = new Array();
  var tableCount = 1;
  for (var i = 0, node; node = tableNodes[i]; i++) {
    var description = '';
    if (node.getAttribute('title')) {
      description = description + node.getAttribute('title') + ' ';
    }
    if (node.getAttribute('summary')) {
      description = description + node.getAttribute('summary') + ' ';
    }
    if (node.getAttribute('caption')) {
      description = description + node.getAttribute('caption') + ' ';
    }
    if (description.length < 1) {
      description = 'Table ' + tableCount;
      tableCount++;
    }
    descriptions.push(description);
  }
  cvox.ChromeVoxUserCommands.showNavigationList(
      cvox.ChromeVox.msgs.getMsg('powerkey_no_tables'),
      cvox.XpathUtil.evalXPath(xpath, document.body), null);
};


/**
 * Show landmarks list with PowerKey.
 */
cvox.ChromeVoxUserCommands.commands['showLandmarksList'] = function() {
  var xpath = '//*[@role="application"] | //*[@role="banner"] | ' +
      '//*[@role="complementary"] | //*[@role="contentinfo"] | ' +
      '//*[@role="form"] | //*[@role="main"] | //*[@role="navigation"] | ' +
      '//*[@role="search"]';
  var landmarkNodes = cvox.XpathUtil.evalXPath(xpath, document.body);
  var descriptions = new Array();
  for (var i = 0, node; node = landmarkNodes[i]; i++) {
    var description = cvox.AriaUtil.getRoleName(node);
    if (node.getAttribute('title')) {
      description = node.getAttribute('title') + ' ' + description;
    }
    descriptions.push(description);
  }
  cvox.ChromeVoxUserCommands.showNavigationList(
      cvox.ChromeVox.msgs.getMsg('powerkey_no_landmarks'),
      landmarkNodes, descriptions);
};


/**
 * Show jump points list with PowerKey.
 */
cvox.ChromeVoxUserCommands.commands['showJumpsList'] = function() {
  var xpath = '//*[@role="application"] | //*[@role="banner"] | ' +
      '//*[@role="complementary"] | //*[@role="contentinfo"] | ' +
      '//*[@role="form"] | //*[@role="main"] | //*[@role="navigation"] | ' +
      '//*[@role="search"] | //*[@role="heading"] | //h1 | //h2 | //h3 | ' +
      '//h4 | //h5 | //h6';
  var jumpNodes = cvox.XpathUtil.evalXPath(xpath, document.body);
  var descriptions = new Array();
  for (var i = 0, node; node = jumpNodes[i]; i++) {
    var description = '';
    if (cvox.AriaUtil.isLandmark(node)) {
      description = cvox.AriaUtil.getRoleName(node);
      var text = cvox.DomUtil.getName(node);
      if (text) {
        description = text + ' ' + description;
      }
    } else {
      description = cvox.DomUtil.collapseWhitespace(
          cvox.DomUtil.getValue(node) + ' ' + cvox.DomUtil.getName(node));
    }
    descriptions.push(description);
  }
  cvox.ChromeVoxUserCommands.showNavigationList(
      cvox.ChromeVox.msgs.getMsg('powerkey_no_jumps'), jumpNodes, descriptions);
};

/**
 * Announce the current position.
 */
cvox.ChromeVoxUserCommands.commands['announcePosition'] = function() {
  var descriptionArray = cvox.ChromeVox.navigationManager.getDescription();

  cvox.ChromeVox.navigationManager.speakDescriptionArray(descriptionArray,
    0, null);
};

/**
 * Fully describe the current position
 */
cvox.ChromeVoxUserCommands.commands['fullyDescribe'] = function() {
  var descriptionArray = cvox.ChromeVox.navigationManager.getFullDescription();

  cvox.ChromeVox.navigationManager.speakDescriptionArray(descriptionArray,
    0, null);
};

/**
 * Filters out items like the current one.
 */
cvox.ChromeVoxUserCommands.commands['filterLikeCurrentItem'] = function() {
  // Compute the CSS selector based on the current node.
  // Currently only use class, id, and type CSS selectors.
  var currentNode = cvox.ChromeVox.navigationManager.getCurrentNode();
  var cssSelector = cvox.WalkerDecorator.filterForNode(currentNode);
  if (!cvox.DomUtil.hasContent(currentNode) || !cssSelector) {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('unable_to_filter'),
        0,
        cvox.AbstractTts.PERSONALITY_ANNOTATION);
    return;
  }

  var walkerDecorator = cvox.ChromeVox.navigationManager.getFilteredWalker();
  walkerDecorator.addFilter(cssSelector);
  cvox.$m('added_filter').speakFlush();
  cvox.ChromeVox.navigationManager.navigate(true);
};

// Commands for starting and stopping event recording.
cvox.ChromeVoxUserCommands.commands['startHistoryRecording'] = function() {
  cvox.History.getInstance().startRecording();
};

cvox.ChromeVoxUserCommands.commands['stopHistoryRecording'] = function() {
  cvox.History.getInstance().stopRecording();
};
cvox.ChromeVoxUserCommands.commands['enterCssSpace'] = function() {
  cvox.CssSpace.initializeSpace();
  cvox.CssSpace.enterExploration();
};

// Console TTS.
cvox.ChromeVoxUserCommands.commands['enableConsoleTts'] = function() {
  cvox.ConsoleTts.getInstance().setEnabled(true);
};

cvox.ChromeVoxUserCommands.commands['autorunner'] = function() {
  var runner = new cvox.AutoRunner();
  runner.run();
};

