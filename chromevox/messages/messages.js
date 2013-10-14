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
 * @fileoverview Messages for ChromeVox.
 *
 * All messages should start with MSG_CHROMEVOX.
 *
 * Within ChromeVox code they should be accessed with
 *   getMsg('everything_after_chromevox_in_lower_case')
 *
 * It's recommended to define an alias at the top of a file with a lot
 * of messages.
 *   var msg = goog.bind(msgs.getMsg, msgs);
 *
 * In a pinch, you can still use chrome.i18n.getMessage('chromevox_...')
 *
 * @author deboer@google.com (James deBoer)
 */


/** @type {Object} */
var msgs = {};


/**
 * @desc The locale you're translating into. For use in URL to localized
 * pages.  e.g. http://www.google.com/?hl=en.
 */
msgs.MSG_LOCALE = goog.getMsg('en');


/**
 * @desc The product name for ChromeVox.
 */
msgs.MSG_CHROMEVOX_NAME = goog.getMsg('ChromeVox');


/**
 * @desc The product description, displayed in the Chrome Extensions
 * page.
 */
msgs.MSG_CHROMEVOX_DESCRIPTION =
    goog.getMsg('ChromeVox - Giving Voice to Chrome');


/**
 * @desc The description of the stopSpeech key.  Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_STOP_SPEECH_KEY =
    goog.getMsg('Stop speech');


/**
 * @desc The description of the toggleStickyMode key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_TOGGLE_STICKY_MODE =
    goog.getMsg('Enable/Disable sticky mode');


/**
 * @desc The description of the prefix key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREFIX_KEY =
    goog.getMsg('Prefix key');


/**
 * @desc The description of the handleTab key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_HANDLE_TAB_NEXT =
    goog.getMsg('Jump to next focusable item');


/**
 * @desc The description of the handleTab key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_HANDLE_TAB_PREV =
    goog.getMsg('Jump to previous focusable item');


/**
 * @desc The description of the backward key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_BACKWARD =
    goog.getMsg('Navigate backward');


/**
 * @desc The description of the forward key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_FORWARD =
    goog.getMsg('Navigate forward');


/**
 * @desc The description of the left key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_LEFT =
    goog.getMsg('Move left');


/**
 * @desc The description of the right key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_RIGHT =
    goog.getMsg('Move right');


/**
 * @desc The description of the skip backward key that functions only during
 * continuous reading (when ChromeVox is speaking the entire page without
 * pausing). The skip backward key allows the user to skip backward without
 * pausing the continuous reading.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SKIP_BACKWARD =
    goog.getMsg('Skip backward during continuous reading');


/**
 * @desc The description of the skip forward key that functions only during
 * continuous reading (when ChromeVox is speaking the entire page without
 * pausing). The skip forward key allows the user to skip forward without
 * pausing the continuous reading.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SKIP_FORWARD =
    goog.getMsg('Skip forward during continuous reading');


/**
 * @desc The description of the previousGranularity key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_GRANULARITY =
    goog.getMsg('Decrease navigation granularity');


/**
 * @desc The description of the nextGranularity key.  Navigation granularity can
 * be e.g. "sentence level", "word level".  Granularity is also referred as
 * "level of detail".  c.f.
 * http://chromevox.com/tutorial/text_navigation.html
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_GRANULARITY =
    goog.getMsg('Increase navigation granularity');


/**
 * @desc The description of the actOnCurrentItem key.
 * The current item is the HTML element which has focus.  Taking action is
 * similar to using the mouse to click on the element.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_ACT_ON_CURRENT_ITEM =
    goog.getMsg('Take action on current item');


/**
 * @desc The description of the forceClickOnCurrentItem key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_FORCE_CLICK_ON_CURRENT_ITEM =
    goog.getMsg('Click on current item');


/**
 * @desc The description of the readLinkURL key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_READ_LINK_URL =
    goog.getMsg('Announce the URL behind a link');


/**
 * @desc The description of the readCurrentTitle key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_READ_CURRENT_TITLE =
    goog.getMsg('Announce the title of the current page');


/**
 * @desc The description of the readCurrentURL key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_READ_CURRENT_URL =
    goog.getMsg('Announce the URL of the current page');


/**
 * @desc The description of the readFromHere key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_READ_FROM_HERE =
    goog.getMsg('Start reading from current location');


/**
 * @desc The description of the showPowerKey key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SHOW_POWER_KEY =
    goog.getMsg('Open ChromeVox keyboard help');


/**
 * @desc The description of the hidePowerKey key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_HIDE_POWER_KEY =
    goog.getMsg('Hide ChromeVox help');


/**
 * @desc Spoken instruction on navigating power key.
 */
msgs.MSG_CHROMEVOX_POWER_KEY_HELP =
    goog.getMsg('Press up or down to review commands, press enter to activate');


/**
 * @desc The description of the help key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_HELP =
    goog.getMsg('Open ChromeVox tutorial');


/**
 * @desc The description of the toggleSearchWidget key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_TOGGLE_SEARCH_WIDGET =
    goog.getMsg('Toggle search widget');


/**
 * @desc The description of the showOptionsPage key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SHOW_OPTIONS_PAGE =
    goog.getMsg('Open options page');


/**
 * @desc The description of the showKbExplorerPage key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SHOW_KB_EXPLORER_PAGE =
    goog.getMsg('Open keyboard explorer');


/**
 * @desc The description of the decreaseTtsRate key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_DECREASE_TTS_RATE =
    goog.getMsg('Decrease rate of speech');


/**
 * @desc The description of the increaseTtsRate key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_INCREASE_TTS_RATE =
    goog.getMsg('Increase rate of speech');


/**
 * @desc The description of the decreaseTtsPitch key.  This key's action is
 * passed to the text-to-speech voice engine and controls the voice's pitch.
 * c.f. http://en.wikipedia.org/wiki/Pitch_(music)
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_DECREASE_TTS_PITCH =
    goog.getMsg('Decrease pitch');


/**
 * @desc The description of the increaseTtsPitch key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_INCREASE_TTS_PITCH =
    goog.getMsg('Increase pitch');


/**
 * @desc The description of the decreaseTtsVolume key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_DECREASE_TTS_VOLUME =
    goog.getMsg('Decrease speech volume');


/**
 * @desc The description of the increaseTtsVolume key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_INCREASE_TTS_VOLUME =
    goog.getMsg('Increase speech volume');


/**
 * @desc The description of the showFormsList key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SHOW_FORMS_LIST =
    goog.getMsg('Show forms list');


/**
 * @desc The description of the showHeadingsList key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SHOW_HEADINGS_LIST =
    goog.getMsg('Show headings list');


/**
 * @desc The description of the showLinksList key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SHOW_LINKS_LIST =
    goog.getMsg('Show links list');


/**
 * @desc The description of the showTablesList key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SHOW_TABLES_LIST =
    goog.getMsg('Show tables list');


/**
 * @desc The description of the showLandmarksList key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SHOW_LANDMARKS_LIST =
    goog.getMsg('Show landmarks list');


/**
 * @desc The description of the previousRow key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_ROW =
    goog.getMsg('Previous table row');


/**
 * @desc The description of the nextRow key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_ROW =
    goog.getMsg('Next table row');


/**
 * @desc The description of the previousCol key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_COL =
    goog.getMsg('Previous table column');


/**
 * @desc The description of the nextCol key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_COL =
    goog.getMsg('Next table column');


/**
 * @desc The description of the announceHeaders key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_ANNOUNCE_HEADERS =
    goog.getMsg('Announce the headers of the current cell');


/**
 * @desc The description of the speakTableLocation key.  This key's action will
 * describe where in the table the focus currently is.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SPEAK_TABLE_LOCATION =
    goog.getMsg('Announce current cell coordinates');


/**
 * @desc The description of the guessRowHeader key.
 * In a table, attempt to determine the header for the row containing
 * the current cell, even if uncertain.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_GUESS_ROW_HEADER =
    goog.getMsg('Make a guess at the row header of the current cell');


/**
 * @desc The description of the guessColHeader key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_GUESS_COL_HEADER =
    goog.getMsg('Make a guess at the column header of the current cell');


/**
 * @desc The description of the skipToBeginning key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SKIP_TO_BEGINNING =
    goog.getMsg('Go to beginning of table');


/**
 * @desc The description of the skipToEnd key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SKIP_TO_END =
    goog.getMsg('Go to end of table');


/**
 * @desc The description of the skipToRowBeginning key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SKIP_TO_ROW_BEGINNING =
    goog.getMsg('Go to beginning of the current row');


/**
 * @desc The description of the skipToRowEnd key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SKIP_TO_ROW_END =
    goog.getMsg('Go to end of the current row');


/**
 * @desc The description of the skipToColBeginning key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SKIP_TO_COL_BEGINNING =
    goog.getMsg('Go to beginning of the current column');


/**
 * @desc The description of the skipToColEnd key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_SKIP_TO_COL_END =
    goog.getMsg('Go to end of the current column');


/**
 * @desc The description of the nextHeading1 key.
 * In most cases, "level 1 heading" is a H1 HTML tag.  ChromeVox will search,
 * from the current focus, for the next heading on the page.  If a heading is
 * found, ChromeVox will focus on the heading.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_HEADING1 =
    goog.getMsg('Next level 1 heading');


/**
 * @desc The description of the previousHeading1 key.  Behaves like
 * nextHeading1, but this key's action will search backwards (up the page).
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_HEADING1 =
    goog.getMsg('Previous level 1 heading');


/**
 * @desc The description of the nextHeading2 key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_HEADING2 =
    goog.getMsg('Next level 2 heading');


/**
 * @desc The description of the previousHeading2 key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_HEADING2 =
    goog.getMsg('Previous level 2 heading');


/**
 * @desc The description of the nextHeading3 key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_HEADING3 =
    goog.getMsg('Next level 3 heading');


/**
 * @desc The description of the previousHeading3 key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_HEADING3 =
    goog.getMsg('Previous level 3 heading');


/**
 * @desc The description of the nextHeading4 key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_HEADING4 =
    goog.getMsg('Next level 4 heading');


/**
 * @desc The description of the previousHeading4 key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_HEADING4 =
    goog.getMsg('Previous level 4 heading');


/**
 * @desc The description of the nextHeading5 key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_HEADING5 =
    goog.getMsg('Next level 5 heading');


/**
 * @desc The description of the previousHeading5 key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_HEADING5 =
    goog.getMsg('Previous level 5 heading');


/**
 * @desc The description of the nextHeading6 key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_HEADING6 =
    goog.getMsg('Next level 6 heading');


/**
 * @desc The description of the previousHeading6 key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_HEADING6 =
    goog.getMsg('Previous level 6 heading');


/**
 * @desc The description of the nextComboBox key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_COMBO_BOX =
    goog.getMsg('Next combo box');


/**
 * @desc The description of the previousComboBox key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_COMBO_BOX =
    goog.getMsg('Previous combo box');


/**
 * @desc The description of the nextEditText key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_EDIT_TEXT =
    goog.getMsg('Next editable text area');


/**
 * @desc The description of the previousEditText key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_EDIT_TEXT =
    goog.getMsg('Previous editable text area');


/**
 * @desc The description of the nextFormField key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_FORM_FIELD =
    goog.getMsg('Next form field');


/**
 * @desc The description of the previousFormField key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_FORM_FIELD =
    goog.getMsg('Previous form field');


/**
 * @desc The description of the nextGraphic key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_GRAPHIC =
    goog.getMsg('Next graphic');


/**
 * @desc The description of the previousGraphic key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_GRAPHIC =
    goog.getMsg('Previous graphic');


/**
 * @desc The description of the nextHeading key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_HEADING =
    goog.getMsg('Next heading');


/**
 * @desc The description of the previousHeading key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_HEADING =
    goog.getMsg('Previous heading');


/**
 * @desc The description of the nextListItem key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_LIST_ITEM =
    goog.getMsg('Next list item');


/**
 * @desc The description of the previousListItem key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_LIST_ITEM =
    goog.getMsg('Previous list item');


/**
 * @desc The description of the nextJump key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_JUMP =
    goog.getMsg('Next jump');


/**
 * @desc The description of the previousJump key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_JUMP =
    goog.getMsg('Previous jump');


/**
 * @desc The description of the nextLink key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_LINK =
    goog.getMsg('Next link');


/**
 * @desc The description of the previousLink key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_LINK =
    goog.getMsg('Previous link');


/**
 * @desc The description of the nextList key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_LIST =
    goog.getMsg('Next list');


/**
 * @desc The description of the previousList key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_LIST =
    goog.getMsg('Previous list');


/**
 * @desc The description of the nextMath key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_MATH =
    goog.getMsg('Next math');


/**
 * @desc The description of the previousMath key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_MATH =
    goog.getMsg('Previous math');


/**
 * @desc The description of the nextMedia key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_MEDIA =
    goog.getMsg('Next media');


/**
 * @desc The description of the previousMedia key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_MEDIA =
    goog.getMsg('Previous media');


/**
 * @desc The description of the nextBlockquote key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_BLOCKQUOTE =
    goog.getMsg('Next block quote');


/**
 * @desc The description of the previousBlockquote key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_BLOCKQUOTE =
    goog.getMsg('Previous block quote');


/**
 * @desc The description of the nextRadio key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_RADIO =
    goog.getMsg('Next radio button');


/**
 * @desc The description of the previousRadio key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_RADIO =
    goog.getMsg('Previous radio button');


/**
 * @desc The description of the nextSlider key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_SLIDER =
    goog.getMsg('Next slider');


/**
 * @desc The description of the previousSlider key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_SLIDER =
    goog.getMsg('Previous slider');


/**
 * @desc The description of the nextTable key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_TABLE =
    goog.getMsg('Next table');


/**
 * @desc The description of the nextVisitedLink key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_VISITED_LINK =
    goog.getMsg('Next visited link');


/**
 * @desc The description of the previousTable key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_TABLE =
    goog.getMsg('Previous table');


/**
 * @desc The description of the previousVisitedLink key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_VISITED_LINK =
    goog.getMsg('Previous visited link');


/**
 * @desc The description of the nextButton key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_BUTTON =
    goog.getMsg('Next button');


/**
 * @desc The description of the previousButton key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_BUTTON =
    goog.getMsg('Previous button');


/**
 * @desc The description of the nextCheckbox key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_CHECKBOX =
    goog.getMsg('Next checkbox');


/**
 * @desc The description of the previousCheckbox key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_CHECKBOX =
    goog.getMsg('Previous checkbox');


/**
 * @desc The description of the nextLandmark key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_LANDMARK =
    goog.getMsg('Next landmark');


/**
 * @desc The description of the previousLandmark key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_LANDMARK =
    goog.getMsg('Previous landmark');


/**
 * @desc The description of the benchmark key.  Launches a benchmark tool
 * useful for debugging.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_BENCHMARK =
    goog.getMsg('Debug benchmark');


/**
 * @desc The description of the announcePosition key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_ANNOUNCE_POSITION =
    goog.getMsg('Announces a brief description of the current position');


/**
 * @desc The description of the fullyDescribe key.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_FULLY_DESCRIBE =
    goog.getMsg('Announces a complete description of the current position');


// The options page.


/**
 * @desc The title of the extension's options page.
 */
msgs.MSG_CHROMEVOX_OPTIONS_PAGE_TITLE =
    goog.getMsg('ChromeVox Options');


/**
 * @desc The summary of the extension's options.  Shown at the top of
 * the options page.
 */
msgs.MSG_CHROMEVOX_OPTIONS_PAGE_SUMMARY =
    goog.getMsg('Use the options below to customize ChromeVox. ' +
                'Changes take effect immediately.');


/**
 * @desc An option to enable the page focus following the mouse.  Focus
 * represents the current HTML element or group of elements that are being
 * spoken and can be acted upon.  There is also a visual UI which highlights
 * the focused elements.
 *
 * This key's action allows the user to change focus with the mouse.  Focus can
 * also be changed using the ChromeVox navigation keys and an API.
 */
