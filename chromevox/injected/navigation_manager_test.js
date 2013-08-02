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
 * @fileoverview Unit tests for NavigationManager.
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.NavigationManagerTest');

goog.require('cvox.AbstractTestCase');
goog.require('cvox.ChromeVoxTester');
goog.require('cvox.NavigationShifter');
goog.require('cvox.TestTts');


/**
 * @constructor
 * @extends {cvox.AbstractTestCase}
 */
cvox.NavigationManagerTest = function() {
  for (var propertyName in this.__proto__) {
    if (propertyName.search('test') == 0) {
      (function() {
        var functionName = propertyName;
        var wrappedFunction = this[functionName];
        this[functionName] = function(queue) {
          console.log('Running wrapped ' + functionName);
          this.functionName_ = functionName;
          wrappedFunction.call(this);
        };
      }).call(this);
    }
  }
};
goog.inherits(cvox.NavigationManagerTest, cvox.AbstractTestCase);


/**
 * A wrapper around checkNavSequence, which hides the queue,
 * and 'waitForCalm' from the user.
 *
 * See cvox.ChromeVoxTest.checkNavSequence for more documentation.
 *
 * @param {(string|Array.<string>)} strategies A strategy or list of
 *     navigation strategies.
 * @param {Array.<Object>} commandsAndExpectations An array of objects,
 *     each one of which should contain:
 *       'command': The UserCommands command to execute.
 *       'text': The expected text of the node that's navigated to.
 *       'annotation': The expected annotation of the node navigated to.
 */
cvox.NavigationManagerTest.prototype.checkNavSequence = function(
    strategies, commandsAndExpectations) {

  if (this.tag_ == null && typeof(strategies) == 'object') {
    for (var i = 0; i < strategies.length; i++) {
      this.tag_ = strategies[i];
      try {
        this[this.functionName_].call(this);
      } catch (e) {
        e.message += ' with nav strategy: ' + this.tag_;
        throw e;
      }
      this.tag_ = null;
    }
    return this;
  }

  var strategy = this.tag_ ? this.tag_ : strategies;

  this.waitForCalm(cvox.ChromeVoxTester.setStrategy, strategy);
  this.waitForCalm(cvox.ChromeVoxTester.syncToFirstNode);

  var depth = 0;
  for (var i = 0; i < commandsAndExpectations.length; i++) {
    var ce = commandsAndExpectations[i];
    if (ce.command) {
      depth = 0;
      this.waitForCalm(this.userCommand, ce.command);
    }
    if (ce.context) {
      this.waitForCalm(this.assertNodeContext, ce.context,
                       depth);
    }
    if (ce.text) {
      this.waitForCalm(this.assertNodeText, ce.text,
                       depth);
    }
    if (ce.userValue) {
      this.waitForCalm(this.assertNodeUserValue, ce.userValue,
                       depth);
    }
    if (ce.annotation) {
      this.waitForCalm(this.assertNodeAnnotation, ce.annotation,
                       depth);
    }
    depth++;
  }
  return this;
};

cvox.NavigationManagerTest.prototype.currentDescription_ = function(opt_depth) {
  var depth = opt_depth || 0;
  return cvox.ChromeVox.navigationManager.getDescription()[depth] ||
      new cvox.NavDescription({text: ''});
};

cvox.NavigationManagerTest.prototype.assertTextEquals = function(expected, actual) {
  try {
    this.assertEquals(expected, actual);
  } catch (e) {
    throw new Error('Expecting ' + expected + ' Actual ' + actual);
  }
};

cvox.NavigationManagerTest.prototype.assertNodeText = function(expectedText, opt_depth) {
  this.assertTextEquals(expectedText,
               this.currentDescription_(opt_depth).text);
  return this;
};

cvox.NavigationManagerTest.prototype.assertNodeAnnotation =
    function(expectedAnnotation, opt_depth) {
  this.assertTextEquals(expectedAnnotation,
               this.currentDescription_(opt_depth).annotation);
  return this;
};

cvox.NavigationManagerTest.prototype.assertNodeContext =
    function(expectedContext, opt_depth) {
  this.assertTextEquals(expectedContext,
               this.currentDescription_(opt_depth).context);
  return this;
};


cvox.NavigationManagerTest.prototype.assertNodeUserValue =
    function(expectedUserValue, opt_depth) {
  this.assertTextEquals(expectedUserValue,
               this.currentDescription_(opt_depth).userValue);
  return this;
};

/**
 * Test navigation of simple static HTML to validate the text and
 *     annotation returned when doing navigation.
 * @export
 */
cvox.NavigationManagerTest.prototype.testSimpleStaticHTML = function() {
  this.appendHtml(
      '<div>' +
        '<p id="before">Before</p>' +
        '<h1>FirstHeading</h1>' +
        '<h2>SecondHeading</h2>' +
      '</div>');
  this.checkNavSequence(
      ['lineardom', 'smart', 'selection'],
      [
       { 'command': 'forward',
         'text': 'FirstHeading',
         'annotation': 'Heading 1'
       },
       { 'command': 'forward',
         'text': 'SecondHeading',
         'annotation': 'Heading 2'
       }
      ]);
};


/**
 * Test navigation of simple static HTML with some control elements to validate
 *      the text and annotation returned when doing navigation.
 * @export
 */
cvox.NavigationManagerTest.prototype.testControlElements = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<p>Some text</p>' +
      '<input type="text"/>' +
      '<p>Some more text</p>' +
      '<input type="button"/>' +
    '</div>');
  this.checkNavSequence(
      ['lineardom', 'smart', 'selection'],
      [
       { 'command': 'forward',
         'text': 'Some text',
         'annotation': ''
       },
       { 'command': 'forward',
         'text': '',
         'annotation': 'Edit text'
       },
       { 'command': 'forward',
         'text': 'Some more text',
         'annotation': ''
       },
       { 'command': 'forward',
         'text': '',
         'annotation': 'Button'
       }
      ]);
};


