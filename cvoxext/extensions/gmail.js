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
var gmailvox = {};

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

/** gmail extension */
gmailvox.speakables = {
  thread: {
    formatter: ['from $threadFrom subject: $threadSubject at $threadTime'],
    selector: {query: '.zA'}
  },
  partiallyCollapsedMessage: {
    formatter: ['collapsed: from $messageFrom $unopenedContent'],
    selector: {query: '.adf.ads'}
  },
  completelyCollapsedMessage: {
    formatter: ['$collapsed messages'],
    selector: '.kQ'
  },
  openedMessage: {
    formatter: ['from $messageFrom at $messageTime $content'],
    selector: {query: '.adn.ads'}
  },
  threadTag: {
    formatter: ['selected'],
    selector: {query: '.PF.xY'}
  },
  threadFrom: {
    selector: {query: '.yX.xY'}
  },
  threadSubject: {
    selector: {query: '.y6'}
  },
  threadTime: {
    selector: {query: '.xW.xY'}
  },
  messageFrom: {
    selector: {query: '.gD'}
  },
  content: {
    selector: {query: '.ii.gt.adP.adO'}
  },
  messageTime: {
    selector: {query: '.g3'}
  },
  unopenedContent: {
    selector: {query: '.iA.g6'}
  },
  to: {
    formatter: ['to'],
    selector: {query: '.vO'}
  },
  subject: {
    formatter: ['subject'],
    selector: {query: '.aoT'}
  },
  messageTextField: {
    formatter: ['enter message'],
    selector: {query: '.Am.Al.editable.LW-avf'}
  }

};

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

/** init function attaching the focus listener for subject */
gmailvox.init = function() {
  document.addEventListener('focus', function(evt) {
    console.log(evt.target.className);
    //if focused on thread subject or chevron, update focus on the whole message
    if (evt.target.className == 'xY') {
      evt.target.parentNode.setAttribute('tabindex', -1);
      evt.target.parentNode.focus();
      return true;
    } else if (evt.target.className == 'PF xY PE') {
      evt.target.parentNode.setAttribute('tabindex', -1);
      evt.target.parentNode.focus();
      return true;
    }
    return false;
  }, true);
};

cvoxExt.loadExtension(gmailvox.speakables, gmailvox.init);
