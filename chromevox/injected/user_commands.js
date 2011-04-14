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

goog.provide('cvox.ChromeVoxUserCommands');

goog.require('cvox.AbstractEarcons');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxNavigationManager');
goog.require('cvox.ChromeVoxSearch');
goog.require('cvox.DomUtil');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.SelectionUtil');

/**
 * @fileoverview High level commands that the user can invoke using hotkeys.
 *
 * @author clchen@google.com (Charles L. Chen)
 */
cvox.ChromeVoxUserCommands = function() { };


/**
 * @type {Object}
 */
cvox.ChromeVoxUserCommands.commands = {};


/**
 * @type {string}
 */
cvox.ChromeVoxUserCommands.stickyModeEnabledMessage = 'Sticky mode enabled';


/**
 * @type {string}
 */
cvox.ChromeVoxUserCommands.stickyModeDisabledMessage = 'Sticky mode disabled';


/**
 * @type {PowerKey}
 */
cvox.ChromeVoxUserCommands.powerkey = null;


/**
 * @type {Function}
 */
cvox.ChromeVoxUserCommands.powerkeyActionCallback = null;


/**
 * A nestable variable to keep track of whether or not we're inside of a
 * user command, so that some event triggers don't respond. For example,
 * we don't want to speak twice when the user navigates to a focusable
 * element, once for the navigation and once for the focus event handler.
 *
 * Calling markInUserCommand() increments this level by one and then
 * decrements it after a delay. Incrementing / decrementing rather than
 * setting it to true/false makes it safe to call this twice or nest calls.
 *
 * Code should call isInUserCommand() to find out whether we're in the
 * middle of handling a command or not.
 *
 * @type {number}
 * @private
 */
cvox.ChromeVoxUserCommands.userCommandLevel_ = 0;


// TODO (chaitanyag): Move the PowerKey related code in a separate JS file.
/**
 * Initializes PowerKey.
 *
 * @param {Object} keyMap Object with keyboard shortcut -> function mappings.
 * @param {Function} callback Function to call when user makes a selection
 *     in PowerKey.
 * @return {Array} An array of keyboard shortcuts populated in powerkey.
 */
cvox.ChromeVoxUserCommands.initPowerKey = function(keyMap, callback) {
  var list = [];
  var cmds = [];
  for (var key in keyMap) {
    list.push(keyMap[key][1] + ' - ' +
        cvox.ChromeVoxUserCommands.getReadableShortcut(key));
    cmds.push(key);
  }
  cvox.ChromeVoxUserCommands.powerkey = new PowerKey('main', null);
  PowerKey.setDefaultCSSStyle();
  cvox.ChromeVoxUserCommands.powerkey.setCompletionPromptStr(
      'Search for a keyboard shortcut or use Up/Down arrow keys to browse.');
  cvox.ChromeVoxUserCommands.powerkey.createCompletionField(
      document.body,
      50,
      cvox.ChromeVoxUserCommands.powerkeyActionHandler,
      null,
      list,
      false);
  cvox.ChromeVoxUserCommands.powerkey.setAutoHideCompletionField(true);
  cvox.ChromeVoxUserCommands.powerkey.hideOnEsc(false);
  cvox.ChromeVoxUserCommands.powerkey.setBrowseCallback(
      cvox.ChromeVoxUserCommands.powerkeyBrowseHandler);
  cvox.ChromeVoxUserCommands.powerkeyActionCallback = callback;
  return cmds;
};


/**
 * Returns a readable form of the specified keyboard shortcut.
 *
 * @param {string} key String form of a keyboard shortcut.
 * @return {string} Readable string representation.
 */
cvox.ChromeVoxUserCommands.getReadableShortcut = function(key) {
  var tokens = key.split('+');
  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].charAt(0) == '#' && tokens[i].indexOf('>') == -1) {
      var keyCode = parseInt(tokens[i].substr(1), 10);
      tokens[i] = cvox.KeyUtil.getReadableNameForKeyCode(keyCode);
    } else {
      var seqs = tokens[i].split('>');
      for (var j = 0; j < seqs.length; j++) {
        if (seqs[j].charAt(0) == '#') {
          var keyCode = parseInt(seqs[j].substr(1), 10);
          seqs[j] = cvox.KeyUtil.getReadableNameForKeyCode(keyCode);
        }
        seqs[j] = cvox.KeyUtil.getReadableNameForStr(seqs[j]) || seqs[j];
      }
      tokens[i] = seqs.join(', ');
    }
    tokens[i] = cvox.KeyUtil.getReadableNameForStr(tokens[i]) || tokens[i];
  }
  // trim '+'s, ' 's and return
  return tokens.join(' + ').replace(/^[\+\s]*/, '').replace(/[\+\s]*$/, '');
};


/**
 * Handles browse callbacks from PowerKey by speaking the current suggestion.
 *
 * @param {string} completion The completion string.
 * @param {number} index The index of the completion string in the array.
 * @param {?HTMLElement} node The node corresponding the selected item.
 * @param {?Array} args optional arguments.
 */