msgs.MSG_CHROMEVOX_OPTIONS_MOUSE_FOCUS_FOLLOWS =
    goog.getMsg('Use the mouse to change focus.');


/**
 * @desc An option to enhance the experience of specific sites such as Google
 * Search.
 */
msgs.MSG_CHROMEVOX_OPTIONS_SITE_SPECIFIC_ENHANCEMENTS =
    goog.getMsg('Enhance specific sites (like Google Search).');


/**
 * @desc An option to use more verbose feedback for the user.
 */
msgs.MSG_CHROMEVOX_OPTIONS_VERBOSITY_VERBOSE =
    goog.getMsg('Enable verbose descriptions.');


/**
 * @desc An option to show the cursor between characters.
 */
msgs.MSG_CHROMEVOX_OPTIONS_CURSOR_BETWEEN_CHARACTERS =
    goog.getMsg('Place cursor between characters when editing text (like Mac ' +
                'OS X).');


/**
 * @desc An option to show the magnifier.
 */
msgs.MSG_CHROMEVOX_OPTIONS_MAGNIFIER_SHOW_CHECKBOX =
    goog.getMsg('Show a magnified view of the page content.');


/**
 * @desc An options page section header for options about the ChromeVox voice.
 * This section lets users change the voice by selecting a different voice from
 * a listbox.
 */
msgs.MSG_CHROMEVOX_OPTIONS_VOICES = goog.getMsg('Voices');


/**
 * @desc Labels the voice selection list box.
 */
msgs.MSG_CHROMEVOX_OPTIONS_VOICES_DESCRIPTION = goog.getMsg('Change the ' +
    'current voice by selecting an option from the list below.');


/**
 * @desc An options page section header for options about key shortcuts.
 * This section lets users change the key bindings for ChromeVox actions.
 * The section has a list of actions and a text field to change the binding
 * (e.g. Ctrl-B) for each action.
 */
msgs.MSG_CHROMEVOX_OPTIONS_KEYBOARD_SHORTCUTS =
    goog.getMsg('Keyboard shortcuts');


/**
 * @desc Labels the key map selection combo box. Key maps describe a pairing
 * of keys users use to invoke a command.
 */
msgs.MSG_CHROMEVOX_OPTIONS_KEYMAP_DESCRIPTION =
    goog.getMsg('Change the current keymap by selecting an option from the ' +
                'list below.');


/**
 * @desc A button to reset the key assignments in the options page.
 */
msgs.MSG_CHROMEVOX_OPTIONS_SELECT_KEYS =
    goog.getMsg('Reset current keymap');


/**
 * @desc Labels the keyboard shortcut section.
 */
msgs.MSG_CHROMEVOX_OPTIONS_SHORTCUTS_DESCRIPTION =
    goog.getMsg('Customize keyboard shortcuts for frequently used commands ' +
        'by typing them into the corresponding fields below.');


/**
 * @desc An options page section header for the modifier key section.
 */
msgs.MSG_CHROMEVOX_OPTIONS_MODIFIER_KEYS =
    goog.getMsg('Modifier keys');


/**
 * @desc An option for setting the key combination that will be used as the
 * ChromeVox modifier key (aka, the 'Cvox' key).
 */
msgs.MSG_CHROMEVOX_OPTIONS_CVOX_MODIFIER_KEY =
    goog.getMsg('ChromeVox modifier key');


// The keyboard explorer.


/**
 * @desc The title of the ChromeOS Keyboard explorer page.  The keyboard
 * explorer voices the name of each key when the user presses it.
 */
msgs.MSG_CHROMEVOX_KBEXPLORER_TITLE =
    goog.getMsg('ChromeOS Keyboard Explorer');


/**
 * @desc The instructions for the keyboard explorer.  The keyboard explorer
 * voices the name of each key when the user presses it.
 *
 * These instructions describe how to use the keyboard explorer.
 */
msgs.MSG_CHROMEVOX_KBEXPLORER_INSTRUCTIONS =
    goog.getMsg('Press any key to learn its name. Ctrl+W will close the ' +
                'keyboard explorer.');


//////////////////////////////////////////////////////////////////////////////
// The following messages are exposed through Chrome's accessibility API.
//////////////////////////////////////////////////////////////////////////////


/**
 * @desc Spoken when a System update is ready and restart is needed.
 */
msgs.MSG_CHROMEVOX_CHROME_SYSTEM_NEED_RESTART =
    goog.getMsg('System was updated.  Restart is recommended.');


/**
 * @desc Spoken when the screen brightness is changed.
 */
msgs.MSG_CHROMEVOX_CHROME_BRIGHTNESS_CHANGED =
    goog.getMsg('Brightness {$brightness} percent', {'brightness': '$1'});


/**
 * @desc Spoken when a new Chrome tab named 'title' is opened.
 */
msgs.MSG_CHROMEVOX_CHROME_TAB_CREATED =
    goog.getMsg('tab created');


/**
 * @desc Spoken when the user changes to different tab showing the
 * 'title' page.
 */
msgs.MSG_CHROMEVOX_CHROME_TAB_SELECTED =
    goog.getMsg('{$title}, tab', {'title': '$1'});


/**
 * @desc Spoken when the user changes to a different normal window showing the
 * 'title' page.
 */
msgs.MSG_CHROMEVOX_CHROME_NORMAL_WINDOW_SELECTED =
    goog.getMsg('window {$title} tab', {'title': '$1'});


/**
 * @desc Spoken when the user changes to a different incognito window showing
 * the 'title' page in the current (displayed) tab.
 */
msgs.MSG_CHROMEVOX_CHROME_INCOGNITO_WINDOW_SELECTED =
    goog.getMsg('incognito window {$title} tab', {'title': '$1'});


/**
 * @desc Spoken when the user opens a Chrome menu named 'title'.
 */
msgs.MSG_CHROMEVOX_CHROME_MENU_OPENED =
    goog.getMsg('{$title} menu opened', {'title': '$1'});


/**
 * @desc Describes a HTML checkbox named 'name'
 * in the checked state.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_CHECKBOX_CHECKED =
    goog.getMsg('{$name} checkbox checked', {'name': '$1'});


/**
 * @desc The checked state for a checkbox.
 */
msgs.MSG_CHROMEVOX_CHECKBOX_CHECKED_STATE = goog.getMsg('checked');


/**
 * @desc The checked state for a checkbox in braille.
 */
msgs.MSG_CHROMEVOX_CHECKBOX_CHECKED_STATE_BRL = goog.getMsg('x');


/**
 * @desc Describes a HTML checkbox named 'name'
 * in the unchecked state.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_CHECKBOX_UNCHECKED =
    goog.getMsg('{$name}, checkbox not checked', {'name': '$1'});


/**
 * @desc The unchecked state for a checkbox.
 */
msgs.MSG_CHROMEVOX_CHECKBOX_UNCHECKED_STATE = goog.getMsg('not checked');


/**
 * @desc The unchecked state for a checkbox in braille.
 */
msgs.MSG_CHROMEVOX_CHECKBOX_UNCHECKED_STATE_BRL = goog.getMsg(' ');


/**
 * @desc Describes a HTML radio button named 'name'
 * in the selected state.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_RADIO_SELECTED =
    goog.getMsg('{$name}, radio button selected', {'name': '$1'});


/**
 * @desc The selected state for a radio button.
 */
msgs.MSG_CHROMEVOX_RADIO_SELECTED_STATE = goog.getMsg('selected');


/**
 * @desc The selected state for a radio button in braille.
 */
msgs.MSG_CHROMEVOX_RADIO_SELECTED_STATE_BRL = goog.getMsg('x');


/**
 * @desc Describes a HTML radio button named 'name'
 * in the unselected state.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_RADIO_UNSELECTED =
    goog.getMsg('{$name}, radio button unselected', {'name': '$1'});


/**
 * @desc The unselected state for a radio button.
 */
msgs.MSG_CHROMEVOX_RADIO_UNSELECTED_STATE = goog.getMsg('unselected');


/**
 * @desc The unselected state for a radio button in braille.
 */
msgs.MSG_CHROMEVOX_RADIO_UNSELECTED_STATE_BRL = goog.getMsg(' ');


/**
 * @desc Describes a menu named 'name'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_MENU =
    goog.getMsg('{$name}, menu', {'name': '$1'});


/**
 * @desc Describes a menu item named 'name'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_MENU_ITEM =
    goog.getMsg('{$name}, menu item', {'name': '$1'});


/**
 * @desc Describes a menu item named 'name' with a
 * submenu.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_MENU_ITEM_WITH_SUBMENU =
    goog.getMsg('{$name}, menu item, with submenu', {'name': '$1'});


/**
 * @desc Describes a window named 'name'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_WINDOW =
    goog.getMsg('{$name}, window', {'name': '$1'});


/**
 * @desc Describes a HTML textbox named 'name' with
 * value 'value'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_TEXTBOX =
    goog.getMsg('{$value}, {$name}, text box', {'value': '$1', 'name': '$2'});


/**
 * @desc Describes an unnamed HTML textbox with
 * value 'value'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_UNNAMED_TEXTBOX =
    goog.getMsg('{$value}, text box', {'value': '$1'});


/**
 * @desc Describes a HTML password textbox
 * named 'name' with value 'value'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_PASSWORD =
    goog.getMsg('{$value}, {$name}, password text box',
                {'value': '$1', 'name': '$2'});


/**
 * @desc Describes an unnamed HTML password textbox
 * with value 'value'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_UNNAMED_PASSWORD =
    goog.getMsg('{$value}, password text box', {'value': '$1'});


/**
 * @desc Describes a HTML button named 'name'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_BUTTON =
    goog.getMsg('{$name}, button', {'name': '$1'});


/**
 * @desc Describes a HTML combo box named 'name'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_COMBOBOX =
    goog.getMsg('{$value}, {$name}, combo box', {'value': '$1', 'name': '$2'});


/**
 * @desc Describes an unnamed HTML combo box.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_UNNAMED_COMBOBOX =
    goog.getMsg('{$value}, combo box', {'value': '$1'});


/**
 * @desc Describes a HTML listbox named 'name'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_LISTBOX =
    goog.getMsg('{$value}, {$name}, list box', {'value': '$1', 'name': '$2'});


/**
 * @desc Describes an unnamed HTML combo box.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_UNNAMED_LISTBOX =
    goog.getMsg('{$value}, list box', {'value': '$1'});


/**
 * @desc Describes a HTML link named 'name'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_LINK =
    goog.getMsg('{$name}, link', {'name': '$1'});


/**
 * @desc Describes a Chrome tab named 'name'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_TAB =
    goog.getMsg('{$name}, tab', {'name': '$1'});


/**
 * @desc Describes a slider with name 'name' and value 'value'.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_SLIDER =
    goog.getMsg('{$value}, {$name}, slider', {'value': '$1', 'name': '$2'});


/**
 * @desc Spoken through the a11y api after describing an element if it is
 * selected.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_SELECTED =
    goog.getMsg(', selected');


/**
 * @desc Spoken through the a11y api after describing an element if it is
 * unselected.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_UNSELECTED =
    goog.getMsg(', unselected');


/**
 * @desc Spoken through the a11y api after describing an element if it
 * is part of a group.
 */
msgs.MSG_CHROMEVOX_DESCRIBE_INDEX =
    goog.getMsg(', {$index} of {$total}, ', {'index': '$1', 'total': '$2'});


//////////////////////////////////////////////////////////////////////////////
// Background page.
//////////////////////////////////////////////////////////////////////////////


/**
 * @desc Describes the rate of synthesized speech as a percentage
 * of the normal speaking rate, like 50% for slow speech or 200% for
 * fast speech.
 */
msgs.MSG_CHROMEVOX_ANNOUNCE_RATE =
    goog.getMsg('Rate {$percent} percent', {'percent': '$1'});


/**
 * @desc Describes the pitch of synthesized speech as a percentage
 * of the normal pitch, like 50% for low pitch or 150% for
 * high pitch.
 */
msgs.MSG_CHROMEVOX_ANNOUNCE_PITCH =
    goog.getMsg('Pitch {$percent} percent', {'percent': '$1'});


/**
 * @desc Describes the volume of synthesized speech as a percentage
 * where 100% is full volume.
 */
msgs.MSG_CHROMEVOX_ANNOUNCE_VOLUME =
    goog.getMsg('Volume {$percent} percent', {'percent': '$1'});


/**
 * @desc Spoken when the user exits a dialog.  For example an alert dialog.
 */
msgs.MSG_CHROMEVOX_EXITING_DIALOG =
    goog.getMsg('Exited dialog.');


/**
 * @desc Spoken when the user exits a container.
 */
msgs.MSG_CHROMEVOX_EXITED_CONTAINER =
    goog.getMsg('Exited {$type}.', {'type': '$1'});


/**
 * @desc Spoken when the user enters a dialog with the text 'text'.
 */
msgs.MSG_CHROMEVOX_ENTERING_DIALOG =
    goog.getMsg('Entered dialog');


/**
 * @desc Spoken before the list of elements when a live region of a page
 * is removed.
 */
msgs.MSG_CHROMEVOX_LIVE_REGIONS_REMOVED =
    goog.getMsg('removed:');


/**
 * @desc Tells the user that sticky mode is enabled.  Sticky mode allows
 * the user to navigate without pressing the modifier keys.
 */
msgs.MSG_CHROMEVOX_STICKY_MODE_ENABLED =
    goog.getMsg('Sticky mode enabled');


/**
 * @desc Tells the user that sticky mode is disabled.  Sticky mode allows
 * the user to navigate without pressing the modifier keys.
 */
msgs.MSG_CHROMEVOX_STICKY_MODE_DISABLED =
    goog.getMsg('Sticky mode disabled');


/**
 * @desc Prompt spoken when the user first opens the Keyboard Help Widget.
 */
msgs.MSG_CHROMEVOX_KEYBOARD_HELP_INTRO =
    goog.getMsg('Keyboard Help');


/**
 * @desc Prompt spoken when user opens the Context Menu Widget.
 */
msgs.MSG_CHROMEVOX_CONTEXT_MENU_INTRO =
    goog.getMsg('Context Menu');


/**
 * @desc Prompt spoken as a generic name for any choice widget of some type.
 */
msgs.MSG_CHROMEVOX_CHOICE_WIDGET_NAME =
    goog.getMsg('{$type} list.', {'type': '$1'});


/**
 * @desc Prompt spoken as a help message when any choice widget is opened.
 */
msgs.MSG_CHROMEVOX_CHOICE_WIDGET_HELP =
    goog.getMsg('Use up and down arrow keys to browse, or type to search.');


/**
 * @desc Prompt spoken when any ChoiceWidget exits.
 */
msgs.MSG_CHROMEVOX_CHOICE_WIDGET_EXITED = goog.getMsg('Exited');



/**
 * @desc Prompt spoken to describe items within the ChoiceWidget.
 */
msgs.MSG_CHROMEVOX_CHOICE_WIDGET_TYPE_GENERIC = goog.getMsg(' ');


/**
 * @desc Spoken when table mode reachs the end of a cell.
 */
msgs.MSG_CHROMEVOX_END_OF_CELL =
    goog.getMsg('End of cell.');


/**
 * @desc Spoken when the user reads a link without a URL.
 */
msgs.MSG_CHROMEVOX_NO_URL_FOUND =
    goog.getMsg('No URL found');


/**
 * @desc Spoken, in table mode, when the user leaves an HTML table.
 */
msgs.MSG_CHROMEVOX_LEAVING_TABLE =
    goog.getMsg('Leaving table.');


/**
 * @desc Spoken, in table mode, when the user leaves a grid.
 */
msgs.MSG_CHROMEVOX_LEAVING_GRID = goog.getMsg('Leaving grid.');


/**
 * @desc Spoken, in table mode, when the user is inside an HTML table.
 */
msgs.MSG_CHROMEVOX_INSIDE_TABLE =
    goog.getMsg('Inside table');


/**
 * @desc Spoken when the user attempts to enter table mode, but there is
 * no HTML tables.
 */
