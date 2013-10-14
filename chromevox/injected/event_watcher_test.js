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
 * @fileoverview Unit tests for ChromeVoxEventWatcher.
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.EventWatcherTest');

goog.require('cvox.AbstractTestCase');
goog.require('cvox.ChromeVoxTester');


/**
 * @constructor
 * @extends {cvox.AbstractTestCase}
 */
cvox.EventWatcherTest = function() { };
goog.inherits(cvox.EventWatcherTest, cvox.AbstractTestCase);

/**
 * Create mock event object.
 * @param {Element} target The event target.
 * @param {number=} opt_keyCode The event key code (i.e. 13 for Enter).
 * @param {string=} opt_type The event type (i.e. 'keydown' or
 *  'focus').
 * @param {number=} opt_timeStamp The event timeStamp.
 * @return {Event} The mock event.
 * @suppress {invalidCasts}
 */
cvox.EventWatcherTest.prototype.createMockEvent =
    function(target, opt_keyCode, opt_type, opt_timeStamp) {
  var mockEvent = {};
  mockEvent.target = target;
  if (opt_keyCode) {
    mockEvent.keyCode = opt_keyCode;
  }
  if (opt_type) {
    mockEvent.type = opt_type;
  }
  if (opt_timeStamp) {
    mockEvent.timeStamp = opt_timeStamp;
  }

  return /** @type {Event} */ (mockEvent);
};


/**
 * Simulate typing a key into an text field by modifying a given field and
 * dispatching a keydown event to ChromeVoxEventWatcher. Allows modifying the
 * selection so arrow keypresses can be simulated.
 * @param {Element} textField The text field.
 * @param {string} newValue The new value for the text field.
 * @param {number} newSelStart The new selection start.
 * @param {number} newSelEnd The new selection end.
 * @param {number} keyCode The key code for the keydown event.
 * @return {Element} The modified text field.
 */
cvox.EventWatcherTest.prototype.changeTextField =
    function(textField, newValue, newSelStart, newSelEnd, keyCode) {
  textField.value = newValue;
  textField.selectionStart = newSelStart;
  textField.selectionEnd = newSelEnd;

  cvox.ChromeVoxEventWatcher.keyDownEventWatcher(
      this.createMockEvent(textField, keyCode, 'keydown'));
  return textField;
};


/**
 * Test feedback when a control gets focus.
 * @export
 */
cvox.EventWatcherTest.prototype.testButtonFocusFeedback = function() {
  this.appendHtml('<div> <button id="alpha">Alpha</button> </div>');
  this.setFocus('alpha');
  this.waitForCalm(this.assertSpoken, 'Alpha Button');
};


/**
 * Test feedback when focusing links backwards (like shift-tabbing).
 * @export
 */
cvox.EventWatcherTest.prototype.testFocusLinksBackwards = function() {
  this.appendHtml('<div> <p>before</p>' +
      '<p><a href="#" id="l1">1</a></p>' +
      '<p><a href="#" id="l2">2</a></p>' +
      '<p><a href="#" id="l3">3</a></p>' +
      '</div>');

  this.waitForCalm(this.setFocus, 'l1')
      .waitForCalm(this.setFocus, 'l2')
      .waitForCalm(this.setFocus, 'l3')
      .waitForCalm(this.setFocus, 'l2')
      .waitForCalm(this.setFocus, 'l1')
      .waitForCalm(this.assertSpoken,
          '1 Internal link 2 Internal link 3 Internal link ' +
          '2 Internal link 1 Internal link');
};


/**
 * Test feedback when an editable text field gets focus.
 * @export
 */
cvox.EventWatcherTest.prototype.testTextFocusFeedback = function() {
  this.appendHtml('<div>' +
      '<label for="mytext">Label</label>' +
      '<input id="mytext" value="Value" title="Title" />' +
      '</div>');

  this.setFocus('mytext');
  this.waitForCalm(this.assertSpoken, 'Label Value Edit text');
};