cvox.ChromeVoxUserCommands.powerkeyBrowseHandler = function(
    completion, index, node, args) {
  cvox.ChromeVox.tts.speak(completion, 0, null);
};


/**
 * Handles action callback from PowerKey when the user selects a suggestion.
 *
 * @param {string} completion The completion string.
 * @param {number} index The index of the completion string in the array.
 * @param {?HTMLElement} node The node corresponding the selected item.
 * @param {?Array} args optional arguments.
 */
cvox.ChromeVoxUserCommands.powerkeyActionHandler = function(
    completion, index, node, args) {
  cvox.ChromeVoxUserCommands.hidePowerKey();
  window.setTimeout(function() {
    if (cvox.ChromeVoxUserCommands.powerkeyActionCallback) {
      cvox.ChromeVoxUserCommands.powerkeyActionCallback(completion, index);
    }
  }, 1); // The 1 ms timeout is necessary to let the focus return to the
  // element which was focused before showing PowerKey, before taking
  // the PowerKey action.
};


/**
 * Hides PowerKey dialog and returns focus to the previously focused element.
 */
cvox.ChromeVoxUserCommands.hidePowerKey = function() {
  if (!cvox.ChromeVoxUserCommands.powerkey.isVisible()) {
    return;
  }
  cvox.ChromeVoxUserCommands.powerkey.updateCompletionField(
      PowerKey.status.HIDDEN);
  if (cvox.ChromeVoxUserCommands.savedCurrentNode) {
    window.setTimeout(function() {
      cvox.DomUtil.setFocus(cvox.ChromeVoxUserCommands.savedCurrentNode);
    }, 0);
  }
};


/**
 * Shows PowerKey dialog.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['showPowerKey'] = function() {
  cvox.ChromeVoxUserCommands.savedCurrentNode =
      cvox.ChromeVox.navigationManager.getCurrentNode();
  cvox.ChromeVoxUserCommands.powerkey.updateCompletionField(
      PowerKey.status.VISIBLE);
  return false;
};


/**
 * Hides PowerKey dialog.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['hidePowerKey'] = function() {
  cvox.ChromeVoxUserCommands.hidePowerKey();
  return false;
};


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
  cvox.ChromeVoxUserCommands.speakAtLowerPitch(cvox.ChromeVox.isStickyOn ?
      cvox.ChromeVoxUserCommands.stickyModeEnabledMessage :
      cvox.ChromeVoxUserCommands.stickyModeDisabledMessage);
  return false;
};


/**
 * Moves forward and speaks the result.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['forward'] = function() {
  cvox.ChromeVoxUserCommands.markInUserCommand_();
  var navSucceeded = cvox.ChromeVox.navigationManager.next(true);

  if (cvox.ChromeVox.navigationManager.inTableMode()) {
    if (! cvox.ChromeVox.navigationManager.checkCellBoundaries()) {
      navSucceeded = cvox.ChromeVox.navigationManager.previous(true);
      cvox.ChromeVoxUserCommands.finishNavCommand('End of cell. ');
      return !navSucceeded;
    }
  }

  cvox.ChromeVoxUserCommands.finishNavCommand('');
  return !navSucceeded;
};


/**
 * Moves backward and speaks the result.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['backward'] = function() {
  cvox.ChromeVoxUserCommands.markInUserCommand_();
  var navSucceeded = cvox.ChromeVox.navigationManager.previous(true);

  if (cvox.ChromeVox.navigationManager.inTableMode()) {
    if (! cvox.ChromeVox.navigationManager.checkCellBoundaries()) {
      navSucceeded = cvox.ChromeVox.navigationManager.next(true);
      cvox.ChromeVoxUserCommands.finishNavCommand('End of cell. ');
      return !navSucceeded;
    }
  }

  cvox.ChromeVoxUserCommands.finishNavCommand('');
  return !navSucceeded;
};


/**
 * Moves up to a different navigation strategy and speaks a summary of the
 * current position.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['previousGranularity'] = function() {
  cvox.ChromeVox.navigationManager.up();
  var strategy = cvox.ChromeVox.navigationManager.getStrategy();
  if (strategy == 'SELECTION') {
    strategy = cvox.ChromeVox.navigationManager.getGranularity();
  }
  cvox.ChromeVoxUserCommands.finishNavCommand(strategy + ' ');
  return false;
};


/**
 * Moves down to a different navigation strategy and speaks a summary of the
 * current position.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextGranularity'] = function() {
  cvox.ChromeVox.navigationManager.down();
  var strategy = cvox.ChromeVox.navigationManager.getStrategy();
  if (strategy == 'SELECTION') {
    strategy = cvox.ChromeVox.navigationManager.getGranularity();
  }
  cvox.ChromeVoxUserCommands.finishNavCommand(strategy + ' ');
  return false;
};


/**
 * Command to do nothing but speak the current navigation position & state.
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['speakCurrentPosition'] = function() {
  cvox.ChromeVoxUserCommands.finishNavCommand('');
  return false;
};


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
  if (cvox.ChromeVox.lens) {
    cvox.ChromeVox.lens.updateText();
  }
  var descriptionArray =
      cvox.ChromeVox.navigationManager.getCurrentDescription();
  var contentStr = descriptionArray[0];
  var descriptionStr = descriptionArray[1];
  // Remove all whitespace from the beginning and end, and collapse all
  // inner strings of whitespace to a single space.
  contentStr = contentStr.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
  descriptionStr = descriptionStr.replace(/\s+/g,
                                          ' ').replace(/^\s+|\s+$/g, '');
  setTimeout(function() {
    cvox.ChromeVox.navigationManager.setFocus();
  }, 0);
  cvox.SelectionUtil.scrollToSelection(window.getSelection());
  cvox.ChromeVox.navigationManager.syncToSelection();
  if ((messagePrefixStr != '') && (descriptionStr != '')) {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch(messagePrefixStr);
    cvox.ChromeVox.tts.speak(contentStr, 1, null);
    cvox.ChromeVoxUserCommands.speakAtLowerPitch(descriptionStr, 1);
  } else if (messagePrefixStr != '') {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch(messagePrefixStr);
    cvox.ChromeVox.tts.speak(contentStr, 1, null);
  } else if (descriptionStr != '') {
    cvox.ChromeVox.tts.speak(contentStr, 0, null);
    cvox.ChromeVoxUserCommands.speakAtLowerPitch(descriptionStr, 1);
  } else {
    cvox.ChromeVox.tts.speak(contentStr, 0, null);
  }
  cvox.ChromeVoxUserCommands.playEarcons();
};


/**
 * Speak a string to the user at a lower pitch. This should be used for
 * changing mode commands and other strings that aren't page content.
 *
 * @param {string} lowerPitchStr The string to be spoken to the user at a lower
 * pitch.
 * @param {number=} queue The queuing level. Default is 0.
 */
