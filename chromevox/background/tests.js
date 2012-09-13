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
 * @fileoverview ChromeVox tests page.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.TestsPage');

goog.require('cvox.AutoRunner');
goog.require('cvox.ChromeEarcons');
goog.require('cvox.ChromeHost');
goog.require('cvox.ChromeMsgs');
goog.require('cvox.ChromeTts');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxInit');
goog.require('cvox.EventWatcherTest');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.HostFactory');

/**
 * Class to manage the tests page.
 * @constructor
 */
cvox.TestsPage = function() {
};

/**
 * Runs the tests.
 * @export
 */
// TODO (clchen): Add notion of a test queue to run tests sequentially.
cvox.TestsPage.runTests = function() {
  if ((typeof(cvox) == 'undefined') ||
      (typeof(cvox.ChromeVox) == 'undefined') ||
      cvox.ChromeVox.host == null) {
    window.setTimeout(cvox.TestsPage.runTests, 100);
    return;
  }
  cvox.ChromeVox.init();
  var runner = new cvox.AutoRunner();
  var testCases = new cvox.EventWatcherTest();
  goog.bind(runner.runTest_, runner, testCases.testButtonFocusFeedback);
  runner.runTest_(testCases.testButtonFocusFeedback);
};

cvox.TestsPage.runTests();
