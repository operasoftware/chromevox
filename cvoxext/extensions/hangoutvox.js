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
 * @fileoverview Chromevox extension for Google+ Hangout.
 *
 * @author cagriy@google.com (Cagri K. Yildirim)
 */

/**
 * hangoutvox object
 */
var hangoutvox = new cvoxExt.extension();

/** @const friends text field class name */
hangoutvox.FRIENDS_TEXTFIELD_SELECTOR = '.i-j-h-G-G';

/** @const buttons selector */
hangoutvox.BUTTONS_SELECTOR = '.goog-inline-block.N-Q';

/** @const checkboxes selector */
hangoutvox.CHECKBOXES_SELECTOR = '.Ye-cb';

/** @const buttons subselector */
hangoutvox.BUTTONS_SUBSELECTOR = {
  text: {
    attribute: 'title',
    type: 'text'
  }
};

/** find the aclwidgetcanvas iframe (for friends textfield) */
hangoutvox.setIframeSelector = function() {
  var iframes = document.getElementsByTagName('iframe');
  for (var i = 0; i < iframes.length; ++i) {
    if (iframes[i].name.indexOf('aclwidgetcanvas-') == 0) {
      cvoxExt.speakableManager.speakables['friendsTextfield'].frame =
        iframes[i].name;
    }
  }
};

/** do on page load */
hangoutvox.load = function() {
  if (window != parent) {
    parent.hangoutvox.setIframeSelector();
    cvoxExt.iframeUtil.frameType = 'child';
    return;
  }
};

/** initializer function for hangoutvox
 *  tries to learn which screen it is on
 */
hangoutvox.init = function() {
  speakableManager.enableDefaultManagedTraversal();
  if (window != parent) {
    cvoxExt.iframeUtil.frameType = 'child';
    return;
  }

  var buttonsSelector =
      new cvoxExt.speakable(hangoutvox.BUTTONS_SELECTOR,
                            hangoutvox.BUTTONS_SUBSELECTOR,
                            'button',
                            '',
                            true);

  var checkboxesSelector =
      new cvoxExt.speakable(hangoutvox.CHECKBOXES_SELECTOR,
                            {},
                            'checkbox',
                            '',
                            true);

  cvoxExt.speakableManager.addSpeakable(buttonsSelector);
  cvoxExt.speakableManager.addSpeakable(checkboxesSelector);

  var friendsTextfieldSpeakable = new cvoxExt.speakableInIframe(
                                  hangoutvox.FRIENDS_TEXTFIELD_SELECTOR,
                                  {},
                                  'friendsTextfield',
                                  'enter friends to invite');
  cvoxExt.addSpeakable(friendsTextfieldSpeakable);
  hangoutvox.setIframeSelector();
};

cvoxExt.loadExtension(hangoutvox);
