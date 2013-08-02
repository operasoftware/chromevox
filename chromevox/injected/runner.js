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
 * @fileoverview The AutoRunner runs a macro/test.
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.AutoRunner');

goog.require('cvox.AbstractTestCase');
goog.require('cvox.CompositeTts');
goog.require('cvox.History');
goog.require('cvox.NodeBreadcrumb');
goog.require('cvox.RunnerInterface');
goog.require('cvox.SpokenListBuilder');
goog.require('cvox.TestTts');

/* Runner state
 * - currently running test
 * - current instruction
 * - pass / fail
 */

/**
 * @constructor
 */
cvox.AutoRunner = function() {
  this.expectedCallbacks_ = 0;
  this.actualCallbacks_ = 0;

  /** @type {cvox.TestTts} */
  this.testTts_ = new cvox.TestTts();

  /** @type {cvox.TtsInterface} */
  this.oldTts_ = cvox.ChromeVox.tts;

  /** @type {Array} */
  this.testsQueue_ = new Array();

  /**
   * @type {Array}
   * @private JsDoc
   */
  this.results_ = new Array();

  /**
   * @type {cvox.AutoRunner.TestSummary}
   * @private JsDoc
   */
  this.currentTestSummary = null;
};

/**
 * Encapsulates a human readable tag for the test case, the test case function,
 * and an optional status string if the test has been run.
 * @param {string} tagStr A tag, typically the name of the test function.
 * @param {Function} testFunc The test function.
 * @param {string} status The current status of the test.
 * @param {*} scope The scope that the test should be run in.
 * @constructor
 */
cvox.AutoRunner.TestSummary = function(tagStr, testFunc, status, scope) {
  /** @type {string} */
  this.tag = tagStr;
  /** @type {Function} */
  this.func = testFunc;
  /** @type {string} */
  this.status = status;
  this.scope = scope;
};

/**
 * @type {string}
 * @const
 */
cvox.AutoRunner.PASS = 'pass';

/**
 * @type {string}
 * @const
 */
cvox.AutoRunner.FAIL = 'fail';


cvox.AutoRunner.prototype.maybeDone_ = function() {
  if (this.actualCallbacks_ != this.expectedCallbacks_) {
    return;
  }
  cvox.ChromeVox.tts = this.oldTts_;
  window.console.log(this.currentTestSummary.tag + ' test ended with status: ' +
      this.status);
  this.currentTestSummary.status = this.status;
  this.results_.push(this.currentTestSummary);
  this.currentTestSummary = null;
  this.runTests();
};


/**
 * Asserts a value is true.
 * @param {boolean} val The value.
 */
cvox.AutoRunner.prototype.assertTrue = function(val) {
  if (!val) {
    this.status = cvox.AutoRunner.FAIL;
    throw new Error('assertTrue');
  }
}

/**
 * Asserts a value is false.
 * @param {boolean} val The value.
 */
cvox.AutoRunner.prototype.assertFalse = function(val) {
  this.assertTrue(!val);
};


/**
 * Asserts two vaues are equal.
 * @param {*} expected The expected value.
 * @param {*} actual The actual value.
 */
cvox.AutoRunner.prototype.assertEquals = function(expected, actual) {
  this.assertTrue(expected == actual);
};


/**
 * Largely copied from jstestdriver.
 * Converts an HTML fragment to a node.
 * @param {string} html The HTML string.
 * @param {Document} doc The document to create the node in.
 * @return {Node} A node.
 */
cvox.AutoRunner.prototype.toHtml = function(html, doc) {
  var fragment = doc.createDocumentFragment();
  var wrapper = doc.createElement('div');
  wrapper.innerHTML = html;
  while (wrapper.firstChild) {
    fragment.appendChild(wrapper.firstChild);
  }
  return fragment.childNodes.length > 1 ? fragment : fragment.firstChild;
};


/**
 * Largely copied from jstestdriver.
 * Appends HTML to the document.
 * @param {string} html The HTML string.
 */
cvox.AutoRunner.prototype.appendHtml = function(html) {
  var node = this.toHtml(html, window.document);
  window.document.body.appendChild(node);
};


/**
 * Asserts the TTS engine spoken a certain string. Clears the TTS buffer.
 * @param {string} expected The expected text.
 * @return {cvox.AutoRunner} this.
 */
cvox.AutoRunner.prototype.assertSpoken = function(expected) {
  var actual = this.testTts_.getUtterancesAsString();
  window.console.log('assertSpoken: Expected: ' +
                     expected + ' Actual: ' + actual);
  this.assertEquals(expected, actual);
  this.testTts_.clearUtterances();
  return this;
};


/**
 * Asserts a list of utterances are in the correct queue mode.
 * @param {cvox.SpokenListBuilder|Array} expectedList A list
 *     of [text, queueMode] tuples OR a SpokenListBuilder with the expected
 *     utterances.
 * @return {cvox.AutoRunner} this.
 */