msgs.MSG_CHROMEVOX_NO_TABLES =
    goog.getMsg('No table found.');


/**
 * @desc Spoken when the user attempts a table mode command, but is not
 * in a table.
 */
msgs.MSG_CHROMEVOX_NOT_INSIDE_TABLE =
    goog.getMsg('Not inside table.');


/**
 * @desc Spoken, in table mode, when the user attempts to navigate to
 * a non-existant next row.
 */
msgs.MSG_CHROMEVOX_NO_CELL_BELOW =
    goog.getMsg('No cell below.');


/**
 * @desc Spoken, in table mode, when the user attempts to navigate to
 * a non-existant previous row.
 */
msgs.MSG_CHROMEVOX_NO_CELL_ABOVE =
    goog.getMsg('No cell above.');


/**
 * @desc Spoken, in table mode, when the user attempts to navigate to
 * a non-existant row to the right.
 */
msgs.MSG_CHROMEVOX_NO_CELL_RIGHT =
    goog.getMsg('No cell right.');


/**
 * @desc Spoken, in table mode, when the user attempts to navigate to
 * a non-existant row to the left.
 */
msgs.MSG_CHROMEVOX_NO_CELL_LEFT =
    goog.getMsg('No cell left.');


/**
 * @desc Spoken, in table mode, when the user moves to an empty cell.
 */
msgs.MSG_CHROMEVOX_EMPTY_CELL =
    goog.getMsg('Empty cell.');


/**
 * @desc Spoken, in table mode, when the user moves to a cell that has
 * rowspan or colspan > 1.
 */
msgs.MSG_CHROMEVOX_SPANNED =
    goog.getMsg('Spanned.');


/**
 * @desc Describes a row header in an HTML table.
 */
msgs.MSG_CHROMEVOX_ROW_HEADER =
    goog.getMsg('Row header:');


/**
 * @desc Describes an empty row header in an HTML table.
 */
msgs.MSG_CHROMEVOX_EMPTY_ROW_HEADER =
    goog.getMsg('Empty row header');


/**
 * @desc Describes a column header in an HTML table.
 */
msgs.MSG_CHROMEVOX_COLUMN_HEADER =
    goog.getMsg('Column header:');


/**
 * @desc Describes an empty column header in an HTML table.
 */
msgs.MSG_CHROMEVOX_EMPTY_COLUMN_HEADER =
    goog.getMsg('Empty column header');


/**
 * @desc Describes the headers on a table with no headers.
 */
msgs.MSG_CHROMEVOX_NO_HEADERS =
    goog.getMsg('No headers');


/**
 * @desc Describes the headers on a table with empty headers.
 */
msgs.MSG_CHROMEVOX_EMPTY_HEADERS =
    goog.getMsg('Empty headers');


/**
 * @desc Descibes the user's location within a table.
 */
msgs.MSG_CHROMEVOX_TABLE_LOCATION =
    goog.getMsg(
        'Row {$rowIndex} of {$rowTotal}, Column {$colIndex} of {$colTotal}',
        {
          'rowIndex': '$1',
          'rowTotal': '$2',
          'colIndex': '$3',
          'colTotal': '$4'});


/**
 * @desc Spoken if the user attempts to jump to the next checkbox when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_CHECKBOX =
    goog.getMsg('No next checkbox.');


/**
 * @desc Spoken if the user attempts to jump to the previous checkbox when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_CHECKBOX =
    goog.getMsg('No previous checkbox.');


/**
 * @desc Spoken if the user attempts to jump to the next editable text field
 * when none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_EDIT_TEXT =
    goog.getMsg('No next editable text field.');


/**
 * @desc Spoken if the user attempts to jump to the previous editable text
 * field when none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_EDIT_TEXT =
    goog.getMsg('No previous editable text field.');


/**
 * @desc Spoken if the user attempts to jump to the next heading when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_HEADING =
    goog.getMsg('No next heading.');


/**
 * @desc Spoken if the user attempts to jump to the previous heading when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_HEADING =
    goog.getMsg('No previous heading.');


/**
 * @desc Spoken if the user attempts to jump to the next level 1 heading when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_HEADING_1 =
    goog.getMsg('No next level 1 heading.');


/**
 * @desc Spoken if the user attempts to jump to the previous level 1 heading
 * when none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_HEADING_1 =
    goog.getMsg('No previous level 1 heading.');


/**
 * @desc Spoken if the user attempts to jump to the next level 2 heading when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_HEADING_2 =
    goog.getMsg('No next level 2 heading.');


/**
 * @desc Spoken if the user attempts to jump to the previous level 2 heading
 * when none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_HEADING_2 =
    goog.getMsg('No previous level 2 heading.');


/**
 * @desc Spoken if the user attempts to jump to the next level 3 heading when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_HEADING_3 =
    goog.getMsg('No next level 3 heading.');


/**
 * @desc Spoken if the user attempts to jump to the previous level 3 heading
 * when none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_HEADING_3 =
    goog.getMsg('No previous level 3 heading.');


/**
 * @desc Spoken if the user attempts to jump to the next level 4 heading when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_HEADING_4 =
    goog.getMsg('No next level 4 heading.');


/**
 * @desc Spoken if the user attempts to jump to the previous level 4 heading
 * when none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_HEADING_4 =
    goog.getMsg('No previous level 4 heading.');


/**
 * @desc Spoken if the user attempts to jump to the next level 5 heading when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_HEADING_5 =
    goog.getMsg('No next level 5 heading.');


/**
 * @desc Spoken if the user attempts to jump to the previous level 5 heading
 * when none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_HEADING_5 =
    goog.getMsg('No previous level 5 heading.');


/**
 * @desc Spoken if the user attempts to jump to the next level 6 heading when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_HEADING_6 =
    goog.getMsg('No next level 6 heading.');


/**
 * @desc Spoken if the user attempts to jump to the previous level 6 heading
 * when none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_HEADING_6 =
    goog.getMsg('No previous level 6 heading.');


/**
 * @desc Spoken if the user attempts to jump to the next item that isn\'t a link
 * when none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_NOT_LINK =
    goog.getMsg('No next item that isn\'t a link.');


/**
 * @desc Spoken if the user attempts to jump to the previous item that isn\'t a
 * link when none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_NOT_LINK =
    goog.getMsg('No previous item that isn\'t a link.');


/**
 * @desc Spoken if the user attempts to jump to the next anchor when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_ANCHOR =
    goog.getMsg('No next anchor.');


/**
 * @desc Spoken if the user attempts to jump to the previous anchor when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_ANCHOR =
    goog.getMsg('No previous anchor.');


/**
 * @desc Spoken if the user attempts to jump to the next link when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_LINK =
    goog.getMsg('No next link.');


/**
 * @desc Spoken if the user attempts to jump to the previous link when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_LINK =
    goog.getMsg('No previous link.');


/**
 * @desc Spoken if the user attempts to jump to the next table when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_TABLE =
    goog.getMsg('No next table.');


/**
 * @desc Spoken if the user attempts to jump to the previous table when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_TABLE =
    goog.getMsg('No previous table.');


/**
 * @desc Spoken if the user attempts to jump to the next visited link when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_VISITED_LINK =
    goog.getMsg('No next visited link.');


/**
 * @desc Spoken if the user attempts to jump to the previous visited link when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_VISITED_LINK =
    goog.getMsg('No previous visited link.');


/**
 * @desc Spoken if the user attempts to jump to the next math expression
 * when none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_MATH =
    goog.getMsg('No next math expression.');


/**
 * @desc Spoken if the user attempts to jump to the previous math expression
 * when none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_MATH =
    goog.getMsg('No previous math expression.');


/**
 * @desc Spoken if the user attempts to jump to the next media widget
 * (audio/video) when none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_MEDIA_WIDGET =
    goog.getMsg('No next media widget.');


/**
 * @desc Spoken if the user attempts to jump to the previous media widget
 * (audio/video) when none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_MEDIA_WIDGET =
    goog.getMsg('No previous media widget.');

/**
 * @desc Spoken if the user attempts to jump to the next list when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_LIST =
    goog.getMsg('No next list.');


/**
 * @desc Spoken if the user attempts to jump to the previous list when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_LIST =
    goog.getMsg('No previous list.');


/**
 * @desc Spoken if the user attempts to jump to the next list item when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_LIST_ITEM =
    goog.getMsg('No next list item.');


/**
 * @desc Spoken if the user attempts to jump to the previous list item when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_LIST_ITEM =
    goog.getMsg('No previous list item.');


/**
 * @desc Spoken if the user attempts to jump to the next blockquote when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_BLOCKQUOTE =
    goog.getMsg('No next blockquote.');


/**
 * @desc Spoken if the user attempts to jump to the previous blockquote when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_BLOCKQUOTE =
    goog.getMsg('No previous blockquote.');


/**
 * @desc Spoken if the user attempts to jump to the next form field when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_FORM_FIELD =
    goog.getMsg('No next form field.');


/**
 * @desc Spoken if the user attempts to jump to the previous form field when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_FORM_FIELD =
    goog.getMsg('No previous form field.');


/**
 * @desc Spoken if the user attempts to jump to the next jump point when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_JUMP =
    goog.getMsg('No next jump point.');


/**
 * @desc Spoken if the user attempts to jump to the previous jump point when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_JUMP =
    goog.getMsg('No previous jump point.');


/**
 * @desc Spoken if the user attempts to jump to the next ARIA landmark when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_LANDMARK =
    goog.getMsg('No next ARIA landmark.');


/**
 * @desc Spoken if the user attempts to jump to the previous ARIA landmark when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_LANDMARK =
    goog.getMsg('No previous ARIA landmark.');


/**
 * @desc Spoken if the user attempts to jump to the next combo box when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_COMBO_BOX =
    goog.getMsg('No next combo box.');


/**
 * @desc Spoken if the user attempts to jump to the previous combo box when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_COMBO_BOX =
    goog.getMsg('No previous combo box.');


/**
 * @desc Spoken if the user attempts to jump to the next button when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_BUTTON =
    goog.getMsg('No next button.');


/**
 * @desc Spoken if the user attempts to jump to the previous button when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_BUTTON =
    goog.getMsg('No previous button.');


/**
 * @desc Spoken if the user attempts to jump to the next graphic when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_GRAPHIC =
    goog.getMsg('No next graphic.');


/**
 * @desc Spoken if the user attempts to jump to the previous graphic when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_GRAPHIC =
    goog.getMsg('No previous graphic.');


/**
 * @desc Spoken if the user attempts to jump to the next slider when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_SLIDER =
    goog.getMsg('No next slider.');


/**
 * @desc Spoken if the user attempts to jump to the previous slider when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_SLIDER =
    goog.getMsg('No previous slider.');


/**
 * @desc Spoken if the user attempts to jump to the next radio button when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_RADIO_BUTTON =
    goog.getMsg('No next radio button.');


/**
 * @desc Spoken if the user attempts to jump to the previous radio button when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_RADIO_BUTTON =
    goog.getMsg('No previous radio button.');


/**
 * @desc Spoken if the user attempts to jump to the next section when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_SECTION = goog.getMsg('No next section.');


/**
 * @desc Spoken if the user attempts to jump to the previous section when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_SECTION = goog.getMsg('No previous section.');


/**
 * @desc Spoken if the user attempts to jump to the next control when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_CONTROL = goog.getMsg('No next control.');


/**
 * @desc Spoken if the user attempts to jump to the previous control when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_CONTROL = goog.getMsg('No previous control.');


/**
 * @desc Spoken when the current HTML element is clicked.
 */
msgs.MSG_CHROMEVOX_ELEMENT_CLICKED =
    goog.getMsg('Clicked');


/**
 * @desc Spoken when the current HTML element is double clicked.
 */
msgs.MSG_CHROMEVOX_ELEMENT_DOUBLE_CLICKED =
    goog.getMsg('double clicked');


/**
 * @desc Spoken in PowerKey if there are no headings to display.
 */
msgs.MSG_CHROMEVOX_POWERKEY_NO_HEADINGS =
    goog.getMsg('No headings.');


/**
 * @desc Spoken in PowerKey if there are no links to display.
 */
msgs.MSG_CHROMEVOX_POWERKEY_NO_LINKS =
    goog.getMsg('No links.');


/**
 * @desc Spoken in PowerKey if there are no forms to display.
 */
msgs.MSG_CHROMEVOX_POWERKEY_NO_FORMS =
    goog.getMsg('No forms.');


/**
 * @desc Spoken in PowerKey if there are no tables to display.
 */
msgs.MSG_CHROMEVOX_POWERKEY_NO_TABLES =
    goog.getMsg('No tables.');


/**
 * @desc Spoken in PowerKey if there are no ARIA landmarks to display.
 */
msgs.MSG_CHROMEVOX_POWERKEY_NO_LANDMARKS =
    goog.getMsg('No ARIA landmarks.');


/**
 * @desc Spoken in PowerKey if there are no jumps to display.
 */
msgs.MSG_CHROMEVOX_POWERKEY_NO_JUMPS =
    goog.getMsg('No jumps.');


////  Aria messages.


/**
 * @desc Describes the list position of a list item.
 */
msgs.MSG_CHROMEVOX_LIST_POSITION =
    goog.getMsg('{$index} of {$total}',
                {'index': '$1', 'total': '$2'});


/**
 * @desc Describes the list position of a list item in braille.
 */
msgs.MSG_CHROMEVOX_LIST_POSITION_BRL =
    goog.getMsg('{$index}/{$total}',
                {'index': '$1', 'total': '$2'});


/**
 * @desc Spoken after an menu is spoken if the menu has a submenu.
 * For example "Menu Options has submenu"
 */
msgs.MSG_CHROMEVOX_ARIA_HAS_SUBMENU = goog.getMsg('has submenu');


/**
 * @desc Brailled after an menu is spoken if the menu has a submenu.
 */
msgs.MSG_CHROMEVOX_ARIA_HAS_SUBMENU_BRL = goog.getMsg('+submnu');


/**
 * @desc Spoken after an element is spoken if the element has a pop up.
 * For example "Button Add friends has pop up"
 */
msgs.MSG_CHROMEVOX_ARIA_HAS_POPUP = goog.getMsg('has pop up');


/**
 * @desc Brailled after an element is spoken if the element has a pop up.
 */
msgs.MSG_CHROMEVOX_ARIA_HAS_POPUP_BRL = goog.getMsg('+popup');


/**
 * @desc Spoken when describing an ARIA value minimun. For example
 * "Distance, in meters textbox 6, min 2, max 10"
 */
msgs.MSG_CHROMEVOX_ARIA_VALUE_MIN = goog.getMsg('Min {$x}', {'x': '$1'});


/**
 * @desc Brailled when describing an ARIA value minimun. For example
 * "Distance, in meters: 6 min:6 max:10"
 */
msgs.MSG_CHROMEVOX_ARIA_VALUE_MIN_BRL = goog.getMsg('min:{$x}', {'x': '$1'});


/**
 * @desc Spoken when describing an ARIA value maximum. For example
 * "Distance, in meters textbox 6, min 2, max 10"
 */
msgs.MSG_CHROMEVOX_ARIA_VALUE_MAX = goog.getMsg('Max {$x}', {'x': '$1'});


/**
 * @desc Brailled when describing an ARIA value maximum. For example
 * "Distance, in meters: 6 min:2 max:10".
 */
msgs.MSG_CHROMEVOX_ARIA_VALUE_MAX_BRL = goog.getMsg('max:{$x}', {'x': '$1'});


/**
 * @desc Spoken when describing an ARIA value. For example
 * "Distance, in meters textbox 6, min 2, max 10".
 */
msgs.MSG_CHROMEVOX_ARIA_VALUE_NOW = goog.getMsg('{$x}', {'x': '$1'});


/**
 * @desc Brailled when describing an ARIA value. For example
 * "Distance, in meters: 6 min:2 max:10".
 */
msgs.MSG_CHROMEVOX_ARIA_VALUE_NOW_BRL = goog.getMsg('{$x}', {'x': '$1'});