/**
 * Test navigation of simple static HTML with some control elements inside a
 *     fieldset to validate the text and annotation returned when doing
 *     navigation.
 * @export
 */
cvox.NavigationManagerTest.prototype.testControlElementsWithFieldset = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<p>Some text</p>' +
      '<fieldset id="Fieldset">' +
        '<legend>This is a legend inside a fieldset</legend>' +
        '<input type="text"/>' +
        '<p>Some more text</p>' +
        '<input type="button"/>' +
      '</fieldset>' +
    '</div>');
  this.checkNavSequence(
      ['lineardom', 'selection'],
      [
       { 'command': 'forward',
         'text': 'Some text',
         'annotation': ''
       },
       { 'command': 'forward',
         'text': 'This is a legend inside a fieldset'
       },
       { 'command': 'forward',
         'annotation': 'Edit text'
       },
       { 'command': 'forward',
         'text': 'Some more text',
         'annotation': ''
       },
       { 'command': 'forward',
         'text': '',
         'annotation': 'Button'
       }
      ]);
};


/**
 * Test skip to next/prev element navigation.
 * @export
 */
cvox.NavigationManagerTest.prototype.testSkipNavigation = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<h1> <i>FirstHeading</i> </h1>' +
      'asdf' +
      '<p>Here is some text</p>' +
      'asdf' +
      '<h2>SecondHeading</h2>' +
    '</div>');

  cvox.ChromeVoxUserCommands.enableCommandDispatchingToPage = false;

  this.checkNavSequence(
      'smart',
      [
       { 'command': 'forward',
         'text': 'FirstHeading',
         'annotation': 'Heading 1'
       },
       { 'command': 'forward',
         'text': 'asdf',
         'annotation': ''
       },
       { 'command': 'nextHeading',
         'text': 'SecondHeading',
         'annotation': 'Heading 2'
       },
       { 'command': 'previousHeading',
         'text': 'FirstHeading',
         'annotation': 'Heading 1'
       }
      ]);
};


/**
 * Test finding the next heading.
 * @export
 */
cvox.NavigationManagerTest.prototype.testFindNextHeading = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      'Some text.' +
      '<h1>A heading</h1>' +
      'More text after the heading.' +
      '<p>Even more text after the heading.</p>' +
      '<p id="after">After</p>' +
     '</div>');
  cvox.ChromeVox.navigationManager.ignoreIframesNoMatterWhat();
  this.waitForCalm(cvox.ChromeVoxTester.setStrategy, 'lineardom');
  this.waitForCalm(cvox.ChromeVoxTester.syncToFirstNode);

  this.waitForCalm(this.userCommand, 'forward');
  this.waitForCalm(this.assertSpoken, 'Some text.');

  this.waitForCalm(this.userCommand, 'nextHeading');
  this.waitForCalm(this.assertSpoken, 'A heading Heading 1');

  this.waitForCalm(this.userCommand, 'nextHeading');
  this.waitForCalm(this.assertSpoken,
                   'Wrapped to top A heading Heading 1');

  this.waitForCalm(this.userCommand, 'forward');
  this.waitForCalm(this.assertSpoken, 'More text after the heading.');

  this.waitForCalm(this.userCommand, 'previousHeading');
  this.waitForCalm(this.assertSpoken, 'A heading Heading 1');

  this.waitForCalm(this.userCommand, 'previousHeading');
  this.waitForCalm(this.assertSpoken,
      'Wrapped to bottom A heading Heading 1');

  this.waitForCalm(this.userCommand, 'backward');
  this.waitForCalm(this.assertSpoken, 'Some text.');

  this.waitForCalm(cvox.ChromeVoxTester.setStrategy, 'smart');
  this.waitForCalm(cvox.ChromeVoxTester.syncToFirstNode);

  this.waitForCalm(this.userCommand, 'forward');
  this.waitForCalm(this.assertSpoken, 'Some text.');

  this.waitForCalm(this.userCommand, 'nextHeading');
  this.waitForCalm(this.assertSpoken, 'A heading Heading 1');

  this.waitForCalm(this.userCommand, 'nextHeading');
  this.waitForCalm(this.assertSpoken,
                   'Wrapped to top A heading Heading 1');

  this.waitForCalm(this.userCommand, 'forward');
  this.waitForCalm(this.assertSpoken, 'More text after the heading.');

  this.waitForCalm(this.userCommand, 'previousHeading');
  this.waitForCalm(this.assertSpoken, 'A heading Heading 1');

  this.waitForCalm(this.userCommand, 'previousHeading');
  this.waitForCalm(this.assertSpoken,
      'Wrapped to bottom A heading Heading 1');

  this.waitForCalm(this.userCommand, 'backward');
  this.waitForCalm(this.assertSpoken, 'Some text.');
};


// TODO(dtseng): Adjust TableShifter to have this feedback.
/**
 * Test finding the next table.
 * @export
 */
cvox.NavigationManagerTest.prototype.failsTestFindNextTable = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<div>Some text.</div>' +
      '<div>Some more text.</div>' +
      '<table border="1">' +
        '<tr> <td>A</td> <td>1</td> </tr>' +
        '<tr> <td>B</td> <td>2</td> </tr>' +
        '<tr> <td>C</td> <td>3</td> </tr>' +
      '</table>' +
      '<div>After first table.</div>' +
      '<table>' +
        '<tr> <td>A</td> <td>1</td> </tr>' +
      '</table>' +
      '<p id="after">After</p>' +
     '</div>');

  this.waitForCalm(cvox.ChromeVoxTester.setStrategy, 'lineardom');
  this.waitForCalm(cvox.ChromeVoxTester.syncToFirstNode);

  this.waitForCalm(this.userCommand, 'forward');
  this.waitForCalm(this.assertSpoken, 'Some text.');

  this.waitForCalm(this.userCommand, 'nextTable');
  this.waitForCalm(this.assertSpoken, 'A table');

  this.waitForCalm(this.userCommand, 'enterShifter');
  this.waitForCalm(this.assertSpoken, 'A table Row 1 of 3, Column 1 of 2');

  this.waitForCalm(this.userCommand, 'nextTable');
  this.waitForCalm(this.assertSpoken, 'No next table.');
};



