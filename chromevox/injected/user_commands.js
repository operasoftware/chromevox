// Copyright 2013 Google Inc.
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
goog.require('cvox.FocusUtil');
goog.require('cvox.KeyboardHelpWidget');
goog.require('cvox.NodeSearchWidget');
goog.require('cvox.PlatformUtil');
goog.require('cvox.SearchWidget');
goog.require('cvox.SelectWidget');
goog.require('cvox.TypingEcho');
goog.require('cvox.UserEventDetail');


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
 *                         nodeList: (undefined|string),
 *                         platformFilter: (undefined|cvox.PlatformFilter),
 *                         skipInput: (undefined|boolean),
 *                         allowEvents: (undefined|boolean),
 *                         allowContinuation: (undefined|boolean)
 *                         }>}
 *  forward: Whether this command points forward.
 *  backward: Whether this command points backward. If neither forward or
 *            backward are specified, it stays facing in the current direction.
 *  announce: Whether to call finishNavCommand and announce the current
 *            position after the command is done.
 *  findNext: The id from the map above if this command is used for
 *            finding next/previous of something.
 *  doDefault: Whether to do the default action. This means that keys will be
 *             passed through to the usual DOM capture/bubble phases.
 *  nodeList: The id from the map above if this command is used for
 *            showing a list of nodes.
 *  platformFilter: Specifies to which platforms this command applies. If left
 *                  undefined, the command applies to all platforms.
 *  skipInput: Explicitly skips this command when text input has focus.
 *             Defaults to false.
 *  allowEvents: Allows EventWatcher to continue processing events which can
 * trump TTS.
 *  allowContinuation: Allows continuous read to proceed even if the command
 * results in speech.
 * @private
 */
