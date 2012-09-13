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
 * @fileoverview Extension loader
 * Extension loader is the externally exposed part of the ChromeVox extensions
 * framework.
 * Loads an extension by passing in the extension object to loadExtension call.
 *
 * @author: cagriy@google.com (Cagri Yildirim)
 */

cvoxExt.Extension = {};


var Extension = cvoxExt.Extension;

/** number of tries to get chromevox */
Extension.loadTries = 0;

/** extensions options string map */
Extension.mapOptionToFunction = {
  'enableAutoTraversal': cvoxExt.TraverseManager.enableDefaultManagedTraversal,
  'disableCheckFocused': cvoxExt.Listeners.disableCheckFocused,
  'enableElementFineScroll':
      cvoxExt.TraverseManager.enableElementFineScroll,
  'enableChildSpeakableFineScroll':
      cvoxExt.TraverseManager.enableChildSpeakableFineScroll
};


/** creates install ChromeVox warning popup
*/
Extension.createInstallChromeVoxPopup = function() {
  var install = confirm('ChromeVox Extensions needs ChromeVox. ' +
      'Click OK to install ChromeVox');
  if (install) {
    window.open('https://chrome.google.com/webstore/detail/' +
      'kgejglhpjiefppelpmljglcjbhoiplfn');
  }

};

/** load new ChromeVox extension
 *  @param {cvoxExt.extension} extension extension to be loaded.
 *  @param {Function} callback optional callback function.
 */
Extension.loadExtension = function(extension, callback) {
 var loadExtensionCallback = function() {
    cvoxExt.loadExtension(extension, callback);

  }

  if (!window.cvox) {

    setTimeout(loadExtensionCallback, 100);
    return;
  }
  //extension.init();
  var speakables = extension.speakables;

  var selectors = extension.selectors;


  if (speakables) {
    var options = extension.options;
    if (!options) { options = {};}
    var preprocess = extension.preprocess;
    if (!preprocess) { preprocess = {};}
    for (speakableName in speakables) {
      var speakable = new cvoxExt.Speakable(
                                  speakableName,
                                  speakables[speakableName],
                                  selectors[speakableName],
                                  options[speakableName],
                                  preprocess[speakableName]);
      cvoxExt.SpeakableManager.addSpeakable(speakable);
    }
    for (speakableName in selectors) {
      if (!SpeakableManager.speakables[speakableName]) {
        var speakable = new cvoxExt.Speakable(
                                    speakableName,
                                    ['$self'],
                                    selectors[speakableName],
                                    options[speakableName],
                                    preprocess[speakableName]);
        cvoxExt.SpeakableManager.addSpeakable(speakable);
      }
    }
  } else {
    for (speakableName in extension) {
      if (speakableName != 'extensionOptions') {
        var speakableObj = extension[speakableName];
        var speakable = new cvoxExt.Speakable(
                                    speakableName,
                                    speakableObj.formatter || ['$self'],
                                    speakableObj.selector,
                                    speakableObj.options,
                                    speakableObj.preprocess);
        cvoxExt.SpeakableManager.addSpeakable(speakable);
      }

    }
  }

  if (extension.extensionOptions) {

    for (optionInd in extension.extensionOptions) {

      var func = Extension.mapOptionToFunction[
          extension.extensionOptions[optionInd]];

      if (func) {
        func();
      }
    }
  }
  if (callback) {
    callback();
  }

  cvoxExt.Listeners.registerListeners();

};

/** expose function to extern */
cvoxExt.loadExtension = cvoxExt.Extension.loadExtension;
