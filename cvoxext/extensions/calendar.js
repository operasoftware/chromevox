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
 * @fileoverview Chromevox extension for Google Calendar.
 *
 * @author cagriy@google.com (Cagri K. Yildirim)
 */


var calvox = {};

/** extension */
calvox.speakers = {
  events: {
    selector: {query: '.lk.lv-event-title'},
    formatter: ['$title']
  },
  title: {
    selector: {attribute: 'title'}
  }
};

/** find and press the agenda button */
calvox.findAgendaButton = function() {
  var evt = document.createEvent('KeyboardEvent');
  evt.initKeyboardEvent('keydown', true, true, window, false, false,
                 false, false, 65, 0);
  delete evt.keyCode;
  // MUST use delete, otherwise it will remain stuck at 0
  //despite assigning it 65.
  delete evt.shiftKey;
  evt.keyCode = 65;
  // keycode for "a'
  evt.shiftKey = false;
  // Must set shift to false, otherwise it will be true after modifying the keyCode.

  document.dispatchEvent(evt);
};

cvoxExt.loadExtension(calvox.speakers, calvox.findAgendaButton);