/**
 * @desc Describes an element with the ARIA role alert.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_ALERT = goog.getMsg('Alert');


/**
 * @desc Braille of element with the ARIA role alert.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_ALERT_BRL = goog.getMsg('alrt');


/**
 * @desc Describes an element with the ARIA role alertdialog.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_ALERTDIALOG = goog.getMsg('Alert dialog');


/**
 * @desc Braille of element with the ARIA role alertdialog.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_ALERTDIALOG_BRL = goog.getMsg('alrt dlg');


/**
 * @desc Describes an element with the ARIA role button.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_BUTTON = goog.getMsg('Button');


/**
 * @desc Braille of element with the ARIA role button.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_BUTTON_BRL = goog.getMsg('btn');


/**
 * @desc Describes an element with the ARIA role checkbox.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_CHECKBOX = goog.getMsg('Check box');


/**
 * @desc Braille of element with the ARIA role checkbox.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_CHECKBOX_BRL = goog.getMsg('chx');


/**
 * @desc Describes an element with the ARIA role combobox.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_COMBOBOX = goog.getMsg('Combo box');


/**
 * @desc Braille of element with the ARIA role combobox.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_COMBOBOX_BRL = goog.getMsg('cbx');


/**
 * @desc Describes an element with the ARIA role dialog.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_DIALOG = goog.getMsg('Dialog');


/**
 * @desc Braille of element with the ARIA role dialog.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_DIALOG_BRL = goog.getMsg('dlg');


/**
 * @desc Describes an element with the ARIA role grid.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_GRID = goog.getMsg('Grid');


/**
 * @desc Braille of element with the ARIA role grid.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_GRID_BRL = goog.getMsg('grd');


/**
 * @desc Describes an element with the ARIA role gridcell.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_GRIDCELL = goog.getMsg('Cell');


/**
 * @desc Braille of element with the ARIA role gridcell.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_GRIDCELL_BRL = goog.getMsg('cl');


/**
 * @desc Describes the position of an element with the ARIA role gridcell.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_GRIDCELL_POS =
    goog.getMsg('row {$row} column {$col}', {'row': '$1', 'col': '$2'});


/**
 * @desc Describes an element with the ARIA role link.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_LINK = goog.getMsg('Link');


/**
 * @desc Braille of element with the ARIA role link.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_LINK_BRL = goog.getMsg('lnk');


/**
 * @desc Describes a single element with the ARIA role link with count.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_LINK_SINGULAR = goog.getMsg('1 link');


/**
 * @desc Describes multiple elements with the ARIA role link.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_LINK_PLURAL =
    goog.getMsg('{$num} links', {'num': '$1'});


/**
 * @desc Describes an element with the ARIA role listbox.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_LISTBOX = goog.getMsg('List box');


/**
 * @desc Braille of element with the ARIA role listbox.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_LISTBOX_BRL = goog.getMsg('lstbx');


/**
 * @desc Describes an element with the ARIA role log.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_LOG = goog.getMsg('Log');


/**
 * @desc Braille of element with the ARIA role log.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_LOG_BRL = goog.getMsg('log');


/**
 * @desc Describes an element with the ARIA role marquee.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MARQUEE = goog.getMsg('Marquee');


/**
 * @desc Braille of element with the ARIA role marquee.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MARQUEE_BRL = goog.getMsg('maqe');


/**
 * @desc Describes an element with the ARIA role menu.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MENU = goog.getMsg('Menu');


/**
 * @desc Braille of element with the ARIA role menu.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MENU_BRL = goog.getMsg('mnu');


/**
 * @desc Describes an element with the ARIA role menubar.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MENUBAR = goog.getMsg('Menu bar');


/**
 * @desc Braille of element with the ARIA role menubar.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MENUBAR_BRL = goog.getMsg('mnu br');


/**
 * @desc Describes an element with the ARIA role menuitem.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MENUITEM = goog.getMsg('Menu item');


/**
 * @desc Braille of element with the ARIA role menuitem.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MENUITEM_BRL = goog.getMsg('mnu itm');


/**
 * @desc Describes an element with the ARIA role menuitemcheckbox.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MENUITEMCHECKBOX =
    goog.getMsg('Menu item check box');


/**
 * @desc Braille of element with the ARIA role menuitemcheckbox.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MENUITEMCHECKBOX_BRL =
    goog.getMsg('mnu itm chx');


/**
 * @desc Describes an element with the ARIA role menuitemradio.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MENUITEMRADIO =
    goog.getMsg('Menu item radio button');


/**
 * @desc Braille of element with the ARIA role menuitemradio.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MENUITEMRADIO_BRL =
    goog.getMsg('mnu itm rd');


/**
 * @desc Describes an element with the ARIA role option.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_OPTION = goog.getMsg(' ');


/**
 * @desc Braille of element with the ARIA role option.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_OPTION_BRL = goog.getMsg(' ');


/**
 * @desc Describes an element with the ARIA role button, with a pop-up.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_POPUP_BUTTON = goog.getMsg('Pop-up button');


/**
 * @desc Braille of element with the ARIA role button, with a pop-up.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_POPUP_BUTTON_BRL = goog.getMsg('pup btn');


/**
 * @desc Describes an element with the ARIA role progressbar.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_PROGRESSBAR = goog.getMsg('Progress bar');


/**
 * @desc Braille of element with the ARIA role progressbar.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_PROGRESSBAR_BRL = goog.getMsg('prog br');


/**
 * @desc Describes an element with the ARIA role radio.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_RADIO = goog.getMsg('Radio button');


/**
 * @desc Braille of element with the ARIA role radio.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_RADIO_BRL = goog.getMsg('rd');


/**
 * @desc Describes an element with the ARIA role radiogroup.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_RADIOGROUP = goog.getMsg('Radio button group');


/**
 * @desc Braille of element with the ARIA role radiogroup.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_RADIOGROUP_BRL = goog.getMsg('rd grp');


/**
 * @desc Describes an element with the ARIA role scrollbar.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_SCROLLBAR = goog.getMsg('Scroll bar');


/**
 * @desc Braille of element with the ARIA role scrollbar.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_SCROLLBAR_BRL = goog.getMsg('scr br');


/**
 * @desc Describes an element with the ARIA role slider.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_SLIDER = goog.getMsg('Slider');


/**
 * @desc Braille of element with the ARIA role slider.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_SLIDER_BRL = goog.getMsg('slr');


/**
 * @desc Describes an element with the ARIA role spinbutton.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_SPINBUTTON = goog.getMsg('Spin button');


/**
 * @desc Braille of element with the ARIA role spinbutton.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_SPINBUTTON_BRL = goog.getMsg('spn btn');


/**
 * @desc Describes an element with the ARIA role status.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_STATUS = goog.getMsg('Status');


/**
 * @desc Braille of element with the ARIA role status.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_STATUS_BRL = goog.getMsg('sts');


/**
 * @desc Describes an element with the ARIA role tab.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TAB = goog.getMsg('Tab');


/**
 * @desc Braille of element with the ARIA role tab.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TAB_BRL = goog.getMsg('tab');


/**
 * @desc Describes an element with the ARIA role tabpanel.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TABPANEL = goog.getMsg('Tab panel');


/**
 * @desc Braille of element with the ARIA role tabpanel.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TABPANEL_BRL = goog.getMsg('tab pnl');


/**
 * @desc Describes an element with the ARIA role textbox.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TEXTBOX = goog.getMsg('Text box');


/**
 * @desc Braille of element with the ARIA role textbox.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TEXTBOX_BRL = goog.getMsg('txtbx');


/**
 * @desc Describes an element with the ARIA role timer.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TIMER = goog.getMsg('Timer');


/**
 * @desc Braille of element with the ARIA role timer.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TIMER_BRL = goog.getMsg('tmr');


/**
 * @desc Describes an element with the ARIA role toolbar.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TOOLBAR = goog.getMsg('Tool bar');


/**
 * @desc Braille of element with the ARIA role toolbar.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TOOLBAR_BRL = goog.getMsg('tl br');


/**
 * @desc Describes an element with the ARIA role tooltip.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TOOLTIP = goog.getMsg('Tool tip');


/**
 * @desc Braille of element with the ARIA role tooltip.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TOOLTIP_BRL = goog.getMsg('tl tp');


/**
 * @desc Describes an element with the ARIA role treeitem.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TREEITEM = goog.getMsg('Tree item');


/**
 * @desc Braille of element with the ARIA role treeitem.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_TREEITEM_BRL = goog.getMsg('tr itm');


/**
 * @desc Describes an element with the ARIA role article.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_ARTICLE = goog.getMsg('Article');


/**
 * @desc Braille of element with the ARIA role article.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_ARTICLE_BRL = goog.getMsg('acl');


/**
 * @desc Describes an element with the ARIA role application.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_APPLICATION = goog.getMsg('Application');


/**
 * @desc Braille of element with the ARIA role application.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_APPLICATION_BRL = goog.getMsg('app');


/**
 * @desc Describes an element with the ARIA role banner.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_BANNER = goog.getMsg('Banner');


/**
 * @desc Braille of element with the ARIA role banner.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_BANNER_BRL = goog.getMsg('bnr');


/**
 * @desc Describes an element with the ARIA role columnheader.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_COLUMNHEADER = goog.getMsg('Column header');


/**
 * @desc Braille of element with the ARIA role columnheader.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_COLUMNHEADER_BRL = goog.getMsg('clm hd');


/**
 * @desc Describes an element with the ARIA role complementary.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_COMPLEMENTARY = goog.getMsg('Complementary');


/**
 * @desc Braille of element with the ARIA role complementary.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_COMPLEMENTARY_BRL = goog.getMsg('cmpy');


/**
 * @desc Describes an element with the ARIA role contentinfo.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_CONTENTINFO = goog.getMsg('Content info');


/**
 * @desc Braille of element with the ARIA role contentinfo.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_CONTENTINFO_BRL = goog.getMsg('cnt in');


/**
 * @desc Describes an element with the ARIA role definition.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_DEFINITION = goog.getMsg('Definition');


/**
 * @desc Braille of element with the ARIA role definition.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_DEFINITION_BRL = goog.getMsg('def');


/**
 * @desc Describes an element with the ARIA role directory.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_DIRECTORY = goog.getMsg('Directory');


/**
 * @desc Braille of element with the ARIA role directory.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_DIRECTORY_BRL = goog.getMsg('dir');


/**
 * @desc Describes an element with the ARIA role document.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_DOCUMENT = goog.getMsg('Document');


/**
 * @desc Braille of element with the ARIA role document.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_DOCUMENT_BRL = goog.getMsg('doc');


/**
 * @desc Describes an element with the ARIA role form.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_FORM = goog.getMsg('Form');


/**
 * @desc Braille of element with the ARIA role form.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_FORM_BRL = goog.getMsg('frm');


/**
 * @desc Describes a single element with the ARIA role form with count.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_FORM_SINGULAR = goog.getMsg('1 form');


/**
 * @desc Describes multiple elements with the ARIA role form.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_FORM_PLURAL =
    goog.getMsg('{$num} forms', {'num': '$1'});


/**
 * @desc Describes an element with the ARIA role group.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_GROUP = goog.getMsg('Group');


/**
 * @desc Braille of element with the ARIA role group.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_GROUP_BRL = goog.getMsg('grp');


/**
 * @desc Describes an element with the ARIA role heading.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_HEADING = goog.getMsg('Heading');


/**
 * @desc Braille of element with the ARIA role heading.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_HEADING_BRL = goog.getMsg('hd');


/**
 * @desc Describes an element with the ARIA role img.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_IMG = goog.getMsg('Image');


/**
 * @desc Describes an element with the ARIA role img.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_IMG_BRL = goog.getMsg('img');


/**
 * @desc Describes an element with the ARIA role list.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_LIST = goog.getMsg('List');


/**
 * @desc Braille of element with the ARIA role list.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_LIST_BRL = goog.getMsg('lst');


/**
 * @desc Describes an element with the ARIA role listitem.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_LISTITEM = goog.getMsg('List item');


/**
 * @desc Braille of element with the ARIA role listitem.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_LISTITEM_BRL = goog.getMsg('lstitm');


/**
 * @desc Describes an element with the ARIA role main.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MAIN = goog.getMsg('Main');


/**
 * @desc Braille of element with the ARIA role main.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MAIN_BRL = goog.getMsg('main');


/**
 * @desc Describes an element with the ARIA role math.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MATH = goog.getMsg('Math');


/**
 * @desc Braille of element with the ARIA role math.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_MATH_BRL = goog.getMsg('math');


/**
 * @desc Describes an element with the ARIA role navigation.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_NAVIGATION = goog.getMsg('Navigation');


/**
 * @desc Braille of element with the ARIA role navigation.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_NAVIGATION_BRL = goog.getMsg('nav');


/**
 * @desc Describes an element with the ARIA role note.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_NOTE = goog.getMsg('Note');


/**
 * @desc Braille of element with the ARIA role note.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_NOTE_BRL = goog.getMsg('note');


/**
 * @desc Describes an element with the ARIA role region.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_REGION = goog.getMsg('Region');


/**
 * @desc Braille of element with the ARIA role region.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_REGION_BRL = goog.getMsg('rgn');


/**
 * @desc Describes an element with the ARIA role rowheader.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_ROWHEADER = goog.getMsg('Row header');


/**
 * @desc Braille of element with the ARIA role rowheader.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_ROWHEADER_BRL = goog.getMsg('rw hd');


/**
 * @desc Describes an element with the ARIA role search.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_SEARCH = goog.getMsg('Search');


/**
 * @desc Braille of element with the ARIA role search.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_SEARCH_BRL = goog.getMsg('srch');


/**
 * @desc Describes an element with the ARIA role separator.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_SEPARATOR = goog.getMsg('Separator');


/**
 * @desc Braille of element with the ARIA role separator.
 */
msgs.MSG_CHROMEVOX_ARIA_ROLE_SEPARATOR_BRL = goog.getMsg('sprtr');


/**
 * @desc Describes an element with the ARIA attribute aria-autocomplete=inline.
 */
msgs.MSG_CHROMEVOX_ARIA_AUTOCOMPLETE_INLINE =
    goog.getMsg('Autocompletion inline');


/**
 * @desc Braille of element with the ARIA attribute aria-autocomplete=inline.
 */
msgs.MSG_CHROMEVOX_ARIA_AUTOCOMPLETE_INLINE_BRL =
    goog.getMsg('autocomplete');


/**
 * @desc Describes an element with the ARIA attribute aria-autocomplete=list.
 */
msgs.MSG_CHROMEVOX_ARIA_AUTOCOMPLETE_LIST =
    goog.getMsg('Autocompletion list');


/**
 * @desc Braille of element with the ARIA attribute aria-autocomplete=list.
 */
msgs.MSG_CHROMEVOX_ARIA_AUTOCOMPLETE_LIST_BRL =
    goog.getMsg('autocomplete lst');


/**
 * @desc Describes an element with the ARIA attribute aria-autocomplete=both.
 */
msgs.MSG_CHROMEVOX_ARIA_AUTOCOMPLETE_BOTH =
    goog.getMsg('Autocompletion inline and list');


/**
 * @desc Brailles an element with the ARIA attribute aria-autocomplete=both.
 */
msgs.MSG_CHROMEVOX_ARIA_AUTOCOMPLETE_BOTH_BRL =
    goog.getMsg('autocomplete lst');


/**
 * @desc Describes an element with the ARIA attribute aria-checked=true.
 */
msgs.MSG_CHROMEVOX_ARIA_CHECKED_TRUE = goog.getMsg('Checked');


/**
 * @desc Braille of element with the ARIA attribute aria-checked=true.
 */
msgs.MSG_CHROMEVOX_ARIA_CHECKED_TRUE_BRL = goog.getMsg('x');


/**
 * @desc Describes an element with the ARIA attribute aria-checked=false.
 */
msgs.MSG_CHROMEVOX_ARIA_CHECKED_FALSE = goog.getMsg('Not checked');