cvox.AutoRunner.prototype.assertSpokenList = function(expectedList) {
  if (expectedList instanceof cvox.SpokenListBuilder) {
    expectedList = expectedList.build();
  }

  var ulist = this.testTts_.getUtteranceInfoList();
  for (var i = 0; i < expectedList.length; i++) {
    var text = expectedList[i][0];
    var queueMode = expectedList[i][1];
    this.assertSingleUtterance_(text, queueMode,
                                ulist[i].text, ulist[i].queueMode);
  }
  this.testTts_.clearUtterances();
  return this; // for chaining.
};

cvox.AutoRunner.prototype.assertSingleUtterance_ = function(
    expectedText, expectedQueueMode, text, queueMode) {
  this.assertEquals(expectedQueueMode, queueMode);
  this.assertEquals(expectedText, text);
};


/**
 * Waits for the queued events in ChromeVoxEventWatcher to be
 * handled. Very useful for asserting the results of events.
 *
 * @param {function(this:cvox.AutoRunner, ...)} func A function to call when
 *     ChromeVox is ready.
 * @param {...*}  var_args Arguments to func.
 * @return {cvox.AutoRunner} this.
 */
cvox.AutoRunner.prototype.waitForCalm = function(func, var_args) {
  if (!func) {
    // This is a programming error, not a test failure.  Blow up!
    throw new Error('waitForCalm needs a valid function');
  }
  this.expectedCallbacks_++;
  var calmArgs = Array.prototype.slice.call(arguments, 1);
  cvox.ChromeVoxEventWatcher.addReadyCallback(goog.bind(function() {
      var scope = this.currentTestSummary ?
          this.currentTestSummary.scope : this;
      try {
        func.apply(/** @type {cvox.AutoRunner} */ (scope), calmArgs);
      } catch (e) {
        window.console.log(e, e.stack);
        this.status = cvox.AutoRunner.FAIL;
      } finally {
        this.actualCallbacks_++;
        this.maybeDone_();
      }
  }, this));
  return this;
};


/**
 * Focuses an element.
 * @param {string} eltName The name of the element to focus.
 * @return {cvox.AutoRunner} this.
 */
cvox.AutoRunner.prototype.setFocus = function(eltName) {
  document.getElementById(eltName).focus();
  return this;
};


/**
 * Runs a user command.
 * @param {string} command The name of the user command.
 * @return {cvox.AutoRunner} this.
 */
cvox.AutoRunner.prototype.userCommand = function(command) {
  var history = cvox.History.getInstance();
  history.enterUserCommand(command);
  cvox.ChromeVoxUserCommands.commands[command]();
  history.exitUserCommand(command);
  return this;
};


/**
 * Runs a test case.
 * @param {Function} func The test case.
 */
cvox.AutoRunner.prototype.runTest_ = function(func) {
  this.status = cvox.AutoRunner.PASS;

  // Set up the tts.
  cvox.ChromeVox.tts = new cvox.CompositeTts()
      .add(this.oldTts_).add(this.testTts_);

  cvox.ChromeVox.navigationManager.reset();

  window.console.log('AutoRunner test start');
  var scope = this.currentTestSummary ?
      this.currentTestSummary.scope : this;
  try {
    func.apply(scope);
  } catch (e) {
    window.console.log(e, e.stack);
    this.status = cvox.AutoRunner.FAIL;
  } finally {
    this.maybeDone_();
  }
};

/**
 * Adds a test case to be run in the test queue.
 * @param {string} tag The tag for the test case.
 * @param {Function} func The function for the test case.
 * @param {Object} scope The scope to run the test in.
 */
cvox.AutoRunner.prototype.addTest = function(tag, func, scope) {
  var summary = new cvox.AutoRunner.TestSummary(tag, func, '', scope);
  this.testsQueue_.push(summary);
};

/**
 * Runs all the tests added to the autorunner with addTest.
 */
cvox.AutoRunner.prototype.runTests = function() {
  // Tests are already running, ignore this call.
  if (this.actualCallbacks_ != this.expectedCallbacks_) {
    return;
  }
  if (this.testsQueue_.length < 1) {
    this.displayResults();
    return;
  }
  this.testTts_.clearUtterances();
  document.body.innerHTML = '';
  this.currentTestSummary = this.testsQueue_.shift();
  this.runTest_(this.currentTestSummary.func);
};


/**
 * Displays the results of running the tests.
 */
cvox.AutoRunner.prototype.displayResults = function() {

  var colorStatus = function(status) {
  switch (status) {
    case cvox.AutoRunner.FAIL:
    return '<font color="red">fail</font>';
    case cvox.AutoRunner.PASS:
    return '<font color="green">pass</font>';
    default:
    return status;
  }
  };


  document.body.innerHTML = '<h1>Tests Done</h1><br>';
  for (var i = 0, result; result = this.results_[i]; i++) {
    document.body.innerHTML = document.body.innerHTML + result.tag + ': ' +
        colorStatus(result.status) + '<br>';
  }
};


