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
 * @fileoverview Allows events to be suspended.
 *
 * @author stoarca@google.com (Sergiu Toarca)
 */

goog.provide('cvox.ChromeVoxEventSuspender');

/**
 * @namespace
 */
cvox.ChromeVoxEventSuspender = function() {};

/**
 * A nestable variable to keep track of whether events are suspended.
 *
 * @type {number}
 * @private
 */
cvox.ChromeVoxEventSuspender.suspendLevel_ = 0;

/**
 * Enters a (nested) suspended state.
 */
cvox.ChromeVoxEventSuspender.enterSuspendEvents = function() {
  cvox.ChromeVoxEventSuspender.suspendLevel_ += 1;
}

/**
 * Exits a (nested) suspended state.
 */
cvox.ChromeVoxEventSuspender.exitSuspendEvents = function() {
  cvox.ChromeVoxEventSuspender.suspendLevel_ -= 1;
}

/**
 * Returns true if events are currently suspended.
 *
 * @return {boolean} True if events are suspended.
 */
cvox.ChromeVoxEventSuspender.areEventsSuspended = function() {
  return cvox.ChromeVoxEventSuspender.suspendLevel_ > 0;
};

/**
 * Returns a function that runs the argument with all events suspended.
 *
 * @param {Function} f Function to run with suspended events.
 * @return {?} Returns a function that wraps f.
 */
cvox.ChromeVoxEventSuspender.withSuspendedEvents = function(f) {
  return function() {
    cvox.ChromeVoxEventSuspender.enterSuspendEvents();
    var ret = f.apply(this, arguments);
    cvox.ChromeVoxEventSuspender.exitSuspendEvents();
    return ret;
  };
};

/**
 * Returns a handler that only runs the argument if events are not suspended.
 *
 * @param {Function} handler Function that will be used as an event handler.
 * @param {boolean} ret Return value if events are suspended.
 * @return {Function} Function wrapping the handler.
 */
cvox.ChromeVoxEventSuspender.makeSuspendableHandler = function(handler, ret) {
  return function() {
    if (cvox.ChromeVoxEventSuspender.areEventsSuspended()) {
      return ret;
    }
    return handler();
  };
};
