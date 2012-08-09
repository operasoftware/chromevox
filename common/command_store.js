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
 * @fileoverview This class acts as the persistent store for all static data
 * about commands.
 *
 * If you are looking to add a user command, follow the below steps for best
 * integration with existing components:
 * 1. Add a command to cvox.UserCommands (referenced herein as 'command').
 * 2. Add 'command' below in cvox.CommandStore.store_. Be sure to add a message
 * id and define it in chromevox/messages/messages.js which describes the
 * 'command'.
 * 3. Add a key binding in chromevox/background/keymaps/classic.json.
 *
 * Class description:
 * This class is entirely static and holds a in-lined table (array of arrays)
 * that holds non-user configurable data.
 * From this datastore, we build various index data structures to permit faster
 * access. This is static data, computed when init is called.
 *
 * It is the user's responsibility to call cvox.CommandStore.init before
 * attempting to make any queries.
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.CommandStore');


/**
 * A non-user configurable table (array of arrays) relating a command, message
 * id, and category id.
 * This collection acts as the basic store for information about a command and
 * is what is used to generate 'index' data structures for faster access.
 * This table is private to this class so its members are unnamed.
 * The table takes three columns:
 * command name, message id, category id.
 * @type {Array.<Array.<string>>}
 * @private
 */
cvox.CommandStore.store_ = [

  ['stopSpeech', 'stop_speech_key', 'controlling_speech'],
  ['toggleChromeVox', 'toggle_chromevox_active', 'controlling_speech'],
  ['increaseTtsRate', 'increase_tts_rate', 'controlling_speech'],
  ['decreaseTtsRate', 'decrease_tts_rate', 'controlling_speech'],
  ['increaseTtsPitch', 'increase_tts_pitch', 'controlling_speech'],
  ['decreaseTtsPitch', 'decrease_tts_pitch', 'controlling_speech'],

  // TODO(dtseng): Pending additional boolean flag to exclude from options page.
  ['toggleStickyMode', 'toggle_sticky_mode', 'modifier_keys'],
  ['toggleKeyPrefix', 'toggle_key_prefix', 'modifier_keys'],

  ['handleTab', 'handle_tab_next', 'chromevox_navigation'],
  ['handleTabPrev', 'handle_tab_prev', 'chromevox_navigation'],
  ['backward', 'backward', 'chromevox_navigation'],
  ['forward', 'forward', 'chromevox_navigation'],
  ['left', 'left', 'chromevox_navigation'],
  ['right', 'right', 'chromevox_navigation'],
  ['previousGranularity', 'previous_granularity', 'chromevox_navigation'],
  ['nextGranularity', 'next_granularity', 'chromevox_navigation'],
  ['readFromHere', 'read_from_here', 'chromevox_navigation'],

  ['skipBackward', 'skip_backward', 'chromevox_navigation'],
  ['skipForward', 'skip_forward', 'chromevox_navigation'],
  ['forceClickOnCurrentItem',
   'force_click_on_current_item',
   'chromevox_navigation'],

  // ['enterCssSpace', 'enter_css_space', 'chromevox_navigation'],

  ['readCurrentURL', 'read_current_url', 'information'],
  ['readCurrentTitle', 'read_current_title', 'information'],
  ['toggleSearchWidget', 'toggle_search_widget', 'information'],

  //  ['announcePosition', 'announce_position', 'information'],
  //  ['toggleFilteringWidget', 'toggle_filtering_widget', 'information'],
  // ['filterLikeCurrentItem', 'filter_item', 'information'],

  ['showPowerKey', 'show_power_key', 'help_commands'],
  ['help', 'help_commands', 'help_commands'],
  ['showOptionsPage', 'show_options_page', 'help_commands'],
  ['showKbExplorerPage', 'show_kb_explorer_page', 'help_commands'],

  // ['showLens', 'show_lens', 'lens'],
  // ['toggleLens', 'toggle_lens', 'lens'],
  // ['anchorLens', 'anchor_lens', 'lens'],
  // ['floatLens', 'float_lens', 'lens'],

  ['showFormsList', 'show_forms_list', 'overview'],
  ['showHeadingsList', 'show_headings_list', 'overview'],
  //  ['showJumpsList', 'show_jumps_list', 'overview'],
  ['showLinksList', 'show_links_list', 'overview'],
  ['showTablesList', 'show_tables_list', 'overview'],
  ['showLandmarksList', 'show_landmarks_list', 'overview'],

  ['nextHeading1', 'next_heading1', 'jump_commands'],
  ['nextHeading2', 'next_heading2', 'jump_commands'],
  ['nextHeading3', 'next_heading3', 'jump_commands'],
  ['nextHeading4', 'next_heading4', 'jump_commands'],
  ['nextHeading5', 'next_heading5', 'jump_commands'],
  ['nextHeading6', 'next_heading6', 'jump_commands'],
  //  ['nextAnchor', 'next_anchor', 'jump_commands'],
  ['nextComboBox', 'next_combo_box', 'jump_commands'],
  ['nextEditText', 'next_edit_text', 'jump_commands'],
  ['nextFormField', 'next_form_field', 'jump_commands'],
  ['nextGraphic', 'next_graphic', 'jump_commands'],
  ['nextHeading', 'next_heading', 'jump_commands'],
  ['nextListItem', 'next_list_item', 'jump_commands'],
  ['nextLink', 'next_link', 'jump_commands'],
  ['nextList', 'next_list', 'jump_commands'],
  ['nextRadio', 'next_radio', 'jump_commands'],
  ['nextTable', 'next_table', 'jump_commands'],
  ['nextButton', 'next_button', 'jump_commands'],
  ['nextCheckbox', 'next_checkbox', 'jump_commands'],
  ['nextLandmark', 'next_landmark', 'jump_commands'],
  ['previousHeading1', 'previous_heading1', 'jump_commands'],
  ['previousHeading2', 'previous_heading2', 'jump_commands'],
  ['previousHeading3', 'previous_heading3', 'jump_commands'],
  ['previousHeading4', 'previous_heading4', 'jump_commands'],
  ['previousHeading5', 'previous_heading5', 'jump_commands'],
  ['previousHeading6', 'previous_heading6', 'jump_commands'],
  //  ['previousAnchor', 'previous_anchor', 'jump_commands'],
  ['previousComboBox', 'previous_combo_box', 'jump_commands'],
  ['previousEditText', 'previous_edit_text', 'jump_commands'],
  ['previousFormField', 'previous_form_field', 'jump_commands'],
  ['previousGraphic', 'previous_graphic', 'jump_commands'],
  ['previousHeading', 'previous_heading', 'jump_commands'],
  ['previousListItem', 'previous_list_item', 'jump_commands'],
  ['previousLink', 'previous_link', 'jump_commands'],
  ['previousList', 'previous_list', 'jump_commands'],
  ['previousRadio', 'previous_radio', 'jump_commands'],
  ['previousTable', 'previous_table', 'jump_commands'],
  ['previousButton', 'previous_button', 'jump_commands'],
  ['previousCheckbox', 'previous_checkbox', 'jump_commands'],
  ['previousLandmark', 'previous_landmark', 'jump_commands'],

  ['toggleTable', 'toggle_table', 'tables'],
  ['announceHeaders', 'announce_headers', 'tables'],
  ['speakTableLocation', 'speak_table_location', 'tables'],
  //['guessRowHeader', 'guess_row_header', 'tables'],
  //['guessColHeader', 'guess_col_header', 'tables'],
  ['skipToBeginning', 'skip_to_beginning', 'tables'],
  ['skipToEnd', 'skip_to_end', 'tables'],
  ['skipToRowBeginning', 'skip_to_row_beginning', 'tables'],
  ['skipToRowEnd', 'skip_to_row_end', 'tables'],
  ['skipToColBeginning', 'skip_to_col_beginning', 'tables'],
  ['skipToColEnd', 'skip_to_col_end', 'tables'],

  //['nextDifferentElement', 'next_different_element', 'jump_commands'],
  //['nextJump', 'next_jump', 'jump_commands'],
  //['previousJump', 'previous_jump', 'jump_commands'],
  //['nextBlockquote', 'next_blockquote', 'jump_commands'],
  //['nextSimilarElement', 'next_similar_element', 'jump_commands'],
  //['previousDifferentElement', 'previous_different_element', 'jump_commands'],
  //['previousBlockquote', 'previous_blockquote', 'jump_commands'],
  //['previousSimilarElement', 'previous_similar_element', 'jump_commands'],

  // TODO(dtseng): Do we want to expose these commands? These are all invalid
  // msg id's.
  ['enableConsoleTts', 'enable_tts_log', 'developer']
  // ['readMacroFromHtml', 'Read macro from HTML', 'developer'],
  // ['startHistoryRecording', 'Start history recording', 'developer'],
  // ['stopHistoryRecording', 'Stop history recording', 'developer'],
  // ['runTests', 'Run some basic tests using the current page', 'developer']
];