cvox.ChromeVoxUserCommands.speakAtLowerPitch = function(lowerPitchStr, queue) {
  // TODO(rshearer): This can be deprecated when we've implemented the
  // "properties" speech utterance parameter. Specifying what pitch to speak
  // at should live in there.
  cvox.ChromeVox.tts.decreaseProperty('Pitch', false);
  cvox.ChromeVox.tts.decreaseProperty('Pitch', false);
  cvox.ChromeVox.tts.decreaseProperty('Pitch', false);
  if (queue) {
    cvox.ChromeVox.tts.speak(lowerPitchStr, queue, null);
  } else {
    cvox.ChromeVox.tts.speak(lowerPitchStr, 0, null);
  }
  cvox.ChromeVox.tts.increaseProperty('Pitch', false);
  cvox.ChromeVox.tts.increaseProperty('Pitch', false);
  cvox.ChromeVox.tts.increaseProperty('Pitch', false);
};


/**
 * Play earcons for the object that was most recently navigated to.
 */
cvox.ChromeVoxUserCommands.playEarcons = function() {
  var ancestors = cvox.ChromeVox.navigationManager.getChangedAncestors();
  var earcons = [];
  for (var i = 0; i < ancestors.length; i++) {
    var node = ancestors[i];
    // Check if this is an ARIA control; if it is, ARIA role takes precedence.
    if (cvox.AriaUtil.isControlWidget(node)) {
      var role = node.getAttribute('role');
      switch (role) {
        case 'button':
          earcons.push(cvox.AbstractEarcons.BUTTON);
          break;
        case 'checkbox':
        case 'radio':
        case 'menuitemcheckbox':
        case 'menuitemradio':
          if (!node.getAttribute('aria-checked')) {
            earcons.push(cvox.AbstractEarcons.CHECK_OFF);
          } else {
            earcons.push(cvox.AbstractEarcons.CHECK_ON);
          }
          break;
        case 'combobox':
          earcons.push(cvox.AbstractEarcons.LISTBOX);
          break;
        case 'textbox':
          earcons.push(cvox.AbstractEarcons.EDITABLE_TEXT);
          break;
      }
    } else {
      // Not an ARIA control; use the element's tag.
      switch (node.tagName) {
        case 'BUTTON':
          earcons.push(cvox.AbstractEarcons.BUTTON);
          break;
        case 'A':
          earcons.push(cvox.AbstractEarcons.LINK);
          break;
        case 'LI':
          earcons.push(cvox.AbstractEarcons.LIST_ITEM);
          break;
        case 'SELECT':
          earcons.push(cvox.AbstractEarcons.LISTBOX);
          break;
        case 'TEXTAREA':
          earcons.push(cvox.AbstractEarcons.EDITABLE_TEXT);
          break;
        case 'INPUT':
          switch (node.type) {
            case 'submit':
            case 'reset':
              earcons.push(cvox.AbstractEarcons.BUTTON);
              break;
            case 'checkbox':
            case 'radio':
              if (node.value) {
                earcons.push(cvox.AbstractEarcons.CHECK_ON);
              } else {
                earcons.push(cvox.AbstractEarcons.CHECK_OFF);
              }
              break;
            default:
              if (cvox.DomUtil.isInputTypeText(node)) {
                // 'text', 'password', etc.
                earcons.push(cvox.AbstractEarcons.EDITABLE_TEXT);
              }
              break;
          }
      }
    }
  }

  for (var j = 0; j < earcons.length; j++) {
    cvox.ChromeVox.earcons.playEarcon(earcons[j]);
  }
};