/**
 * @desc Braille of element with the ARIA attribute aria-checked=false.
 */
msgs.MSG_CHROMEVOX_ARIA_CHECKED_FALSE_BRL = goog.getMsg(' ');


/**
 * @desc Describes an element with the ARIA attribute aria-checked=mixed.
 */
msgs.MSG_CHROMEVOX_ARIA_CHECKED_MIXED = goog.getMsg('Partially checked');


/**
 * @desc Braille of element with the ARIA attribute aria-checked=mixed.
 */
msgs.MSG_CHROMEVOX_ARIA_CHECKED_MIXED_BRL = goog.getMsg('/x');


/**
 * @desc Describes an element with the ARIA attribute aria-disabled=true.
 */
msgs.MSG_CHROMEVOX_ARIA_DISABLED_TRUE = goog.getMsg('Disabled');


/**
 * @desc Braille of element with the ARIA attribute aria-disabled=true.
 */
msgs.MSG_CHROMEVOX_ARIA_DISABLED_TRUE_BRL = goog.getMsg('=');


/**
 * @desc Describes an element with the ARIA attribute aria-expanded=true.
 */
msgs.MSG_CHROMEVOX_ARIA_EXPANDED_TRUE = goog.getMsg('Expanded');


/**
 * @desc Braille of element with the ARIA attribute aria-expanded=true.
 */
msgs.MSG_CHROMEVOX_ARIA_EXPANDED_TRUE_BRL = goog.getMsg('>');


/**
 * @desc Describes an element with the ARIA attribute aria-expanded=false.
 */
msgs.MSG_CHROMEVOX_ARIA_EXPANDED_FALSE = goog.getMsg('Collapsed');


/**
 * @desc Braille of element with the ARIA attribute aria-expanded=false.
 */
msgs.MSG_CHROMEVOX_ARIA_EXPANDED_FALSE_BRL = goog.getMsg('<');


/**
 * @desc Describes an element with the ARIA attribute aria-invalid=true.
 */
msgs.MSG_CHROMEVOX_ARIA_INVALID_TRUE = goog.getMsg('Invalid input');


/**
 * @desc Braille of element with the ARIA attribute aria-invalid=true.
 */
msgs.MSG_CHROMEVOX_ARIA_INVALID_TRUE_BRL = goog.getMsg('!');


/**
 * @desc Describes an element with the ARIA attribute aria-invalid=grammar.
 */
msgs.MSG_CHROMEVOX_ARIA_INVALID_GRAMMAR =
    goog.getMsg('Grammatical mistake detected');


/**
 * @desc Braille of element with the ARIA attribute aria-invalid=grammar.
 */
msgs.MSG_CHROMEVOX_ARIA_INVALID_GRAMMAR_BRL =
    goog.getMsg('Grammatical mistake detected');


/**
 * @desc Describes an element with the ARIA attribute aria-invalid=spelling.
 */
msgs.MSG_CHROMEVOX_ARIA_INVALID_SPELLING =
    goog.getMsg('Spelling mistake detected');


/**
 * @desc Braille of element with the ARIA attribute aria-invalid=spelling.
 */
msgs.MSG_CHROMEVOX_ARIA_INVALID_SPELLING_BRL =
    goog.getMsg('misspelled');


/**
 * @desc Describes an element with the ARIA attribute aria-multiline=true.
 */
msgs.MSG_CHROMEVOX_ARIA_MULTILINE_TRUE = goog.getMsg('Multi line');


/**
 * @desc Braille of element with the ARIA attribute aria-multiline=true.
 */
msgs.MSG_CHROMEVOX_ARIA_MULTILINE_TRUE_BRL = goog.getMsg('mult ln');


/**
 * @desc Describes an element with the ARIA attribute
 * aria-multiselectable=true.
 */
msgs.MSG_CHROMEVOX_ARIA_MULTISELECTABLE_TRUE = goog.getMsg('Multi select');


/**
 * @desc Braille of element with the ARIA attribute
 * aria-multiselectable=true.
 */
msgs.MSG_CHROMEVOX_ARIA_MULTISELECTABLE_TRUE_BRL = goog.getMsg('mult sel');


/**
 * @desc Describes an element with the ARIA attribute aria-pressed=true.
 */
msgs.MSG_CHROMEVOX_ARIA_PRESSED_TRUE = goog.getMsg('Pressed');


/**
 * @desc Braille of element with the ARIA attribute aria-pressed=true.
 */
msgs.MSG_CHROMEVOX_ARIA_PRESSED_TRUE_BRL = goog.getMsg('x');


/**
 * @desc Describes an element with the ARIA attribute aria-pressed=false.
 */
msgs.MSG_CHROMEVOX_ARIA_PRESSED_FALSE = goog.getMsg('Not pressed');


/**
 * @desc Braille of element with the ARIA attribute aria-pressed=false.
 */
msgs.MSG_CHROMEVOX_ARIA_PRESSED_FALSE_BRL = goog.getMsg(' ');


/**
 * @desc Describes an element with the ARIA attribute aria-pressed=mixed.
 */
msgs.MSG_CHROMEVOX_ARIA_PRESSED_MIXED = goog.getMsg('Partially pressed');


/**
 * @desc Braille of element with the ARIA attribute aria-pressed=mixed.
 */
msgs.MSG_CHROMEVOX_ARIA_PRESSED_MIXED_BRL = goog.getMsg('/x');


/**
 * @desc Describes an element with the ARIA attribute aria-readonly=true.
 */
msgs.MSG_CHROMEVOX_ARIA_READONLY_TRUE = goog.getMsg('Read only');


/**
 * @desc Braille of element with the ARIA attribute aria-readonly=true.
 */
msgs.MSG_CHROMEVOX_ARIA_READONLY_TRUE_BRL = goog.getMsg('rdonly');


/**
 * @desc Describes an element with the ARIA attribute aria-required=true.
 */
msgs.MSG_CHROMEVOX_ARIA_REQUIRED_TRUE = goog.getMsg('Required');


/**
 * @desc Braille of element with the ARIA attribute aria-required=true.
 */
msgs.MSG_CHROMEVOX_ARIA_REQUIRED_TRUE_BRL = goog.getMsg('req');


/**
 * @desc Describes an element with the ARIA attribute aria-selected=true.
 */
msgs.MSG_CHROMEVOX_ARIA_SELECTED_TRUE = goog.getMsg('Selected');


/**
 * @desc Braille of element with the ARIA attribute aria-selected=true.
 */
msgs.MSG_CHROMEVOX_ARIA_SELECTED_TRUE_BRL = goog.getMsg('x');


/**
 * @desc Describes an element with the ARIA attribute aria-selected=false.
 */
msgs.MSG_CHROMEVOX_ARIA_SELECTED_FALSE = goog.getMsg('Not selected');


/**
 * @desc Braille of element with the ARIA attribute aria-selected=false.
 */
msgs.MSG_CHROMEVOX_ARIA_SELECTED_FALSE_BRL = goog.getMsg(' ');


//// DOM messages.


/**
 * @desc Spoken to describe an <a> tag.
 */
msgs.MSG_CHROMEVOX_TAG_LINK =
    goog.getMsg('Link');


/**
 * @desc Brailled to describe an <a> tag.
 */
msgs.MSG_CHROMEVOX_TAG_LINK_BRL =
    goog.getMsg('lnk');


/**
 * @desc Spoken to describe a <button> tag.
 */
msgs.MSG_CHROMEVOX_TAG_BUTTON =
    goog.getMsg('Button');


/**
 * @desc Brailled to describe a <button> tag.
 */
msgs.MSG_CHROMEVOX_TAG_BUTTON_BRL =
    goog.getMsg('btn');


/**
 * @desc Spoken to describe a <h1> tag.
 */
msgs.MSG_CHROMEVOX_TAG_H1 =
    goog.getMsg('Heading 1');


/**
 * @desc Brailled to describe a <h1> tag.
 */
msgs.MSG_CHROMEVOX_TAG_H1_BRL =
    goog.getMsg('h1');


/**
 * @desc Spoken to describe a <h2> tag.
 */
msgs.MSG_CHROMEVOX_TAG_H2 =
    goog.getMsg('Heading 2');


/**
 * @desc Brailled to describe a <h2> tag.
 */
msgs.MSG_CHROMEVOX_TAG_H2_BRL =
    goog.getMsg('h2');


/**
 * @desc Spoken to describe a <h3> tag.
 */
msgs.MSG_CHROMEVOX_TAG_H3 =
    goog.getMsg('Heading 3');


/**
 * @desc Brailled to describe a <h3> tag.
 */
msgs.MSG_CHROMEVOX_TAG_H3_BRL =
    goog.getMsg('h3');


/**
 * @desc Spoken to describe a <h4> tag.
 */
msgs.MSG_CHROMEVOX_TAG_H4 =
    goog.getMsg('Heading 4');


/**
 * @desc Brailled to describe a <h4> tag.
 */
msgs.MSG_CHROMEVOX_TAG_H4_BRL =
    goog.getMsg('h4');


/**
 * @desc Spoken to describe a <h5> tag.
 */
msgs.MSG_CHROMEVOX_TAG_H5 =
    goog.getMsg('Heading 5');


/**
 * @desc Brailled to describe a <h5> tag.
 */
msgs.MSG_CHROMEVOX_TAG_H5_BRL =
    goog.getMsg('h5');


/**
 * @desc Spoken to describe a <h6> tag.
 */
msgs.MSG_CHROMEVOX_TAG_H6 =
    goog.getMsg('Heading 6');


/**
 * @desc Brailled to describe a <h6> tag.
 */
msgs.MSG_CHROMEVOX_TAG_H6_BRL =
    goog.getMsg('h6');


/**
 * @desc Spoken to describe a <li> tag.
 */
msgs.MSG_CHROMEVOX_TAG_LI =
    goog.getMsg('List item');


/**
 * @desc Brailled to describe a <li> tag.
 */
msgs.MSG_CHROMEVOX_TAG_LI_BRL =
    goog.getMsg('lstitm');


/**
 * @desc Spoken to describe a <ol> tag.
 */
msgs.MSG_CHROMEVOX_TAG_OL =
    goog.getMsg('Ordered List');


/**
 * @desc Brailled to describe a <ol> tag.
 */
msgs.MSG_CHROMEVOX_TAG_OL_BRL =
    goog.getMsg('lst');


/**
 * @desc Spoken to describe a <select> tag.
 */
msgs.MSG_CHROMEVOX_TAG_SELECT =
    goog.getMsg('Combo box');


/**
 * @desc Brailled to describe a <select> tag.
 */
msgs.MSG_CHROMEVOX_TAG_SELECT_BRL =
    goog.getMsg('cbx');


/**
 * @desc Spoken to describe a <textarea> tag.
 */
msgs.MSG_CHROMEVOX_TAG_TEXTAREA =
    goog.getMsg('Text area');


/**
 * @desc Brailled to describe a <textarea> tag.
 */
msgs.MSG_CHROMEVOX_TAG_TEXTAREA_BRL =
    goog.getMsg('txta');


/**
 * @desc Spoken to describe a <table> tag.
 */
msgs.MSG_CHROMEVOX_TAG_TABLE = goog.getMsg('table');


/**
 * @desc Brailled to describe a <table> tag.
 */
msgs.MSG_CHROMEVOX_TAG_TABLE_BRL = goog.getMsg('tbl');


/**
 * @desc Spoken to describe a <ul> tag.
 */
msgs.MSG_CHROMEVOX_TAG_UL =
    goog.getMsg('List');


/**
 * @desc Brailled to describe a <ul> tag.
 */
msgs.MSG_CHROMEVOX_TAG_UL_BRL =
    goog.getMsg('lst');


/**
 * @desc Spoken to describe a <section> tag.
 */
msgs.MSG_CHROMEVOX_TAG_SECTION =
    goog.getMsg('Section');


/**
 * @desc Brailled to describe a <section> tag.
 */
msgs.MSG_CHROMEVOX_TAG_SECTION_BRL =
    goog.getMsg('stn');


/**
 * @desc Spoken to describe a <nav> tag.
 */
msgs.MSG_CHROMEVOX_TAG_NAV =
    goog.getMsg('Navigation');


/**
 * @desc Brailled to describe a <nav> tag.
 */
msgs.MSG_CHROMEVOX_TAG_NAV_BRL =
    goog.getMsg('nav');


/**
 * @desc Spoken to describe a <article> tag.
 */
msgs.MSG_CHROMEVOX_TAG_ARTICLE =
    goog.getMsg('Article');


/**
 * @desc Brailled to describe a <article> tag.
 */
msgs.MSG_CHROMEVOX_TAG_ARTICLE_BRL =
    goog.getMsg('article');


/**
 * @desc Spoken to describe a <aside> tag.
 */
msgs.MSG_CHROMEVOX_TAG_ASIDE =
    goog.getMsg('Aside');


/**
 * @desc Brailled to describe a <aside> tag.
 */
msgs.MSG_CHROMEVOX_TAG_ASIDE_BRL =
    goog.getMsg('aside');


/**
 * @desc Spoken to describe a <hgroup> tag.
 */
msgs.MSG_CHROMEVOX_TAG_HGROUP =
    goog.getMsg('Heading group');


/**
 * @desc Brailled to describe a <hgroup> tag.
 */
msgs.MSG_CHROMEVOX_TAG_HGROUP_BRL =
    goog.getMsg('hgrp');


/**
 * @desc Spoken to describe a <header> tag.
 */
msgs.MSG_CHROMEVOX_TAG_HEADER =
    goog.getMsg('Header');


/**
 * @desc Brailled to describe a <header> tag.
 */
msgs.MSG_CHROMEVOX_TAG_HEADER_BRL =
    goog.getMsg('hdr');


/**
 * @desc Spoken to describe a <footer> tag.
 */
msgs.MSG_CHROMEVOX_TAG_FOOTER =
    goog.getMsg('Footer');


/**
 * @desc Brailled to describe a <footer> tag.
 */
msgs.MSG_CHROMEVOX_TAG_FOOTER_BRL =
    goog.getMsg('ftr');


/**
 * @desc Spoken to describe a <time> tag.
 */
msgs.MSG_CHROMEVOX_TAG_TIME =
    goog.getMsg('Time');


/**
 * @desc Brailled to describe a <time> tag.
 */
msgs.MSG_CHROMEVOX_TAG_TIME_BRL =
    goog.getMsg(' ');


/**
 * @desc Spoken to describe a <mark> tag.
 */
msgs.MSG_CHROMEVOX_TAG_MARK =
    goog.getMsg('Mark');


/**
 * @desc Brailled to describe a <mark> tag.
 */
msgs.MSG_CHROMEVOX_TAG_MARK_BRL =
    goog.getMsg('mark');


/**
 * @desc Spoken to describe a <video> tag.
 */
msgs.MSG_CHROMEVOX_TAG_VIDEO =
    goog.getMsg('Video');


/**
 * @desc Brailled to describe a <video> tag.
 */
msgs.MSG_CHROMEVOX_TAG_VIDEO_BRL =
    goog.getMsg('video');


/**
 * @desc Spoken to describe a <audio> tag.
 */
msgs.MSG_CHROMEVOX_TAG_AUDIO =
    goog.getMsg('Audio');


/**
 * @desc Brailled to describe a <audio> tag.
 */
msgs.MSG_CHROMEVOX_TAG_AUDIO_BRL =
    goog.getMsg('audio');


