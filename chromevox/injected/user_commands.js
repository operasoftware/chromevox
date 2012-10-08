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
 * Usage:
 * If you are here, you probably want to add a new user command. Here are some
 * general steps to get you started.
 * - Pick a unique programmatic name for the command.
 * - Add something to the WHITELIST_CMD structure.
 * - Add the logic of the command to doCommand_ below. Try to reuse or group
 * your command with related commands.
 * - Add a row in cvox.CommandStore (and follow the instructions there).
 * - Add some key bindings in background/keymaps (likely one binding per
 * keymap).
 * @author clchen@google.com (Charles L. Chen)
 */


goog.provide('cvox.ChromeVoxUserCommands');

goog.require('cvox.AutoRunner');
goog.require('cvox.ChromeVox');
goog.require('cvox.ConsoleTts');
goog.require('cvox.CssSpace');
goog.require('cvox.DomPredicates');
goog.require('cvox.DomUtil');
goog.require('cvox.KeyboardHelpWidget');
goog.require('cvox.NodeChooserWidget');
goog.require('cvox.PlatformUtil');
goog.require('cvox.SearchWidget');


// TODO(stoarca): First, delete 75% of this functionality. Second,
// write functions (one function per group instead of one function per
// command) for the groups remaining so that the switch statement
// in the doCommand_() delegates to those functions.
/**
 * List of commands and their properties
 * @type {Object.<string, {forward: (undefined|boolean),
 *                         backward: (undefined|boolean),
 *                         announce: boolean,
 *                         findNext: (undefined|string),
 *                         doDefault: (undefined|boolean),
 *platformFilter: (undefined|cvox.PlatformFilter)
 *                         }>}
 *  forward: Whether this command points forward.
 *  backward: Whether this command points backward. If neither forward or
 *    backward are specified, it stays facing in the current direction.
 *  announce: Whether to call finishNavCommand and announce the current
 *    position after the command is done.
 *  findNext: The id from the map above if this command is used for
 *    finding next/previous of something
 *  doDefault: Whether to do the default action. This means that keys will be
 *             passed through to the usual DOM capture/bubble phases.
 * platformFilter: Specifies to which platforms this command applies. If left
 *                 undefined, the command applies to all platforms.
 * @private
 */