/**
 * Test feedback when a contenteditable field gets focus.
 * @export
 */
cvox.EventWatcherTest.prototype.testContentEditableFocusFeedback = function() {
  this.appendHtml('<div>' +
      '<label for="mytext">Label</label>' +
      '<div id="mytext" contentEditable>This is editable</div>' +
      '</div>');

  this.setFocus('mytext');
  this.waitForCalm(this.assertSpoken, 'Label This is editable Edit text');
};


/**
 * Test feedback when an item in a dialog receives focus and then focus
 *     leaves the dialog.
 * @export
 */
cvox.EventWatcherTest.prototype.testDialogFeedback = function() {
  this.appendHtml('<div>' +
      '<button id="show">Show</button>' +
      '<div role="dialog">' +
      '  <button id="ok">OK</button>' +
      '  <button id="cancel">Cancel</button>' +
      '</div>' +
      '</div>');


  // Enter the dialog by focusing an element inside it.
  this.setFocus('ok');

  this.waitForCalm(this.assertSpoken,
                   'Entered dialog OK Button Cancel Button OK Button');

  // After we've entered a dialog, temporarily moving focus away shouldn't
  // have any effect if we move it right back. (Allow apps to trap focus.)
  this.waitForCalm(function() {
    this.setFocus('show')
        .setFocus('ok');
  });

  this.waitForCalm(this.assertSpoken, 'OK Button');

  // Now move focus away and leave it there.
  this.waitForCalm(this.setFocus, 'show');
  this.waitForCalm(this.assertSpoken, 'Exited dialog. Show Button');
};


/**
 * Test feedback when an item in an alert dialog receives focus.
 * @export
 */
cvox.EventWatcherTest.prototype.testAlertDialogFeedback = function() {
  this.appendHtml('<div>' +
      '<div role="alertdialog">' +
      '  <p>Are you sure you want to install Windows?</p>' +
      '  <button id="yes">Yes</button>' +
      '  <button id="no">No</button>' +
      '</div> </div>');


  // Enter the dialog by focusing an element inside it.
  this.setFocus('no');
  this.waitForCalm(this.assertSpoken,
          'Entered dialog ' +
          'Are you sure you want to install Windows? Yes Button No Button ' +
          'No Button');
};

/**
 * Test feedback when focus moves to two different items in a dialog
 * quickly - make sure the notification that we entered the dialog
 * isn't interrupted.
 * @export
 */
cvox.EventWatcherTest.prototype.testDoubleFocusDialogFeedback = function() {
  this.appendHtml('<div>' +
      '<div role="dialog">' +
      '  <p>Are these the droids you\'re looking for?</p>' +
      '  <button id="yes">Yes</button>' +
      '  <button id="no">No</button>' +
      '</div>' +
      '<button id="outside">Outside</button>' +
      '</div>');


  // Enter the dialog by focusing an element inside it, but then the Jedi
  // mind trick quickly changes the default answer.
  this.setFocus('yes')
      .setFocus('no');

  this.waitForCalm(this.assertSpokenList,
                   this.spokenList()
                       .flush('Entered dialog')
                       .queue('Are these the droids you\'re looking for?')
                       .queue('Yes')
                       .queue('Button'));

  // Unfocus the dialog so we don't effect other tests.
  this.waitForCalm(this.setFocus, 'outside');
  this.waitForCalm(this.assertSpoken, 'Exited dialog. Outside Button');
};


/**
 * Test recovery when a dialog box closes and the user sends a tab event.
 * @export
 */
