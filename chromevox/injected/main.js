// Copyright 2010 Google Inc.
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
 * @fileoverview The main entry point for the extension content script.
 *
 * This is the only file that has access to the chrome.extension API
 * from the content script, because all other scripts are loaded into the
 * document head. So, any use of these extension APIs must be done in this
 * file.
 *
 * @author clchen@google.com (Charles Chen)
 */

// TODO(dmazzoni): pull in these dependencies without explicitly
// calling the private method writeScriptTag_.
function initialize() {
  if (COMPILED) {
    var loadCompiledScript = function(scriptRelPath) {
      var scriptElt = document.createElement('script');
      scriptElt.type = 'text/javascript';
      scriptElt.src = chrome.extension.getURL(scriptRelPath);
      document.getElementsByTagName('head')[0].appendChild(scriptElt);
    };
    if (BUILD_TYPE == BUILD_TYPE_CHROME) {
      if (window.location.toString().indexOf('chrome-extension://') == -1 ||
          window.location.toString().indexOf('background.html') == -1) {
        loadCompiledScript('/chromeVoxChromePageScript.js');
      }
    } else if (BUILD_TYPE == BUILD_TYPE_ANDROID_DEV) {
      loadCompiledScript('/androidVoxDev.js');
    } else {
      throw 'Unknown or unsupported build type: ' + BUILD_TYPE;
    }
  } else {
    goog.importScript_(chrome.extension.getURL('/closure/base.js'));
    goog.importScript_(chrome.extension.getURL('/build/build_defs.js'));
    goog.importScript_(
        chrome.extension.getURL('/build/build_config_chrome.js'));
    goog.importScript_(chrome.extension.getURL('../powerkey-bundle.js'));
    goog.require('cvox.ChromeVoxInit');
  }
}

initialize();
