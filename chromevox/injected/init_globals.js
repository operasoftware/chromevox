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
 * @fileoverview Initializes the injected content script.
 *
 * @author clchen@google.com (Charles Chen)
 */

goog.provide('cvox.InitGlobals');

goog.require('cvox.ApiImplementation');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxEventWatcher');
goog.require('cvox.CompositeTts');
goog.require('cvox.ConsoleTts');
goog.require('cvox.HostFactory');
goog.require('cvox.NavigationManager');
goog.require('cvox.Serializer');
goog.require('cvox.SpokenMessages');



/**
 * @constructor
 */
cvox.InitGlobals = function() { };


/**
 * Initializes cvox.ChromeVox.
 */
cvox.InitGlobals.initGlobals = function() {
  if (!cvox.ChromeVox.host) {
    cvox.ChromeVox.host = cvox.HostFactory.getHost();
  }

  cvox.ChromeVox.tts = new cvox.CompositeTts()
      .add(cvox.HostFactory.getTts())
      .add(cvox.History.getInstance())
      .add(cvox.ConsoleTts.getInstance());

  if (!cvox.ChromeVox.braille) {
    cvox.ChromeVox.braille = cvox.HostFactory.getBraille();
  }
  cvox.ChromeVox.mathJax = cvox.HostFactory.getMathJax();

  cvox.ChromeVox.earcons = cvox.HostFactory.getEarcons();
  cvox.ChromeVox.msgs = cvox.HostFactory.getMsgs();
  cvox.ChromeVox.isActive = true;
  cvox.ChromeVox.navigationManager = new cvox.NavigationManager();
  cvox.ChromeVox.navigationManager.updateIndicator();
  cvox.ChromeVox.syncToNode = cvox.ApiImplementation.syncToNode;
  cvox.ChromeVox.speakNode = cvox.ApiImplementation.speakNode;

  cvox.ChromeVox.serializer = new cvox.Serializer();

  // Do platform specific initialization here.
  cvox.ChromeVox.host.init();

  // Start the event watchers
  cvox.ChromeVoxEventWatcher.init(window);

  // Provide a way for modules that can't depend on cvox.ChromeVoxUserCommands
  // to execute commands.
  cvox.ChromeVox.executeUserCommand = function(commandName) {
    cvox.ChromeVoxUserCommands.commands[commandName]();
  };

  cvox.ChromeVox.host.onPageLoad();
};