cvox.ChromeVoxUserCommands.CMD_WHITELIST_ = {
  'forward': {forward: true, announce: true},
  'backward': {backward: true, announce: true},
  'right': {forward: true, announce: true},
  'left': {backward: true, announce: true},
  'skipForward': {forward: true, announce: false, allowContinuation: true},
  'skipBackward': {backward: true, announce: false, allowContinuation: true},
  'previousGranularity': {announce: true},
  'nextGranularity': {announce: true},

  'previousCharacter': {backward: true, announce: true, skipInput: true},
  'nextCharacter': {forward: true, announce: true, skipInput: true},
  'previousWord': {backward: true, announce: true, skipInput: true},
  'nextWord': {forward: true, announce: true, skipInput: true},
  'previousLine': {backward: true, announce: true},
  'nextLine': {forward: true, announce: true},
  'previousSentence': {backward: true, announce: true, skipInput: true},
  'nextSentence': {forward: true, announce: true, skipInput: true},
  'previousObject': {backward: true, announce: true},
  'nextObject': {forward: true, announce: true},
  'previousGroup': {backward: true, announce: true, skipInput: true},
  'nextGroup': {forward: true, announce: true, skipInput: true},

  'cycleTypingEcho': {announce: false},

  'jumpToTop': {forward: true, announce: true},
  'jumpToBottom': {backward: true, announce: true},
  'moveToStartOfLine': {forward: true, announce: true},
  'moveToEndOfLine': {backward: true, announce: true},
  'readFromHere': {forward: true, announce: false},
  'stopSpeech': {announce: false, doDefault: true},

  'toggleKeyboardHelp': {announce: false},
  'help': {announce: false},
  'contextMenu': {announce: false},

  'showBookmarkManager': {announce: false},
  'showOptionsPage': {announce: false},
  'showKbExplorerPage': {announce: false},
  'readLinkURL': {announce: false},
  'readCurrentTitle': {announce: false},
  'readCurrentURL': {announce: false},
  'announceHeaders': {announce: false},
  'speakTableLocation': {announce: false},
  'forceClickOnCurrentItem': {announce: true, allowEvents: true},
  'forceDoubleClickOnCurrentItem': {announce: true, allowEvents: true},
  'toggleChromeVox': {announce: false, platformFilter: cvox.PlatformFilter.WML},
  'fullyDescribe': {announce: false},
  'toggleSelection': {announce: true},
  'startHistoryRecording': {announce: false},
  'stopHistoryRecording': {announce: false},
  'enterCssSpace': {announce: false},
  'enableConsoleTts': {announce: false},
  'autorunner': {announce: false},

  // Table Actions.
  'goToFirstCell': {announce: true},
  'goToLastCell': {announce: true},
  'goToRowFirstCell': {announce: true},
  'goToRowLastCell': {announce: true},
  'goToColFirstCell': {announce: true},
  'goToColLastCell': {announce: true},

  // Generic Actions.
  'enterShifter': {announce: true},
  'exitShifter': {announce: true},
  'exitShifterContent': {announce: true},

  'decreaseTtsRate': {announce: false, allowContinuation: true},
  'increaseTtsRate': {announce: false, allowContinuation: true},
  'decreaseTtsPitch': {announce: false, allowContinuation: true},
  'increaseTtsPitch': {announce: false, allowContinuation: true},
  'decreaseTtsVolume': {announce: false, allowContinuation: true},
  'increaseTtsVolume': {announce: false, allowContinuation: true},
  'cyclePunctuationEcho': {announce: false, allowContinuation: true},

  'toggleStickyMode': {announce: false},
  'toggleKeyPrefix': {announce: false},
  'toggleSearchWidget': {announce: false},

  'showFormsList': {announce: false, nodeList: 'formField'},
  'showHeadingsList': {announce: false, nodeList: 'heading'},
  'showLandmarksList': {announce: false, nodeList: 'landmark'},
  'showLinksList': {announce: false, nodeList: 'link'},
  'showTablesList': {announce: false, nodeList: 'table'},

  'nextArticle': {forward: true, findNext: 'article'},
  'nextButton': {forward: true, findNext: 'button'},
  'nextCheckbox': {forward: true, findNext: 'checkbox'},
  'nextComboBox': {forward: true, findNext: 'combobox'},
  'nextControl': {forward: true, findNext: 'control'},
  'nextEditText': {forward: true, findNext: 'editText'},
  'nextFormField': {forward: true, findNext: 'formField'},
  'nextGraphic': {forward: true, findNext: 'graphic'},
  'nextHeading': {forward: true, findNext: 'heading'},
  'nextHeading1': {forward: true, findNext: 'heading1'},
  'nextHeading2': {forward: true, findNext: 'heading2'},
  'nextHeading3': {forward: true, findNext: 'heading3'},
  'nextHeading4': {forward: true, findNext: 'heading4'},
  'nextHeading5': {forward: true, findNext: 'heading5'},
  'nextHeading6': {forward: true, findNext: 'heading6'},
  'nextLandmark': {forward: true, findNext: 'landmark'},
  'nextLink': {forward: true, findNext: 'link'},
  'nextList': {forward: true, findNext: 'list'},
  'nextListItem': {forward: true, findNext: 'listItem'},
  'nextMath': {forward: true, findNext: 'math'},
  'nextRadio': {forward: true, findNext: 'radio'},
  'nextSection': {forward: true, findNext: 'section'},
  'nextSlider': {forward: true, findNext: 'slider'},
  'nextTable': {forward: true, findNext: 'table'},

  'previousArticle': {backward: true, findNext: 'article'},
  'previousButton': {backward: true, findNext: 'button'},
  'previousCheckbox': {backward: true, findNext: 'checkbox'},
  'previousComboBox': {backward: true, findNext: 'combobox'},
  'previousControl': {backward: true, findNext: 'control'},
  'previousEditText': {backward: true, findNext: 'editText'},
  'previousFormField': {backward: true, findNext: 'formField'},
  'previousGraphic': {backward: true, findNext: 'graphic'},
  'previousHeading': {backward: true, findNext: 'heading'},
  'previousHeading1': {backward: true, findNext: 'heading1'},
  'previousHeading2': {backward: true, findNext: 'heading2'},
  'previousHeading3': {backward: true, findNext: 'heading3'},
  'previousHeading4': {backward: true, findNext: 'heading4'},
  'previousHeading5': {backward: true, findNext: 'heading5'},
  'previousHeading6': {backward: true, findNext: 'heading6'},
  'previousLandmark': {backward: true, findNext: 'landmark'},
  'previousLink': {backward: true, findNext: 'link'},
  'previousList': {backward: true, findNext: 'list'},
  'previousListItem': {backward: true, findNext: 'listItem'},
  'previousMath': {backward: true, findNext: 'math'},
  'previousRadio': {backward: true, findNext: 'radio'},
  'previousSection': {backward: true, findNext: 'section'},
  'previousSlider': {backward: true, findNext: 'slider'},
  'previousTable': {backward: true, findNext: 'table'},

  'openLongDesc': {announce: false},

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
 * @type {boolean} Flag to set whether or not certain user commands will be
 * first dispatched to the underlying web page. Some commands (such as finding
 * the next/prev structural element) may be better implemented by the web app
 * than by ChromeVox.
 *
 * By default, this is enabled; however, for testing, we usually disable this to
 * reduce flakiness caused by event timing issues.
 *
 * TODO (clchen, dtseng): Fix testing framework so that we don't need to turn
 * this feature off at all.
 */
cvox.ChromeVoxUserCommands.enableCommandDispatchingToPage = true;


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
 * List of find next commands and their associated data.
 * @type {Object.<string, {predicate: string,
 *                         forwardError: string,
 *                         backwardError: string}>}
 *  predicate: The name of the predicate. This must be defined in DomPredicates.
 *  forwardError: The message id of the error string when moving forward.
 *  backwardError: The message id of the error string when moving backward.
 * @private
 */
cvox.ChromeVoxUserCommands.NODE_INFO_MAP_ = {
  'checkbox': {predicate: 'checkboxPredicate',
               forwardError: 'no_next_checkbox',
               backwardError: 'no_previous_checkbox',
               typeMsg: 'aria_role_checkbox'},
  'radio': {predicate: 'radioPredicate',
            forwardError: 'no_next_radio_button',
            backwardError: 'no_previous_radio_button',
            typeMsg: 'aria_role_radio'},
  'slider': {predicate: 'sliderPredicate',
             forwardError: 'no_next_slider',
             backwardError: 'no_previous_slider',
             typeMsg: 'aria_role_slider'},
  'graphic': {predicate: 'graphicPredicate',
              forwardError: 'no_next_graphic',
              backwardError: 'no_previous_graphic',
              typeMsg: 'UNUSED'},
  'article': {predicate: 'articlePredicate',
             forwardError: 'no_next_ARTICLE',
             backwardError: 'no_previous_ARTICLE',
             typeMsg: 'TAG_ARTICLE'},
  'button': {predicate: 'buttonPredicate',
             forwardError: 'no_next_button',
             backwardError: 'no_previous_button',
             typeMsg: 'aria_role_button'},
  'combobox': {predicate: 'comboBoxPredicate',
               forwardError: 'no_next_combo_box',
               backwardError: 'no_previous_combo_box',
               typeMsg: 'aria_role_combobox'},
  'editText': {predicate: 'editTextPredicate',
               forwardError: 'no_next_edit_text',
               backwardError: 'no_previous_edit_text',
               typeMsg: 'input_type_text'},
  'heading': {predicate: 'headingPredicate',
              forwardError: 'no_next_heading',
              backwardError: 'no_previous_heading',
              typeMsg: 'aria_role_heading'},
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
           backwardError: 'no_previous_link',
           typeMsg: 'aria_role_link'},
  'table': {predicate: 'tablePredicate',
            forwardError: 'no_next_table',
            backwardError: 'no_previous_table',
            typeMsg: 'table_strategy'},
  'list': {predicate: 'listPredicate',
           forwardError: 'no_next_list',
           backwardError: 'no_previous_list',
           typeMsg: 'aria_role_list'},
  'listItem': {predicate: 'listItemPredicate',
               forwardError: 'no_next_list_item',
               backwardError: 'no_previous_list_item',
               typeMsg: 'aria_role_listitem'},
  'formField': {predicate: 'formFieldPredicate',
                forwardError: 'no_next_form_field',
                backwardError: 'no_previous_form_field',
                typeMsg: 'aria_role_form'},
  'landmark': {predicate: 'landmarkPredicate',
               forwardError: 'no_next_landmark',
               backwardError: 'no_previous_landmark',
               typeMsg: 'role_landmark'},
  'math': {predicate: 'mathPredicate',
           forwardError: 'no_next_math',
           backwardError: 'no_previous_math',
           typeMsg: 'math_expr'},
  'section': {predicate: 'sectionPredicate',
           forwardError: 'no_next_section',
           backwardError: 'no_previous_section'},
  'control': {predicate: 'controlPredicate',
           forwardError: 'no_next_control',
           backwardError: 'no_previous_control'}
};



