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
 * @fileoverview Utilities for working with platforms.
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.PlatformFilter');
goog.provide('cvox.PlatformUtil');

goog.require('cvox.ChromeVox');


/**
 * @enum
 */
cvox.PlatformFilter = {
  NONE: 0,
  WINDOWS: 1,
  MAC: 2,
  LINUX: 4,
  WML: 7,
  CHROMEOS: 8
};


/**
 *Checks whether the given filter matches the current platform. An undefined
 * filter always matches the current platform.
 * @param {undefined|cvox.PlatformFilter} filter The filter.
 * @return {boolean} Whether the filter matches the current platform.
 */
cvox.PlatformUtil.matchesPlatform = function(filter) {
  if (filter == undefined) {
    return true;
  } else if (navigator.userAgent.indexOf('Win') != -1) {
    return (filter & cvox.PlatformFilter.WINDOWS) != 0;
  } else if (navigator.userAgent.indexOf('Mac') != -1) {
    return (filter & cvox.PlatformFilter.MAC) != 0;
  } else if (navigator.userAgent.indexOf('Linux') != -1) {
    return (filter & cvox.PlatformFilter.LINUX) != 0;
  } else if (navigator.userAgent.indexOf('CrOS') != -1) {
    return (filter & cvox.PlatformFilter.CHROMEOS) != 0;
  }
  return false;
};