/**
 * @desc Describes an <input> element with type=button.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_BUTTON = goog.getMsg('Button');


/**
 * @desc Brailles an <input> element with type=button.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_BUTTON_BRL = goog.getMsg('btn');


/**
 * @desc Describes an <input> element with type=checkbox.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_CHECKBOX = goog.getMsg('Check box');


/**
 * @desc Brailles an <input> element with type=checkbox.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_CHECKBOX_BRL = goog.getMsg('chx');


/**
 * @desc Describes an <input> element with type=color.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_COLOR = goog.getMsg('Color picker');


/**
 * @desc Brailles an <input> element with type=color.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_COLOR_BRL = goog.getMsg('color picker');


/**
 * @desc Describes an <input> element with type=datetime.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_DATETIME = goog.getMsg('Date time control');


/**
 * @desc Brailles an <input> element with type=datetime.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_DATETIME_BRL = goog.getMsg('date time');


/**
 * @desc Describes an <input> element with type=datetime-local.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_DATETIME_LOCAL =
    goog.getMsg('Date time control');


/**
 * @desc Brailles an <input> element with type=datetime-local.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_DATETIME_LOCAL_BRL =
    goog.getMsg('date time');


/**
 * @desc Describes an <input> element with type=date.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_DATE = goog.getMsg('Date control');


/**
 * @desc Brailles an <input> element with type=date.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_DATE_BRL = goog.getMsg('date');


/**
 * @desc Describes an <input> element with type=email.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_EMAIL = goog.getMsg('Edit text, email entry');


/**
 * @desc Brailles an <input> element with type=email.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_EMAIL_BRL = goog.getMsg('edtxt email');


/**
 * @desc Describes an <input> element with type=file.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_FILE = goog.getMsg('File selection');


/**
 * @desc Brailles an <input> element with type=file.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_FILE_BRL = goog.getMsg('file');


/**
 * @desc Describes an <input> element with type=image.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_IMAGE = goog.getMsg('Button');


/**
 * @desc Brailles an <input> element with type=image.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_IMAGE_BRL = goog.getMsg('btn');


/**
 * @desc Describes an <input> element with type=month.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_MONTH = goog.getMsg('Month control');


/**
 * @desc Brailles an <input> element with type=month.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_MONTH_BRL = goog.getMsg('month');


/**
 * @desc Describes an <input> element with type=number.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_NUMBER =
    goog.getMsg('Edit text numeric only');


/**
 * @desc Brailles an <input> element with type=number.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_NUMBER_BRL =
    goog.getMsg('edtxt#');


/**
 * @desc Describes an <input> element with type=password.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_PASSWORD = goog.getMsg('Password edit text');


/**
 * @desc Brailles an <input> element with type=password.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_PASSWORD_BRL = goog.getMsg('pwd edtxt');


/**
 * @desc Describes an <input> element with type=radio.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_RADIO = goog.getMsg('Radio button');


/**
 * @desc Brailles an <input> element with type=radio.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_RADIO_BRL = goog.getMsg('rd btn');


/**
 * @desc Describes an <input> element with type=range.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_RANGE = goog.getMsg('Slider');


/**
 * @desc Brailles an <input> element with type=range.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_RANGE_BRL = goog.getMsg('slr');


/**
 * @desc Describes an <input> element with type=reset.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_RESET = goog.getMsg('Reset');


/**
 * @desc Brailles an <input> element with type=reset.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_RESET_BRL = goog.getMsg('reset');


/**
 * @desc Describes an <input> element with type=search.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_SEARCH = goog.getMsg('Edit text, search entry');


/**
 * @desc Brailles an <input> element with type=search.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_SEARCH_BRL = goog.getMsg('search edtxt');


/**
 * @desc Describes an <input> element with type=submit.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_SUBMIT = goog.getMsg('Button');


/**
 * @desc Brailles an <input> element with type=submit.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_SUBMIT_BRL = goog.getMsg('btn');


/**
 * @desc Describes an <input> element with type=tel.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_TEL =
    goog.getMsg('Edit text, number entry');


/**
 * @desc Brailles an <input> element with type=tel.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_TEL_BRL =
    goog.getMsg('tele# edtxt');


/**
 * @desc Describes an <input> element with type=text.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_TEXT = goog.getMsg('Edit text');


/**
 * @desc Brailles an <input> element with type=text.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_TEXT_BRL = goog.getMsg('edtxt');


/**
 * @desc Describes an <input> element with type=url.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_URL = goog.getMsg('Edit text, URL entry');


/**
 * @desc Brailles an <input> element with type=url.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_URL_BRL = goog.getMsg('url edtxt');


/**
 * @desc Describes an <input> element with type=week.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_WEEK =
    goog.getMsg('Week of the year control');


/**
 * @desc Brailles an <input> element with type=week.
 */
msgs.MSG_CHROMEVOX_INPUT_TYPE_WEEK_BRL =
    goog.getMsg('week');


/**
 * @desc Spoken to describe a <a> tag with a link to an internal anchor.
 */
msgs.MSG_CHROMEVOX_INTERNAL_LINK = goog.getMsg('Internal link');


/**
 * @desc Brailles to describe a <a> tag with a link to an internal anchor.
 */
msgs.MSG_CHROMEVOX_INTERNAL_LINK_BRL = goog.getMsg('int lnk');


/**
 * @desc In an editable text box, describes a blank line.
 */
msgs.MSG_CHROMEVOX_TEXT_BOX_BLANK = goog.getMsg('Blank');


/**
 * @desc Further describes a list-like element with a number of items.
 * e.g. This will be combined with other messages to produce:
 * List with 3 items.
 * NOTE(deboer):  This is questionable, it may be better to include 'List'
 * in this message.
 */
msgs.MSG_CHROMEVOX_LIST_WITH_ITEMS =
    goog.getMsg('with {$num} items', {'num': '$1'});


/**
 * @desc Further describes a list-like element with a number of items in
 * braille.
 */
msgs.MSG_CHROMEVOX_LIST_WITH_ITEMS_BRL =
    goog.getMsg('+{$num}', {'num': '$1'});


/**
 * @desc Describes the state of a progress bar, in percent.
 */
msgs.MSG_CHROMEVOX_STATE_PERCENT =
    goog.getMsg('{$num}%', {'num': '$1'});


/**
 * @desc Brailles the state of a progress bar, in percent.
 */
msgs.MSG_CHROMEVOX_STATE_PERCENT_BRL =
    goog.getMsg('{$num}%', {'num': '$1'});


/**
 * @desc Phrase indicating a menu item has a submenu.
 */
msgs.MSG_CHROMEVOX_HAS_SUBMENU =
    goog.getMsg('with submenu');


/**
 * @desc Brailled after an menu is spoken if the menu has a submenu.
 */
msgs.MSG_CHROMEVOX_HAS_SUBMENU_BRL = goog.getMsg('+submnu');


/**
 * @desc Phrase indicating a control has a pop-up component to it.
 */
msgs.MSG_CHROMEVOX_HAS_POPUP =
    goog.getMsg('has popup');


/**
 * @desc Brailled phrase indicating a control has a pop-up component to it.
 */
msgs.MSG_CHROMEVOX_HAS_POPUP_BRL =
    goog.getMsg('has popup');


/**
 * @desc Describes a collection of tags. e.g. A 'link collection'.
 */
msgs.MSG_CHROMEVOX_COLLECTION = goog.getMsg(
    '{$tag} collection with {$num} items', {'tag': '$1', 'num': '$2'});


/**
 * @desc The "Enter" key on the keyboard.
 */
msgs.MSG_CHROMEVOX_ENTER_KEY = goog.getMsg('Enter');


/**
 * @desc The "Space" key on the keyboard.
 */
msgs.MSG_CHROMEVOX_SPACE_KEY = goog.getMsg('Space');


/**
 * @desc The "Backspace" key on the keyboard.
 */
msgs.MSG_CHROMEVOX_BACKSPACE_KEY = goog.getMsg('Backspace');


/**
 * @desc The "Tab" key on the keyboard.
 */
msgs.MSG_CHROMEVOX_TAB_KEY = goog.getMsg('Tab');


/**
 * @desc The "Left" key on the keyboard.
 */
msgs.MSG_CHROMEVOX_LEFT_KEY = goog.getMsg('Left');


/**
 * @desc The "Up" key on the keyboard.
 */
msgs.MSG_CHROMEVOX_UP_KEY = goog.getMsg('Up');


/**
 * @desc The "Right" key on the keyboard.
 */
msgs.MSG_CHROMEVOX_RIGHT_KEY = goog.getMsg('Right');


/**
 * @desc The "Down" key on the keyboard.
 */
msgs.MSG_CHROMEVOX_DOWN_KEY = goog.getMsg('Down');


/**
 * @desc Describes an element with a link that has no known URL.
 */
msgs.MSG_CHROMEVOX_UNKNOWN_LINK = goog.getMsg('Unknown link');


/**
 * @desc The spoken feedback for the command to toggle ChromeVox between
 * active and inactive states.
 */
msgs.MSG_CHROMEVOX_TOGGLE_CHROMEVOX_ACTIVE =
    goog.getMsg('Toggle ChromeVox active or inactive.');


/**
 * @desc The spoken feedback when ChromeVox becomes inactive.
 */
msgs.MSG_CHROMEVOX_CHROMEVOX_INACTIVE =
    goog.getMsg('ChromeVox is now inactive.');


/**
 * @desc The indicator of a pause to tts.
 */
msgs.MSG_CHROMEVOX_PAUSE = goog.getMsg(', ');


/**
 * @desc The indicator of a end to tts.
 */
msgs.MSG_CHROMEVOX_END = goog.getMsg('. ');


/**
 * @desc Description of the previous different element command displayed in the
 * options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_DIFFERENT_ELEMENT =
    goog.getMsg('Previous different element.');


/**
 * @desc Description of the next different element command displayed in the
 * options page.
 */
msgs.MSG_CHROMEVOX_NEXT_DIFFERENT_ELEMENT =
    goog.getMsg('Next different element.');


/**
 * @desc Description of the previous similar element command displayed in the
 * options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_SIMILAR_ELEMENT =
    goog.getMsg('Previous similar element.');


/**
 * @desc Description of the next similar element command.
 */
msgs.MSG_CHROMEVOX_NEXT_SIMILAR_ELEMENT =
    goog.getMsg('Next similar element.');


/**
 * @desc Verbal indication of no more similar elements.
 */
msgs.MSG_CHROMEVOX_NO_MORE_SIMILAR_ELEMENTS =
    goog.getMsg('No more similar elements.');


/**
 * @desc Verbal indication of no more different elements.
 */
msgs.MSG_CHROMEVOX_NO_MORE_DIFFERENT_ELEMENTS =
    goog.getMsg('No more different elements.');


/**
 * @desc Describes an element with the ARIA role link.
 */
msgs.MSG_CHROMEVOX_INDEX_TOTAL = goog.getMsg(
    '{$index} of {$total}', {'index': '$1', 'total': '$2'});


/**
 * @desc Description of the enter group exploration user command.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_ENTER_CSS_SPACE = goog.getMsg('Enter group exploration');


/**
 * @desc Spoken when entering group exploration.
 */
msgs.MSG_CHROMEVOX_ENTER_GROUP_EXPLORATION = goog.getMsg('Exploring groups');


/**
 * @desc A message displayed at the top of PDF files where text has
 * been automatically extracted for accessibility.
 */
msgs.MSG_CHROMEVOX_PDF_HEADER = goog.getMsg(
    'This page contains the text automatically extracted from the PDF file ' +
    '<b>{$filename}</b>. <a href="{$url}">Click here for the original.</a>',
    {'filename': '$1', 'url': '$2'});


/**
 * @desc A message spoken when the user switches to the object granularity,
 * which allows users to navigate the page by objects.
 */
msgs.MSG_CHROMEVOX_OBJECT_STRATEGY = goog.getMsg('Object');


/**
 * @desc A message spoken when the user switches to the group granularity,
 * which allows users to navigate the page by groups.
 */
msgs.MSG_CHROMEVOX_GROUP_STRATEGY = goog.getMsg('Group');


/**
 * @desc A message spoken when the user switches to the table granularity,
 * which allows users to navigate within a group.
 */
msgs.MSG_CHROMEVOX_TABLE_STRATEGY = goog.getMsg('Table');



/**
 * @desc A message spoken when the user switches to the row granularity,
 * which allows users to navigate within a table.
 */
msgs.MSG_CHROMEVOX_ROW_GRANULARITY = goog.getMsg('Row');


/**
 * @desc A message spoken when the user switches to the column granularity,
 * which allows users to navigate within a column.
 */
msgs.MSG_CHROMEVOX_COLUMN_GRANULARITY = goog.getMsg('Column');


/**
 * @desc A message spoken when the user switches to the MathMl tree
 * granularity, which allows users to navigate within a math expression.
 */
msgs.MSG_CHROMEVOX_MATHML_TREE_GRANULARITY = goog.getMsg('Math ML Tree');


/**
 * @desc A message spoken when the user switches to the MathMl layout
 * granularity, which allows users to navigate within a math expression.
 */
msgs.MSG_CHROMEVOX_MATHML_LAYOUT_GRANULARITY = goog.getMsg('Math ML Layout');


/**
 * @desc A message spoken when the user switches to the MathMl token
 * granularity, which allows users to navigate within a math expression.
 */
msgs.MSG_CHROMEVOX_MATHML_TOKEN_GRANULARITY = goog.getMsg('Math ML Token');


/**
 * @desc A message spoken when the user switches to the MathMl leaf
 * granularity, which allows users to navigate within a math expression.
 */
msgs.MSG_CHROMEVOX_MATHML_LEAF_GRANULARITY = goog.getMsg('Math ML Leaf');


/**
 * @desc A message spoken when the user switches to the visual granularity,
 * which allows users to navigate the page by visual regions.
 */
msgs.MSG_CHROMEVOX_VISUAL_STRATEGY = goog.getMsg('Visual');


/**
 * @desc A message spoken when the user switches to a custom granularity,
 * which allows users to navigate in a yet-to-be-defined manner.
 */
msgs.MSG_CHROMEVOX_CUSTOM_STRATEGY = goog.getMsg('Custom');



/**
 * @desc A message spoken when the user switches to the line granularity,
 * which allows users to navigate the page one line at a time.
 */
msgs.MSG_CHROMEVOX_LINE_GRANULARITY = goog.getMsg('Line');


/**
 * @desc A message spoken when the user switches to the sentence granularity,
 * which allows users to navigate the page one sentence at a time.
 */
msgs.MSG_CHROMEVOX_SENTENCE_GRANULARITY = goog.getMsg('Sentence');


/**
 * @desc A message spoken when the user switches to the word granularity,
 * which allows users to navigate the page one word at a time.
 */
msgs.MSG_CHROMEVOX_WORD_GRANULARITY = goog.getMsg('Word');


/**
 * @desc A message spoken when the user switches to the character granularity,
 * which allows users to navigate the page one character at a time.
 */
msgs.MSG_CHROMEVOX_CHARACTER_GRANULARITY = goog.getMsg('Character');


/**
 * @desc Spoken when the search widget first shows.
 */
msgs.MSG_CHROMEVOX_SEARCH_WIDGET_INTRO = goog.getMsg('Find in page.');


/**
 * @desc Spoken help message when the search widget shows.
 */
msgs.MSG_CHROMEVOX_SEARCH_WIDGET_INTRO_HELP =
    goog.getMsg('Enter a search query.');


/**
 * @desc Spoken message when the search widget hides.
 */
msgs.MSG_CHROMEVOX_SEARCH_WIDGET_OUTRO =
    goog.getMsg('Exited find in page.');


/**
 * @desc Spoken message when the search widget has no more search results.
 */
msgs.MSG_CHROMEVOX_SEARCH_WIDGET_NO_RESULTS =
    goog.getMsg('No more results.');


/**
 * @desc Category displayed in the options page under keyboard commands.
 */
msgs.MSG_CHROMEVOX_MODIFIER_KEYS = goog.getMsg('Modifier Keys');


/**
 * @desc Category displayed in the options page under keyboard commands.
 */
msgs.MSG_CHROMEVOX_NAVIGATION = goog.getMsg('ChromeVox Navigation');


/**
 * @desc Category displayed in the options page under keyboard commands.
 */
msgs.MSG_CHROMEVOX_INFORMATION = goog.getMsg('Information');


/**
 * @desc Category displayed in the options page under keyboard commands.
 */
msgs.MSG_CHROMEVOX_HELP_COMMANDS = goog.getMsg('Help Commands');


