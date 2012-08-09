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


/**
 *  drivevox object
 */
var drivevox = new cvoxExt.extension();

/** @const selected document selector */
drivevox.DOCUMENT_SELECTOR = '.doclist-tr-hover.doclist-tr-underlined';

/** @const document subselector */
drivevox.DOCUMENT_SUBSELECTOR = {
  name: {
    selector: '.goog-inline-block.doclist-name',
    type: 'text',
    attribute: 'title'
  },
  type: {
    selector: '.goog-inline-block.doclist-icon',
    type: 'text',
    attribute: 'title'
  },
  shared: {
    selector: '.goog-inline-block.doclist-shared',
    type: 'text'
  },
  folder: {
    selector: '.goog-inline-block.documentpill',
    type: 'text'
  },
  owner: {
    selector: '.doclist-td-owners',
    type: 'text',
    pretext: 'owned by'
  },
  date: {
    selector: '.doclist-date',
    type: 'text'
  }
};

/** handler for cursor update */
drivevox.modified = function() {
  cvox.Api.setSpeechForNode(
      cvoxExt.util.getFirstDomObjectFromSelector('___hovercard_0'),
      drivevox.documentSpeakable.generateSpeechNode(
      cvoxExt.util.getFirstDomObjectFromSelector(drivevox.DOCUMENT_SELECTOR)));
};

/** init function
 */
drivevox.init = function() {

  drivevox.documentSpeakable = new cvoxExt.speakable(drivevox.DOCUMENT_SELECTOR,
                                                drivevox.DOCUMENT_SUBSELECTOR,
                                                'document',
                                                '');

  cvoxExt.speakableManager.addNoTraverseSpeakable(drivevox.documentSpeakable);
};

cvoxExt.loadExtension(drivevox);