/**
 * Test navigation of HTML and ARIA lists.
 * @export
 */
cvox.NavigationManagerTest.prototype.testListLinearNav = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<ul>' +
        '<li>First' +
        '<li><div>Second</div></li>' +
        '<div role="listitem"><a href="#">Third</a></div>' +
      '</ul>' +
      '<div role="list">' +
        '<div role="listitem"><a href="#">First</a></div>' +
        '<li>Second' +
      '</div>' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      'lineardom',
      [
       { 'command': 'forward',
         'context': 'List with 3 items',
         'text': 'First',
         'annotation': 'List item'
       },
       { 'command': 'forward',
         'context': '',
         'text': 'Second',
         'annotation': 'List item'
       },
       { 'command': 'forward',
         'context': '',
         'text': 'Third',
         'annotation': 'Internal link List item'
       },
       { 'command': 'forward',
         'context': 'List with 2 items',
         'text': 'First',
         'annotation': 'Internal link List item'
       },
       { 'command': 'forward',
         'context': '',
         'text': 'Second',
         'annotation': 'List item'
       },
       { 'command': 'forward',
         'context': '',
         'text': 'After',
         'annotation': ''
       },
       { 'command': 'backward',
         'context': 'List with 2 items',
         'text': 'Second',
         'annotation': 'List item'
       },
       { 'command': 'backward',
         'context': '',
         'text': 'First',
         'annotation': 'Internal link List item'
       }
      ]);
};


/**
 * Test navigation of HTML and ARIA lists.
 * @export
 */
cvox.NavigationManagerTest.prototype.testListSmartNav = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<ul>' +
        '<li>First</li>' +
        '<li>Second</li>' +
        '<div role="listitem">Third</div>' +
      '</ul>' +
      '<div role="list">' +
        '<div role="listitem"><a href="#">First</a></div>' +
        '<li>Second' +
      '</div>' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      'smart',
      [
       { 'command': 'forward',
         'context': 'List with 3 items',
         'text': 'First',
         'annotation': 'List item'
       },
       { 'text': 'Second',
         'annotation': 'List item'
       },
       { 'text': 'Third',
         'annotation': 'List item'
       },
       { 'command': 'forward',
         'context': 'List with 2 items',
         'text': 'First',
         'annotation': 'Internal link List item'
       },
       { 'text': 'Second',
         'annotation': 'List item'
       },
       { 'command': 'forward',
         'text': 'After'
       },
       { 'command': 'backward',
         'context': 'List with 2 items',
         'text': 'First',
         'annotation': 'Internal link List item'
       },
       { 'text': 'Second',
         'annotation': 'List item'
       }
      ]);
};


/**
 * Test smart navigation of link collections.
 * @export
 */
cvox.NavigationManagerTest.prototype.testLinkCollectionSmartNav = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<p>' +
        '<a href="#">First</a>' +
        '<a href="#">Second</a>' +
        '<a href="#">Third</a>' +
      '</p>' +
      '<p>' +
        '<a href="#">First</a> and' +
        '<a href="#">Second</a> and' +
        '<a href="#">Third</a>' +
      '</p>' +
      '<p id="after">After</p>' +
    '</div>');

  // TODO: The way we implemented this feature breaks the i18n_check.
  if (cvox.I18nCheck)
    return;

  this.checkNavSequence(
      'smart',
      [
       { 'command': 'forward',
         'annotation': 'Link collection with 3 items'
       },
       { 'text': 'First'
       },
       { 'text': 'Second'
       },
       { 'text': 'Third'
       },
       { 'command': 'forward',
         'text': 'First',
         'annotation': 'Internal link'
       },
       { 'text': 'and'
       },
       { 'text': 'Second',
         'annotation': 'Internal link'
       },
       { 'text': 'and'
       },
       { 'text': 'Third',
         'annotation': 'Internal link'
       },
       { 'command': 'forward',
         'text': 'After'
       }
      ]);
};


/**
 * Test navigation of a control followed by its label.
 * @export
 */
cvox.NavigationManagerTest.prototype.testControlThenLabel = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<input type="checkbox" id="aaa">' +
      '<label for="aaa">Alpha</label>' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      'lineardom',
      [
       { 'command': 'forward',
         'text': 'Alpha',
         'annotation': 'Check box not checked'
       },
       { 'command': 'forward',
         'text': 'After',
         'annotation': ''
       },
       { 'command': 'backward',
         'text': 'Alpha',
         'annotation': 'Check box not checked'
       },
       { 'command': 'backward',
         'text': 'Before',
         'annotation': ''
       }
      ]);
};


/**
 * Test navigation of a label followed by its control.
 * @export
 */
cvox.NavigationManagerTest.prototype.testLabelThenControl = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<label for="bbb">Beta</label>' +
      '<input type="checkbox" id="bbb">' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      'lineardom',
      [
       { 'command': 'forward',
         'text': 'Beta',
         'annotation': 'Check box not checked'
       },
       { 'command': 'forward',
         'text': 'After',
         'annotation': ''
       },
       { 'command': 'backward',
         'text': 'Beta',
         'annotation': 'Check box not checked'
       },
       { 'command': 'backward',
         'text': 'Before',
         'annotation': ''
       }
      ]);
};


/**
 * Test navigation of a control inside a label element (yes, this is
 *     valid HTML and should be supported).
 * @export
 */