/**
 * @param {string} cmd The programmatic command name.
 * @return {function(): boolean} The callable command.
 * @private
 */
cvox.ChromeVoxUserCommands.createCommand_ = function(cmd) {
  return goog.bind(function() {
    return cvox.ChromeVoxUserCommands.dispatchCommand_(cmd);
  }, cvox.ChromeVoxUserCommands);
};


/**
 * @param {string} cmd The command to do.
 * @return {boolean} False to prevent the default action. True otherwise.
 * @private
 */
cvox.ChromeVoxUserCommands.dispatchCommand_ = function(cmd) {
  if (cvox.Widget.isActive()) {
    return true;
  }
  var cmdStruct = cvox.ChromeVoxUserCommands.CMD_WHITELIST_[cmd];
  if (!cmdStruct) {
    throw 'Invalid command: ' + cmd;
  }
  if (!cvox.PlatformUtil.matchesPlatform(cmdStruct.platformFilter) ||
      (cmdStruct.skipInput && cvox.FocusUtil.isFocusInTextInputField())) {
    return true;
  }
  // Handle dispatching public command events
  if (cvox.ChromeVoxUserCommands.enableCommandDispatchingToPage &&
      (cvox.UserEventDetail.COMMANDS.indexOf(cmd) != -1)) {
    var detail = new cvox.UserEventDetail({command: cmd});
    var evt = detail.createEventObject();
    var currentNode = cvox.ChromeVox.navigationManager.getCurrentNode();
    if (!currentNode) {
      currentNode = document.body;
    }
    currentNode.dispatchEvent(evt);
    return false;
  }
  // Not a public command; act on this command directly.
  return cvox.ChromeVoxUserCommands.doCommand_(cmd);
};


