// Copyright 2012 Google Inc
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
 * @fileoverview Chromevox extension for Gmail.
 * @author cagriy@google.com (Cagri K. Yildirim)
 * @author clchen@google.com (Charles L. Chen)
 */

/** gmailvox object */
var gmailvox = new cvoxExt.extension();

/**
 * Collection of strings to be spoken to the user.
 * @type {Object}
 */
gmailvox.STRINGS = {
  STARRED: 'Starred.',
  NOT_STARRED: 'Not starred.',
  SELECTED: 'Selected.',
  NOT_SELECTED: 'Not selected.',
  UNREAD: 'Unread.',
  COLLAPSED: 'Collapsed.'
};

/** @const gmail gmonkey speakable type */
gmailvox.GMONKEY_COLLAPSED_MESSAGE_TYPE = 'gmonkeyCollapsedMessage';

/** @const gmail gmonkey speakable type */
gmailvox.GMONKEY_OPENED_MESSAGE_TYPE = 'gmonkeyOpenedMessage';

/** @const gmail gmonkey thread speakable type */
gmailvox.GMONKEY_THREAD_TYPE = 'gmonkeyThread';

/** @const messages selector */
gmailvox.THREAD_SELECTOR = '.zA';

/** @const messages subselector */
gmailvox.THREAD_SUBSELECTOR = {
  from: {
    selector: '.yX.xY',
    type: cvoxExt.speakable.subselectorTypes.TEXT
  },
  subject: {
    selector: '.y6',
    type: cvoxExt.speakable.subselectorTypes.TEXT
  },
  time: {
    selector: '.xW.xY',
    type: cvoxExt.speakable.subselectorTypes.USER_VALUE
  }
};

/** @const side menu class name */
gmailvox.SIDE_MENU_SELECTOR = '.aim';

/** @const side menu subselectors */
gmailvox.SIDE_MENU_SUBSELECTOR = { text: '.J-Ke.n0'};

/** @const compose button class name */
gmailvox.COMPOSE_BUTTON_SELECTOR = '.T-I.J-J5-Ji.T-I-KE.L3';

/** @const message thread class name */
gmailvox.COLLAPSED_MESSAGE_SELECTOR = '.hn';

/** @const message thread subselector */
gmailvox.COLLAPSED_MESSAGE_SUBSELECTOR = {
  from: {
    selector: '.gD',
    type: cvoxExt.speakable.subselectorTypes.USER_VALUE
  },
  time: {
    selector: '.g3',
    type: cvoxExt.speakable.subselectorTypes.USER_VALUE
  },
  content: {
    selector: '.ii.gt.adP.adO',
    type: cvoxExt.speakable.subselectorTypes.TEXT
  },
  unopenedContent: {
    selector: '.iA.g6',
    type: cvoxExt.speakable.subselectorTypes.TEXT
  }
};

/** @const more messages selector */
gmailvox.MORE_MESSAGES_SELECTOR = '.kQ';

/** @const 'to' field in compose window selector */
gmailvox.TO_TEXTFIELD_SELECTOR = '.vO';

/** @const 'subject' field in compose window selector */
gmailvox.SUBJECT_TEXTFIELD_SELECTOR = '.aoT';

/** @const message field in compose window selector */
gmailvox.TEXT_TEXTFIELD_SELECTOR = '.Am.Al.editable.LW-avf';

/** @const email address focus */
gmailvox.EMAIL_FOCUSED_SELECTOR = '.gD';

/**
 * Takes a string of HTML and returns it as plain text with
 * all the HTML stripped out.
 *
 * @param {string} htmlString The string of HTML that needs to be stripped.
 * @return {string} The string with all of the HTML stripped out.
 */
gmailvox.getPlainText = function(htmlString) {
  var dummyNode = document.createElement('span');
  dummyNode.innerHTML = htmlString;
  return dummyNode.textContent;
};

/**
 * Speaks when the user has changed their current view.
 */
gmailvox.activeViewChangeListener = function() {
  // Use a set timeout to let things settle down before speaking.
  window.setTimeout(function() {
    var activeViewType = gmailvox.api_.getActiveViewType();
    switch (activeViewType) {
      case 'tl':
        cvox.Api.speak('Thread list loaded.', 0, null);
        break;
      case 'cv':
        gmailvox.messageViewChangeListener();
        break;
      case 'co':
        cvox.Api.speak('Compose message.', 0, null);
        break;
      case 'ct':
        cvox.Api.speak('Contacts loaded.', 0, null);
        break;
      case 's':
        cvox.Api.speak('Settings loaded.', 0, null);
        break;
    }
  }, 100);
};