/**
 * Runs all the test cases in a test.
 * @param {cvox.AbstractTestCase} testcase The test case constructor.
 */
cvox.AutoRunner.prototype.runTestCase = function(testcase) {
  this.mixOurselfIn_(testcase);
  for (var propertyName in testcase) {
    if (propertyName.search('test') == 0) {
      this.addTest(propertyName,
                   testcase[propertyName], testcase);
    }
  }
  testcase.setUpTest();
  this.runTests();
};


/**
 * Mixes a bound cvox.AutoRunner into the test case.
 * @param {Object} obj The test case to mix into.
 * @private
 */
cvox.AutoRunner.prototype.mixOurselfIn_ = function(obj) {
  for (var propertyName in cvox.RunnerInterface.prototype) {
    obj[propertyName] = goog.bind(this[propertyName], this);
  }
};


/**
 * A sample test case.
 * @this {cvox.AutoRunner}
 */
var runNextGranularity = function() {
  this.appendHtml(
      "<div>" +
        "<a href='#' id='next-granularity-start'>First sentence.</a>" +
        "<a href='#' id='ng-second'>Second sentence.</a>" +
      "</div>");
  this.setFocus('next-granularity-start')
      .waitForCalm(this.assertSpoken, 'First sentence. Internal link');
  this.waitForCalm(this.userCommand, 'nextGranularity')
      .waitForCalm(this.assertSpoken, 'Sentence First sentence. Internal link')
      .waitForCalm(this.userCommand, 'nextGranularity')
      .waitForCalm(this.assertSpoken, 'Word First Internal link');
};


/**
 * A sample test case.
 * @this {cvox.AutoRunner}
 */
var runRadioButtonAnnouncements = function() {
  this.appendHtml(
      "<input id='radio1' type='radio' aria-label='green' tabindex=0>" +
      "<input id='radio2' type='radio' aria-label='blue' tabindex=0>");
  function performKeyDown(dir) {
    var evt = document.createEvent('KeyboardEvent');
    evt.initKeyboardEvent(
        'keydown', true, true, window, dir, 0, false, false, false, false);

    document.activeElement.dispatchEvent(evt);
  };

  this.setFocus('radio1');

  this.waitForCalm(this.assertSpoken, 'green Radio button unselected')
      .waitForCalm(performKeyDown, 'Right') // right arrow
      // Moves to next radiobutton.
      .waitForCalm(this.assertSpoken, 'blue Radio button selected')
      .waitForCalm(performKeyDown, 'Right') // right arrow
      // Arrowed beyond end. Should be quiet.
      .waitForCalm(this.assertSpoken, '');

  this.waitForCalm(performKeyDown, 'Left') // left arrow
      // Moves back to first radio.
      .waitForCalm(this.assertSpoken, 'green Radio button selected')
      .waitForCalm(performKeyDown, 'Left') // left arrow
      // Arrowed beyond beginning. Should be quiet.
      .waitForCalm(this.assertSpoken, '');
};

/**
 * Tests ChromeVox navigation for forward/backward symetry over the entire page.
 * This test passes if all runs of forward/backward navigation are symetrical.
 */
var runBackForwardTest = function() {
  this.waitForCalm(this.userCommand, 'forward');

  var reachedEndOfPage = function() {
    var currentNode = cvox.ChromeVox.navigationManager.getCurrentNode();
    while (currentNode && !currentNode.hasAttribute) {
        currentNode = currentNode.parentNode;
    }
    if (currentNode && currentNode.hasAttribute('class')) {
      return currentNode.getAttribute('class') == 'cvoxHistoryEvent';
    }
    return false;
  };

  var tagA, tagB, tagC, tagD;

  var forwardAgain = function() {
     tagA = cvox.NodeBreadcrumb.getCurrentNodeTag();
     this.assertTrue(tagA != -1);
     this.waitForCalm(this.userCommand, 'forward')
         .waitForCalm(function() {
           tagB = cvox.NodeBreadcrumb.getCurrentNodeTag();
           this.assertTrue(tagB != -1);
         })
         .waitForCalm(this.userCommand, 'backward')
         .waitForCalm(function() {
           tagC = cvox.NodeBreadcrumb.getCurrentNodeTag();
           this.assertTrue(tagC != -1);
         })
         .waitForCalm(this.userCommand, 'forward')
         .waitForCalm(function() {
           tagD = cvox.NodeBreadcrumb.getCurrentNodeTag();
           this.assertTrue(tagD != -1);
         })
         .waitForCalm(function() {
           window.console.log('A: ' + tagA + ' B: ' + tagB + ' C: ' + tagC + ' D: ' + tagD);
           this.assertEquals(tagA, tagC);
           this.assertEquals(tagB, tagD);
           if (!reachedEndOfPage()) {
             forwardAgain.apply(this);
           }
         });
  };
  this.waitForCalm(forwardAgain);
};
