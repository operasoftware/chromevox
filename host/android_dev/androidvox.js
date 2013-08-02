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
 * @fileoverview Android-specific code needed to integrate AndroidVox with
 * the accessibility framework in Android.
 *
 * @author clchen@google.com (Charles L. Chen)
 */
goog.provide('cvox.AndroidVox');

goog.require('cvox.AbstractTts');
goog.require('cvox.ApiImplementation');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxEventWatcher');
goog.require('cvox.ChromeVoxUserCommands');
goog.require('cvox.DomUtil');
goog.require('cvox.Focuser');
goog.require('cvox.SearchWidget');


/**
 * @constructor
 */
cvox.AndroidVox = function() {
  // TODO(clchen, dtseng): Don't navigate into iframes. Remove once AndroidVox
  // gets properly injected into all iframes.
  cvox.ChromeVox.navigationManager.ignoreIframesNoMatterWhat();
};
goog.exportSymbol('cvox.AndroidVox', cvox.AndroidVox);


// Returns true if the action was performed.
cvox.AndroidVox.performAction = function(actionJson) {
  // These are constants used by Android.
  var MOVEMENT_GRANULARITY_PAGE = 16;
  var MOVEMENT_GRANULARITY_PARAGRAPH = 8;
  var MOVEMENT_GRANULARITY_LINE = 4;
  var MOVEMENT_GRANULARITY_WORD = 2;
  var MOVEMENT_GRANULARITY_CHARACTER = 1;
  var ACTION_CLICK = 16;
  var ACTION_NEXT_AT_MOVEMENT_GRANULARITY = 256;
  var ACTION_NEXT_HTML_ELEMENT = 1024;
  var ACTION_PREVIOUS_AT_MOVEMENT_GRANULARITY = 512;
  var ACTION_PREVIOUS_HTML_ELEMENT = 2048;

  var FAKE_GRANULARITY_READ_CURRENT = -1;
  var FAKE_GRANULARITY_READ_TITLE = -2;
  var FAKE_GRANULARITY_STOP_SPEECH = -3;
  var FAKE_GRANULARITY_CHANGE_SHIFTER = -4;
  var FAKE_TOGGLE_INCREMENTAL_SEARCH = -5;

  // Actions in this range are reserved for Braille use.
  // TODO(jbroman): use event arguments instead of this hack.
  var FAKE_GRANULARITY_BRAILLE_CLICK_MAX = -275000000;
  var FAKE_GRANULARITY_BRAILLE_CLICK_MIN = -275999999;

  var ELEMENTNAME_SECTION = 'SECTION';
  var ELEMENTNAME_LIST = 'LIST';
  var ELEMENTNAME_CONTROL = 'CONTROL';

  // The accessibility framework in Android will send commands to AndroidVox
  // using a JSON object that contains the action, granularity, and element
  // to use for navigation.
  var jsonObj =
      /** @type {{action, granularity, element}} */ (JSON.parse(actionJson));
  var action = jsonObj.action;
  var granularity = jsonObj.granularity;
  var htmlElementName = jsonObj.element;

  var inSearchMode = cvox.SearchWidget.getInstance().isActive();

  // This is a hack because of limitations in the Android framework; we're using
  // page and previous to mean reset ChromeVox. Note that ChromeVox will reset
  // automatically at the end of a page, so this is only needed if TalkBack is
  // trying to force a position reset.
  if ((granularity == MOVEMENT_GRANULARITY_PAGE) &&
      (action == ACTION_PREVIOUS_AT_MOVEMENT_GRANULARITY)) {
    cvox.ChromeVox.navigationManager.setReversed(false);
    cvox.ChromeVox.navigationManager.syncToBeginning();
    cvox.ChromeVox.navigationManager.updateIndicator();
  }

  // This is a hack; we're using page and next to mean readFromHere since
  // there is no clean way to do this in the API given how few calls are
  // available.
  if (granularity == MOVEMENT_GRANULARITY_PAGE) {
    cvox.ChromeVoxUserCommands.commands['readFromHere']();
    return true;
  }

  // Stop speech before doing anything else. Note that this will also stop
  // any continuous reading that may be happening.
  cvox.ChromeVoxUserCommands.commands['stopSpeech']();

  // Intercept certain movement types and convert them into cursor movement
  // if a text control is being used.
  if (action == ACTION_NEXT_AT_MOVEMENT_GRANULARITY ||
      action == ACTION_PREVIOUS_AT_MOVEMENT_GRANULARITY) {
    if (!inSearchMode) {
      // Need to fix currentTextHandler.
      // This may be wrong because ChromeVox drops focus events that originate
      // from itself.
      cvox.ChromeVoxEventWatcher.setUpTextHandler();
    }
  }
  var currentTextHandler = cvox.ChromeVoxEventWatcher.currentTextHandler;
  if (!currentTextHandler && document.activeElement != document.body) {
    console.log('no text handler, but there is an active element',
        document.activeElement);
  }
  if (currentTextHandler && granularity == MOVEMENT_GRANULARITY_CHARACTER) {
    if (action == ACTION_NEXT_AT_MOVEMENT_GRANULARITY) {
      return currentTextHandler.moveCursorToNextCharacter();
    } else if (action == ACTION_PREVIOUS_AT_MOVEMENT_GRANULARITY) {
      return currentTextHandler.moveCursorToPreviousCharacter();
    }
  } else if (currentTextHandler &&
      granularity == MOVEMENT_GRANULARITY_WORD) {
    if (action == ACTION_NEXT_AT_MOVEMENT_GRANULARITY) {
      return currentTextHandler.moveCursorToNextWord();
    } else if (action == ACTION_PREVIOUS_AT_MOVEMENT_GRANULARITY) {
      return currentTextHandler.moveCursorToPreviousWord();
    }
  } else if (currentTextHandler &&
      granularity == MOVEMENT_GRANULARITY_PARAGRAPH) {
    if (action == ACTION_NEXT_AT_MOVEMENT_GRANULARITY) {
      return currentTextHandler.moveCursorToNextParagraph();
    } else if (action == ACTION_PREVIOUS_AT_MOVEMENT_GRANULARITY) {
      return currentTextHandler.moveCursorToPreviousParagraph();
    }
  } else if (currentTextHandler &&
      granularity == MOVEMENT_GRANULARITY_LINE) {
    // When navigating by line, allow escaping from the field at the ends.
    var handled = false;
    if (action == ACTION_NEXT_AT_MOVEMENT_GRANULARITY) {
      handled = currentTextHandler.moveCursorToNextLine();
    } else if (action == ACTION_PREVIOUS_AT_MOVEMENT_GRANULARITY) {
      handled = currentTextHandler.moveCursorToPreviousLine();
    }
    if (handled) {
      return true;
    }
  }

  // Hack: Using fake granularities for commands. We were using NEXT_HTML, but
  // it is unsafe for TalkBack to do this since TalkBack has no way to check if
  // ChromeVox is actually active.
  switch (granularity) {
    case FAKE_GRANULARITY_READ_CURRENT:
      cvox.ChromeVox.navigationManager.finishNavCommand('');
      return true;
    case FAKE_GRANULARITY_READ_TITLE:
      cvox.ChromeVoxUserCommands.commands.readCurrentTitle();
      return true;
    case FAKE_GRANULARITY_STOP_SPEECH:
      // Speech was already stopped, nothing more to do.
      return true;
    case FAKE_GRANULARITY_CHANGE_SHIFTER:
      if (action == ACTION_PREVIOUS_AT_MOVEMENT_GRANULARITY) {
        cvox.ChromeVoxUserCommands.commands.exitShifter();
      } else {
        cvox.ChromeVoxUserCommands.commands.enterShifter();
      }
      return true;
    case FAKE_TOGGLE_INCREMENTAL_SEARCH:
      cvox.SearchWidget.getInstance().toggle();
      return true;
  }

  // Braille clicks are currently sent under these action IDs.
  // TODO(jbroman): Remove this hack when a better way to send this information
  // exists.
  if (granularity >= FAKE_GRANULARITY_BRAILLE_CLICK_MIN &&
      granularity <= FAKE_GRANULARITY_BRAILLE_CLICK_MAX) {
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('element_clicked'),
        cvox.AbstractTts.QUEUE_MODE_FLUSH,
        cvox.AbstractTts.PERSONALITY_ANNOTATION);
    var navBraille = cvox.ChromeVox.navigationManager.getBraille();
    var clickIndex = FAKE_GRANULARITY_BRAILLE_CLICK_MAX - granularity;
    var targetNode = /** @type {!Node|undefined} */
        (navBraille.text.getSpan(clickIndex));
    if (targetNode) {
      var clickIndexInNode = clickIndex -
          navBraille.text.getSpanStart(targetNode);
      cvox.AndroidVox.performClickAction(targetNode, clickIndexInNode);
    }
    return true;
  }

  // Drop unknown fake granularities.
  if (granularity < 0) {
    return false;
  }

  // Adjust the granularity if needed
  var ANDROID_TO_CHROMEVOX_GRANULARITY_MAP = new Array();
  ANDROID_TO_CHROMEVOX_GRANULARITY_MAP[MOVEMENT_GRANULARITY_PARAGRAPH] =
      cvox.NavigationShifter.GRANULARITIES.GROUP;
  ANDROID_TO_CHROMEVOX_GRANULARITY_MAP[MOVEMENT_GRANULARITY_LINE] =
      cvox.NavigationShifter.GRANULARITIES.LINE;
  ANDROID_TO_CHROMEVOX_GRANULARITY_MAP[MOVEMENT_GRANULARITY_WORD] =
      cvox.NavigationShifter.GRANULARITIES.WORD;
  ANDROID_TO_CHROMEVOX_GRANULARITY_MAP[MOVEMENT_GRANULARITY_CHARACTER] =
      cvox.NavigationShifter.GRANULARITIES.CHARACTER;

  if (!inSearchMode) {
    var targetNavStrategy;
    if (!granularity) {
      // Default to ChromeVox DOM object navigation.
      targetNavStrategy = cvox.NavigationShifter.GRANULARITIES.OBJECT;
    } else {
      targetNavStrategy = ANDROID_TO_CHROMEVOX_GRANULARITY_MAP[granularity];
    }
    cvox.ChromeVox.navigationManager.setGranularity(targetNavStrategy);
  }

  // Perform the action - return the NOT of it since the ChromeVoxUserCommands
  // return TRUE for using the default action (ie, ChromeVox was unable to
  // perform the action and is trying to let the default handler act).
  var actionPerformed = false;

  switch (action) {
    case ACTION_CLICK:
      // Prevent clicking (and unfocusing text area) when incremental search
      // is on.
      if (inSearchMode) {
        break;
      }
      // Touches do not dispatch ACTION_CLICK, but BrailleBack does.
      // The click is sent to the current node.
      cvox.ChromeVox.tts.speak(
          cvox.ChromeVox.msgs.getMsg('element_clicked'),
          cvox.AbstractTts.QUEUE_MODE_FLUSH,
          cvox.AbstractTts.PERSONALITY_ANNOTATION);
      var targetNode = cvox.ChromeVox.navigationManager.getCurrentNode();
      if (targetNode) {
        cvox.AndroidVox.performClickAction(targetNode);
      }
      actionPerformed = true;
      break;
    case ACTION_NEXT_HTML_ELEMENT:
      switch (htmlElementName) {
        case ELEMENTNAME_SECTION:
          actionPerformed = !cvox.ChromeVoxUserCommands.commands.nextSection();
          break;
        case ELEMENTNAME_LIST:
          actionPerformed = !cvox.ChromeVoxUserCommands.commands.nextList();
          break;
        case ELEMENTNAME_CONTROL:
          actionPerformed =
              !cvox.ChromeVoxUserCommands.commands.nextControl();
          break;
      }
      if (actionPerformed) {
        // Only break if htmlElementName was valid, otherwise fall through and
        // just navigate forward.
        break;
      }
    case ACTION_NEXT_AT_MOVEMENT_GRANULARITY:
      if (inSearchMode) {
        cvox.SearchWidget.getInstance().nextResult(false /*reverse*/);
        actionPerformed = true;
      } else {
        actionPerformed = !cvox.ChromeVoxUserCommands.commands.forward();
      }
      break;
    case ACTION_PREVIOUS_HTML_ELEMENT:
      switch (htmlElementName) {
        case ELEMENTNAME_SECTION:
          actionPerformed =
              !cvox.ChromeVoxUserCommands.commands.previousSection();
          break;
        case ELEMENTNAME_LIST:
          actionPerformed = !cvox.ChromeVoxUserCommands.commands.previousList();
          break;
        case ELEMENTNAME_CONTROL:
          actionPerformed =
              !cvox.ChromeVoxUserCommands.commands.previousControl();
          break;
      }
      if (actionPerformed) {
        // Only break if htmlElementName was valid, otherwise fall through and
        // just navigate backward.
        break;
      }
    case ACTION_PREVIOUS_AT_MOVEMENT_GRANULARITY:
      if (inSearchMode) {
        cvox.SearchWidget.getInstance().nextResult(true /*reverse*/);
        actionPerformed = true;
      } else {
        actionPerformed = !cvox.ChromeVoxUserCommands.commands.backward();
      }
      break;
  }
  return actionPerformed;
};
goog.exportSymbol('cvox.AndroidVox.performAction', cvox.AndroidVox.performAction);