/**
 * Position in a particular row of the command name.
 * Note that this is a (database) key for the store table.
 * @type {number}
 * @const
 * @private
 */
cvox.CommandStore.COMMAND_NAME_INDEX_ = 0;


/**
 * Position in a particular row of the message id.
 * @type {number}
 * @const
 * @private
 */
cvox.CommandStore.MESSAGE_ID_INDEX_ = 1;


/**
 * Position in a particular row of the category id.
 * @type {number}
 * @const
 * @private
 */
cvox.CommandStore.CATEGORY_ID_INDEX_ = 2;


/* Index data structures */
/**
 * A table index of cvox.keyMap.store_ that maps a category to a list of
 * commands.
 * @type {Object.<string, Array.<string>>}
 * @private
 */
cvox.CommandStore.categoryToCommands_ = null;


/**
 * A table index of cvox.keyMap.store_ that maps a command to a category.
 * @type {Object.<string, string>}
 * @private
 */
cvox.CommandStore.commandToCategory_ = null;


/**
 * A table index of command to message id's.
 * @type {Object.<string, string>}
 * @private
 */
cvox.CommandStore.commandToMessage_ = null;


/**
 * Returns all of the categories in the table as an array.
 * @return {Array.<string>} The collection of categories.
 */
cvox.CommandStore.categories = function() {
  var ret = [];
  for (var category in cvox.CommandStore.categoryToCommands_) {
    ret.push(category);
  }
  return ret;
};


