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
 * @fileoverview Defines the AndroidVox app.
 * @author deboer@google.com (James deBoer)
 */
goog.require('cvox.AndroidEarcons');
goog.require('cvox.AndroidTts');
goog.require('cvox.AndroidBraille');
goog.require('cvox.ChromeVoxInit');
goog.require('cvox.ClankHost');
goog.require('cvox.TestMsgs');

// NOTE(deboer): This is called when this script is loaded, automatically
// starting ChromeVox.
cvox.ChromeVox.initDocument();
