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
 * @fileoverview A runner runs macros / tests.
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.RunnerInterface');

goog.require('cvox.SpokenListBuilder');

/**
 * @interface
 */
cvox.RunnerInterface = function() { };

/**
 * Asserts a value is true.
 * @param {boolean} val The value.
 */
cvox.RunnerInterface.prototype.assertTrue = function(val) { };

/**
 * Asserts a value is false.
 * @param {boolean} val The value.
 */
cvox.RunnerInterface.prototype.assertFalse = function(val) { };

/**
 * Asserts two vaues are equal.
 * @param {*} expected The expected value.
 * @param {*} actual The actual value.
 */
cvox.RunnerInterface.prototype.assertEquals = function(expected, actual) { };

/**
 * Asserts the TTS engine spoken a certain string. Clears the TTS buffer.
 * @param {string} expected The expected text.
 * @return {cvox.RunnerInterface} this.
 */
cvox.RunnerInterface.prototype.assertSpoken = function(expected) { };

/**
 * Asserts a list of utterances are in the correct queue mode.
 * @param {cvox.SpokenListBuilder|Array} expectedList A list
 *     of [text, queueMode] tuples OR a SpokenListBuilder with the expected
 *     utterances.
 * @return {cvox.RunnerInterface} this.
 */
cvox.RunnerInterface.prototype.assertSpokenList = function(expectedList) { };


/**
 * Appends HTML to the document.
 * @param {string} html The HTML string.
 */
cvox.RunnerInterface.prototype.appendHtml = function(html) { };

/**
 * Waits for the queued events in ChromeVoxEventWatcher to be
 * handled. Very useful for asserting the results of events.
 *
 * @param {function(this:cvox.RunnerInterface, ...)} func A function to call
 *     when ChromeVox is ready.
 * @param {...*}  var_args Arguments to func.
 * @return {cvox.RunnerInterface} this.
 */
cvox.RunnerInterface.prototype.waitForCalm = function(func, var_args) { };

/**
 * Focuses an element.
 * @param {string} eltName The name of the element to focus.
 * @return {cvox.RunnerInterface} this.
 */
cvox.RunnerInterface.prototype.setFocus = function(eltName) { };

/**
 * Runs a user command.
 * @param {string} command The name of the user command.
 * @return {cvox.RunnerInterface} this.
 */
cvox.RunnerInterface.prototype.userCommand = function(command) { };