cvox.NavigationManagerTest.prototype.testControlInsideLabel = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<label>' +
        'First name:' +
        '<input type="text" name="name" value="Linus">' +
      '</label>' +
      '<p>' +
        '<label>Remember me' +
          '<input type="checkbox" id="remember" />' +
        '</label>' +
      '</p>' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      'lineardom',
      [
       { 'command': 'forward',
         'text': 'First name:',
         'userValue': 'Linus',
         'annotation': 'Edit text'
       },
       { 'command': 'forward',
         'text': 'Remember me',
         'annotation': 'Check box not checked'
       },
       { 'command': 'forward',
         'text': 'After',
         'annotation': ''
       },
       { 'command': 'backward',
         'text': 'Remember me',
         'annotation': 'Check box not checked'
       },
       { 'command': 'backward',
         'text': 'First name:',
         'userValue': 'Linus',
         'annotation': 'Edit text'
       },
       { 'command': 'backward',
         'text': 'Before',
         'annotation': ''
       }
      ]);
};


/**
 * Test navigation of two controls inside a single label element - this
 *     is nonstandard but we should make sure we don't totally fail!
 * @export
 */
cvox.NavigationManagerTest.prototype.testTwoControlsInsideLabel = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<label>' +
        'LabelText' +
        '<input type="text" value="Value">' +
        '<input type="checkbox">' +
      '</label>' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      'lineardom',
      [
       { 'command': 'forward',
         'text': 'LabelText',
         'userValue': 'Value',
         'annotation': 'Edit text'
       },
       { 'command': 'forward',
         'text': 'LabelText',
         'annotation': 'Check box not checked'
       },
       { 'command': 'forward',
         'text': 'After',
         'annotation': ''
       },
       { 'command': 'backward',
         'text': 'LabelText',
         'annotation': 'Check box not checked'
       },
       { 'command': 'backward',
         'text': 'LabelText',
         'userValue': 'Value',
         'annotation': 'Edit text'
       },
       { 'command': 'backward',
         'text': 'Before',
         'annotation': ''
       }
      ]);
};


/**
 * Test invalid labels - if a label doesn't point to a control, it
 *     should just be read as if it wasn't a label.
 * @export
 */
cvox.NavigationManagerTest.prototype.testInvalidLabels = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<label for="xxx">Label for nonexistent control</label>' +
      '<label>Label with no associated control</label>' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      'lineardom',
      [
       { 'command': 'forward',
         'text': 'Label for nonexistent control',
         'annotation': ''
       },
       { 'command': 'forward',
         'text': 'Label with no associated control',
         'annotation': ''
       },
       { 'command': 'forward',
         'text': 'After',
         'annotation': ''
       },
       { 'command': 'backward',
         'text': 'Label with no associated control',
         'annotation': ''
       },
       { 'command': 'backward',
         'text': 'Label for nonexistent control',
         'annotation': ''
       },
       { 'command': 'backward',
         'text': 'Before',
         'annotation': ''
       }
      ]);
};


/**
 * Test scrollbar value readout.
 * @export
 */
cvox.NavigationManagerTest.prototype.testScrollbar = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<div id="progress1" role="progressbar" class="range"' +
        'aria-valuemin="0" aria-valuenow="1" aria-valuemax="5">' +
          '<div>[==&nbsp;&nbsp;&nbsp;]</div>' +
      '</div>' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      ['lineardom', 'smart'],
      [
       { 'command': 'forward',
         'text': '',
         'annotation': 'Progress bar 20%'
       }
      ]);
};


/**
 * Test ARIA listbox where the whole box gets focus.
 * @export
 */
cvox.NavigationManagerTest.prototype.testAriaListboxActiveDescendant = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<select size="3">' +
        '<option selected>Red</option>' +
        '<option>Yellow</option>' +
        '<option>Green</option>' +
      '</select>' +
      '<p id="middle1">Middle 1</p>' +
      '<div id="listbox" role="listbox" tabindex="0" aria-activedescendant="red">' +
        '<div id="red" aria-selected="true" role="option">Red</div>' +
        '<div id="yellow" role="option">Yellow</div>' +
        '<div id="green" role="option">Green</div>' +
      '</div>' +
      '<p id="middle2">Middle 2</p>' +
      '<div id="listbox2" role="listbox" tabindex="0"' +
             'aria-activedescendant="red2">' +
        '<div id="red2" aria-selected="true" role="option"' +
             'aria-posinset="10" aria-setsize="30">Red</div>' +
        '<div id="yellow2" role="option"' +
             'aria-posinset="20" aria-setsize="30">Yellow</div>' +
        '<div id="green2" role="option"' +
             'aria-posinset="30" aria-setsize="30">Green</div>' +
      '</div>' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      ['lineardom', 'smart'],
      [
       { 'command': 'forward',
         'userValue': 'Red',
         'annotation': 'Combo box 1 of 3'
       },
       { 'command': 'forward',
         'text': 'Middle 1',
         'annotation': ''
       },
       { 'command': 'forward',
         'userValue': 'Red',
         'annotation': 'List box Selected 1 of 3'
       },
       { 'command': 'forward',
         'text': 'Middle 2',
         'annotation': ''
       },
       { 'command': 'forward',
         'userValue': 'Red',
         'annotation': 'List box Selected 10 of 30'
       },
       { 'command': 'forward',
         'text': 'After',
         'annotation': ''
       }
      ]);
};


/**
 * Test ARIA listbox where each option gets focus.
 * @export
 */