/**
 * Find the next occurrence of an item defined by the given predicate.
 * @param {function(Array.<Node>)} predicate A function taking a node as a
 *     parameter and returning true if it's what to search for.
 * @param {string} errorStr A string to speak if the item couldn't be found.
 * @private
 */
cvox.ChromeVoxUserCommands.findNextAndSpeak_ = function(predicate,
    errorStr) {
  cvox.ChromeVoxUserCommands.markInUserCommand_();
  if (!cvox.ChromeVox.navigationManager.findNext(predicate)) {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch(errorStr);
    return;
  }
  cvox.ChromeVoxUserCommands.finishNavCommand('');
};


/**
 * Find the next occurrence of an item defined by the given predicate.
 * @param {function(Array.<Node>)} predicate A function taking a node as a
 *     parameter and returning true if it's what to search for.
 * @param {string} errorStr A string to speak if the item couldn't be found.
 * @private
 */
cvox.ChromeVoxUserCommands.findPreviousAndSpeak_ = function(predicate,
    errorStr) {
  cvox.ChromeVoxUserCommands.markInUserCommand_();
  if (!cvox.ChromeVox.navigationManager.findPrevious(predicate)) {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch(errorStr);
    return;
  }
  cvox.ChromeVoxUserCommands.finishNavCommand('');
};


/**
 * @param {Array} arr Array of nodes.
 * @param {string} tagName The name of the tag.
 * @return {?Node} Node if obj is in the array.
 * @private
 */
cvox.ChromeVoxUserCommands.containsTagName_ = function(arr, tagName) {
  var i = arr.length;
  while (i--) {
    if (arr[i].tagName == tagName) {
      return arr[i];
    }
  }
  return null;
};


/**
 * Mark that we're handling a user command now, to temporarily silence
 * event watchers, then automatically un-silence them after a short delay.
 * This prevents us from speaking that something has focused when the
 * focusing was a result of a ChromeVox action.
 * @private
 */
cvox.ChromeVoxUserCommands.markInUserCommand_ = function() {
  cvox.ChromeVoxUserCommands.userCommandLevel_ += 1;
  setTimeout(function() {
    cvox.ChromeVoxUserCommands.userCommandLevel_ -= 1;
  }, 100);
};


/**
 * @return {boolean} True if we're handling a user command now.
 */
cvox.ChromeVoxUserCommands.isInUserCommand = function() {
  return (cvox.ChromeVoxUserCommands.userCommandLevel_ > 0);
};


/**
 * Handles TAB navigation by putting focus at the user's position.
 * This function will create dummy nodes if there is nothing that
 * is focusable at the current position.
 *
 * @return {boolean} Always return true since we rely on the default action.
 */
cvox.ChromeVoxUserCommands.commands['handleTab'] = function() {
  // Clean up after any previous runs
  var previousDummySpan = document.getElementById('ChromeVoxTabDummySpan');
  if (previousDummySpan) {
    previousDummySpan.parentNode.removeChild(previousDummySpan);
  }

  // Hide the search widget if it is shown.
  cvox.ChromeVoxSearch.hide();

  var tagName = 'A';
  // If the user is already focused on a link or control,
  // nothing more needs to be done.
  if ((document.activeElement.tagName == tagName) ||
      cvox.DomUtil.isControl(document.activeElement)) {
    return true;
  }

  // Try to find something reasonable to focus on in the current selection.
  var sel = window.getSelection();
  if (sel == null || sel.anchorNode == null || sel.focusNode == null) {
    return true;
  }
  if (sel.anchorNode.tagName &&
      ((sel.anchorNode.tagName == tagName) ||
      cvox.DomUtil.isControl(sel.anchorNode))) {
    sel.anchorNode.focus();
    return true;
  }
  if (sel.focusNode.tagName &&
      ((sel.focusNode.tagName == tagName) ||
      cvox.DomUtil.isControl(sel.focusNode))) {
    sel.focusNode.focus();
    return true;
  }
  if (sel.anchorNode.parentNode.tagName &&
      ((sel.anchorNode.parentNode.tagName == tagName) ||
      cvox.DomUtil.isControl(sel.anchorNode.parentNode))) {
    sel.anchorNode.parentNode.focus();
    return true;
  }
  if (sel.focusNode.parentNode.tagName &&
      ((sel.focusNode.parentNode.tagName == tagName) ||
      cvox.DomUtil.isControl(sel.focusNode))) {
    sel.focusNode.parentNode.focus();
    return true;
  }

  // Create a dummy span immediately before the current position and focus
  // on it so that the default tab action will start off as close to the
  // user's current position as possible.
  var span = document.createElement('span');
  span.id = 'ChromeVoxTabDummySpan';
  sel.anchorNode.parentNode.insertBefore(span, sel.anchorNode);
  span.tabIndex = -1;
  span.focus();
  return true;
};


