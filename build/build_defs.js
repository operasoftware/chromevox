//Copyright 2010 Google Inc.
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
 * @fileoverview The ChromeVox build configuration.
 *
 * This file encapsulates the ChromeVox build information.
 * It is yet another page script that is injected by the
 * content script in case some other page scripts requests
 * it in order to perform build specific operations.
 *
 * @author svetoslavganov@google.com
 */

// Make it possible to use this file in a non-Closure context.
if (!window['cvoxgoog']) {
  window['cvoxgoog'] = {};
  window['cvoxgoog'].provide = function() {};
  window['cvoxgoog'].require = function() {};
}
if (!window['cvox']) { window['cvox'] = {}; }

cvoxgoog.provide('cvox.BuildDefs');

/**
 * Undefined build type.
 * @type {number}
 */
var BUILD_TYPE_UNDEFINED = -1;

/**
 * Chrome user build type.
 * @type {number}
 */
var BUILD_TYPE_CHROME = 0;

/**
 * Android user build type.
 * @type {number}
 */
var BUILD_TYPE_ANDROID = 1;

/**
 * Chrome user build type.
 * @type {number}
 */
var BUILD_TYPE_ANDROID_DEV = 2;