cvox.EventWatcherTest.prototype.testCloseDialogTabRecovery = function() {
  this.appendHtml('<div id="container">' +
      '<p id="first">first node</p>' +
      '<button id="button">valid button before</button>' +
      '<p id="before">valid text before</p>' +
      '<p id="dialog">invalid after click</p>' +
      '<p id="last">valid text after</p>' +
      '</div>');

  var first = document.getElementById('first');
  var dialog = document.getElementById('dialog');
  var displayNone = function() {
    dialog.style.display = 'none';
  };

  this.waitForCalm(cvox.ChromeVoxTester.syncToNode, first);
  this.waitForCalm(cvox.ChromeVoxTester.setStrategy, 'lineardom');
  this.waitForCalm(this.userCommand, 'forward');
  this.waitForCalm(this.assertSpoken, 'valid button before Button');
  this.waitForCalm(this.userCommand, 'forward');
  this.waitForCalm(this.assertSpoken, 'valid text before');
  this.waitForCalm(this.userCommand, 'forward');
  this.waitForCalm(this.assertSpoken, 'invalid after click');

  // Invalidate the dialog box.
  this.waitForCalm(displayNone);
  this.waitForCalm(this.userCommand, 'forward');
  this.waitForCalm(this.assertSpoken, 'valid text after');
};


/**
 * Test feedback when a list box with an active descendant receives focus.
 * @export
 */
cvox.EventWatcherTest.prototype.testListBoxFeedback = function() {
  this.appendHtml('<div>' +
      '<p id="before">My listbox</p>' +
      '<div id="listbox" role="listbox" tabindex="0"' +
      ' aria-activedescendant="red">' +
      '  <div id="red" aria-selected="true" role="option">Red</div>' +
      '  <div id="yellow" role="option">Yellow</div>' +
      '  <div id="green" role="option">Green</div>' +
      '</div>' +
      '<p id="after">After</p>' +
      '</div>');


  // Focus the listbox.
  this.setFocus('listbox');
  this.waitForCalm(this.assertSpoken, 'Red List box Selected 1 of 3')
      .waitForCalm(function() {
          // Set the activeDescendant and fire a keydown event.
          // TODO(dmazzoni): replace with a higher-level API that's
          // less brittle.
          var listbox = document.getElementById('listbox');
          listbox.setAttribute('aria-activeDescendant', 'yellow');
          cvox.ChromeVoxEventWatcher.keyDownEventWatcher(/** @type {Event} */ (
              { 'target': listbox,
                'type': 'keydown' }));
        })
      .waitForCalm(this.assertSpoken, 'Yellow 2 of 3');
};


/**
 * Test feedback when the items of a list box receive focus.
 * @export
 */
cvox.EventWatcherTest.prototype.testListBoxOptionFeedback = function() {
  this.appendHtml('<div>' +
      '<p id="before">My listbox</p>' +
      '<div id="listbox" role="listbox">' +
      ' <div id="red" tabindex="0" aria-selected="true" role="option">' +
      'Red</div>' +
      '  <div id="yellow" tabindex="-1" role="option">Yellow</div>' +
      '  <div id="green" tabindex="-1" role="option">Green</div>' +
      '</div>' +
      '<p id="after">After</p>' +
      '</div>');

  // Focus the second item.
  this.setFocus('yellow');

  this.waitForCalm(this.assertSpoken, 'List box Yellow 2 of 3')
      .waitForCalm(this.setFocus, 'red')
      .waitForCalm(this.assertSpoken, 'Red Selected 1 of 3');
};


/**
 * Test feedback when the list box is setting focus in response to arrow
 * (or some other) keypress and the user is also using ChromeVox navigation.
 * @export
 */