cvox.ChromeVoxUserCommands.CMD_WHITELIST_ = {
  'forward': {forward: true, announce: true},
  'backward': {backward: true, announce: true},
  'right': {forward: true, announce: true},
  'left': {backward: true, announce: true},
  'skipForward': {forward: true, announce: false},
  'skipBackward': {backward: true, announce: false},
  'previousGranularity': {announce: true},
  'nextGranularity': {announce: true},
  'jumpToTop': {forward: true, announce: true},
  'readFromHere': {forward: true, announce: false},
  'stopSpeech': {announce: false, doDefault: true},
  'showPowerKey': {announce: false},
  'nextTtsEngine': {announce: false},
  'help': {announce: false},
  'showBookmarkManager': {announce: false},
  'showOptionsPage': {announce: false},
  'showKbExplorerPage': {announce: false},
  'readLinkURL': {announce: false},
  'readCurrentTitle': {announce: false},
  'readCurrentURL': {announce: false},
  'announceHeaders': {announce: false},
  'speakTableLocation': {announce: false},
  'actOnCurrentItem': {announce: false},
  'forceClickOnCurrentItem': {announce: false},
  'toggleChromeVox': {announce: false, platformFilter: cvox.PlatformFilter.WML},
  'fullyDescribe': {announce: false},
  'toggleSelection': {announce: true},
  'filterLikeCurrentItem': {announce: false},
  'startHistoryRecording': {announce: false},
  'stopHistoryRecording': {announce: false},
  'enterCssSpace': {announce: false},
  'enableConsoleTts': {announce: false},
  'autorunner': {announce: false},

  'skipToBeginning': {announce: true},
  'skipToEnd': {announce: true},
  'skipToRowBeginning': {announce: true},
  'skipToRowEnd': {announce: true},
  'skipToColBeginning': {announce: true},
  'skipToColEnd': {announce: true},

  'decreaseTtsRate': {announce: false},
  'increaseTtsRate': {announce: false},
  'decreaseTtsPitch': {announce: false},
  'increaseTtsPitch': {announce: false},
  'decreaseTtsVolume': {announce: false},
  'increaseTtsVolume': {announce: false},

  'toggleTable': {announce: true},
  'toggleStickyMode': {announce: false},
  'toggleKeyPrefix': {announce: false},
  'toggleSearchWidget': {announce: false},

  'toggleLens': {announce: false},
  'floatLens': {announce: false},
  'anchorLens': {announce: false},

  'showHeadingsList': {announce: false},
  'showLinksList': {announce: false},
  'showFormsList': {announce: false},
  'showTablesList': {announce: false},
  'showLandmarksList': {announce: false},
  'showJumpsList': {announce: false},




  'nextCheckbox': {forward: true, findNext: 'checkbox'},
  'previousCheckbox': {backward: true, findNext: 'checkbox'},
  'nextRadio': {forward: true, findNext: 'radio'},
  'previousRadio': {backward: true, findNext: 'radio'},
  'nextSlider': {forward: true, findNext: 'slider'},
  'previousSlider': {backward: true, findNext: 'slider'},
  'nextGraphic': {forward: true, findNext: 'graphic'},
  'previousGraphic': {backward: true, findNext: 'graphic'},
  'nextButton': {forward: true, findNext: 'button'},
  'previousButton': {backward: true, findNext: 'button'},
  'nextComboBox': {forward: true, findNext: 'combobox'},
  'previousComboBox': {backward: true, findNext: 'combobox'},
  'nextEditText': {forward: true, findNext: 'editText'},
  'previousEditText': {backward: true, findNext: 'editText'},
  'nextHeading': {forward: true, findNext: 'heading'},
  'previousHeading': {backward: true, findNext: 'heading'},
  'nextHeading1': {forward: true, findNext: 'heading1'},
  'previousHeading1': {backward: true, findNext: 'heading1'},
  'nextHeading2': {forward: true, findNext: 'heading2'},
  'previousHeading2': {backward: true, findNext: 'heading2'},
  'nextHeading3': {forward: true, findNext: 'heading3'},
  'previousHeading3': {backward: true, findNext: 'heading3'},
  'nextHeading4': {forward: true, findNext: 'heading4'},
  'previousHeading4': {backward: true, findNext: 'heading4'},
  'nextHeading5': {forward: true, findNext: 'heading5'},
  'previousHeading5': {backward: true, findNext: 'heading5'},
  'nextHeading6': {forward: true, findNext: 'heading6'},
  'previousHeading6': {backward: true, findNext: 'heading6'},
  'nextLink': {forward: true, findNext: 'link'},
  'previousLink': {backward: true, findNext: 'link'},
  'nextTable': {forward: true, findNext: 'table'},
  'previousTable': {backward: true, findNext: 'table'},
  'nextList': {forward: true, findNext: 'list'},
  'previousList': {backward: true, findNext: 'list'},
  'nextListItem': {forward: true, findNext: 'listItem'},
  'previousListItem': {backward: true, findNext: 'listItem'},
  'nextFormField': {forward: true, findNext: 'formField'},
  'previousFormField': {backward: true, findNext: 'formField'},
  'nextLandmark': {forward: true, findNext: 'landmark'},
  'previousLandmark': {backward: true, findNext: 'landmark'},

  'debug': {announce: false},

  'nop': {announce: false}
};


/**
 * Initializes commands map.
 * Initializes global members.
 * @private
 */
cvox.ChromeVoxUserCommands.init_ = function() {
  if (cvox.ChromeVoxUserCommands.commands) {
    return;
  } else {
    cvox.ChromeVoxUserCommands.commands = {};
  }
  for (var cmd in cvox.ChromeVoxUserCommands.CMD_WHITELIST_) {
    cvox.ChromeVoxUserCommands.commands[cmd] =
        cvox.ChromeVoxUserCommands.createCommand_(cmd);
  }

  // TODO(stoarca): These two are the only ones that do not use
  // doCommand because they require that focus events are detected.
  /**
   * Handles TAB navigation.
   * @return {boolean} True if the default action should be taken.
   */
  cvox.ChromeVoxUserCommands.commands['handleTab'] = function() {
    return cvox.ChromeVoxUserCommands.handleTabAction_();
  };

  /**
   * Handles SHIFT+TAB navigation
   * @return {boolean} True if the default action should be taken.
   */
  cvox.ChromeVoxUserCommands.commands['handleTabPrev'] = function() {
    return cvox.ChromeVoxUserCommands.handleTabAction_();
  };
};


