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
 * @fileoverview Chromevox extension for Google+.
 *
 * @author cagriy@google.com (Cagri K. Yildirim)
 */

var plusvox = {

  /** plusvox constants */
  constants: {
    //class names of left side pane menu items
    HOME_CLASSNAME: '.jz',
    PROFILE_CLASSNAME: '.ila',
    EXPLORE_CLASSNAME: '.dla',
    EVENTS_CLASSNAME: '.sga',
    HANGOUTS_CLASSNAME: '.fla',
    PHOTOS_CLASSNAME: '.jl',
    CIRCLES_CLASSNAME: '.bq',
    LOCAL_CLASSNAME: '.gla',
    GAMES_CLASSNAME: '.ela',
    PAGES_CLASSNAME: '.hla',
    LEFT_SIDE_MENU_COMMON_CLASSNAME: '.NIa.cOa.Gdb'
  },
  /**
  * plusvox speakables
  * @const
  */
  speakables: {
    gPlusPost: {
      selector: {
        query: '.Tg.Sb'
      },
      formatter: ['$author $content $addedPhotos $sharerComment ' +
      '$shareLinkTitle $sharingDetails $time. $plusCount $commentCount']
    },
    gPlusComment: {
      selector: {
        query: '.Ho.gx'
      },
      formatter: ['$commentAuthor $commentContent $commentTime $commentPlusCt']
    },
    author: {
      selector: {
        query: '.cK'
      },
      formatter: ['$self']
    },
    content: {
      selector: {
        query: '.wm.VC'
      },
      formatter: ['said $self.']
    },
    shareLinkTitle: {
      selector: {
        query: '.a-n.ot-anchor.YF'
      },
      formatter: ['link: $self']
    },
    sharerComment: {
      selector: {
        query: '.sE.nv'
      },
      formatter: ['said $self']
    },
    sharingDetails: {
      selector: {
        query: '.a-n.ej.Ku.pl'
      },
      formatter: ['shared with: $self']
    },
    hangouters: {
      selector: {
        query: '.Ob'
      },
      formatter: ['$self']
    },
    time: {
      selector: {
        query: '.Ri.lu'
      },
      formatter: ['at $self']
    },
    addedPhotos: {
      selector: {
        query: '.QV'
      },
      formatter: ['$self']
    },
    plusCount: {
      selector: {
        query: '.G8.ol.a-f-e.le'
      },
      formatter: ['$self']
    },
    commentCount: {
      selector: {
        query: '.gh.Ni'
      },
      formatter: ['$self people commented on this post']
    },
    commentAuthor: {
      selector: {
        query: '.Sg.Ob.qm'
      },
      formatter: ['$self commented']
    },
    commentContent: {
      selector: {
        query: '.Mi'
      },
      formatter: ['$self']
    },
    commentTime: {
      selector: {
        query: '.Bf'
      },
      formatter: ['at $self']
    },
    commentPlusCt: {
      selector: {
        query: '.L7.ol.a-f-e.Uh'
      },
      formatter: ['$self']
    }
  },
  quickNavigate: function(evt) {
      var goToMenuItemClassName;
      var constants = plusvox.constants;
      //if pressed 1 to 9 then go to the appropriate left menu
      switch (evt.charCode) {
        case 49:
          goToMenuItemClassName = constants.HOME_CLASSNAME;
          break;
        case 50:
          goToMenuItemClassName = constants.PROFILE_CLASSNAME;
          break;
        case 51:
          goToMenuItemClassName = constants.EXPLORE_CLASSNAME;
          break;
        case 52:
          goToMenuItemClassName = constants.EVENTS_CLASSNAME;
          break;
        case 53:
          goToMenuItemClassName = constants.HANGOUTS_CLASSNAME;
          break;
        case 54:
          goToMenuItemClassName = constants.PHOTOS_CLASSNAME;
          break;
        case 55:
          goToMenuItemClassName = constants.CIRCLES_CLASSNAME;
          break;
        case 56:
          goToMenuItemClassName = constants.LOCAL_CLASSNAME;
          break;
        case 57:
          goToMenuItemClassName = constants.GAMES_CLASSNAME;
          break;
        case 48:
          goToMenuItemClassName = constants.PAGES_CLASSNAME;
          break;
      }
      //concatenate common class name with the menu item class name and click
      cvox.Api.click(document.querySelector(
          constants.LEFT_SIDE_MENU_COMMON_CLASSNAME + goToMenuItemClassName));

  },
  init: function() {
    document.addEventListener('keypress', plusvox.quickNavigate, true);
  }
};


cvoxExt.loadExtension(plusvox.speakables, plusvox.init);
