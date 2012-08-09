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


var calvox = new cvoxExt.extension();

/** @const calendar event selector */
calvox.EVENT_SELECTOR = '.lk.lv-event-title';

/** @const calendar event subselector */
calvox.EVENT_SUBSELECTOR = {
  title: {
    attribute: 'title'
  }
};

/** @const date of event selector */
calvox.DATE_SELECTOR = '.lk.lv-datelink';

/** @const create event button selector */
calvox.CREATE_BUTTON_SELECTOR = '.goog-imageless-button-content';

/** find and press the agenda button */
calvox.findAgendaButton = function() {
  var checkedButton = document.querySelectorAll(
      '.goog-imageless-button-checked')[0];
  if (!checkedButton || checkedButton.querySelector(
      '.goog-imageless-button-content').textContent != 'Agenda') {
    var buttons = document.querySelectorAll(
        '.goog-imageless-button-content');
    for (var b = 0; b < buttons.length; ++b) {
      if (buttons[b].textContent == 'Agenda') {
        cvox.Api.click(buttons[b]);
        return;
      }
    }
  }
  setTimeout(calvox.findAgendaButton, 50);
};

/** init function
 */
calvox.init = function() {
  calvox.findAgendaButton();

  // Calendar already has a navigation system, therefore we specify
  // the reading style of cells
  var eventSpeakable = new cvoxExt.speakable(calvox.EVENT_SELECTOR,
                                             calvox.EVENT_SUBSELECTOR,
                                             'event',
                                             '');

  var dateSpeakable = new cvoxExt.speakable(calvox.DATE_SELECTOR,
                                            {},
                                            'date',
                                            '',
                                            true);

  cvoxExt.speakableManager.addNoTraverseSpeakable(eventSpeakable);
  cvoxExt.speakableManager.addNoTraverseSpeakable(dateSpeakable);
};

cvoxExt.loadExtension(calvox);