/**
 * Toggles between searching and browsing.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['toggleSearchWidget'] = function() {
  if (cvox.ChromeVoxSearch.isActive()) {
    cvox.ChromeVoxSearch.hide();
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Browse');
  } else {
    cvox.ChromeVoxSearch.show();
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Search');
  }
  return false;
};


/**
 * Cycles through the Text-To-Speech Engines.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['nextTtsEngine'] = function() {
  cvox.ChromeVox.tts.nextEngine();
  return false;
};


/**
 * Decreases the tts rate.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['decreaseTtsRate'] = function() {
  cvox.ChromeVox.tts.decreaseProperty('Rate', true);
  return false;

};


/**
 * Increases the tts rate.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['increaseTtsRate'] = function() {
  cvox.ChromeVox.tts.increaseProperty('Rate', true);
  return false;
};


/**
 * Decreases the tts pitch.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['decreaseTtsPitch'] = function() {
  cvox.ChromeVox.tts.decreaseProperty('Pitch', true);
  return false;
};


/**
 * Increases the tts pitch.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['increaseTtsPitch'] = function() {
  cvox.ChromeVox.tts.increaseProperty('Pitch', true);
  return false;
};


/**
 * Decreases the tts volume.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['decreaseTtsVolume'] = function() {
  cvox.ChromeVox.tts.decreaseProperty('Volume', true);
  return false;
};


/**
 * Increases the tts volume.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['increaseTtsVolume'] = function() {
  cvox.ChromeVox.tts.increaseProperty('Volume', true);
  return false;
};


/**
 * Opens the ChromeVox help documentation.
 *
 * @return {boolean} Always return false since we want to prevent the default
 * action.
 */