/**
 * @desc Category displayed in the options page under keyboard commands.
 */
msgs.MSG_CHROMEVOX_CONTROLLING_SPEECH = goog.getMsg('Controlling Speech');


/**
 * @desc Category displayed in the options page under keyboard commands.
 */
msgs.MSG_CHROMEVOX_OVERVIEW = goog.getMsg('Overview');


/**
 * @desc Category displayed in the options page under keyboard commands.
 */
msgs.MSG_CHROMEVOX_TABLES = goog.getMsg('Tables');


/**
 * @desc Category displayed in the options page under keyboard commands.
 */
msgs.MSG_CHROMEVOX_JUMP_COMMANDS = goog.getMsg('Jump Commands');


/**
 * @desc Category displayed in the options page under keyboard commands.
 */
msgs.MSG_CHROMEVOX_BRAILLE = goog.getMsg('Braille');


/**
 * @desc Category displayed in the options page under keyboard commands.
 */
msgs.MSG_CHROMEVOX_DEVELOPER = goog.getMsg('Developer');


/**
 * @desc Name of the classic key map.
 */
msgs.MSG_CHROMEVOX_KEYMAP_CLASSIC = goog.getMsg('Classic keymap');


/**
 * @desc Name of the flat key map.
 */
msgs.MSG_CHROMEVOX_KEYMAP_FLAT = goog.getMsg('Flat keymap');


/**
 * @desc Name of the experimental key map.
 */
msgs.MSG_CHROMEVOX_KEYMAP_EXPERIMENTAL = goog.getMsg('Experimental keymap');


/**
 * @desc Description of the TTS console logging command.
 * Displayed in the options page.
 */
msgs.MSG_CHROMEVOX_ENABLE_TTS_LOG = goog.getMsg('Enable TTS logging');


/**
 * @desc Spoken when a user begins a selection on a webpage.
 */
msgs.MSG_CHROMEVOX_BEGIN_SELECTION = goog.getMsg('Start selection');


/**
 * @desc Spoken when a user ends a selection on a webpage.
 */
msgs.MSG_CHROMEVOX_END_SELECTION = goog.getMsg('End selection');


/**
 * @desc Spoken to describe the current selection.
 */
msgs.MSG_CHROMEVOX_SELECTION_IS = goog.getMsg('Selection is ');


/**
 * @desc Describes the toggle selection command.
 * Displayed in the options page.
 */
msgs.MSG_CHROMEVOX_TOGGLE_SELECTION = goog.getMsg('Start or end selection.');


/**
 * @desc Spoken when the browser's copy command is invoked.
 */
msgs.MSG_CHROMEVOX_COPY = goog.getMsg('copy.');


/**
 * @desc Spoken when the browser's cut command is invoked.
 *
  */
msgs.MSG_CHROMEVOX_CUT = goog.getMsg('cut.');


/**
 * @desc Spoken when the browser's paste command is invoked.
 */
msgs.MSG_CHROMEVOX_PASTE = goog.getMsg('paste.');


/**
 * @desc Spoken when additional characters are selected in editable text.
 */
msgs.MSG_CHROMEVOX_SELECTED = goog.getMsg('selected');


/**
 * @desc Spoken in editable text when text is unselected.
 */
msgs.MSG_CHROMEVOX_UNSELECTED = goog.getMsg('unselected');


/**
 * @desc Spoken when more than one character gets added to selection in editable
 * text.
 */
msgs.MSG_CHROMEVOX_ADDED_TO_SELECTION = goog.getMsg('added to selection');


/**
 * @desc Spoken when more than one character gets removed from selection in
 * editable text.
 */
msgs.MSG_CHROMEVOX_REMOVED_FROM_SELECTION =
    goog.getMsg('removed from selection');


/**
 * @desc Spoken as the conjunction between hotkey combinations like ctrl then
 * alt followed by a.
 */
msgs.MSG_CHROMEVOX_THEN = goog.getMsg('then');


/**
 * @desc Spoken as the conjunction between hotkey combinations like ctrl then
 * alt followed by a.
 */
msgs.MSG_CHROMEVOX_FOLLOWED_BY = goog.getMsg('followed by');


/**
 * @desc Spoken to describe the ChromeVox modifier keys when describing a key
 * combination.
 */
msgs.MSG_CHROMEVOX_MODIFIER_KEY = goog.getMsg('ChromeVox modifier');


/**
 * @desc Spoken when a key conflict occurs in the options page.
 */
msgs.MSG_CHROMEVOX_KEY_CONFLICT =
    goog.getMsg('{$key} is already assigned to a command.', {'key': '$1'});


/**
 * @desc Spoken to describe the current selection is a Math object.
 */
msgs.MSG_CHROMEVOX_MATH_EXPR = goog.getMsg('Math');

/**
 * @desc Brailled phrase indicating the current selection is a Math object.
 */
msgs.MSG_CHROMEVOX_MATH_EXPR_BRL = goog.getMsg('Math');

/**
 * @desc Describes an element with the ARIA role math.
 */
msgs.MSG_CHROMEVOX_NOT_INSIDE_MATH = goog.getMsg('Not inside math');

/**
 * @desc Time widget. Indicates the user is on the AM/PM field.
 */
msgs.MSG_CHROMEVOX_TIMEWIDGET_AMPM = goog.getMsg('AM PM');


/**
 * @desc Time widget. Indicates the user is on the hours field.
 */
msgs.MSG_CHROMEVOX_TIMEWIDGET_HOURS = goog.getMsg('hours');


/**
 * @desc Time widget. Indicates the user is on the minutes field.
 */
msgs.MSG_CHROMEVOX_TIMEWIDGET_MINUTES = goog.getMsg('minutes');


/**
 * @desc Time widget. Indicates the user is on the seconds field.
 */
msgs.MSG_CHROMEVOX_TIMEWIDGET_SECONDS = goog.getMsg('seconds');


/**
 * @desc Time widget. Indicates the user is on the milliseconds field.
 */
msgs.MSG_CHROMEVOX_TIMEWIDGET_MILLISECONDS = goog.getMsg('milliseconds');


/**
 * @desc Time widget. Indicates the AM/PM is set to AM.
 */
msgs.MSG_CHROMEVOX_TIMEWIDGET_AM = goog.getMsg('AM');


/**
 * @desc Time widget. Indicates the AM/PM is set to PM.
 */
msgs.MSG_CHROMEVOX_TIMEWIDGET_PM = goog.getMsg('PM');


/**
 * @desc Date widget. Indicates the user is on the week field.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_WEEK = goog.getMsg('week');


/**
 * @desc Date widget. Indicates that the month is January.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_JANUARY = goog.getMsg('January');


/**
 * @desc Date widget. Indicates that the month is February.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_FEBRUARY = goog.getMsg('February');


/**
 * @desc Date widget. Indicates that the month is March.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_MARCH = goog.getMsg('March');


/**
 * @desc Date widget. Indicates that the month is April.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_APRIL = goog.getMsg('April');


/**
 * @desc Date widget. Indicates that the month is May.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_MAY = goog.getMsg('May');


/**
 * @desc Date widget. Indicates that the month is June.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_JUNE = goog.getMsg('June');


/**
 * @desc Date widget. Indicates that the month is July.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_JULY = goog.getMsg('July');


/**
 * @desc Date widget. Indicates that the month is August.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_AUGUST = goog.getMsg('August');


/**
 * @desc Date widget. Indicates that the month is September.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_SEPTEMBER = goog.getMsg('September');


/**
 * @desc Date widget. Indicates that the month is October.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_OCTOBER = goog.getMsg('October');


/**
 * @desc Date widget. Indicates that the month is November.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_NOVEMBER = goog.getMsg('November');


/**
 * @desc Date widget. Indicates that the month is December.
 */
msgs.MSG_CHROMEVOX_DATEWIDGET_DECEMBER = goog.getMsg('December');


/**
 * @desc Spoken when a user switches to a mode announcing no punctuation.
 */
msgs.MSG_CHROMEVOX_NO_PUNCTUATION = goog.getMsg('No punctuation');


/**
 * @desc Spoken when a user switches to a mode announcing some punctuation.
 */
msgs.MSG_CHROMEVOX_SOME_PUNCTUATION = goog.getMsg('Some punctuation');


/**
 * @desc Spoken when a user switches to a mode announcing all punctuation.
 */
msgs.MSG_CHROMEVOX_ALL_PUNCTUATION = goog.getMsg('All punctuation');


/**
 * @desc Spoken as help after every search result in search widget.
 */
msgs.MSG_CHROMEVOX_SEARCH_HELP_ITEM = goog.getMsg('Press enter to accept or' +
    ' escape to cancel, down for next and up for previous.');


/**
 * @desc Spoken to describe a clickable element.
 */
msgs.MSG_CHROMEVOX_CLICKABLE = goog.getMsg('clickable');


/**
 * @desc Brailled to describe a clickable element.
 */
msgs.MSG_CHROMEVOX_CLICKABLE_BRL = goog.getMsg('clickable');


/**
 * @desc The description of the previous character command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_CHARACTER = goog.getMsg('Previous Character');


/**
 * @desc The description of the next character command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_CHARACTER = goog.getMsg('Next Character');


/**
 * @desc The description of the previous word command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_WORD = goog.getMsg('Previous Word');


/**
 * @desc The description of the next word command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_WORD = goog.getMsg('Next Word');


/**
 * @desc The description of the previous sentence command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_SENTENCE = goog.getMsg('Previous Sentence');


/**
 * @desc The description of the next sentence command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_SENTENCE = goog.getMsg('Next Sentence');



/**
 * @desc The description of the previous line command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_LINE = goog.getMsg('Previous Line');


/**
 * @desc The description of the next line command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_LINE = goog.getMsg('Next Line');


/**
 * @desc The description of the previous object command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_OBJECT = goog.getMsg('Previous Object');


/**
 * @desc The description of the next object command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_OBJECT = goog.getMsg('Next Object');


/**
 * @desc The description of the previous group command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_PREVIOUS_GROUP = goog.getMsg('Previous Group');


/**
 * @desc The description of the next group command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_NEXT_GROUP = goog.getMsg('Next Group');


/**
 * @desc Describes nodes or anything describing them as a landmark.
 */
msgs.MSG_CHROMEVOX_ROLE_LANDMARK = goog.getMsg('Landmark');


/**
 * @desc Spoken when user types invalid keys into the modifier selection field.
 */
msgs.MSG_CHROMEVOX_MODIFIER_ENTRY_ERROR = goog.getMsg(
    'No modifier pressed; please press and hold one or more modifiers; lift' +
    ' your fingers once done and you will hear the keys set. Tab to exit.');


/**
 * @desc Spoken when a modifier key becomes successfully set.
 */
msgs.MSG_CHROMEVOX_MODIFIER_ENTRY_SET =
    goog.getMsg('{$key} is now the new ChromeVox modifier.', {'key': '$1'});


/**
 * @desc Spoken when resetting the current keymap to defaults.
 */
msgs.MSG_CHROMEVOX_KEYMAP_RESET =
    goog.getMsg('{$key} has been reset.', {'key': '$1'});


/**
 * @desc Spoken when switched to a keymap different from the current one.
 */
msgs.MSG_CHROMEVOX_KEYMAP_SWITCH =
    goog.getMsg('Switched to {$key}.', {'key': '$1'});


/**
 * @desc The description of the key to move to the beginning of the page.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_JUMP_TO_TOP =
    goog.getMsg('Jump to the top of the page');


/**
 * @desc The description of the key to move to the end of the page.
 * Displayed in the Options page.
 */
msgs.MSG_CHROMEVOX_JUMP_TO_BOTTOM =
    goog.getMsg('Jump to the bottom of the page');


/**
 * @desc Message telling the user that they will wrap to the top of the page.
 */
msgs.MSG_CHROMEVOX_WRAPPED_TO_TOP =
    goog.getMsg('Wrapped to top');


/**
 * @desc Message telling the user that they will wrap to the bottom of the page.
 */
msgs.MSG_CHROMEVOX_WRAPPED_TO_BOTTOM =
    goog.getMsg('Wrapped to bottom');


/**
 * @desc Description of the cycle punctuation echo key.
 * Shown in options page.
 */
msgs.MSG_CHROMEVOX_CYCLE_PUNCTUATION_ECHO =
    goog.getMsg('Cycle punctuation echo');


/**
 * @desc Description of the cycle typing echo key.
 * Shown in options page.
 */
msgs.MSG_CHROMEVOX_CYCLE_TYPING_ECHO =
    goog.getMsg('Cycle typing echo');

/**
 * @desc The description of the pauseAllMedia key.
 * Shown in options page.
 */
msgs.MSG_CHROMEVOX_PAUSE_ALL_MEDIA =
    goog.getMsg('Pauses all currently playing media widgets');

/**
 * @desc The description of the openLongDesc key.
 * Shown in options page.
 */
msgs.MSG_CHROMEVOX_OPEN_LONG_DESC =
    goog.getMsg('Open long description in a new tab');


/**
 * @desc Message telling the user that there is no long description if they try
 * to open the long description for an element which does not have one.
 */
msgs.MSG_CHROMEVOX_NO_LONG_DESC =
    goog.getMsg('No long description');


/**
 * @desc Message telling the user that the current image has a long description.
 */
msgs.MSG_CHROMEVOX_IMAGE_WITH_LONG_DESC =
    goog.getMsg('Image with long description');


/**
 * @desc Describes the value of a selection of items within a listbox. For
 * example, 'Mercury to Jupiter, selected 5 items'.
 */
msgs.MSG_CHROMEVOX_SELECTED_OPTIONS_VALUE =
    goog.getMsg('{$v1} to {$v2}', {'v1': '$1', 'v2': '$2'});


/**
 * @desc Brailles the value of a selection of items within a listbox. For
 * example, 'Mercury-Jupiter, sld 5'.
 */
msgs.MSG_CHROMEVOX_SELECTED_OPTIONS_VALUE_BRL =
    goog.getMsg('{$v1}-{$v2}', {'v1': '$1', 'v2': '$2'});


/**
 * @desc Describes the count of a selection of items within a listbox. For
 * example, 'Mercury to Jupiter, selected 5 items'.
 */
msgs.MSG_CHROMEVOX_SELECTED_OPTIONS_STATE =
    goog.getMsg('selected {$count} items', {'count': '$1'});


/**
 * @desc Brailles the count of a selection of items within a listbox. For
 * example, 'Mercury-Jupiter, sld 5'.
 */
msgs.MSG_CHROMEVOX_SELECTED_OPTIONS_STATE_BRL =
    goog.getMsg('sld {$count}', {'count': '$1'});


/**
 * @desc Spoken when a selection on a page is cleared.
 */
msgs.MSG_CHROMEVOX_CLEAR_PAGE_SELECTION =
    goog.getMsg('cleared selection');

/**
 * @desc Spoken to describe character echo (a setting to speak characters while
 * typing into editable text fields).
 */
msgs.MSG_CHROMEVOX_CHARACTER_ECHO =
    goog.getMsg('character echo');


/**
 * @desc Spoken to describe word echo (a setting to speak words while
 * typing into editable text fields).
 */
msgs.MSG_CHROMEVOX_WORD_ECHO =
    goog.getMsg('word echo');


/**
 * @desc Spoken to describe character and word echo (a setting to speak
 * characters and words while typing into editable text fields).
 */
msgs.MSG_CHROMEVOX_CHARACTER_AND_WORD_ECHO =
    goog.getMsg('character and word echo');


/**
 * @desc Spoken to describe no echo (a setting to not speak characters or words
 * while typing into editable text fields).
 */
msgs.MSG_CHROMEVOX_NONE_ECHO =
    goog.getMsg('no typing echo');


/**
 * @desc Describes the enter content command in the options page.
 * Content refers to any special structure on the page such as tables or math.
 */
msgs.MSG_CHROMEVOX_ENTER_CONTENT =
    goog.getMsg('enter structured content, such as tables');


