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
 * @fileoverview Chromevox extension for Google Drive.
 *
 * @author cagriy@google.com (Cagri K. Yildirim)
 */

var drivevox = {};

/** extension */
drivevox.speakers = {
  doc: {
    formatter: ['unselected $typeImg $name owned by $owner shared with ' +
    '$shared last modified on $date'],
    selector: {query: '.doclist-tr-hover'}
  },
  selecteddoc: {
    formatter: ['selected $typeImg $name owned by $owner shared with $shared ' +
    'last modified on $date'],
    selector: {query: '.doclist-tr-selected.doclist-tr-hover'}
  },

  typeImg: {
    formatter: ['{user}$type'],
    selector: {query: '.goog-inline-block.doclist-icon'}
  },
  type: {
    selector: {attribute: 'title'}
  },
  name: {
    formatter: ['{user}$self'],
    selector: {query: '.goog-inline-block.doclist-name'}
  },
  shared: {
    formatter: ['{user}$self'],
    selector: {query: '.goog-inline-block.doclist-shared'}
  },
  folder: {
    formatter: ['{user}$self'],
    selector: {query: '.goog-inline-block.documentpill'}
  },
  owner: {
    formatter: ['{user}$self'],
    selector: {query: '.doclist-td-owners'}
  },
  date: {
    selector: {query: '.doclist-date'},
    formatter: ['{user}$self']
  }
};

/** handler for cursor update
 * @param {Array<DOMMutation>} mutations the mutations to check for selection.
 * @return {undefined} returns early if selected.
 */
drivevox.modified = function(mutations) {
  //check if any element is selected, if so focus on it
  for (var i = 0; i < mutations.length; ++i) {
    if (mutations[i].attributeName == 'class' &&
      mutations[i].target.className.indexOf('doclist-tr-selected') != -1) {
      SpeakableManager.updateSpeak(mutations[i].target);
      mutations[i].target.setAttribute('tabindex', -1);
      mutations[i].target.blur();
      mutations[i].target.focus();
      return;
    }

  }

  //if none is selected, check if a new element is hovered on, if so focus on it
  for (var i = 0; i < mutations.length; ++i) {
    if (mutations[i].attributeName == 'class' &&
      mutations[i].target.className.indexOf('doclist-tr-hover') != -1) {
      SpeakableManager.updateSpeak(mutations[i].target);
      mutations[i].target.setAttribute('tabindex', -1);
      mutations[i].target.blur();
      mutations[i].target.focus();
      return;
    }

  }

};

/**
 * load the DOM mutation listener
 */
drivevox.loadListeners = function() {
  if (!drivevox.listenersLoaded) {
    var documentList = document.getElementsByClassName('doclistview');
    if (documentList.length > 0) {
      var observer = new WebKitMutationObserver(drivevox.modified);
      observer.observe(documentList[0], {childList: true, subtree: true,
          attributes: true });
      drivevox.listenersLoaded = true;
    }
  }
};

/** init function for drivevox to register onLoad listener */
drivevox.init = function() {
  document.addEventListener('load', drivevox.loadListeners, true);
};

cvoxExt.loadExtension(drivevox.speakers, drivevox.init);