cvox.NavigationManagerTest.prototype.testAriaListboxOption = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<div id="listbox" role="listbox">' +
        '<div id="red" tabindex="0" aria-selected="true" role="option">Red</div>' +
        '<div id="yellow" tabindex="-1" role="option">Yellow</div>' +
        '<div id="green" tabindex="-1" role="option">Green</div>' +
      '</div>' +
      '<p id="before">Middle</p>' +
      '<div id="listbox2" role="listbox">' +
        '<div id="red2" tabindex="0" aria-selected="true" role="option"' +
             'aria-posinset="2" aria-setsize="6">Red</div>' +
        '<div id="yellow2" tabindex="-1" role="option"' +
             'aria-posinset="4" aria-setsize="6">Yellow</div>' +
        '<div id="green2" tabindex="-1" role="option"' +
             'aria-posinset="6" aria-setsize="6">Green</div>' +
      '</div>' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      ['lineardom', 'smart'],
      [
       { 'command': 'forward',
         'context': 'List box',
         'text': 'Red',
         'annotation': 'Selected 1 of 3'
       },
       { 'command': 'forward',
         'text': 'Yellow',
         'annotation': '2 of 3'
       },
       { 'command': 'forward',
         'text': 'Green',
         'annotation': '3 of 3'
       },
       { 'command': 'forward',
         'text': 'Middle',
         'annotation': ''
       },
       { 'command': 'forward',
         'context': 'List box',
         'text': 'Red',
         'annotation': 'Selected 2 of 6'
       },
       { 'command': 'forward',
         'text': 'Yellow',
         'annotation': '4 of 6'
       },
       { 'command': 'forward',
         'text': 'Green',
         'annotation': '6 of 6'
       },
       { 'command': 'forward',
         'text': 'After',
         'annotation': ''
       },
       { 'command': 'backward',
         'context': 'List box',
         'text': 'Green',
         'annotation': '6 of 6'
       },
       { 'command': 'backward',
         'text': 'Yellow',
         'annotation': '4 of 6'
       },
       { 'command': 'backward',
         'text': 'Red',
         'annotation': 'Selected 2 of 6'
       },
       { 'command': 'backward',
         'text': 'Middle',
         'annotation': ''
       },
       { 'command': 'backward',
         'context': 'List box',
         'text': 'Green',
         'annotation': '3 of 3'
       },
       { 'command': 'backward',
         'text': 'Yellow',
         'annotation': '2 of 3'
       },
       { 'command': 'backward',
         'text': 'Red',
         'annotation': 'Selected 1 of 3'
       }
      ]);
};


/**
 * Test ARIA listbox where each option gets focus and the outer container has
 * tabindex="-1"
 * @export
 */
cvox.NavigationManagerTest.prototype.testAriaListboxOptionOuterFocus = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<div id="listbox" role="listbox" tabindex="-1">' +
        '<div id="red" tabindex="0" aria-selected="true" role="option">Red</div>' +
        '<div id="yellow" tabindex="-1" role="option">Yellow</div>' +
        '<div id="green" tabindex="-1" role="option">Green</div>' +
      '</div>' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      ['smart'],
      [
       { 'command': 'forward',
         'context': 'List box',
         'text': 'Red',
         'annotation': 'Selected 1 of 3'
       },
       { 'command': 'forward',
         'text': 'Yellow',
         'annotation': '2 of 3'
       },
       { 'command': 'forward',
         'text': 'Green',
         'annotation': '3 of 3'
       },
       { 'command': 'forward',
         'text': 'After',
         'annotation': ''
       }
      ]);
};



/**
 * Test ARIA menus.
 * @export
 */
cvox.NavigationManagerTest.prototype.testAriaMenus = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<div role="menubar">' +
        '<div role="menuitem">File</div>' +
        '<div role="menuitem">Edit</div>' +
      '</div>' +
      '<div role="menu">' +
        '<div role="menuitem">New</div>' +
        '<div role="menuitem">Open</div>' +
      '</div>' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      ['lineardom', 'smart'],
      [
       { 'command': 'forward',
         'context': 'Menu bar',
         'text': 'File',
         'annotation': 'Menu'
       },
       { 'command': 'forward',
         'text': 'Edit',
         'annotation': 'Menu'
       },
       { 'command': 'forward',
         'text': 'New',
         'annotation': 'Menu item 1 of 2'
       },
       { 'command': 'forward',
         'text': 'Open',
         'annotation': 'Menu item 2 of 2'
       }
      ]);
};

/**
 * Test left and right navigation at the group level.
 * @export
 */
cvox.NavigationManagerTest.prototype.testLeftRightGroupNavigation = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<h1>Alphabetical Fruits</h1>' +
      'Apple <a href=\'#\'>Banana</a> Cranberry <a href=\'#\'>Date</a> Eggplant' +
      '<p id="after">After</p>' +
     '</div>');
  this.checkNavSequence(
      'smart',
      [
        { 'command': 'forward',
          'text': 'Alphabetical Fruits',
          'annotation': 'Heading 1'
        },
        { 'command': 'right',
          'text': 'Apple'
        },
        { 'command': 'right',
          'text': 'Banana',
          'annotation': 'Internal link'
        },
        { 'command': 'left',
          'text': 'Apple'
        },
        { 'command': 'forward',
          'text': 'Banana',
          'annotation': 'Internal link'
        },
        { 'command': 'right',
          'text': 'Cranberry'
        },
        { 'command': 'backward',
          'text': 'Banana',
          'annotation': 'Internal link'
        }
      ]);
};

/**
 * Test left and right navigation at the sentence level.
 * @export
 */
cvox.NavigationManagerTest.prototype.testLeftRightSentenceNavigation = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<h1>Alphabetical Fruits</h1>' +
      'Apples are delicious. An apple a day keeps the doctor away.' +
      '<a href="#">Banana</a> Cranberries are delicious. ' +
      'A cranberry a day keeps the doctor away.' +
      '<p id="after">After</p>' +
     '</div>');

  // TODO(dtseng): This is here until we can remove or fix all tests relating to
  // sentences. This test framework holds state across runs, so only this
  // expression is needed.
  cvox.NavigationShifter.allowSentence = true;
  this.checkNavSequence(
      'lineardom',
      [
        { 'command': 'forward',
          'text': 'Alphabetical Fruits',
          'annotation': 'Heading 1'
        },
        { 'command': 'forward',
          'text': 'Apples are delicious. An apple a day keeps the doctor away.'
        },
        { 'command': 'right',
          'text': 'An apple a day keeps the doctor away.'
        },
        { 'command': 'right',
          'text': 'Banana',
          'annotation': 'Internal link'
        },
        { 'command': 'right',
          'text': 'Cranberries are delicious.'
        },
        { 'command': 'right',
          'text': 'A cranberry a day keeps the doctor away.'
        },
        { 'command': 'left',
          'text': 'Cranberries are delicious.'
        },
        { 'command': 'left',
          'text': 'Banana',
          'annotation': 'Internal link'
        },
        { 'command': 'forward',
          'text': 'Cranberries are delicious. A cranberry a day keeps the doctor away.'
        }
      ]);
};

