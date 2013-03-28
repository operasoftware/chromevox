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
 * @fileoverview ChromeVox media player page.
 * We need to use this media player page to load video/audo files in cases where
 * Chrome is used to directly access these files since the default Chrome media
 * player controls are not accessible.
 *
 * See: http://code.google.com/p/chromium/issues/detail?id=135661.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.MediaPlayerPage');

goog.require('cvox.ChromeEarcons');
goog.require('cvox.ChromeHost');
goog.require('cvox.ChromeMsgs');
goog.require('cvox.ChromeTts');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxPrefs');
goog.require('cvox.CommandStore');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.HostFactory');
goog.require('cvox.KeyMap');
goog.require('cvox.KeySequence');
goog.require('cvox.PlatformUtil');

/**
 * Class to manage the mediaplayer page.
 * @constructor
 */
cvox.MediaPlayerPage = function() {
};

/**
 * Initializes the MediaPlayerPage.
 */
cvox.MediaPlayerPage.init = function() {
  var contentUrl = document.location.hash.replace('#', '');
  var videoElem = document.getElementById('videoElem');
  videoElem.src = contentUrl;
  videoElem.play();
};