cvox.EventWatcherTest.prototype.testListBoxOptionFeedbackWithFocus =
    function() {
  this.appendHtml('<div>' +
      '<p id="before">My listbox</p>' +
      '<div id="listbox" role="listbox">' +
      '  <div id="red" tabindex="0" aria-selected="true" role="option">' +
      'Red</div>' +
      '  <div id="yellow" tabindex="-1" role="option">Yellow</div>' +
      '  <div id="green" tabindex="-1" role="option">Green</div>' +
      '  <div id="blue" tabindex="-1" role="option">Blue</div>' +
      '</div>' +
      '<p id="after">After</p>' +
      '</div>');

  // Simulate the user using ChromeVox navigation to move forward in the listbox
  this.waitForCalm(cvox.ChromeVoxTester.setStrategy, 'lineardom');
  this.waitForCalm(cvox.ChromeVoxTester.syncToFirstNode);
  this.waitForCalm(this.userCommand, 'forward');
  this.waitForCalm(this.assertSpoken, 'List box Red Selected 1 of 4');

  // Simulate the listbox setting focus on items in the listbox in response to
  // keypresses
  this.waitForCalm(this.setFocus, 'yellow');
  this.waitForCalm(this.assertSpoken, 'Yellow 2 of 4');

  this.waitForCalm(this.setFocus, 'green');
  this.waitForCalm(this.assertSpoken, 'Green 3 of 4');

  // ChromeVox navigation again
  this.waitForCalm(this.userCommand, 'forward');
  this.waitForCalm(this.assertSpoken, 'Blue 4 of 4');
};


/**
 * Test feedback when interacting with an editable text field.
 * The low-level details are tested in editable_text_test.js, this is
 * a higher-level test of how that code interacts with the event watcher.
 * @export
 */
cvox.EventWatcherTest.prototype.testEditableText = function() {
  cvox.ChromeVoxEditableTextBase.eventTypingEcho = false;
  this.appendHtml('<div>' +
      '<button id="before">Before</button>' +
      '<label for="input">Query</label>' +
      '<input id="input" value="abc">' +
      '<p>After</p>' +
      '</div>');

  var before = document.getElementById('before');
  var input = document.getElementById('input');

  // Focus the button first.
  before.focus();

  // Then focus the text field.
  input.focus();
  input.setSelectionRange(3, 3);

  this.waitForCalm(this.changeTextField, input, 'abcd', 3, 3, 68)  // 'd'
      .waitForCalm(this.changeTextField, input, 'abcde', 4, 4, 69) // 'e'
      .waitForCalm(this.assertSpokenList,
                   this.spokenList()
                       .flush('Query')
                       .queue('abc')
                       .queue('Edit text')
                       .flush('d')
                       .flush('e'));
};


/**
 * Test feedback when interacting with an editable text field that drives
 * an listbox (to form an auto-complete combobox) but doesn't get updated.
 * The low-level details are tested in editable_text_test.js, this is
 * a higher-level test of how that code interacts with the event watcher.
 * @export
 */
cvox.EventWatcherTest.prototype.testEditableTextListbox = function() {
  this.appendHtml('<div>' +
      '<button id="before">Before</button>' +
      '<label for="input">Query</label>' +
      '<input id="input" value="" role="combobox" aria-autocomplete="list"' +
      '  aria-activedescendant>' +
      '<div role="listbox">' +
      '  <div id="option1" role="option">First pick</div>' +
      '  <div id="option2" role="option">Second pick</div>' +
      '</div>' +
      '<p>After</p>' +
      '</div>');

  var before = document.getElementById('before');
  var input = document.getElementById('input');

  // Focus the text field.
  this.waitForCalm(this.setFocus, 'input')
      .waitForCalm(this.assertSpoken, 'Query Combo box Autocompletion list');

  this.waitForCalm(function() {
          input.setAttribute('aria-activedescendant', 'option1');
          this.changeTextField(input, '', 0, 0, 40);  // 'down'
          })
      .waitForCalm(this.assertSpoken, 'First pick 1 of 2');
};


/**
 * Test feedback when interacting with an editable text field that drives
 * an listbox (to form an auto-complete combobox) and *does* get updated.
 * The low-level details are tested in editable_text_test.js, this is
 * a higher-level test of how that code interacts with the event watcher.
 * @export
 */