/**
 * Test left and right navigation at the word level.
 * @export
 */
cvox.NavigationManagerTest.prototype.testLeftRightWordNavigation = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<h1>Alphabetical Fruits</h1>' +
      'Apples are delicious. An apple a day keeps the doctor away.' +
      '<h2><a href="#">Banana</a></h2> Cranberries are delicious. ' +
      'A cranberry a day keeps the doctor away.' +
      '<p id="after">After</p>' +
    '</div>');
  this.checkNavSequence(
      'selection',
      [
        { 'command': 'forward',
          'text': 'Alphabetical Fruits',
          'annotation': 'Heading 1'
        },
        { 'command': 'forward',
          'text': 'Apples are delicious.'
        },
        { 'command': 'nextGranularity' },
        { 'command': 'right',
          'text': 'are'
        },
        { 'command': 'right',
          'text': 'delicious.'
        },
        { 'command': 'right',
          'text': 'An'
        },
        { 'command': 'right',
          'text': 'apple'
        },
        { 'command': 'right',
          'text': 'a'
        },
        { 'command': 'left',
          'text': 'apple'
        },
        { 'command': 'left',
          'text': 'An'
        },
        { 'command': 'forward',
          'text': 'Banana'
        },
        { 'command': 'right',
          'text': 'Cranberries'
        },
        { 'command': 'previousGranularity' },
        { 'command': 'previousGranularity',
          'text': 'Cranberries are delicious. A cranberry a day keeps the doctor away.'
        }
      ]);
};

/**
 * Test left and right navigation at the character level.
 * @export
 */
cvox.NavigationManagerTest.prototype.testLeftRightCharacterNavigation = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<h1>Alphabetical Fruits</h1>' +
      'Apples are delicious. An apple a day keeps the doctor away.' +
      '<a href="#">Banana</a> Cranberries are delicious. ' +
      'A cranberry a day keeps ' +
      'the doctor away.' +
      '<p id="after">After</p>' +
     '</div>');
  this.checkNavSequence(
      'selection',
      [
        { 'command': 'forward',
          'text': 'Alphabetical Fruits',
          'annotation': 'Heading 1'
        },
        { 'command': 'forward',
          'text': 'Apples are delicious.'
        },
        { 'command': 'nextGranularity' },
        { 'command': 'nextGranularity',
          'text': 'Apples'
        },
        { 'command': 'right',
          'text': 'p'
        },
        { 'command': 'right',
          'text': 'p'
        },
        { 'command': 'right',
          'text': 'l'
        },
        { 'command': 'right',
          'text': 'e'
        },
        { 'command': 'right',
          'text': 's'
        },
        { 'command': 'right',
          'text': ' '
        },
        { 'command': 'right',
          'text': 'a'
        },
        { 'command': 'right',
          'text': 'r'
        },
        { 'command': 'right',
          'text': 'e'
        },
        { 'command': 'left',
          'text': 'r'
        },
        { 'command': 'left',
          'text': 'a'
        },
        { 'command': 'forward',
          'text': 'delicious.'
        },
        { 'command': 'right',
          'text': 'e'
        },
        { 'command': 'nextGranularity' },
        { 'command': 'previousGranularity',
          'text': 'elicious.'
        }
      ]);
};

/**
 * Test mixing left/right and up/down navigation at the selection level.
 * @export
 */
cvox.NavigationManagerTest.prototype.testMixSelectionNavigation = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<h1>Alphabetical Fruits</h1>' +
      'Apples are delicious. An apple a day keeps the doctor away.' +
      'Bananas are delicious. A banana a day keeps the doctor away.' +
      '<p id="after">After</p>' +
     '</div>');
  this.checkNavSequence(
      'selection',
      [
        { 'command': 'forward',
          'text': 'Alphabetical Fruits',
          'annotation': 'Heading 1'
        },
        { 'command': 'forward',
          'text': 'Apples are delicious.'
        },
        { 'command': 'nextGranularity' },
        { 'command': 'nextGranularity',
          'text': 'Apples'
        },
        { 'command': 'forward',
          'text': 'are'
        },
        { 'command': 'right',
          'text': 'r'
        },
        { 'command': 'right',
          'text': 'e'
        },
        { 'command': 'previousGranularity' },
        { 'command': 'previousGranularity',
          'text': 'Apples are delicious.'
        },
        { 'command': 'nextGranularity' },
        { 'command': 'nextGranularity',
          'text': 'Apples'
        },
        { 'command': 'right',
          'text': 'p'
        },
        { 'command': 'right',
          'text': 'p'
        }
      ]);
};


// TODO(dtseng): Adjust TableShifter to have this feedback.
// TODO(dtseng): Implement support for AbstractShifter in tester class.
/**
 * Test whether a grid starts table mode.
 * @export
 */
cvox.NavigationManagerTest.prototype.failsTestGridTableMode = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<div role="grid">' +
        '<div role="row">' +
          '<div role="gridcell">A</div>' +
          '<div role="gridcell">1</div>' +
        '</div>' +
        '<div role="row">' +
          '<div role="gridcell">B</div>' +
          '<div role="gridcell">2</div>' +
        '</div>' +
        '<div role="row">' +
          '<div role="gridcell">C</div>' +
          '<div role="gridcell">3</div>' +
        '</div>' +
      '</div>' +
      '<p id="after">After</p>' +
     '</div>');
  this.checkNavSequence(
      ['lineardom', 'smart'],
      [
        { 'command': 'forward',
          'context': 'Grid',
          'text': 'A',
          'annotation': 'Cell'
        },
        {
          'context': 'Row 1 of 3, Column 1 of 2'
        },
        {
          'command': 'forward',
          'text': 'B',
          'annotation': 'Cell'
        }
      ]);
};