/**
 * Responds to a node being clicked at some offset via the Braille display.
 * @param {!Node} node Node to click.
 * @param {number=} opt_index Index into the node text which was clicked.
 */
cvox.AndroidVox.performClickAction = function(node, opt_index) {
  // As in cvox.ChromeVoxEventWatcher.mouseClickEventWatcher.
  // Consider merging.
  if (cvox.ChromeVox.navigationManager.getCurrentNode() != node) {
    cvox.ApiImplementation.syncToNode(node, false);
  }
  cvox.Focuser.setFocus(node);

  // Position the cursor within the node, if appropriate.
  // TODO(jbroman): Include contenteditable here, too.
  // TODO(jbroman): Find a cleaner way to notice the selection change.
  var hasSelectionStartAndEnd =
      cvox.DomUtil.isInputTypeText(node) ||
      node instanceof HTMLTextAreaElement;
  if (goog.isDef(opt_index) && hasSelectionStartAndEnd) {
    var nodeDescription = cvox.BrailleUtil.getTemplated(null, node);
    var valueSpan = nodeDescription.getSpanInstanceOf(
        cvox.BrailleUtil.ValueSpan);
    var valueStart = nodeDescription.getSpanStart(valueSpan);
    var valueEnd = nodeDescription.getSpanEnd(valueSpan);
    if (valueStart <= opt_index && opt_index <= valueEnd) {
      var cursorPosition = opt_index - valueStart + valueSpan.offset;
      node.selectionStart = node.selectionEnd = cursorPosition;
      cvox.ChromeVoxEventWatcher.handleTextChanged(true);
    }
  }

  cvox.DomUtil.clickElem(node, false, true);
};
