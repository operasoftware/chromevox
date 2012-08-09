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
 * @fileoverview Chromevox extension for Google Books.
 *
 * @author cagriy@google.com (Cagri K. Yildirim)
 */

/**
  * booksvox object
  */
var booksvox = new cvoxExt.extension();

/** @const
  * plain text div class name
  */
booksvox.TEXT_DIV_SELECTOR = '.flow-top-div';

/** @const
  * main window div class name
  */
booksvox.MAIN_DIV_SELECTOR = {'flow-top-div': 'bookcontent' };

/** @const
  * bookpage plain text selector
  */
booksvox.TEXT_SELECTOR = '.gtxt_body';

/** @const
  * plain text button class name
  */
booksvox.PLAIN_TEXT_BUTTON_SELECTOR = '.gbmt';

/** @const
  * prev-next page arrow button class name
  */
booksvox.MOVE_ARROW_SELECTOR = '.arrow';

/** @const
  * book text div class name
  */
booksvox.BOOK_TEXT_DIV_SELECTOR = booksvox.TEXT_DIV_SELECTOR;

/** @const
  * book text div sub-selector (book text)
  */
booksvox.BOOK_TEXT_DIV_SUBSELECTORS = {content: '.gtxt_body'};

/** inject the request plain text parameter to the url
  * @return {boolean} return if the plain text page exists.
  */
booksvox.redirPlainText = function() {
  var loc = document.location;
  if (loc.pathname.indexOf('/books') == 0 &&
      loc.search.indexOf('&output=text') == -1) {
    window.location = loc.href.slice(0, loc.href.indexOf('#')) +
      '&output=text' + loc.hash;
    return true;
  }
  return false;
};

/** reads the book page */
booksvox.readBook = function() {

  cvoxExt.speakableManager.updateSpeak(
     document.querySelector(booksvox.TEXT_DIV_SELECTOR));
  cvox.Api.speakNode(document.querySelector(booksvox.TEXT_DIV_SELECTOR));
};

/** add 'j' 'k' page traversal and reading
  * @this {booksvox}
  * @param {Event} evt keypress event.
  */
booksvox.keyboardControl = function(evt) {
  if (!document.activeElement.form) {
    //if char is j go next
    if (evt.charCode === 106) {
      window.location =
          document.querySelectorAll(
              booksvox.MOVE_ARROW_SELECTOR)[1].querySelector('a').href;
    }
    //if char is k go back
    else if (evt.charCode === 107) {
      window.location =
          document.querySelectorAll(
              booksvox.MOVE_ARROW_SELECTOR)[0].querySelector('a').href;
    }
    //if char is r read book
    else if (evt.charCode === 114) {
      cvox.Api.stop();
      booksvox.readBook();
    }
  }
};

/** init function for booksvox */
booksvox.init = function() {
  booksvox.redirPlainText();
  var bookText = new cvoxExt.speakable(
    booksvox.BOOK_TEXT_DIV_SELECTOR,
    booksvox.BOOK_TEXT_DIV_SUBSELECTORS,
    'booktext',
    false);
  //Override original generateSpeechNode
  bookText.generateSpeechNode = function(domObj) {
    var booktext = document.querySelectorAll(booksvox.TEXT_SELECTOR);
    if (booktext) {
      var content = '';
      for (text in booktext) {
        if (booktext[text].textContent) {
          content += booktext[text].textContent;
        }
      }
    }
    else {
      return undefined;
    }
    return content;
  }

  cvoxExt.addSpeakable(bookText);
  document.addEventListener('keypress', booksvox.keyboardControl, true);
};

cvoxExt.loadExtension(booksvox);
