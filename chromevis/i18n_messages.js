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

var msgs = {};

/**
 * @desc The locale you're translating into, for use in URLs to localized pages.
 */
msgs.MSG_LOCALE = goog.getMsg('en');


/**
 * @desc The html direction for the locale you're translating into; either
 * 'ltr' for left-to-right languages,  or 'rtl' for right-to-left languages.
 * Please use only lowercase 'ltr' or 'rtl'.
 */
msgs.MSG_DIRECTION = goog.getMsg('ltr');


/** @desc Extension name.*/
msgs.MSG_CHROMEVIS_NAME = goog.getMsg('ChromeVis (by Google)');


/** @desc Extension description. */
msgs.MSG_CHROMEVIS_DESCRIPTION = goog.getMsg('Magnify and change the ' +
                                             'color of any selected text. ' +
                                             'Use the mouse or the ' +
                                             'keyboard to move the ' +
                                             'selection around the page.');


/** @desc The title of the options page that allows the user to specify
 * keyboard shortcuts.
 */
msgs.MSG_CHROMEVIS_TITLE_TEXT = goog.getMsg('Lens Keyboard Shortcuts');


/** @desc The description of the required format for keyboard shortcuts. */
msgs.MSG_CHROMEVIS_FORMAT_TEXT = goog.getMsg('Shortcuts should be in ' +
                                             'this format: ' +
                                             '[Modifier]+[Key]');


/** @desc The description of the required format for using capital letters
 * in keyboard shortcuts.
 */
msgs.MSG_CHROMEVIS_CAPITALS_TEXT = goog.getMsg('For capital letters, use ' +
                                               'Shift+[Key]');


/** @desc The label for the first color picker, which chooses the color
 * of the foreground lens text.
 */
msgs.MSG_CHROMEVIS_TEXTCOLOR_LABEL = goog.getMsg('text');


/** @desc The label for the second color picker, which chooses the background
 * lens color.
 */
msgs.MSG_CHROMEVIS_BACKGROUNDCOLOR_LABEL = goog.getMsg('background');


/** @desc The label for the keyboard shortcut that toggles the lens on or off.
 */
msgs.MSG_CHROMEVIS_SHOWHIDELENS_LABEL = goog.getMsg('Toggle Lens On/Off');


/** @desc The label for the keyboard shortcut that toggles whether the lens
 * is anchored to the top of the page or floats above the selected text.
 */
msgs.MSG_CHROMEVIS_STYLELENS_LABEL =
  goog.getMsg('Toggle Anchored/Floating Lens');


/** @desc The label for the keyboard shortcut that toggles whether the
 * floating lens is centered above the selected text or justified to the
 * selected text position.
 */
msgs.MSG_CHROMEVIS_CENTERLENS_LABEL = goog.getMsg('Toggle ' +
                                                  'Centered/Justified Lens');


/** @desc The label for the keyboard shortcut that increases the text size. */
msgs.MSG_CHROMEVIS_INCREASEMAG_LABEL = goog.getMsg('Increase Text Size');


/** @desc The label for the keyboard shortcut that decreasese the text size. */
msgs.MSG_CHROMEVIS_DECREASEMAG_LABEL = goog.getMsg('Decrease Text Size');


/** @desc The label for the keyboard shortcut that moves the selection
 * forward by a sentence. */
msgs.MSG_CHROMEVIS_FORWARDSENTENCE_LABEL = goog.getMsg('Move Forward by ' +
                                                       'Sentence');


/** @desc The label for the keyboard shortcut that moves the selection
 * backward by a sentence. */
msgs.MSG_CHROMEVIS_BACKWARDSENTENCE_LABEL = goog.getMsg('Move Backward ' +
                                                        'by Sentence');


/** @desc The label for the keyboard shortcut that moves the selection
 * forward by a word. */
msgs.MSG_CHROMEVIS_FORWARDWORD_LABEL = goog.getMsg('Move Forward by Word');


/** @desc The label for the keyboard shortcut that moves the selection
 * backward by a word. */
msgs.MSG_CHROMEVIS_BACKWARDWORD_LABEL = goog.getMsg('Move Backward by Word');


/** @desc The label for the keyboard shortcut that moves the selection
 * forward by a character. */
msgs.MSG_CHROMEVIS_FORWARDCHAR_LABEL = goog.getMsg('Move Forward by Character');


/** @desc The label for the keyboard shortcut that moves the selection
 * backward by a character. */
msgs.MSG_CHROMEVIS_BACKWARDCHAR_LABEL = goog.getMsg('Move Backward by ' +
                                                    'Character');


/** @desc The label for the keyboard shortcut that moves the selection
 * forward by a paragraph. */
msgs.MSG_CHROMEVIS_FORWARDPAR_LABEL = goog.getMsg('Move Forward by Paragraph');


/** @desc The label for the keyboard shortcut that moves the selection
 * backward by a paragraph. */
msgs.MSG_CHROMEVIS_BACKWARDPAR_LABEL = goog.getMsg('Move Backward by ' +
                                                   'Paragraph');


/** @desc The label for the button that saves the keyboard shortcuts. */
msgs.MSG_CHROMEVIS_SAVEBUTTON_LABEL = goog.getMsg('Save');


/** @desc The label for the button that restores the default keyboard
 * shortcuts. */
msgs.MSG_CHROMEVIS_RESTOREBUTTON_LABEL = goog.getMsg('Restore Defaults');


/** @desc The description for ChromeVis in the Chrome extensions gallery page.
 */
msgs.MSG_CHROMEVIS_GALLERY_DESCRIPTION = goog.getMsg(
  'This extension magnifies any selected text on a webpage.  The magnified ' +
    'text is displayed inside of a separate lens and preserves the original ' +
    'page layout. You can change both the lens text color and the lens ' +
    'background color.{$lineBreak}' +
  'Two lens display options:{$lineBreak}' +
    '- the Anchored Lens, which is always at the top of the ' +
    'window{$lineBreak}' +
    '- the Floating Lens, which floats immediately above the selected ' +
    'text{$lineBreak}' +
  'You can select text on a webpage using your mouse or with your keyboard. ' +
    'Activate the lens with the keyboard or by pressing the ChromeVis icon. ' +
    'Use the keyboard to move your selection around by paragraph, sentence, ' +
    'word, or character.{$lineBreak}' +
  'For a keyboard shortcut listing and to specify your own keyboard ' +
    'shortcuts, please refer to the ChromeVis options page.{$lineBreak}' +
  'NOTE: This extension does not run on this page or any Chrome Extensions ' +
    'Gallery page.',
  {
    'lineBreak': '<br/><br/>'
  });

/** @desc The TOS URL for ChromeVis extension gallery page. */
msgs.MSG_CHROMEVIS_GALLERY_TOS_URL = goog.getMsg(
  'By installing this extension, you agree to the Terms of Service at {$url}',
  {
    'url': 'https://chrome.google.com/extensions/intl/en/gallery_tos.html'
  });