// TODO(dtseng): Adjust TableShifter to have this feedback.
// TODO(dtseng): Implement support for AbstractShifter in tester class.
/**
 * Test focusable elements inside a table.
 * @export
 */
cvox.NavigationManagerTest.prototype.failsTestFocusTableMode = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<table border="1">' +
        '<tr>' +
          '<td>A</td>' +
          '<td><input type="button" value="Boring button"></input></td>' +
        '</tr>' +
        '<tr>' +
          '<td>B</td>' +
          '<td><input type="text"></input> Extra text</td>' +
        '</tr>' +
        '<tr>' +
          '<td>C</td>' +
          '<td>3</td>' +
        '</tr>' +
      '</table>' +
      '<p>Outside table</p>' +
      '<p id="after">After</p>' +
     '</div>');
  this.checkNavSequence(
      'smart',
      [
        { 'command': 'forward',
          'text': 'A'
        },
        {
          'context': 'Row 1 of 3, Column 1 of 2'
        },
        {
          'command': 'right',
          'userValue': 'Boring button',
          'annotation': 'Button'
        },
        {
          'command': 'forward',
          'annotation': 'Edit text'
        },
        {
          'text': 'Extra text'
        }
      ]);
};


// TODO(dtseng): Implement support for AbstractShifter in tester class.
/**
 * Test sentence mode within a table.
 * @export
 */
cvox.NavigationManagerTest.prototype.testTableSentenceMode = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<table border=1>' +
        '<tr>' +
          '<td>One sentence. Two sentence.</td>' +
          '<td>Three sentence. Four sentence.</td>' +
        '</tr>' +
        '<tr>' +
          '<td>Never announced. A sentence. B sentence.</td>' +
          '<td>C sentence. D sentence.</td>' +
        '</tr>' +
      '</table>' +
      '<p>Outside table</p>' +
      '<p id="after">After</p>' +
     '</div>');
  this.checkNavSequence(
      'smart',
      [
        { 'command': 'forward',
          'text': 'One sentence. Two sentence.'
        },
        {
          'command': 'nextGranularity',
          'text': 'One sentence. Two sentence.'
        },
        {
          'command': 'nextGranularity',
          'text': 'One sentence.'
        },
        {
          'command': 'forward',
          'text': 'Two sentence.'
        },
        {
          'command': 'forward',
          'text': 'Three sentence.'
        },
        {
          'command': 'forward',
          'text': 'Four sentence.'
        }
      ]);
};


/**
 * Test whether fullyDescribe works
 * @export
 */
cvox.NavigationManagerTest.prototype.testFullyDescribe = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<ul>' +
        '<li>A</li>' +
        '<ul>' +
          '<li>1</li>' +
          '<li>2</li>' +
        '</ul>' +
      '</ul>' +
      '<p id="after">After</p>' +
     '</div>');
  this.checkNavSequence(
      'lineardom',
      [
        { 'command': 'forward',
          'context': 'List with 1 items',
          'text': 'A',
          'annotation': 'List item'
        },
        { 'command': 'forward',
          'context': 'List with 2 items',
          'text': '1',
          'annotation': 'List item'
        },
        { 'command': 'forward',
          'context': '',
          'text': '2',
          'annotation': 'List item'
        },
        { 'command': 'fullyDescribe',
          'context': '',
          'text': '2',
          'annotation': 'List item'
        }
      ]);
  this.waitForCalm(this.assertSpoken,
      'List with 1 items A List item ' +
      'List with 2 items 1 List item 2 List item ' +
      'List with 1 items List with 2 items 2 List item');
};


/**
 * Test continuous reading mode.
 * @export
 */
cvox.NavigationManagerTest.prototype.testContinuousReading = function() {
  this.appendHtml(
    '<div id="continuousTest">' +
      '<p id="before">Before</p>' +
      '<div>Some text.</div>' +
        '<div>First</div>' +
        '<div>Second</div>' +
        '<a href="#">Third</a>' +
      '<p id="after">After</p>' +
   '</div>');
  cvox.ChromeVox.navigationManager.ignoreIframesNoMatterWhat();
  this.waitForCalm(cvox.ChromeVoxTester.setStrategy, 'lineardom');
  this.waitForCalm(cvox.ChromeVoxTester.syncToFirstNode);

  this.waitForCalm(cvox.ChromeVoxTester.readFromHere);
  this.waitForCalm(this.assertSpoken,
                   'Before Some text. First Second Third Internal link After');
};


/**
 * Test HTML5 semantic elements
 * @export
 */
cvox.NavigationManagerTest.prototype.testSemanticElts = function() {
  this.appendHtml(
    '<p id="before">Before</p>' +
    '<article>' +
      '<header>' +
        '<time datetime="2009-10-22" pubdate="">October 22, 2009</time>' +
        '<h1>' +
          '<a href="#">Travel day</a>' +
        '</h1>' +
      '</header>' +
      '<p>Blah blah blah</p>' +
    '</article>' +
    '<div>' +
      '<p>October 17, 2009</p>' +
      '<h2>' +
        '<a href="#">I am going to Prague!</a>' +
      '</h2>' +
      '<p>More blah blah blah</p>' +
    '</div>' +
    '<p id="after">After</p>');

  this.checkNavSequence(
      'smart',
      [
        { 'command': 'forward',
          'text': 'October 22, 2009',
          'context': 'Article Header',
          'annotation': 'Time'
        },
        {
          'text': 'Travel day',
          'context': '',
          'annotation': 'Internal link Heading 1'
        },
        {
          'text': 'Blah blah blah'
        },
        { 'command': 'forward',
          'text': 'October 17, 2009'
        },
        {
          'command': 'forward',
          'text': 'I am going to Prague!',
          'context': '',
          'annotation': 'Internal link Heading 2'
        },
        {
          'command': 'forward',
          'text': 'More blah blah blah'
        }
      ]);
};


