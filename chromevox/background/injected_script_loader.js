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
 * @fileoverview Responsible for loading scripts into the inject context.
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.InjectedScriptLoader');




/** @constructor */
cvox.InjectedScriptLoader = function() { };


/**
 * Loads a dictionary of file contents for Javascript files.
 * @param {Array.<string>} files A list of file names.
 * @param {function(Object.<string,string>)} done A function called when all
 *     the files have been loaded. Called with the code map as the first
 *     parameter.
 */
cvox.InjectedScriptLoader.fetchCode = function(files, done) {
  var code = {};
  var waiting = files.length;
  var startTime = new Date();
  var loadScriptAsCode = function(src) {
      // Load the script by fetching its source and running 'eval' on it
      // directly, with a magic comment that makes Chrome treat it like it
      // loaded normally. Wait until it's fetched before loading the
      // next script.
      var xhr = new XMLHttpRequest();
      var url = chrome.extension.getURL(src) + '?' + new Date().getTime();
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          var scriptText = xhr.responseText;
          // Add a magic comment to the bottom of the file so that
          // Chrome knows the name of the script in the JavaScript debugger.
          var debugSrc = src.replace('closure/../', '');
          // The 'chromevox' id is only used in the DevTools instead of a long
          // extension id.
          scriptText += '\n//# sourceURL= chrome-extension://chromevox/' +
              debugSrc + '\n';
          code[src] = scriptText;
          waiting--;
          if (waiting == 0) {
            done(code);
          }
        }
      };
      xhr.open('GET', url);
      xhr.send(null);
  }

  files.forEach(function(f) { loadScriptAsCode(f); });
};