cvox.EventWatcherTest.prototype.testEditableTextListboxUpdatingInput =
    function() {
  this.appendHtml('<div>' +
      '<button id="before">Before</button>' +
      '<label for="input">Query</label>' +
      '<input id="input" value="" role="combobox" aria-autocomplete="list"' +
      '  aria-activedescendant>' +
      '<div role="listbox">' +
      '  <div id="option1" role="option">First pick</div>' +
      '  <div id="option2" role="option">Second pick</div>' +
      '</div>' +
      '<p>After</p>' +
      '</div>');

  var before = document.getElementById('before');
  var input = document.getElementById('input');

  // Focus the text field.
  this.waitForCalm(this.setFocus, 'input')
      .waitForCalm(this.assertSpoken, 'Query Combo box Autocompletion list');

  this.waitForCalm(function() {
          input.setAttribute('aria-activedescendant', 'option1');
          this.changeTextField(input, 'First pick', 9, 9, 40);  // 'down'
          })
      .waitForCalm(this.assertSpoken, 'First pick');
};


/**
 * Tests navigating through a multiline text area.
 * @export
 */
cvox.EventWatcherTest.prototype.testMultilineNavigation = function() {
  this.appendHtml('<div> <textarea id="area">' +
      'one' +
      '\n\n' +
      'two' +
      '\n\n' +
      'three</textarea>' +
      '</div>');

  var area = document.getElementById('area');

  function setAreaCursor(pos) {
    area.setSelectionRange(pos, pos);
    cvox.ChromeVoxEventWatcher.keyDownEventWatcher(/** @type {Event} */ (
        { 'target': area,
          'type': 'keydown' }));
  }

  area.focus();
  this.waitForCalm(this.assertSpoken, 'one two three Text area')
      .waitForCalm(setAreaCursor, 0)
  // The cursor did not move, so don't say anything -- even though we
  // did press a key.
      .waitForCalm(this.assertSpoken, '')
      .waitForCalm(setAreaCursor, 5) // in front on the 'two'
      .waitForCalm(this.assertSpoken, 'two')
      .waitForCalm(setAreaCursor, 10) // in front of the 'three'
      .waitForCalm(this.assertSpoken, 'three')
      .waitForCalm(setAreaCursor, 0) // back to the first line
      .waitForCalm(this.assertSpoken, 'one')
      .waitForCalm(setAreaCursor, 4) // on the first new line
      .waitForCalm(this.assertSpoken, 'Blank')
      .waitForCalm(setAreaCursor, 5)
      .waitForCalm(this.assertSpoken, 'two')
      .waitForCalm(setAreaCursor, 9)
      .waitForCalm(this.assertSpoken, 'Blank')
      .waitForCalm(setAreaCursor, 10)
      .waitForCalm(this.assertSpoken, 'three');
};


cvox.EventWatcherTest.prototype.testShouldWaitToProcess = function() {
  // The focus event just happened, wait.
  this.assertTrue(
      cvox.ChromeVoxEventWatcherUtil.shouldWaitToProcess(100, 100, 100));
  // The focus event just happened, but the first event is old, don't wait.
  this.assertFalse(
      cvox.ChromeVoxEventWatcherUtil.shouldWaitToProcess(100, 0, 100));
  // The focus event is old, don't wait.
  this.assertFalse(
      cvox.ChromeVoxEventWatcherUtil.shouldWaitToProcess(0, 0, 100));
};


/**
 * Test that no feedback is received for events that fire on elements
 * that are hidden (or the descendant of a hidden element).
 * @export
 */
cvox.EventWatcherTest.prototype.testAriaHiddenFeedback = function() {
  this.appendHtml('<div>' +
      '<div>' +
      '  <button id="button1">Button 1</button>' +
      '  <button id="button2" aria-hidden="true">Button 2</button>' +
      '</div>' +
      '<div aria-hidden="true">' +
      '  <h3>Random header</h3>' +
      '  <div>' +
      '     <button id="button3">Button 3</button>' +
      '  </div>' +
      '  <h3>Random header</h3>' +
      '</div>' +
      '<div>' +
      '  <button id="button4">Button 4</button>' +
      '</div>' +
      '</div>');

  this.setFocus('button1')
      .waitForCalm(this.assertSpoken, 'Button 1 Button')
      .waitForCalm(this.setFocus, 'button2')
      .waitForCalm(this.assertSpoken, '')
      .waitForCalm(this.setFocus, 'button3')
      .waitForCalm(this.assertSpoken, '')
      .waitForCalm(this.setFocus, 'button4')
      .waitForCalm(this.assertSpoken, 'Button 4 Button');
};