cvox.ChromeVoxUserCommands.commands['help'] = function() {
  cvox.ExtensionBridge.send({
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
  cvox.ExtensionBridge.send({
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
  cvox.ExtensionBridge.send({
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
  cvox.ExtensionBridge.send({
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


//
// Mode commands - change modes


/**
 * Look into a table.
 */
cvox.ChromeVoxUserCommands.commands['enterTable'] = function() {
  if (cvox.ChromeVox.navigationManager.enterTable()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('Inside table ');
  } else {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('No table found.');
  }
};


/**
 * End looking at a table.
 */
cvox.ChromeVoxUserCommands.commands['exitTable'] = function() {
  cvox.ChromeVox.navigationManager.exitTable();

  cvox.ChromeVoxUserCommands.finishNavCommand('Leaving table. ');
};


/**
 * Move to the previous row of a table.
 */
cvox.ChromeVoxUserCommands.commands['previousRow'] = function() {
  if (! cvox.ChromeVox.navigationManager.inTableMode()) {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
    return;
  }
  if (cvox.ChromeVox.navigationManager.previousRow()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('No cell above.');
  }
};


/**
 * Move to the next row of a table.
 */
cvox.ChromeVoxUserCommands.commands['nextRow'] = function() {
  if (! cvox.ChromeVox.navigationManager.inTableMode()) {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
    return;
  }
  if (cvox.ChromeVox.navigationManager.nextRow()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('No cell below.');
  }
};


/**
 * Move to the previous column of a table.
 */
cvox.ChromeVoxUserCommands.commands['previousCol'] = function() {
  if (! cvox.ChromeVox.navigationManager.inTableMode()) {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
    return;
  }
  if (cvox.ChromeVox.navigationManager.previousCol()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('No cell on left.');
  }
};


/**
 * Move to the next column of a table.
 */
cvox.ChromeVoxUserCommands.commands['nextCol'] = function() {
  if (! cvox.ChromeVox.navigationManager.inTableMode()) {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
    return;
  }
  if (cvox.ChromeVox.navigationManager.nextCol()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('No cell on right.');
  }
};


/**
 * Announce the headers of the current cell
 */
cvox.ChromeVoxUserCommands.commands['announceHeaders'] = function() {
  if (! cvox.ChromeVox.navigationManager.inTableMode()) {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
    return;
  }
  var rowHeader = cvox.ChromeVox.navigationManager.getRowHeaderText();
  var colHeader = cvox.ChromeVox.navigationManager.getColHeaderText();
  if (rowHeader != '') {
    cvox.ChromeVox.tts.speak('Row header: ' + rowHeader, 0, null);
  }
  if (colHeader != '') {
    cvox.ChromeVox.tts.speak('Column header: ' + colHeader, 1, null);
  }
  if ((rowHeader == '') && (colHeader == '')) {
    cvox.ChromeVox.tts.speak('No headers', 0, null);
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
  if (! cvox.ChromeVox.navigationManager.inTableMode()) {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
    return;
  }

  var description = '';
  description += ('Row ' +
      cvox.ChromeVox.navigationManager.getRowIndex() + ' of ' +
      cvox.ChromeVox.navigationManager.getRowCount() + ', Column ' +
      cvox.ChromeVox.navigationManager.getColIndex() + ' of ' +
      cvox.ChromeVox.navigationManager.getColCount());

  cvox.ChromeVox.tts.speak(description, 0, null);
};


/**
 * Announce the row header (or best guess) of the current cell.
 */
cvox.ChromeVoxUserCommands.commands['guessRowHeader'] = function() {
  if (! cvox.ChromeVox.navigationManager.inTableMode()) {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
    return;
  }
  var rowHeader = cvox.ChromeVox.navigationManager.getRowHeaderText();
  if (rowHeader != '') {
    cvox.ChromeVox.tts.speak('Row header: ' + rowHeader, 0, null);
  }
  else {
    // No explicit row header, ask for best guess
    var guessRowHeader = cvox.ChromeVox.navigationManager.getRowHeaderGuess();
    cvox.ChromeVox.tts.speak('Row header: ' + guessRowHeader, 0, null);
  }
};


/**
 * Announce the column header (or best guess) of the current cell.
 */
cvox.ChromeVoxUserCommands.commands['guessColHeader'] = function() {
  if (! cvox.ChromeVox.navigationManager.inTableMode()) {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
    return;
  }
  var colHeader = cvox.ChromeVox.navigationManager.getColHeaderText();
  if (colHeader != '') {
    cvox.ChromeVox.tts.speak('Col header: ' + colHeader, 0, null);
  }
  else {
    // No explicit col header, ask for best guess
    var guessColHeader = cvox.ChromeVox.navigationManager.getColHeaderGuess();
    cvox.ChromeVox.tts.speak('Col header: ' + guessColHeader, 0, null);
  }
};


/**
 * Skip to the first cell of a table.
 */
cvox.ChromeVoxUserCommands.commands['skipToBeginning'] = function() {
  if (cvox.ChromeVox.navigationManager.goToFirstCell()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
  }
};


/**
 * Skip to the last cell of a table.
 */
cvox.ChromeVoxUserCommands.commands['skipToEnd'] = function() {
  if (cvox.ChromeVox.navigationManager.goToLastCell()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
  }
};


/**
 * Skip to the first cell of the current row of a table.
 */
cvox.ChromeVoxUserCommands.commands['skipToRowBeginning'] = function() {
  if (cvox.ChromeVox.navigationManager.goToRowFirstCell()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
  }
};


/**
 * Skip to the last cell of the current row of a table.
 */
cvox.ChromeVoxUserCommands.commands['skipToRowEnd'] = function() {
  if (cvox.ChromeVox.navigationManager.goToRowLastCell()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
  }
};


/**
 * Skip to the first cell of the current column of a table.
 */
cvox.ChromeVoxUserCommands.commands['skipToColBeginning'] = function() {
  if (cvox.ChromeVox.navigationManager.goToColFirstCell()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
  }
};


/**
 * Skip to the last cell of the current column of a table.
 */
cvox.ChromeVoxUserCommands.commands['skipToColEnd'] = function() {
  if (cvox.ChromeVox.navigationManager.goToColLastCell()) {
    cvox.ChromeVoxUserCommands.finishNavCommand('');
  } else {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('Not inside table.');
  }
};


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
      cvox.ChromeVoxUserCommands.checkboxPredicate_,
      'No next checkbox.');
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
      cvox.ChromeVoxUserCommands.checkboxPredicate_,
      'No previous checkbox.');
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
      cvox.ChromeVoxUserCommands.radioPredicate_,
      'No next radio button.');
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
      cvox.ChromeVoxUserCommands.radioPredicate_,
      'No previous radio button.');
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
      cvox.ChromeVoxUserCommands.sliderPredicate_,
      'No next slider.');
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
      cvox.ChromeVoxUserCommands.sliderPredicate_,
      'No previous slider.');
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
      cvox.ChromeVoxUserCommands.graphicPredicate_,
      'No next graphic.');
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
      cvox.ChromeVoxUserCommands.graphicPredicate_,
      'No previous graphic.');
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
      cvox.ChromeVoxUserCommands.buttonPredicate_,
      'No next button.');
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
      cvox.ChromeVoxUserCommands.buttonPredicate_,
      'No previous button.');
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
      cvox.ChromeVoxUserCommands.comboBoxPredicate_,
      'No next combo box.');
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
      cvox.ChromeVoxUserCommands.comboBoxPredicate_,
      'No previous combo box.');
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
      cvox.ChromeVoxUserCommands.editTextPredicate_,
      'No next editable text field.');
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
      cvox.ChromeVoxUserCommands.editTextPredicate_,
      'No previous editable text field.');
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
      cvox.ChromeVoxUserCommands.headingPredicate_,
      'No next heading.');
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
      cvox.ChromeVoxUserCommands.headingPredicate_,
      'No previous heading.');
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
      cvox.ChromeVoxUserCommands.heading1Predicate_,
      'No next level 1 heading.');
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
      cvox.ChromeVoxUserCommands.heading1Predicate_,
      'No previous level 1 heading.');
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
      cvox.ChromeVoxUserCommands.heading2Predicate_,
      'No next level 2 heading.');
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
      cvox.ChromeVoxUserCommands.heading2Predicate_,
      'No previous level 2 heading.');
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
      cvox.ChromeVoxUserCommands.heading3Predicate_,
      'No next level 3 heading.');
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
      cvox.ChromeVoxUserCommands.heading3Predicate_,
      'No previous level 3 heading.');
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
      cvox.ChromeVoxUserCommands.heading4Predicate_,
      'No next level 4 heading.');
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
      cvox.ChromeVoxUserCommands.heading4Predicate_,
      'No previous level 4 heading.');
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
      cvox.ChromeVoxUserCommands.heading5Predicate_,
      'No next level 5 heading.');
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
      cvox.ChromeVoxUserCommands.heading5Predicate_,
      'No previous level 5 heading.');
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
      cvox.ChromeVoxUserCommands.heading6Predicate_,
      'No next level 6 heading.');
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
      cvox.ChromeVoxUserCommands.heading6Predicate_,
      'No previous level 6 heading.');
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
      cvox.ChromeVoxUserCommands.notLinkPredicate_,
      'No next item that isn\'t a link.');
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
      cvox.ChromeVoxUserCommands.notLinkPredicate_,
      'No previous item that isn\'t a link.');
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
      cvox.ChromeVoxUserCommands.linkPredicate_,
      'No next link.');
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
      cvox.ChromeVoxUserCommands.linkPredicate_,
      'No previous link.');
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
      cvox.ChromeVoxUserCommands.tablePredicate_,
      'No next table.');
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
      cvox.ChromeVoxUserCommands.tablePredicate_,
      'No previous table.');
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
      cvox.ChromeVoxUserCommands.listPredicate_,
      'No next list.');
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
      cvox.ChromeVoxUserCommands.listPredicate_,
      'No previous list.');
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
      cvox.ChromeVoxUserCommands.listItemPredicate_,
      'No next list item.');
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
      cvox.ChromeVoxUserCommands.listItemPredicate_,
      'No previous list item.');
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
      cvox.ChromeVoxUserCommands.blockquotePredicate_,
      'No next blockquote.');
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
      cvox.ChromeVoxUserCommands.blockquotePredicate_,
      'No previous blockquote.');
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
      cvox.ChromeVoxUserCommands.formFieldPredicate_,
      'No next form field.');
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
      cvox.ChromeVoxUserCommands.formFieldPredicate_,
      'No previous form field.');
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
  var actionTaken = cvox.ChromeVox.navigationManager.actOnCurrentItem();
  if (!actionTaken) {
    cvox.ChromeVoxUserCommands.speakAtLowerPitch('No actions available.');
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
  cvox.ChromeVoxUserCommands.speakAtLowerPitch('Clicked.');
  cvox.DomUtil.clickElem(cvox.ChromeVox.navigationManager.currentNode, false);
  return false;
};