/** callback function for message focus change in gmonkey */
gmailvox.messageViewChangedListener = function() {
  var message = gmailvox.gmonkey.getCurrentMessage();
  var messageContentElem = message.getContentElement();
  if (messageContentElem) {
    if (messageContentElem.className == '') {
      messageContentElem.setAttribute('speakableType',
          gmailvox.OPENED_MESSAGE_TYPE);
    }
    messageContentElem.setAttribute('tabindex', -1);
    messageContentElem.focus();
  }
};

/** callback function for message focus change in gmonkey */
gmailvox.threadChangedListener = function() {
  var thread = gmailvox.gmonkey.getCurrentThread();
  var threadRowElem = thread.getRowElement();
  if (threadRowElem) {
    threadRowElem.setAttribute('tabindex', -1);
    threadRowElem.focus();
  }
};

/** init function
 */
gmailvox.init = function() {
  cvoxExt.readFocus = true;

 /** For opened messages, the Gmonkey actually focuses on the
  * text content of the message, therefore reading text content
  * should be enough */
  var gmonkeyOpenedMessage = new cvoxExt.speakable(
    null,
    {},
    gmailvox.GMONKEY_OPENED_MESSAGE_TYPE,
    null,
    true);

 /** gmonkey message object, speakable representation */
  var gmonkeyCollapsedMessage = new cvoxExt.speakable(
    gmailvox.COLLAPSED_MESSAGE_SELECTOR,
    gmailvox.COLLAPSED_MESSAGE_SUBSELECTOR,
    gmailvox.GMONKEY_COLLAPSED_MESSAGE_TYPE,
    'collapsed');

 /** gmonkey thread object, speakable representation */
  var gmonkeyThread = new cvoxExt.speakable(
    gmailvox.THREAD_SELECTOR,
    gmailvox.THREAD_SUBSELECTOR,
    gmailvox.GMONKEY_THREAD_TYPE,
    null);

  var sideMenuSpeakable =
      new cvoxExt.speakable(gmailvox.SIDE_MENU_SELECTOR,
                            gmailvox.SIDE_MENU_SUBSELECTOR,
                            'sideMenu',
                            '');

  var composeButtonSpeakable =
      new cvoxExt.speakable(gmailvox.COMPOSE_BUTTON_SELECTOR,
                            {},
                            'composeButton',
                            'Compose');

  var toSpeakable = new cvoxExt.speakable(
                            gmailvox.TO_TEXTFIELD_SELECTOR,
                            {},
                            'toTextfield',
                            'to');
  var subjectSpeakable =
      new cvoxExt.speakable(gmailvox.SUBJECT_TEXTFIELD_SELECTOR,
                            {},
                            'subjectTextfield',
                            'subject');
  var textSpeakable =
      new cvoxExt.speakable(gmailvox.TEXT_TEXTFIELD_SELECTOR,
                            {},
                            'textTextfield',
                            'text');
  var emailaddressSpeakable =
      new cvoxExt.speakable(gmailvox.EMAIL_ADDRESS_SELECTOR,
                            {},
                            'messageEmailAddress',
                            'from:');

  cvoxExt.speakableManager.addNoTraverseSpeakable(gmonkeyOpenedMessage);
  cvoxExt.speakableManager.addNoTraverseSpeakable(gmonkeyCollapsedMessage);
  cvoxExt.speakableManager.addNoTraverseSpeakable(gmonkeyThread);
  cvoxExt.speakableManager.addNoTraverseSpeakable(sideMenuSpeakable);
  cvoxExt.speakableManager.addNoTraverseSpeakable(composeButtonSpeakable);
  cvoxExt.speakableManager.addNoTraverseSpeakable(toSpeakable);
  cvoxExt.speakableManager.addNoTraverseSpeakable(subjectSpeakable);
  cvoxExt.speakableManager.addNoTraverseSpeakable(textSpeakable);

  gmailvox.gmonkey.registerMessageViewChangeCallback(
    gmailvox.messageViewChangedListener);
  gmailvox.gmonkey.registerThreadViewChangeCallback(
    gmailvox.threadChangedListener);
  gmailvox.gmonkey.registerViewChangeCallback(
      gmailvox.activeViewChangeListener);
};

/** load gmonkey object callback function
  * @param {Object} gmonkey loaded gmonkey object. */
gmailvox.loadGmonkey = function(gmonkey) {
  /** gmonkey accessor object */
  gmailvox.gmonkey = gmonkey;
  cvoxExt.loadExtension(gmailvox);
};

var loadGmailvox = function() {
  if (!window.gmonkey) {
    setTimeout(loadGmailvox, 500);
    return;
  }
  gmonkey.load('2.0', gmailvox.loadGmonkey);
};
loadGmailvox();