/**
 * @desc Describes the exit content command in the options page.
 * Content refers to any special structure on the page such as tables or math.
 */
msgs.MSG_CHROMEVOX_EXIT_CONTENT =
    goog.getMsg('exit structured content, such as tables');


/**
 * @desc Announced when user enters special content such as tables.
 */
msgs.MSG_CHROMEVOX_ENTER_CONTENT_SAY =
    goog.getMsg('entered {$type}', {'type': '$1'});


/**
 * @desc Spoken to describe structural lines.
 */
msgs.MSG_CHROMEVOX_STRUCTURAL_LINE =
    goog.getMsg('structural line');


/**
 * @desc Spoken to describe layout lines.
 */
msgs.MSG_CHROMEVOX_LAYOUT_LINE =
    goog.getMsg('line');


/**
 * @desc Displayed to describe the toggle line type (structural or layout).
 * Shown in the options page.
 */
msgs.MSG_CHROMEVOX_TOGGLE_LINE_TYPE =
    goog.getMsg('Toggle line type between structural or layout');


/**
 * @desc Describes the collection of navigation strategies for a table.
 */
msgs.MSG_CHROMEVOX_TABLE_SHIFTER =
    goog.getMsg('table');


/**
 * @desc Describes the defaultset of navigation strategies.
 */
msgs.MSG_CHROMEVOX_NAVIGATION_SHIFTER =
    goog.getMsg('default navigation');


/**
 * @desc Describes the collection of navigation strategies for math.
 */
msgs.MSG_CHROMEVOX_MATH_SHIFTER =
    goog.getMsg('math');


/**
 * @desc Displayed to describes the key that toggles semantic interpretation of
 *     mathematical formulas.
 */
msgs.MSG_CHROMEVOX_TOGGLE_SEMANTICS =
    goog.getMsg('Toggle interpretation of math expressions between structural' +
        ' and semantic');


/**
 * @desc Spoken when semantics interpretation is switched on.
 */
msgs.MSG_CHROMEVOX_SEMANTICS_ON = goog.getMsg('Semantics on');


/**
 * @desc Spoken when semantics interpretation is switched off.
 */
msgs.MSG_CHROMEVOX_SEMANTICS_OFF = goog.getMsg('Semantics off');


/**
 * @desc Used as a phonetic word hint for a particular letter. The word is used
 * to clarify similarly sounding letters like m and n.  This mapping is taken
 * directly from the NATO phonetic standard:
 * https://en.wikipedia.org/wiki/NATO_phonetic_alphabet
 * Please retain the structure of this string.  The structure is of the form
 * {"letter": "phonetic word equivalent", ..., "letter": "phonetic word
 * equivalent"}.  The first part of the mapping (letter) should be all letters
 * of the localization in lower case. The second part (phonetic word equivalent)
 * should be the word that describes the letter.
 */
msgs.MSG_CHROMEVOX_PHONETIC_MAP = goog.getMsg(
    '{"a": "alpha", "b": "bravo", "c": "charlie", "d": "delta", "e": "echo",' +
    ' "f": "foxtrot", "g": "golf", "h": "hotel", "i": "india", "j": "juliet",' +
    '"k": "kilo", "l": "lima", "m": "mike", "n": "november", "o": "oscar",' +
    '"p": "papa", "q": "quebec", "r": "romeo", "s": "sierra",' +
    ' "t": "tango", "u": "uniform", "v": "victor", "w": "whiskey",' +
    '"x": "xray", "y": "yankee", "z": "zulu"}');


/**
 * @desc Announces that the current page has 1 alert.
 */
msgs.MSG_CHROMEVOX_PAGE_HAS_ONE_ALERT_SINGULAR =
    goog.getMsg('This page has 1 alert');


/**
 * @desc Announces that the current page has multiple alerts.
 */
msgs.MSG_CHROMEVOX_PAGE_HAS_ALERTS_PLURAL =
    goog.getMsg('This page has {$num} alerts', {'num': '$1'});


/**
 * @desc Describes a key sequence that will let the user review
 * (examine and make a decision on) all of the alerts on the page.
 */
msgs.MSG_CHROMEVOX_REVIEW_ALERTS =
    goog.getMsg('Press Alt+Shift+A to review alerts');


/**
 * @desc Spoken if the user attempts to jump to the next article when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_NEXT_ARTICLE =
    goog.getMsg('No next article.');


/**
 * @desc Spoken if the user attempts to jump to the previous article when
 * none exists.
 */
msgs.MSG_CHROMEVOX_NO_PREVIOUS_ARTICLE =
    goog.getMsg('No previous article.');


/**
 * @desc Spoken when the browser first starts and ChromeVox is active.
 */
msgs.MSG_CHROMEVOX_CHROMEVOX_INTRO = goog.getMsg('ChromeVox is ready');


/**
 * @desc Brailled when ChromeVox is connected to a braille display.
 */
msgs.MSG_CHROMEVOX_INTRO_BRL = goog.getMsg('ChromeVox connected');

/**
 * @desc Spoken when earcons are on.
 */
msgs.MSG_CHROMEVOX_EARCONS_ON = goog.getMsg('Earcons on');


/**
 * @desc Spoken when earcons are off.
 */
msgs.MSG_CHROMEVOX_EARCONS_OFF = goog.getMsg('Earcons off');

/**
 * @desc Description of the toggle earcons key.
 * Shown in options page.
 */
msgs.MSG_CHROMEVOX_TOGGLE_EARCONS =
    goog.getMsg('Turn sound feedback (earcons) on or off.');

/**
 * @desc Description of the speak time and date key.
 * Shown in options page.
 */
msgs.MSG_CHROMEVOX_SPEAK_TIME_AND_DATE =
    goog.getMsg('Speak the current time and date.');

/**
 * @desc Abbreviation indicating following text is an incremental search result.
 * For example, in English, the abbreviation might be 'S:' for 'Search'.
 */
msgs.MSG_CHROMEVOX_MARK_AS_SEARCH_RESULT_BRL =
    goog.getMsg('S:{$result}', {'result': '$1'});


/**
 * @desc Announced when text within an editable text field gets deleted.
 */
msgs.MSG_CHROMEVOX_TEXT_DELETED =
    goog.getMsg('Deleted');


/**
 * @desc Describes the perform default action command. This is usually triggered
 * by hitting the enter key over a control.
 * Shown in options page.
 */
msgs.MSG_CHROMEVOX_PERFORM_DEFAULT_ACTION =
    goog.getMsg('Perform default action');


/**
 * @desc Spoken to describe a link (url) that has been previously visited.
 */
msgs.MSG_CHROMEVOX_VISITED_URL = goog.getMsg('visited');


/**
 * @desc Brailled to describe a link (url) that has been previously visited.
 */
msgs.MSG_CHROMEVOX_VISITED_URL_BRL = goog.getMsg('visited');


/**
 * @desc Exclamation (!) character description.
 */
msgs.MSG_CHROMEVOX_EXCLAMATION = goog.getMsg('{COUNT, plural, ' +
    '=1 {exclamation point}' +
    'other {# exclamation points}}');


/**
 * @desc Space ( ) character description.
 */
msgs.MSG_CHROMEVOX_SPACE = goog.getMsg('{COUNT, plural, ' +
    '=1 {space}' +
    'other {# spaces}}');


/**
 * @desc Backtcik (`) character description.
 */
msgs.MSG_CHROMEVOX_BACKTICK = goog.getMsg('{COUNT, plural, ' +
    '=1 {backtick}' +
    'other {# backticks}}');


/**
 * @desc Tilde (~) character description.
 */
msgs.MSG_CHROMEVOX_TILDE = goog.getMsg('{COUNT, plural, ' +
    '=1 {TILDE}' +
    'other {# tildes}}');


/**
 * @desc At (@) character description.
 */
msgs.MSG_CHROMEVOX_AT = goog.getMsg('{COUNT, plural, ' +
    '=1 {at}' +
    'other {# at signs}}');


/**
 * @desc Pound (#) character description.
 */
msgs.MSG_CHROMEVOX_POUND = goog.getMsg('{COUNT, plural, ' +
    '=1 {pound}' +
    'other {# pound signs}}');


/**
 * @desc Dollar ($) character description.
 */
msgs.MSG_CHROMEVOX_DOLLAR = goog.getMsg('{COUNT, plural, ' +
    '=1 {dollar}' +
    'other {# dollar signs}}');


/**
 * @desc Percent (%) character description.
 */
msgs.MSG_CHROMEVOX_PERCENT = goog.getMsg('{COUNT, plural, ' +
    '=1 {percent}' +
    'other {# percent signs}}');


/**
 * @desc Caret (^) character description.
 */
msgs.MSG_CHROMEVOX_CARET = goog.getMsg('{COUNT, plural, ' +
    '=1 {caret}' +
    'other {# carets}}');


/**
 * @desc Ampersand (&) character description.
 */
msgs.MSG_CHROMEVOX_AMPERSAND = goog.getMsg('{COUNT, plural, ' +
    '=1 {ampersand}' +
    'other {# ampersands}}');


/**
 * @desc Asterisk (*) character description.
 */
msgs.MSG_CHROMEVOX_ASTERISK = goog.getMsg('{COUNT, plural, ' +
    '=1 {asterisk}' +
    'other {# asterisks}}');


/**
 * @desc Left parenthesis (() character description.
 */
msgs.MSG_CHROMEVOX_OPEN_PAREN = goog.getMsg('{COUNT, plural, ' +
    '=1 {open paren}' +
    'other {# open parens}}');


/**
 * @desc Right parenthesis ()) character description.
 */
msgs.MSG_CHROMEVOX_CLOSE_PAREN = goog.getMsg('{COUNT, plural, ' +
    '=1 {close paren}' +
    'other {# close parens}}');


/**
 * @desc Dash (-) character description.
 */
msgs.MSG_CHROMEVOX_DASH = goog.getMsg('{COUNT, plural, ' +
    '=1 {dash}' +
    'other {# dashes}}');


/**
 * @desc Underscore (_) character description.
 */
msgs.MSG_CHROMEVOX_UNDERSCORE = goog.getMsg('{COUNT, plural, ' +
    '=1 {underscore}' +
    'other {# underscores}}');


/**
 * @desc Equals (=) character description.
 */
msgs.MSG_CHROMEVOX_EQUALS = goog.getMsg('{COUNT, plural, ' +
    '=1 {equal}' +
    'other {# equal signs}}');


/**
 * @desc Plus (+) character description.
 */
msgs.MSG_CHROMEVOX_PLUS = goog.getMsg('{COUNT, plural, ' +
    '=1 {plus}' +
    'other {# plus signs}}');


/**
 * @desc Left bracket ([) character description.
 */
msgs.MSG_CHROMEVOX_LEFT_BRACKET = goog.getMsg('{COUNT, plural, ' +
    '=1 {left bracket}' +
    'other {# left brackets}}');


/**
 * @desc Right bracket (]) character description.
 */
msgs.MSG_CHROMEVOX_RIGHT_BRACKET = goog.getMsg('{COUNT, plural, ' +
    '=1 {right bracket}' +
    'other {# right brackets}}');


/**
 * @desc Left brace ({) character description.
 */
msgs.MSG_CHROMEVOX_LEFT_BRACE = goog.getMsg('{COUNT, plural, ' +
    '=1 {left brace}' +
    'other {# left braces}}');


/**
 * @desc Right brace (}) character description.
 */
msgs.MSG_CHROMEVOX_RIGHT_BRACE = goog.getMsg('{COUNT, plural, ' +
    '=1 {right brace}' +
    'other {# right braces}}');


/**
 * @desc Pipe (|) character description.
 */
msgs.MSG_CHROMEVOX_PIPE = goog.getMsg('{COUNT, plural, ' +
    '=1 {pipe}' +
    'other {# vertical pipes}}');


/**
 * @desc Semicolon (;) character description.
 */
msgs.MSG_CHROMEVOX_SEMICOLON = goog.getMsg('{COUNT, plural, ' +
    '=1 {semicolon}' +
    'other {# semicolons}}');


/**
 * @desc Colon (:) character description.
 */
msgs.MSG_CHROMEVOX_COLON = goog.getMsg('{COUNT, plural, ' +
    '=1 {colon}' +
    'other {# colons}}');


/**
 * @desc Comma (,) character description.
 */
msgs.MSG_CHROMEVOX_COMMA = goog.getMsg('{COUNT, plural, ' +
    '=1 {comma}' +
    'other {# commas}}');


/**
 * @desc Dot (.) character description.
 */
msgs.MSG_CHROMEVOX_DOT = goog.getMsg('{COUNT, plural, ' +
    '=1 {dot}' +
    '=3 {ellipsis}' +
    'other {# dots}}');


/**
 * @desc Less than (<) character description.
 */
msgs.MSG_CHROMEVOX_LESS_THAN = goog.getMsg('{COUNT, plural, ' +
    '=1 {less than}' +
    'other {# less than signs}}');


/**
 * @desc Greater than (>) character description.
 */
msgs.MSG_CHROMEVOX_GREATER_THAN = goog.getMsg('{COUNT, plural, ' +
    '=1 {greater than}' +
    'other {# greater than signs}}');


/**
 * @desc Slash (/) character description.
 */
msgs.MSG_CHROMEVOX_SLASH = goog.getMsg('{COUNT, plural, ' +
    '=1 {slash}' +
    'other {# slashes}}');


/**
 * @desc Question mark (?) character description.
 */
msgs.MSG_CHROMEVOX_QUESTION_MARK = goog.getMsg('{COUNT, plural, ' +
    '=1 {question mark}' +
    'other {# question marks}}');


/**
 * @desc Quote (") character description.
 */
msgs.MSG_CHROMEVOX_QUOTE = goog.getMsg('{COUNT, plural, ' +
    '=1 {quote}' +
    'other {# quotes}}');


/**
 * @desc Apostrophe (') character description.
 */
msgs.MSG_CHROMEVOX_APOSTROPHE = goog.getMsg('{COUNT, plural, ' +
    '=1 {apostrophe}' +
    'other {# apostrophes}}');


/**
 * @desc Tab (\t) character description.
 */
msgs.MSG_CHROMEVOX_TAB = goog.getMsg('{COUNT, plural, ' +
    '=1 {tab}' +
    'other {# tabs}}');


/**
 * @desc Backslash (\) character description.
 */
msgs.MSG_CHROMEVOX_BACKSLASH = goog.getMsg('{COUNT, plural, ' +
    '=1 {backslash}' +
    'other {# backslashes}}');


/**
 * @desc Describes the braille click command.
 * Displayed in the options page.
 */
msgs.MSG_CHROMEVOX_BRAILLE_ROUTING =
    goog.getMsg('Click the item under a routing key');


/**
 * @desc Describes the braille pan backward command.
 * Displayed in the options page.
 */
msgs.MSG_CHROMEVOX_BRAILLE_PAN_LEFT =
    goog.getMsg('Pan backward');


/**
 * @desc Describes the braille pan forward command.
 * Displayed in the options page.
 */
msgs.MSG_CHROMEVOX_BRAILLE_PAN_RIGHT =
    goog.getMsg('Pan bforward');


/**
 * @desc The description of the braille previous line command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_BRAILLE_LINE_UP = goog.getMsg('Braille previous Line');


/**
 * @desc The description of the braille next line command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_BRAILLE_LINE_DOWN = goog.getMsg('Braille next Line');


/**
 * @desc The description of the braille top command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_BRAILLE_TOP =
    goog.getMsg('Move braille display to top of page');


/**
 * @desc The description of the braille bottom command.  Displayed in the
 * Options page.
 */
msgs.MSG_CHROMEVOX_BRAILLE_BOTTOM =
    goog.getMsg('Move braille display to bottom of page');


/**
 * @desc Spoken to describe an access key.  An access key consists of a single
 * letter. When pressed along with a modifier (usually alt, but depends on
 * platform), a targetted node will be activated.
 */
msgs.MSG_CHROMEVOX_ACCESS_KEY =
    goog.getMsg('has access key, {$key}', {'key': '$1'});