//
// Predicates - functions that take an array of ancestor nodes that have
// changed and returns true if a certain category has been found. Used for
// implementing functions like nextCheckbox / prevCheckbox, and so on.
//


/**
 * Checkbox.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a checkbox.
 * @private
 */
cvox.ChromeVoxUserCommands.checkboxPredicate_ = function(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].role == 'checkbox' ||
        (nodes[i].tagName == 'INPUT' && nodes[i].type == 'checkbox')) {
      return nodes[i];
    }
  }
  return null;
};


/**
 * Radio button.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a radio button.
 * @private
 */
cvox.ChromeVoxUserCommands.radioPredicate_ = function(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].role == 'radio' ||
        (nodes[i].tagName == 'INPUT' && nodes[i].type == 'radio')) {
      return nodes[i];
    }
  }
  return null;
};


/**
 * Slider.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a slider.
 * @private
 */
cvox.ChromeVoxUserCommands.sliderPredicate_ = function(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].role == 'slider' ||
        (nodes[i].tagName == 'INPUT' && nodes[i].type == 'range')) {
      return nodes[i];
    }
  }
  return null;
};


/**
 * Graphic.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a graphic.
 * @private
 */
cvox.ChromeVoxUserCommands.graphicPredicate_ = function(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].tagName == 'IMG' ||
        (nodes[i].tagName == 'INPUT' && nodes[i].type == 'img')) {
      return nodes[i];
    }
  }
  return null;
};


/**
 * Button.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a button.
 * @private
 */
cvox.ChromeVoxUserCommands.buttonPredicate_ = function(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].role == 'button' ||
        nodes[i].tagName == 'BUTTON' ||
        (nodes[i].tagName == 'INPUT' && nodes[i].type == 'submit') ||
        (nodes[i].tagName == 'INPUT' && nodes[i].type == 'reset')) {
      return nodes[i];
    }
  }
  return null;
};