/**
 * Gets a message given a command.
 * @param {string} command The command to query.
 * @return {?string} The message id, if any.
 */
cvox.CommandStore.messageForCommand = function(command) {
  return cvox.CommandStore.commandToMessage_[command];
};


/**
 * Gets a category given a command.
 * @param {string} command The command to query.
 * @return {?string} The command, if any.
 */
cvox.CommandStore.categoryForCommand = function(command) {
  return cvox.CommandStore.commandToCategory_[command];
};


/**
 * Gets all commands for a category.
 * @param {string} category The category to query.
 * @return {Array.<string>} The commands, if any.
 */
cvox.CommandStore.commandsForCategory = function(category) {
  return cvox.CommandStore.categoryToCommands_[category];
};


/**
 * Builds index structures based on cvox.CommandStore.store_.
 * This method can be safely called repeatedly.
 */
cvox.CommandStore.init = function() {
  if (!cvox.CommandStore.commandToCategory_ ||
      !cvox.CommandStore.categoryToCommands_ ||
      !cvox.CommandStore.commandToMessage_) {
    cvox.CommandStore.commandToCategory_ = {};
    cvox.CommandStore.categoryToCommands_ = {};
    cvox.CommandStore.commandToMessage_ = {};

    var commandIndex = cvox.CommandStore.COMMAND_NAME_INDEX_;
    var categoryIndex = cvox.CommandStore.CATEGORY_ID_INDEX_;
    var messageIndex = cvox.CommandStore.MESSAGE_ID_INDEX_;
    for (var i = 0; i < cvox.CommandStore.store_.length; ++i) {
      var row = cvox.CommandStore.store_[i];

      cvox.CommandStore.commandToCategory_[row[commandIndex]] =
          row[categoryIndex];
      cvox.CommandStore.commandToMessage_[row[commandIndex]] =
          row[messageIndex];

      if (!cvox.CommandStore.categoryToCommands_[row[categoryIndex]]) {
        cvox.CommandStore.categoryToCommands_[row[categoryIndex]] = [];
      }

      cvox.CommandStore.categoryToCommands_[row[categoryIndex]].push(
          row[commandIndex]);
    }
  }
};