/**
 * @type {!Object.<string, function(): boolean>}
 */
cvox.ChromeVoxUserCommands.commands;


/**
 * @type {boolean}
 * TODO (clchen, dmazzoni): Implement syncing on click to avoid needing this.
 */
cvox.ChromeVoxUserCommands.wasMouseClicked = false;


/**
 * Perform all of the actions that should happen at the end of any
 * navigation operation: update the lens, play earcons, and speak the
 * description of the object that was navigated to.
 *
 * @param {string} messagePrefixStr The string to be prepended to what
 * is spoken to the user.
 */
cvox.ChromeVoxUserCommands.finishNavCommand = function(messagePrefixStr) {
  var descriptionArray = cvox.ChromeVox.navigationManager.getDescription();

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
cvox.ChromeVoxUserCommands.findNextAndSpeak_ = function(predicate, errorStr) {
  // Don't do any navigational commands if the document is hidden from
  // screen readers.
  // TODO(stoarca): Why is this specific only to this command?
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
 */
cvox.ChromeVoxUserCommands.removeTabDummySpan = function() {
  var previousDummySpan = document.getElementById('ChromeVoxTabDummySpan');
  if (previousDummySpan && document.activeElement != previousDummySpan) {
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
 * Uses PowerKey to show a list of elements that can be navigated to.
 *
 * @param {string} errorStr A string to speak if there is nothing in the list.
 * @param {Array.<Node>} nodes The array of elements to populate the navigation
 * list.
 * @param {Array.<String>} opt_descriptionsArray Optional array of descriptions
 * for the elements; if this is null, the text of the elements will be used.
 * @private
 */
cvox.ChromeVoxUserCommands.showNavigationList_ = function(errorStr,
    nodes, opt_descriptionsArray) {
  // Do not include empty nodes in the list.
  nodes = nodes.filter(cvox.DomUtil.hasContent);
  if (nodes.length < 1) {
    cvox.ChromeVox.tts.speak(errorStr, 0,
        cvox.AbstractTts.PERSONALITY_ANNOTATION);
    return;
  }

  var widget =
      new cvox.NodeChooserWidget(nodes, opt_descriptionsArray);
  widget.show();
};


/**
 * List of find next commands and their associated data.
 * @type {Object.<string, {predicate: string,
 *                         forwardError: string,
 *                         backwardError: string}>}
 *  predicate: The name of the predicate. This must be defined in DomPredicates.
 *  forwardError: The message id of the error string when moving forward.
 *  backwardError: The message id of the error string when moving backward.
 * @private
 */
cvox.ChromeVoxUserCommands.FIND_NEXT_MAP_ = {
  'checkbox': {predicate: 'checkboxPredicate',
               forwardError: 'no_next_checkbox',
               backwardError: 'no_previous_checkbox'},
  'radio': {predicate: 'radioPredicate',
            forwardError: 'no_next_radio_button',
            backwardError: 'no_previous_radio_button'},
  'slider': {predicate: 'sliderPredicate',
             forwardError: 'no_next_slider',
             backwardError: 'no_previous_slider'},
  'graphic': {predicate: 'graphicPredicate',
              forwardError: 'no_next_graphic',
              backwardError: 'no_previous_graphic'},
  'button': {predicate: 'buttonPredicate',
             forwardError: 'no_next_button',
             backwardError: 'no_previous_button'},
  'combobox': {predicate: 'comboBoxPredicate',
               forwardError: 'no_next_combo_box',
               backwardError: 'no_previous_combo_box'},
  'editText': {predicate: 'editTextPredicate',
               forwardError: 'no_next_edit_text',
               backwardError: 'no_previous_edit_text'},
  'heading': {predicate: 'headingPredicate',
              forwardError: 'no_next_heading',
              backwardError: 'no_previous_heading'},

  // TODO(stoarca): This is just goofy. How the hell is a user supposed to
  // know what heading a website uses?
  'heading1': {predicate: 'heading1Predicate',
               forwardError: 'no_next_heading_1',
               backwardError: 'no_previous_heading_1'},
  'heading2': {predicate: 'heading2Predicate',
               forwardError: 'no_next_heading_2',
               backwardError: 'no_previous_heading_2'},
  'heading3': {predicate: 'heading3Predicate',
               forwardError: 'no_next_heading_3',
               backwardError: 'no_previous_heading_3'},
  'heading4': {predicate: 'heading4Predicate',
               forwardError: 'no_next_heading_4',
               backwardError: 'no_previous_heading_4'},
  'heading5': {predicate: 'heading5Predicate',
               forwardError: 'no_next_heading_5',
               backwardError: 'no_previous_heading_5'},
  'heading6': {predicate: 'heading6Predicate',
               forwardError: 'no_next_heading_6',
               backwardError: 'no_previous_heading_6'},

  'link': {predicate: 'linkPredicate',
           forwardError: 'no_next_link',
           backwardError: 'no_previous_link'},
  'table': {predicate: 'tablePredicate',
            forwardError: 'no_next_table',
            backwardError: 'no_previous_table'},
  'list': {predicate: 'listPredicate',
           forwardError: 'no_next_list',
           backwardError: 'no_previous_list'},
  'listItem': {predicate: 'listItemPredicate',
               forwardError: 'no_next_list_item',
               backwardError: 'no_previous_list_item'},
  'formField': {predicate: 'formFieldPredicate',
                forwardError: 'no_next_form_field',
                backwardError: 'no_previous_form_field'},
  'landmark': {predicate: 'landmarkPredicate',
               forwardError: 'no_next_landmark',
               backwardError: 'no_previous_landmark'}
};


/**
 * @param {string} cmd The programmatic command name.
 * @return {function(): boolean} The callable command.
 * @private
 */
cvox.ChromeVoxUserCommands.createCommand_ = function(cmd) {
  return goog.bind(function() {
    return cvox.ChromeVoxUserCommands.doCommand_(cmd);
  }, cvox.ChromeVoxUserCommands);
};

/**
 * @param {string} cmd The command to do.
 * @return {boolean} False to prevent the default action. True otherwise.
 * @private
 */
cvox.ChromeVoxUserCommands.doCommand_ =
    cvox.ChromeVoxEventSuspender.withSuspendedEvents(function(cmd) {
  var cmdStruct = cvox.ChromeVoxUserCommands.CMD_WHITELIST_[cmd];
  if (!cmdStruct) {
    throw 'Invalid command: ' + cmd;
  }

  if (!cvox.PlatformUtil.matchesPlatform(cmdStruct.platformFilter)) {
    return true;
  }

  if (cmdStruct.forward) {
    cvox.ChromeVox.navigationManager.setReversed(false);
  } else if (cmdStruct.backward) {
    cvox.ChromeVox.navigationManager.setReversed(true);
  }

  if (cmdStruct.findNext) {
    var findNextStruct =
        cvox.ChromeVoxUserCommands.FIND_NEXT_MAP_[cmdStruct.findNext];
    var predicate = cvox.DomPredicates[findNextStruct.predicate];
    var error = '';
    if (cmdStruct.forward) {
      error = cvox.ChromeVox.msgs.getMsg(findNextStruct.forwardError);
    } else {
      error = cvox.ChromeVox.msgs.getMsg(findNextStruct.backwardError);
    }
    cvox.ChromeVoxUserCommands.findNextAndSpeak_(predicate, error);
    return false;
  }

  var prefixMsg = '';
  var errorMsg = '';
  var ret = false;
  switch (cmd) {
    case 'forward':
    case 'backward':
      if (cvox.ChromeVox.navigationManager.isTableMode()) {
        if (!cvox.ChromeVox.navigationManager.nextRow()) {
          cvox.ChromeVox.navigationManager.tryExitTable();
        }
      } else {
        cvox.ChromeVox.navigationManager.navigate();
      }
      break;
    case 'right':
    case 'left':
      if (cvox.ChromeVox.navigationManager.isTableMode()) {
        cvox.ChromeVox.navigationManager.nextCol();
      } else {
        cvox.ChromeVox.navigationManager.subnavigate();
      }
      break;
    case 'skipForward':
    case 'skipBackward':
      ret = !cvox.ChromeVox.navigationManager.skip();
      break;
    // TODO(stoarca): Bad naming. Should be less instead of previous.
    case 'previousGranularity':
      cvox.ChromeVox.navigationManager.makeLessGranular();
      prefixMsg = cvox.ChromeVox.navigationManager.getGranularityMsg();
      break;
    case 'nextGranularity':
      cvox.ChromeVox.navigationManager.makeMoreGranular();
      prefixMsg = cvox.ChromeVox.navigationManager.getGranularityMsg();
      break;
    case 'readFromHere':
      cvox.ChromeVox.navigationManager.startReading(
          cvox.AbstractTts.QUEUE_MODE_FLUSH);
      break;
    case 'jumpToTop':
      cvox.ChromeVox.navigationManager.syncToPageBeginning();
      break;
    case 'stopSpeech':
      cvox.ChromeVox.tts.stop();
      break;
    case 'showPowerKey':
      // TODO(stoarca): There seems to not be a symmetrical command.
      // Is this supposed to live forever?
      cvox.KeyboardHelpWidget.getInstance().show();
      break;
    case 'nextTtsEngine':
      // TODO(stoarca): Implement.
      break;
    case 'help':
      cvox.ChromeVox.tts.stop();
      cvox.ChromeVox.host.sendToBackgroundPage({
        'target': 'HelpDocs',
        'action': 'open'
      });
      break;
    case 'showBookmarkManager':
      // TODO(stoarca): Should this have tts.stop()??
      cvox.ChromeVox.host.sendToBackgroundPage({
        'target': 'BookmarkManager',
        'action': 'open'
      });
      break;
    case 'showOptionsPage':
      cvox.ChromeVox.tts.stop();
      cvox.ChromeVox.host.sendToBackgroundPage({
        'target': 'Options',
        'action': 'open'
      });
      break;
    case 'showKbExplorerPage':
      cvox.ChromeVox.tts.stop();
      cvox.ChromeVox.host.sendToBackgroundPage({
        'target': 'KbExplorer',
        'action': 'open'
      });
      break;
    case 'readLinkURL':
      var activeElement = document.activeElement;
      var currentSelectionAnchor = window.getSelection().anchorNode;

      var url = '';
      if (activeElement.tagName == 'A') {
        url = cvox.DomUtil.getLinkURL(activeElement);
      } else if (currentSelectionAnchor) {
        url = cvox.DomUtil.getLinkURL(currentSelectionAnchor.parentNode);
      }

      if (url != '') {
        cvox.ChromeVox.tts.speak(url);
      } else {
        cvox.ChromeVox.tts.speak(cvox.ChromeVox.msgs.getMsg('no_url_found'));
      }
      break;
    case 'readCurrentTitle':
      cvox.ChromeVox.tts.speak(document.title);
      break;
    case 'readCurrentURL':
      cvox.ChromeVox.tts.speak(document.URL);
      break;
    case 'announceHeaders':
      cvox.ChromeVox.tts.speak(
          cvox.ChromeVox.navigationManager.getHeaderText(),
          cvox.AbstractTts.QUEUE_MODE_FLUSH,
          null);
      break;
    case 'speakTableLocation':
      var desc = cvox.ChromeVox.navigationManager.getLocationDescription();
      if (desc == null) {
        errorMsg = 'not_inside_table';
      } else {
        cvox.ChromeVox.navigationManager.speakDescriptionArray(
            desc, cvox.AbstractTts.QUEUE_MODE_FLUSH, null);
      }
      break;
    case 'actOnCurrentItem':
      ret = !cvox.ChromeVox.navigationManager.act();
      break;
    case 'forceClickOnCurrentItem':
      // TODO(stoarca): What is the difference between acting and clicking?
      // These two should be merged and "just work" instead of having the
      // user fumble around to figure out exactly what key combination to
      // press to activate something.
      cvox.ChromeVox.tts.speak(
          cvox.ChromeVox.msgs.getMsg('element_clicked'),
          0, cvox.AbstractTts.PERSONALITY_ANNOTATION);
      cvox.DomUtil.clickElem(
          cvox.ChromeVox.navigationManager.getCurrentNode(), false);
      break;
    case 'toggleChromeVox':
      cvox.ChromeVox.host.sendToBackgroundPage({
        'target': 'Prefs',
        'action': 'setPref',
        'pref': 'active',
        'value': !cvox.ChromeVox.isActive
      });
      break;
    case 'fullyDescribe':
      var descs = cvox.ChromeVox.navigationManager.getFullDescription();
      cvox.ChromeVox.navigationManager.speakDescriptionArray(
          descs,
          cvox.AbstractTts.QUEUE_MODE_FLUSH,
          null);
      break;
    case 'toggleSelection':
      var selState = cvox.ChromeVox.navigationManager.togglePageSel();
      prefixMsg = cvox.ChromeVox.msgs.getMsg(
          selState ? 'begin_selection' : 'end_selection');
    break;
    case 'filterLikeCurrentItem':
      // Compute the CSS selector based on the current node.
      // Currently only use class, id, and type CSS selectors.
      var currentNode = cvox.ChromeVox.navigationManager.getCurrentNode();
      var cssSelector = cvox.WalkerDecorator.filterForNode(currentNode);
      if (!cvox.DomUtil.hasContent(currentNode) || !cssSelector) {
        errorMsg = 'unable_to_filter';
        break;
      }

      var walkerDecorator =
          cvox.ChromeVox.navigationManager.getFilteredWalker();
      walkerDecorator.addFilter(cssSelector);
      cvox.$m('added_filter').speakFlush();
      cvox.ChromeVox.navigationManager.navigate();
      break;
    case 'startHistoryRecording':
      cvox.History.getInstance().startRecording();
      break;
    case 'stopHistoryRecording':
      cvox.History.getInstance().stopRecording();
      break;
    case 'enterCssSpace':
      cvox.CssSpace.initializeSpace();
      cvox.CssSpace.enterExploration();
      break;
    case 'enableConsoleTts':
      cvox.ConsoleTts.getInstance().setEnabled(true);
      break;
    case 'autorunner':
      var runner = new cvox.AutoRunner();
      runner.run();
      break;

    // TODO(stoarca): code repetition
    case 'skipToBeginning':
      // TODO(stoarca): This should be merged with jumpToTop
      if (!cvox.ChromeVox.navigationManager.goToFirstCell()) {
        errorMsg = 'not_inside_table';
      }
      break;
    case 'skipToEnd':
      if (!cvox.ChromeVox.navigationManager.goToLastCell()) {
        errorMsg = 'not_inside_table';
      }
      break;
    case 'skipToRowBeginning':
      if (!cvox.ChromeVox.navigationManager.goToRowFirstCell()) {
        errorMsg = 'not_inside_table';
      }
      break;
    case 'skipToRowEnd':
      if (!cvox.ChromeVox.navigationManager.goToRowLastCell()) {
        errorMsg = 'not_inside_table';
      }
      break;
    case 'skipToColBeginning':
      if (!cvox.ChromeVox.navigationManager.goToColFirstCell()) {
        errorMsg = 'not_inside_table';
      }
      break;
    case 'skipToColEnd':
      if (!cvox.ChromeVox.navigationManager.goToColLastCell()) {
        errorMsg = 'not_inside_table';
      }
      break;

    // TODO(stoarca): Code repetition.
    case 'decreaseTtsRate':
      // TODO(stoarca): This function name is way too long.
      cvox.ChromeVox.tts.increaseOrDecreaseProperty(
          cvox.AbstractTts.RATE, false);
      break;
    case 'increaseTtsRate':
      cvox.ChromeVox.tts.increaseOrDecreaseProperty(
          cvox.AbstractTts.RATE, true);
      break;
    case 'decreaseTtsPitch':
      cvox.ChromeVox.tts.increaseOrDecreaseProperty(
          cvox.AbstractTts.PITCH, false);
      break;
    case 'increaseTtsPitch':
      cvox.ChromeVox.tts.increaseOrDecreaseProperty(
          cvox.AbstractTts.PITCH, true);
      break;
    case 'decreaseTtsVolume':
      cvox.ChromeVox.tts.increaseOrDecreaseProperty(
          cvox.AbstractTts.VOLUME, false);
      break;
    case 'increaseTtsVolume':
      cvox.ChromeVox.tts.increaseOrDecreaseProperty(
          cvox.AbstractTts.VOLUME, true);
      break;

    case 'toggleTable':
      if (cvox.ChromeVox.navigationManager.isTableMode()) {
        cvox.ChromeVox.navigationManager.tryExitTable();
        prefixMsg = cvox.ChromeVox.navigationManager.getGranularityMsg();
      } else {
        cvox.ChromeVox.navigationManager.tryEnterTable({force: true});
        if (cvox.ChromeVox.navigationManager.isTableMode()) {
          prefixMsg = cvox.ChromeVox.navigationManager.getGranularityMsg();
        } else {
          prefixMsg = cvox.ChromeVox.msgs.getMsg('no_tables');
        }
      }
      break;
    case 'toggleStickyMode':
      cvox.ChromeVox.host.sendToBackgroundPage({
        'target': 'Prefs',
        'action': 'setPref',
        'pref': 'sticky',
        'value': !cvox.ChromeVox.isStickyOn
      });
      break;
    case 'toggleKeyPrefix':
      cvox.ChromeVox.keyPrefixOn = !cvox.ChromeVox.keyPrefixOn;
      break;
    case 'toggleSearchWidget':
      cvox.SearchWidget.getInstance().toggle();
      break;

    case 'toggleLens':
      var newSetting = !cvox.ChromeVox.lens.isLensDisplayed();
      cvox.ChromeVox.lens.showLens(newSetting);
      cvox.ChromeVox.host.sendToBackgroundPage({
        'target': 'Prefs',
        'action': 'setPref',
        'pref': 'lensVisible',
        'value': newSetting
      });
      break;
    case 'floatLens':
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
      break;
    case 'anchorLens':
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
      break;

    case 'showHeadingsList':
      var xpath =
          '//*[@role="heading"] | //h1 | //h2 | //h3 | //h4 | //h5 | //h6';
      cvox.ChromeVoxUserCommands.showNavigationList_(
          cvox.ChromeVox.msgs.getMsg('powerkey_no_headings'),
          cvox.XpathUtil.evalXPath(xpath, document.body), null);
      break;
    case 'showLinksList':
      var xpath = '//a';
        cvox.ChromeVoxUserCommands.showNavigationList_(
            cvox.ChromeVox.msgs.getMsg('powerkey_no_links'),
            cvox.XpathUtil.evalXPath(xpath, document.body), null);
      break;
    case 'showFormsList':
      var xpath = '//form';
      cvox.ChromeVoxUserCommands.showNavigationList_(
          cvox.ChromeVox.msgs.getMsg('powerkey_no_forms'),
          cvox.XpathUtil.evalXPath(xpath, document.body), null);
      break;
    case 'showTablesList':
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
      cvox.ChromeVoxUserCommands.showNavigationList_(
          cvox.ChromeVox.msgs.getMsg('powerkey_no_tables'),
          cvox.XpathUtil.evalXPath(xpath, document.body), null);
      break;
    case 'showLandmarksList':
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
      cvox.ChromeVoxUserCommands.showNavigationList_(
          cvox.ChromeVox.msgs.getMsg('powerkey_no_landmarks'),
          landmarkNodes, descriptions);
      break;
    case 'showJumpsList':
      var xpath = '//*[@role="application"] | //*[@role="banner"] | ' +
          '//*[@role="complementary"] | //*[@role="contentinfo"] | ' +
          '//*[@role="form"] | //*[@role="main"] | //*[@role="navigation"] | ' +
          '//*[@role="search"] | //*[@role="heading"] | //h1 | //h2 | //h3 | ' +
          '//h4 | //h5 | //h6';
      var jumpNodes = cvox.XpathUtil.evalXPath(xpath, document.body);
      var descs = new Array();
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
        descs.push(description);
      }
      cvox.ChromeVoxUserCommands.showNavigationList_(
          cvox.ChromeVox.msgs.getMsg('powerkey_no_jumps'), jumpNodes, descs);
      break;

    case 'debug':
      // TODO(stoarca): This doesn't belong here.
      break;

    case 'nop':
      break;
    default:
      throw 'Command behavior not defined: ' + cmd;
  }

  if (errorMsg != '') {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg(errorMsg),
        cvox.AbstractTts.QUEUE_MODE_FLUSH,
        cvox.AbstractTts.PERSONALITY_ANNOTATION);
  } else {
    if (cmdStruct.announce) {
      cvox.ChromeVoxUserCommands.finishNavCommand(prefixMsg);
    }
  }
  return !!cmdStruct.doDefault || ret;
});

cvox.ChromeVoxUserCommands.init_();