/**
 * Combo box.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a combo box.
 * @private
 */
cvox.ChromeVoxUserCommands.comboBoxPredicate_ = function(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].role == 'combobox' || nodes[i].tagName == 'SELECT') {
      return nodes[i];
    }
  }
  return null;
};


/**
 * Editable text field.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is an editable text field.
 * @private
 */
cvox.ChromeVoxUserCommands.editTextPredicate_ = function(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].role == 'textbox' ||
        nodes[i].tagName == 'TEXTAREA' ||
        (nodes[i].tagName == 'INPUT' &&
        cvox.DomUtil.isInputTypeText(nodes[i]))) {
      return nodes[i];
    }
  }
  return null;
};


/**
 * Heading.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a heading.
 * @private
 */
cvox.ChromeVoxUserCommands.headingPredicate_ = function(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].role == 'heading') {
      return nodes[i];
    }
    switch (nodes[i].tagName) {
      case 'H1':
      case 'H2':
      case 'H3':
      case 'H4':
      case 'H5':
      case 'H6':
        return nodes[i];
    }
  }
  return null;
};


/**
 * Heading level 1.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a heading level 1.
 * TODO: handle ARIA headings with ARIA heading levels?
 * @private
 */
cvox.ChromeVoxUserCommands.heading1Predicate_ = function(nodes) {
  return cvox.ChromeVoxUserCommands.containsTagName_(nodes, 'H1');
};


/**
 * Heading level 2.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a heading level 2.
 * @private
 */
cvox.ChromeVoxUserCommands.heading2Predicate_ = function(nodes) {
  return cvox.ChromeVoxUserCommands.containsTagName_(nodes, 'H2');
};


/**
 * Heading level 3.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a heading level 3.
 * @private
 */
cvox.ChromeVoxUserCommands.heading3Predicate_ = function(nodes) {
  return cvox.ChromeVoxUserCommands.containsTagName_(nodes, 'H3');
};


/**
 * Heading level 4.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a heading level 4.
 * @private
 */
cvox.ChromeVoxUserCommands.heading4Predicate_ = function(nodes) {
  return cvox.ChromeVoxUserCommands.containsTagName_(nodes, 'H4');
};


/**
 * Heading level 5.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a heading level 5.
 * @private
 */
cvox.ChromeVoxUserCommands.heading5Predicate_ = function(nodes) {
  return cvox.ChromeVoxUserCommands.containsTagName_(nodes, 'H5');
};


/**
 * Heading level 6.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a heading level 6.
 * @private
 */
cvox.ChromeVoxUserCommands.heading6Predicate_ = function(nodes) {
  return cvox.ChromeVoxUserCommands.containsTagName_(nodes, 'H6');
};


/**
 * Not-link.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {boolean} True if none of the items in the array is a link.
 * @private
 */
cvox.ChromeVoxUserCommands.notLinkPredicate_ = function(nodes) {
  return cvox.ChromeVoxUserCommands.linkPredicate_(nodes) == null;
};


/**
 * Link.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a link.
 * @private
 */
cvox.ChromeVoxUserCommands.linkPredicate_ = function(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].role == 'link' || nodes[i].tagName == 'A') {
      return nodes[i];
    }
  }
  return null;
};


/**
 * Table.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a table.
 * @private
 */
cvox.ChromeVoxUserCommands.tablePredicate_ = function(nodes) {
  return cvox.ChromeVoxUserCommands.containsTagName_(nodes, 'TABLE');
};


/**
 * List.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a list.
 * @private
 */
cvox.ChromeVoxUserCommands.listPredicate_ = function(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].tagName == 'UL' || nodes[i].tagName == 'OL') {
      return nodes[i];
    }
  }
  return null;
};


/**
 * List item.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a list item.
 * @private
 */
cvox.ChromeVoxUserCommands.listItemPredicate_ = function(nodes) {
  return cvox.ChromeVoxUserCommands.containsTagName_(nodes, 'LI');
};


/**
 * Blockquote.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is a blockquote.
 * @private
 */
cvox.ChromeVoxUserCommands.blockquotePredicate_ = function(nodes) {
  return cvox.ChromeVoxUserCommands.containsTagName_(nodes, 'BLOCKQUOTE');
};


/**
 * Form field.
 * @param {Array.<Node>} nodes An array of nodes to check.
 * @return {?Node} Node in the array that is any type of form field.
 * @private
 */
cvox.ChromeVoxUserCommands.formFieldPredicate_ = function(nodes) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].role == 'button' ||
        nodes[i].role == 'checkbox' ||
        nodes[i].role == 'combobox' ||
        nodes[i].role == 'radio' ||
        nodes[i].role == 'slider' ||
        nodes[i].role == 'spinbutton' ||
        nodes[i].role == 'textbox' ||
        nodes[i].tagName == 'INPUT' ||
        nodes[i].tagName == 'SELECT' ||
        nodes[i].tagName == 'BUTTON') {
      return nodes[i];
    }
  }
  return null;
};