/**
 * Next granularity should stay on the same node.
 */
cvox.NavigationManagerTest.prototype.testNextGranularity = function() {
  this.appendHtml(
   '<div>' +
  '<p id="next-granularity-start">First sentence.</p>' +
  '<p id="ng-second">Second sentence.</p>');
  this.waitForCalm(this.userCommand, 'nextGranularity')
      .waitForCalm(this.assertSpoken, 'Object First sentence.')
      .waitForCalm(this.userCommand, 'nextGranularity')
      .waitForCalm(this.assertSpoken, 'Sentence First sentence.');
};


/**
 * Test aria-haspopup
 * @export
 */
cvox.NavigationManagerTest.prototype.testAriaHasPopup = function() {
  this.appendHtml(
    '<div>' +
      '<p id="before">Before</p>' +
      '<button>Alpha</button>' +
      '<button aria-haspopup="true">Bravo</button>' +
      '<div role="button" tabindex="0">Charlie</div>' +
      '<div role="button" aria-haspopup="true" tabindex="0">Delta</div>' +
      '<div role="menuitem" tabindex="0">Echo</div>' +
      '<div role="menuitem" aria-haspopup="true" tabindex="0">Foxtrot</div>' +
    '</div>');
  this.checkNavSequence(
      ['lineardom', 'smart'],
      [
       { 'command': 'forward',
         'text': 'Alpha',
         'annotation': 'Button'
       },
       { 'command': 'forward',
         'text': 'Bravo',
         'annotation': 'Pop-up button'
       },
       { 'command': 'forward',
         'text': 'Charlie',
         'annotation': 'Button'
       },
       { 'command': 'forward',
         'text': 'Delta',
         'annotation': 'Pop-up button'
       },
       { 'command': 'forward',
         'text': 'Echo',
         'annotation': 'Menu item'
       },
       { 'command': 'forward',
         'text': 'Foxtrot',
         'annotation': 'Menu item with submenu'
       }
      ]);
};


/** Test Aria Math Roles. */
cvox.NavigationManagerTest.prototype.testAriaMathRoles = function() {
  this.appendHtml(
    '<p><div role="math"' +
    'aria-label="a times x squared plus b times x plus c equals 0">' +
    '<math xmlns="http://www.w3.org/1998/Math/MathML">' +
    '<mrow><mrow><mrow><mi>a</mi><mo> &InvisibleTimes; </mo>' +
    ' <msup id="foo"><mi>x</mi><mn>2</mn></msup>' +
    '</mrow><mo>+</mo><mrow><mi>b</mi><mo> &InvisibleTimes; </mo>' +
    '<mi>x</mi></mrow><mo>+</mo><mi>c</mi></mrow><mo>=</mo><mn>0</mn></mrow>' +
    '</math></div></p>' +
    '<p><div role="math" aria-label="square root of n cube">' +
    '<math><msqrt><msup><mi>n</mi><mn>3</mn></msup></msqrt></math></div></p>'
      );

  this.waitForCalm(this.userCommand, 'forward')
      .waitForCalm(this.assertSpoken, 'Math a times x squared plus b times x plus c equals 0')
      .waitForCalm(this.userCommand, 'forward')
      .waitForCalm(this.assertSpoken, 'Math square root of n cube');
};


// TODO(sorge) Tests fail due to pausing.
/** Test MathML nodes. */
cvox.NavigationManagerTest.prototype.failsTestMathmlNodes = function() {
  this.appendHtml(
    '<p><div><math xmlns="http://www.w3.org/1998/Math/MathML">' +
    '<mrow><mrow><mrow><mi>a</mi>' +
    ' <msup id="foo"><mi>x</mi><mn>2</mn></msup>' +
    '</mrow><mo>+</mo><mrow><mi>b</mi>' +
    '<mi>x</mi></mrow><mo>+</mo><mi>c</mi></mrow><mo>=</mo><mn>0</mn></mrow>' +
    '</math></div></p>' +
    '<p><div><math><msqrt><msup><mi>n</mi><mn>3</mn></msup></msqrt>' +
    '</math></div></p>'
      );

  this.waitForCalm(this.userCommand, 'forward')
      .waitForCalm(this.assertSpoken, 'a x super 2 + b x + c = 0 math')
      .waitForCalm(this.userCommand, 'forward')
      .waitForCalm(this.assertSpoken, 'Square root of n super 3 math');
};


// TODO(sorge) Tests fail due to pausing.
/** Test Mathjax nodes. */
cvox.NavigationManagerTest.prototype.failsTestMathjaxNodes = function() {
  this.appendHtml(
    '<script type="text/x-mathjax-config"> MathJax.Hub.Config({tex2jax:' +
    '{ inlineMath: [[\'$\',\'$\'],[\'\\\\(\',\'\\\\)\']] }});</script>' +
    '<script type="text/javascript"' +
    'src="http://cdn.mathjax.org/mathjax/latest/' +
    'MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>' +
    '<p><div><math xmlns="http://www.w3.org/1998/Math/MathML">' +
    '<mrow><mrow><mrow><mi>a</mi>' +
    ' <msup id="foo"><mi>x</mi><mn>2</mn></msup>' +
    '</mrow><mo>+</mo><mrow><mi>b</mi>' +
    '<mi>x</mi></mrow><mo>+</mo><mi>c</mi></mrow><mo>=</mo><mn>0</mn></mrow>' +
    '</math></div></p>' +
    '<p><div><math><msqrt><msup><mi>n</mi><mn>3</mn></msup></msqrt>' +
    '</math></div></p>'
      );

  this.waitForCalm(this.userCommand, 'forward')
      .waitForCalm(this.assertSpoken, 'a x super 2 + b x + c = 0 math')
      .waitForCalm(this.userCommand, 'forward')
      .waitForCalm(this.assertSpoken, 'Square root of n super 3 math');
};