/**
 * @param {string} cmd The command to do.
 * @param {string=} opt_status Optional string that indicates the status of this
 *     command.
 * @param {Node=} opt_resultNode Optional result node that can be included if
 *     this command was already performed successfully by the page itself.
 * @return {boolean} False to prevent the default action. True otherwise.
 * @private
 */
cvox.ChromeVoxUserCommands.doCommand_ = function(cmd, opt_status,
      opt_resultNode) {
  opt_status = opt_status || cvox.UserEventDetail.Status.PENDING;
  opt_resultNode = opt_resultNode || null;
  if (cvox.Widget.isActive()) {
    return true;
  }
  var cmdStruct = cvox.ChromeVoxUserCommands.CMD_WHITELIST_[cmd];
  if (!cmdStruct) {
    throw 'Invalid command: ' + cmd;
  }

  if (!cvox.PlatformUtil.matchesPlatform(cmdStruct.platformFilter) ||
      (cmdStruct.skipInput && cvox.FocusUtil.isFocusInTextInputField())) {
    return true;
  }

  if (!cmdStruct.allowEvents) {
    cvox.ChromeVoxEventSuspender.enterSuspendEvents();
  }

  if (!cmdStruct.allowContinuation) {
    cvox.ChromeVox.navigationManager.stopReading(false);
  }

  if (cmdStruct.forward) {
    cvox.ChromeVox.navigationManager.setReversed(false);
  } else if (cmdStruct.backward) {
    cvox.ChromeVox.navigationManager.setReversed(true);
  }

  if (cmdStruct.findNext) {
    cmd = 'find';
    cmdStruct.announce = true;
  }

  var prefixMsg = '';
  var errorMsg = '';
  var ret = false;
  switch (cmd) {
    case 'forward':
    case 'backward':
      ret = !cvox.ChromeVox.navigationManager.navigate();
      break;
    case 'right':
    case 'left':
      cvox.ChromeVox.navigationManager.subnavigate();
      break;
    case 'find':
      if (!cmdStruct.findNext) {
        throw 'Invalid find command.';
      }
      var NodeInfoStruct =
          cvox.ChromeVoxUserCommands.NODE_INFO_MAP_[cmdStruct.findNext];
      var predicateName = NodeInfoStruct.predicate;
      var predicate = cvox.DomPredicates[predicateName];
      var error = '';
      var wrap = '';
      if (cmdStruct.forward) {
        wrap = cvox.ChromeVox.msgs.getMsg('wrapped_to_top');
        error = cvox.ChromeVox.msgs.getMsg(NodeInfoStruct.forwardError);
      } else if (cmdStruct.backward) {
        wrap = cvox.ChromeVox.msgs.getMsg('wrapped_to_bottom');
        error = cvox.ChromeVox.msgs.getMsg(NodeInfoStruct.backwardError);
      }
      var found = null;
      switch (opt_status) {
        case cvox.UserEventDetail.Status.SUCCESS:
          if (opt_resultNode) {
            cvox.ChromeVox.navigationManager.updateSelToArbitraryNode(
                opt_resultNode, true);
          }
          break;
        case cvox.UserEventDetail.Status.FAILURE:
          prefixMsg = error;
          break;
        default:
          found = cvox.ChromeVox.navigationManager.findNext(
              predicate, predicateName);
          if (!found) {
            cvox.ChromeVox.navigationManager.saveSel();
            prefixMsg = wrap;
            cvox.ChromeVox.navigationManager.syncToBeginning();
            cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.WRAP);
            found = cvox.ChromeVox.navigationManager.findNext(
                predicate, predicateName, true);
            if (!found) {
              prefixMsg = error;
              cvox.ChromeVox.navigationManager.restoreSel();
            }
          }
          break;
      }
      // NavigationManager performs announcement inside of frames when finding.
      if (found && found.start.node.tagName == 'IFRAME') {
        cmdStruct.announce = false;
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

    case 'previousCharacter':
      cvox.ChromeVox.navigationManager.navigate(false,
          cvox.NavigationShifter.GRANULARITIES.CHARACTER);
      break;
    case 'nextCharacter':
      cvox.ChromeVox.navigationManager.navigate(false,
          cvox.NavigationShifter.GRANULARITIES.CHARACTER);
      break;

    case 'previousWord':
      cvox.ChromeVox.navigationManager.navigate(false,
          cvox.NavigationShifter.GRANULARITIES.WORD);
      break;
    case 'nextWord':
      cvox.ChromeVox.navigationManager.navigate(false,
          cvox.NavigationShifter.GRANULARITIES.WORD);
      break;

    case 'previousSentence':
      cvox.ChromeVox.navigationManager.navigate(false,
          cvox.NavigationShifter.GRANULARITIES.SENTENCE);
      break;
    case 'nextSentence':
      cvox.ChromeVox.navigationManager.navigate(false,
          cvox.NavigationShifter.GRANULARITIES.SENTENCE);
      break;

    case 'previousLine':
      cvox.ChromeVox.navigationManager.navigate(false,
          cvox.NavigationShifter.GRANULARITIES.LINE);
      break;
    case 'nextLine':
      cvox.ChromeVox.navigationManager.navigate(false,
          cvox.NavigationShifter.GRANULARITIES.LINE);
      break;

    case 'previousObject':
      cvox.ChromeVox.navigationManager.navigate(false,
          cvox.NavigationShifter.GRANULARITIES.OBJECT);
      break;
    case 'nextObject':
      cvox.ChromeVox.navigationManager.navigate(false,
          cvox.NavigationShifter.GRANULARITIES.OBJECT);
      break;

    case 'previousGroup':
      cvox.ChromeVox.navigationManager.navigate(false,
          cvox.NavigationShifter.GRANULARITIES.GROUP);
      break;
    case 'nextGroup':
      cvox.ChromeVox.navigationManager.navigate(false,
          cvox.NavigationShifter.GRANULARITIES.GROUP);
      break;

    case 'moveToStartOfLine':
    case 'moveToEndOfLine':
      cvox.ChromeVox.navigationManager.setGranularity(
          cvox.NavigationShifter.GRANULARITIES.LINE);
      cvox.ChromeVox.navigationManager.sync();
      cvox.ChromeVox.navigationManager.collapseSelection();
      break;

    case 'readFromHere':
      cvox.ChromeVox.navigationManager.startReading(
          cvox.AbstractTts.QUEUE_MODE_FLUSH);
      break;
    case 'cycleTypingEcho':
      cvox.ChromeVox.host.sendToBackgroundPage({
        'target': 'Prefs',
        'action': 'setPref',
        'pref': 'typingEcho',
        'value': cvox.TypingEcho.cycle(cvox.ChromeVox.typingEcho),
        'announce': true
      });
      break;
    case 'jumpToTop':
      cvox.ChromeVox.navigationManager.syncToBeginning();
      break;
    case 'jumpToBottom':
      cvox.ChromeVox.navigationManager.syncToBeginning();
      break;
    case 'stopSpeech':
      cvox.ChromeVox.navigationManager.stopReading(true);
      break;
    case 'toggleKeyboardHelp':
      cvox.KeyboardHelpWidget.getInstance().toggle();
      break;
    case 'help':
      cvox.ChromeVox.tts.stop();
      cvox.ChromeVox.host.sendToBackgroundPage({
        'target': 'HelpDocs',
        'action': 'open'
      });
      break;
    case 'contextMenu':
      // Move this logic to a central dispatching class if it grows any bigger.
      var node = cvox.ChromeVox.navigationManager.getCurrentNode();
      if (node.tagName == 'SELECT' && !node.multiple) {
        new cvox.SelectWidget(node).show();
      }
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
    case 'forceClickOnCurrentItem':
      prefixMsg = cvox.ChromeVox.msgs.getMsg('element_clicked');
      var targetNode = cvox.ChromeVox.navigationManager.getCurrentNode();
      cvox.DomUtil.clickElem(targetNode, false, false);
      break;
    case 'forceDoubleClickOnCurrentItem':
      prefixMsg = cvox.ChromeVox.msgs.getMsg('element_double_clicked');
      var targetNode = cvox.ChromeVox.navigationManager.getCurrentNode();
      cvox.DomUtil.clickElem(targetNode, false, false, true);
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

    // Table actions.
    case 'goToFirstCell':
    case 'goToLastCell':
    case 'goToRowFirstCell':
    case 'goToRowLastCell':
    case 'goToColFirstCell':
    case 'goToColLastCell':
    case 'announceHeaders':
    case 'speakTableLocation':
    case 'exitShifterContent':
      if (!cvox.DomPredicates.tablePredicate(cvox.DomUtil.getAncestors(
              cvox.ChromeVox.navigationManager.getCurrentNode())) ||
          !cvox.ChromeVox.navigationManager.performAction(cmd)) {
        errorMsg = 'not_inside_table';
      }
      break;

    // Generic actions.
    case 'enterShifter':
    case 'exitShifter':
      cvox.ChromeVox.navigationManager.performAction(cmd);
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
      case 'cyclePunctuationEcho':
        cvox.ChromeVox.host.sendToBackgroundPage({
            'target': 'TTS',
            'action': 'cyclePunctuationEcho'
          });
        break;

    case 'toggleStickyMode':
      cvox.ChromeVox.host.sendToBackgroundPage({
        'target': 'Prefs',
        'action': 'setPref',
        'pref': 'sticky',
        'value': !cvox.ChromeVox.isStickyOn,
        'announce': true
      });
      break;
    case 'toggleKeyPrefix':
      cvox.ChromeVox.keyPrefixOn = !cvox.ChromeVox.keyPrefixOn;
      break;
    case 'toggleSearchWidget':
      cvox.SearchWidget.getInstance().toggle();
      break;

    case 'showHeadingsList':
    case 'showLinksList':
    case 'showFormsList':
    case 'showTablesList':
    case 'showLandmarksList':
      if (!cmdStruct.nodeList) {
        break;
      }
      var nodeListStruct =
          cvox.ChromeVoxUserCommands.NODE_INFO_MAP_[cmdStruct.nodeList];

      cvox.NodeSearchWidget.create(nodeListStruct.typeMsg,
                  cvox.DomPredicates[nodeListStruct.predicate]).show();
      break;

    case 'openLongDesc':
      var currentNode = cvox.ChromeVox.navigationManager.getCurrentNode();
      if (cvox.DomUtil.hasLongDesc(currentNode)) {
        cvox.ChromeVox.host.sendToBackgroundPage({
          'target': 'OpenTab',
          'url': currentNode.longDesc // Use .longDesc instead of getAttribute
                                      // since we want Chrome to convert the
                                      // longDesc to an absolute URL.
        });
      } else {
        cvox.ChromeVox.tts.speak(
          cvox.ChromeVox.msgs.getMsg('no_long_desc'),
          cvox.AbstractTts.QUEUE_MODE_FLUSH,
          cvox.AbstractTts.PERSONALITY_ANNOTATION);
      }
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
      cvox.ChromeVox.navigationManager.finishNavCommand(prefixMsg);
    }
  }
  if (!cmdStruct.allowEvents) {
    cvox.ChromeVoxEventSuspender.exitSuspendEvents();
  }
  return !!cmdStruct.doDefault || ret;
};


/**
 * Default handler for public user commands that are dispatched to the web app
 * first so that the web developer can handle these commands instead of
 * ChromeVox if they decide they can do a better job than the default algorithm.
 *
 * @param {Object} cvoxUserEvent The cvoxUserEvent to handle.
 */
cvox.ChromeVoxUserCommands.handleChromeVoxUserEvent = function(cvoxUserEvent) {
  var detail = new cvox.UserEventDetail(cvoxUserEvent.detail);
  if (detail.command) {
    cvox.ChromeVoxUserCommands.doCommand_(detail.command, detail.status,
        detail.resultNode);
  }
};


cvox.ChromeVoxUserCommands.init_();