/**
 * Test that key down events don't cause excessive value and state announcements
 * when arrowing around radiobuttons.
 *
 * @export
 */
cvox.EventWatcherTest.prototype.testRadioButtonAnnouncements = function() {
  this.appendHtml(
    '<input id="radio1" type="radio" aria-label="green" tabindex=0>' +
    '<input id="radio2" type="radio" aria-label="blue" tabindex=0>');
  function performKeyDown(dir) {
    var evt = document.createEvent('KeyboardEvent');
    evt.initKeyboardEvent(
        'keydown', true, true, window, dir, 0, false, false, false, false);

    document.activeElement.dispatchEvent(evt);
  };

  var radio1 = document.getElementById('radio1');
  radio1.focus();

  // TODO(dtseng): Repeated actual spoken text here; this is most certainly a
  // test framework bug.
  this.waitForCalm(this.assertSpoken, 'green Radio button unselected')
      .waitForCalm(performKeyDown, 'Right') // right arrow
      // Moves to next radiobutton.
      .waitForCalm(this.assertSpoken,
                   'blue Radio button selected blue Radio button selected')
      .waitForCalm(performKeyDown, 'Right') // right arrow
      // Arrowed beyond end. Should be quiet.
      .waitForCalm(this.assertSpoken, '');

  this.waitForCalm(performKeyDown, 'Left') // left arrow
      // Moves back to first radio.
      .waitForCalm(this.assertSpoken,
                   'green Radio button selected green Radio button selected')
      .waitForCalm(performKeyDown, 'Left') // left arrow
      // Arrowed beyond beginning. Should be quiet.
      .waitForCalm(this.assertSpoken, '');
};


/**
 * Test time widget.
 *
 * @export
 */
cvox.EventWatcherTest.prototype.testTimeWidget = function() {
  var chromeVer = -1;
  var userAgent = window.navigator.userAgent;
  var startIndex = userAgent.indexOf('Chrome/');
  if (startIndex != -1) {
    userAgent = userAgent.substring(startIndex + 'Chrome/'.length);
  }
  var endIndex = userAgent.indexOf('.');
  if (endIndex != -1) {
    userAgent = userAgent.substring(0, endIndex);
  }
  // This test will only work on Chrome 23 and higher.
  if (userAgent >= 23) {
    this.appendHtml(
      '<label for="timewidget">Set alarm for:</label>');
    this.appendHtml(
      '<input id="timewidget" type="time" value="12:00">');
    var performKeyDown = function(dir) {
      var evt = document.createEvent('KeyboardEvent');
      evt.initKeyboardEvent(
          'keydown', true, true, window, dir, 0, false, false, false, false);

      document.activeElement.dispatchEvent(evt);
    };
    var performKeyUp = function(dir) {
      var evt = document.createEvent('KeyboardEvent');
      evt.initKeyboardEvent(
          'keyup', true, true, window, dir, 0, false, false, false, false);

      document.activeElement.dispatchEvent(evt);
    };

    var timewidget = document.getElementById('timewidget');
    timewidget.focus();

    this.waitForCalm(this.assertSpoken,
        'Set alarm for: 12:00 Set alarm for: 12 hours 00 minutes PM');

    this.waitForCalm(performKeyDown, 'Down') // down arrow
        .waitForCalm(performKeyUp, 'Down') // down arrow
        .waitForCalm(this.assertSpoken,
                     '11 hours');

    this.waitForCalm(performKeyDown, 'Down') // down arrow
        .waitForCalm(performKeyUp, 'Down') // down arrow
        .waitForCalm(this.assertSpoken,
                     '10 hours');

    this.waitForCalm(performKeyDown, 'Right') // right arrow
        .waitForCalm(performKeyUp, 'Right') // right arrow
        .waitForCalm(performKeyDown, 'Up') // right arrow
        .waitForCalm(performKeyUp, 'Up') // right arrow
        .waitForCalm(this.assertSpoken,
                     '01 minutes');

    this.waitForCalm(performKeyDown, 'Down') // down arrow
        .waitForCalm(performKeyUp, 'Down') // down arrow
        .waitForCalm(this.assertSpoken,
                     '00 minutes');

    this.waitForCalm(performKeyDown, 'Right') // right arrow
        .waitForCalm(performKeyUp, 'Right') // right arrow
        .waitForCalm(performKeyDown, 'Up') // right arrow
        .waitForCalm(performKeyUp, 'Up') // right arrow
        .waitForCalm(this.assertSpoken,
                     'AM');


    this.waitForCalm(performKeyDown, 'Down') // down arrow
        .waitForCalm(performKeyUp, 'Down') // down arrow
        .waitForCalm(this.assertSpoken,
                     'PM');
    }
};


