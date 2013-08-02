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
 * @fileoverview A test case can run itself, so it is a runner.
 * But, we don't know how it is run yet, so make everything abstract.
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.AbstractTestCase');

goog.require('cvox.RunnerInterface');
goog.require('cvox.SpokenListBuilder');

/**
 * @constructor
 * @implements {cvox.RunnerInterface}
 */
cvox.AbstractTestCase = function() { };
/** @override */
cvox.AbstractTestCase.prototype.assertTrue = goog.abstractMethod;
/** @override */
cvox.AbstractTestCase.prototype.assertFalse = goog.abstractMethod;
/** @override */
cvox.AbstractTestCase.prototype.assertEquals = goog.abstractMethod;
/** @override */
cvox.AbstractTestCase.prototype.assertSpoken = goog.abstractMethod;
/** @override */
cvox.AbstractTestCase.prototype.assertSpokenList = goog.abstractMethod;
/** @override */
cvox.AbstractTestCase.prototype.appendHtml = goog.abstractMethod;
/** @override */
cvox.AbstractTestCase.prototype.waitForCalm = goog.abstractMethod;
/** @override */
cvox.AbstractTestCase.prototype.setFocus = goog.abstractMethod;
/** @override */
cvox.AbstractTestCase.prototype.userCommand = goog.abstractMethod;


/**
 * Local setup method for tests.
 */
cvox.AbstractTestCase.prototype.setUpTest = function() { };

/**
 * @return {cvox.SpokenListBuilder} A new builder.
 */
cvox.AbstractTestCase.prototype.spokenList = function() {
  return new cvox.SpokenListBuilder();
};