/**
 * Test date widget.
 *
 * @export
 */
cvox.EventWatcherTest.prototype.testDateWidget = function() {
  var chromeVer = -1;
  var userAgent = window.navigator.userAgent;
  var startIndex = userAgent.indexOf('Chrome/');
  if (startIndex != -1) {
    userAgent = userAgent.substring(startIndex + 'Chrome/'.length);
  }
  var endIndex = userAgent.indexOf('.');
  if (endIndex != -1) {
    userAgent = userAgent.substring(0, endIndex);
  }
  // This test will only work on Chrome 25 and higher.
  if (userAgent >= 25) {
    this.appendHtml(
      '<label for="datewidget">Set birthdate:</label>');
    this.appendHtml(
      '<input id="datewidget" type="date" value="1998-09-04"/>');
    var performKeyDown = function(dir) {
      var evt = document.createEvent('KeyboardEvent');
      evt.initKeyboardEvent(
          'keydown', true, true, window, dir, 0, false, false, false, false);

      document.activeElement.dispatchEvent(evt);
    };
    var performKeyUp = function(dir) {
      var evt = document.createEvent('KeyboardEvent');
      evt.initKeyboardEvent(
          'keyup', true, true, window, dir, 0, false, false, false, false);

      document.activeElement.dispatchEvent(evt);
    };

    var datewidget = document.getElementById('datewidget');
    datewidget.focus();

    this.waitForCalm(this.assertSpoken,
        'Set birthdate: 1998-09-04 Date control Set birthdate: September 4 1998');

    this.waitForCalm(performKeyDown, 'Down') // down arrow
        .waitForCalm(performKeyUp, 'Down') // down arrow
        .waitForCalm(this.assertSpoken,
                     'August');

    this.waitForCalm(performKeyDown, 'Down') // down arrow
        .waitForCalm(performKeyUp, 'Down') // down arrow
        .waitForCalm(this.assertSpoken,
                     'July');

    this.waitForCalm(performKeyDown, 'Right') // right arrow
        .waitForCalm(performKeyUp, 'Right') // right arrow
        .waitForCalm(performKeyDown, 'Up') // right arrow
        .waitForCalm(performKeyUp, 'Up') // right arrow
        .waitForCalm(this.assertSpoken, '5');

    this.waitForCalm(performKeyDown, 'Down') // down arrow
        .waitForCalm(performKeyUp, 'Down') // down arrow
        .waitForCalm(this.assertSpoken,
                     '4');

    this.waitForCalm(performKeyDown, 'Right') // right arrow
        .waitForCalm(performKeyUp, 'Right') // right arrow
        .waitForCalm(performKeyDown, 'Up') // right arrow
        .waitForCalm(performKeyUp, 'Up') // right arrow
        .waitForCalm(this.assertSpoken,
                     '1999');


    this.waitForCalm(performKeyDown, 'Down') // down arrow
        .waitForCalm(performKeyUp, 'Down') // down arrow
        .waitForCalm(this.assertSpoken,
                     '1998');
    }
};

/**
 * Test video widget.
 *
 * @export
 */
cvox.EventWatcherTest.prototype.testVideoWidget = function() {
    this.appendHtml('<video id="chromevideo" poster="http://www.html5rocks.com/en/tutorials/video/basics/star.png" controls>');
    this.appendHtml('<source src="http://www.html5rocks.com/en/tutorials/video/basics/Chrome_ImF.mp4" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' />');
    this.appendHtml('<source src="http://www.html5rocks.com/en/tutorials/video/basics/Chrome_ImF.webm" type=\'video/webm; codecs="vp8, vorbis"\' />');
    this.appendHtml('<source src="http://www.html5rocks.com/en/tutorials/video/basics/Chrome_ImF.ogv" type=\'video/ogg; codecs="theora, vorbis"\' />');

    function performKeyDown(dir) {
      var evt = document.createEvent('KeyboardEvent');
      evt.initKeyboardEvent(
          'keydown', true, true, window, dir, 0, false, false, false, false);

      document.activeElement.dispatchEvent(evt);
    };

    function performKeyUp(dir) {
      var evt = document.createEvent('KeyboardEvent');
      evt.initKeyboardEvent(
          'keyup', true, true, window, dir, 0, false, false, false, false);
      document.activeElement.dispatchEvent(evt);
    };

    var self = this;
    var videowidget = document.getElementById('chromevideo');

    videowidget.onload = function() {
      videowidget.focus();
      self.waitForCalm(performKeyDown, 'Enter')
          .waitForCalm(performKeyUp, 'Enter')
          .waitForCalm(self.assertEquals, videowidget.paused, false);

      self.waitForCalm(performKeyDown, 'Right')
          .waitForCalm(performKeyUp, 'Right')
          .waitForCalm(self.assertEquals, videowidget.currentTime, 0);

      self.waitForCalm(performKeyDown, 'Down')
          .waitForCalm(performKeyUp, 'Down')
          .waitForCalm(self.assertEquals, videowidget.volume, 0);
    };
}

/**
 * Test audio widget.
 *
 * @export
 */
cvox.EventWatcherTest.prototype.testAudioWidget = function() {
    this.appendHtml('<audio id="chromeaudio" controls>');
    this.appendHtml('<source src="http://www.html5rocks.com/en/tutorials/audio/quick/test.mp3" type="audio/mpeg" />');
    this.appendHtml('<source src="http://www.html5rocks.com/en/tutorials/audio/quick/test.ogg" type="audio/ogg" />');

    function performKeyDown(dir) {
      var evt = document.createEvent('KeyboardEvent');
      evt.initKeyboardEvent(
          'keydown', true, true, window, dir, 0, false, false, false, false);

      document.activeElement.dispatchEvent(evt);
    };

    function performKeyUp(dir) {
      var evt = document.createEvent('KeyboardEvent');
      evt.initKeyboardEvent(
          'keyup', true, true, window, dir, 0, false, false, false, false);
      document.activeElement.dispatchEvent(evt);
    };

    var self = this;
    var audiowidget = document.getElementById('chromeaudio');

    audiowidget.onload = function() {
      audiowidget.focus();
      self.waitForCalm(performKeyDown, 'Enter')
          .waitForCalm(performKeyUp, 'Enter')
          .waitForCalm(self.assertEquals, audiowidget.paused, false);

      self.waitForCalm(performKeyDown, 'Right')
          .waitForCalm(performKeyUp, 'Right')
          .waitForCalm(self.assertEquals, audiowidget.currentTime, 0);

      self.waitForCalm(performKeyDown, 'Down')
          .waitForCalm(performKeyUp, 'Down')
          .waitForCalm(self.assertEquals, audiowidget.volume, 0);
    };
}
