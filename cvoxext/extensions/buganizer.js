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
 * @fileoverview Chromevox extension for Buganizer.
 *
 * @author cagriy@google.com (Cagri K. Yildirim)
 */

/**
 * buganizervox object
 */

var buganizervox = {};

/** current focused bug */
buganizervox.currBug = 0;

/** extension */
buganizervox.speakers = {

  issueRow: {
    formatter: ['$starred summary: $issueCell<8> . type: $issueCell<1> . ' +
    'priority: $issueCell<2> . status: $issueCell<3> . reporter: ' +
    '$issueCell<5> . assignee $issueCell<6> .'],
    selector: {query: '.resultrow_off'},
    options: ['enableTraverse']
  },
  issueCell: {
    formatter: ['$self'],
    selector: {query: '.resultRow'}
  },
  starred: {
    formatter: ['starred'],
    selector: {className: 'SPRITE_star_on_sm_2'}
  },
  issueSummary: {
    formatter: ['issue summary'],
    selector: {id: 'issue.summary'}
  },
  component: {
    formatter: ['component $componentName'],
    selector: {id: 'componentInput'}
  },
  notes: {
    formatter: ['notes'],
    selector: {id: 'notes'}
  },
  reporter: {
    formatter: ['reporter'],
    selector: {id: 'reporter'}
  },
  newReporter: {
    formatter: ['reporter'],
    selector: {id: 'newReporter'}
  },
  assignee: {
    formatter: ['assignee'],
    selector: {id: 'owner'}
  },
  newAssignee: {
    formatter: ['assignee'],
    selector: {id: 'newOwner'}
  },
  newVerifier: {
    formatter: ['verifier'],
    selector: {id: 'verifier'}
  },
  verifier: {
    formatter: ['verifier'],
    selector: {id: 'verifier'}
  },
  cc: {
    formatter: ['CC'],
    selector: {id: 'cc'}
  },
  dependsOn: {
    formatter: ['depends on'],
    selector: {id: 'depend'}
  },
  blocking: {
    formatter: ['blocking'],
    selector: {id: 'block'}
  },
  foundIn: {
    formatter: ['found in'],
    selector: {id: 'foundIn'}
  },
  targetedTo: {
    formatter: ['targeted to'],
    selector: {id: 'targetedTo'}
  },
  verifiedIn: {
    formatter: ['verified in'],
    selector: {id: 'verifiedIn'}
  },
  inProd: {
    formatter: ['in prod? checkbox'],
    selector: {id: 'inProd'}
  },
  extensionOptions: ['enableElementFineScroll']
};

/** on load function for buganizer, blur if focused on an input element unless
 it is focused on issue summary when entering a new issue
 * @param {Event} evt load event.
 */
buganizervox.onLoad = function(evt) {
  if (document.activeElement.tagName == 'INPUT' && document.activeElement.id !=
    'issue.summary') {
    document.activeElement.blur();
  }
};

/** keypress listener to go to next bug
* @param {Event} evt keypress event.
* @return {boolean} consume keypress event.*/
buganizervox.onKeypress = function(evt) {

  if (evt.keyCode == 27) {
    document.activeElement.blur();
    return true;
  }
  if (document.activeElement.tagName == 'INPUT' ||
        document.activeElement.tagName == 'TEXTAREA') {
    return false;
  }
  if (document.activeElement.className.indexOf('resultrow_off') != -1) {
    if (evt.keyCode == 13) {

      cvox.Api.click(document.activeElement);
      return true;
    }
  }
  var createButton = document.getElementById('createButton');
  if (createButton) {
    if (evt.keyCode == 13) {
      cvox.Api.speak('created issue');
      cvox.Api.click(createButton);
      return true;
    }
  }
  var saveButton = document.getElementById('saveButton');
  if (saveButton) {
    if (evt.keyCode == 13) {
      cvox.Api.speak('updated issue');
      cvox.Api.click(saveButton);
      return true;
    }
  }
  if (buganizervox.gotoKey) {
    buganizervox.gotoKey = false;
    if (evt.keyCode == 97) {
      cvox.Api.speak('Assigned to me');
      cvox.Api.click(document.getElementById(
          'personalizedSearchResultsAsOwner'));
      return true;
    } else if (evt.keyCode == 115) {
      cvox.Api.speak('Starred by me');
      window.location.href = 'buganizer/personalizedSearchResultsAsStarrer';
      return true;
    } else if (evt.keyCode == 99) {
      cvox.Api.speak('CCed to me');
      window.location.href = 'buganizer/personalizedSearchResultsAsCc';
      return true;
    } else if (evt.keyCode == 114) {
      cvox.Api.speak('Reported by me');
      window.location.href = 'buganizer/persoanlizedSearchResultsAsReporter';
      return true;
    }
  }
  //if n, new issue
  if (evt.keyCode == 110) {
    cvox.Api.speak('new issue');
    cvox.Api.click(document.getElementById('createIssue'));
  return true;
  }
  //if s, star issue
  if (evt.keyCode == 115) {
    cvox.Api.speak('toggle star');
    cvox.Api.click(buganizervox.issue.getElementsByClassName('star')[0]);
    return true;
  }
  //if j
  if (evt.keyCode == 106) {
    buganizervox.currBug++;
    var issues = Util.getVisibleDomObjectsFromSelector(
                    buganizervox.speakers.issueRow.selector);
    if (issues.length == 0) {
      cvox.Api.speak('No issues found.', true);
      return true;
    }
    if (buganizervox.currBug >= issues.length) {
      buganizervox.currBug = issues.length - 1;
    }
    buganizervox.issue = issues[buganizervox.currBug];
    buganizervox.issue.setAttribute('tabindex', -1);
    buganizervox.issue.focus();
    return true;
  } else if (evt.keyCode == 107) {
    buganizervox.currBug--;
    var issues = Util.getVisibleDomObjectsFromSelector(
                    buganizervox.speakers.issueRow.selector);
    if (buganizervox.currBug < 0) {
      buganizervox.currBug = 0;
    }
    buganizervox.issue = issues[buganizervox.currBug];
    buganizervox.issue.setAttribute('tabindex', -1);
    buganizervox.issue.focus();
    return true;
  } else if (evt.keyCode == 47) {
      cvox.Api.speak('Search');
      document.getElementById('simplifiedSearchText').focus();
      return true;
  } else if (evt.keyCode == 103) {
    buganizervox.gotoKey = true;
    return true;
  } //if g
  return false;
};

/** init function to register listeners */
buganizervox.init = function() {
  document.addEventListener('keypress', buganizervox.onKeypress, true);
  document.addEventListener('load', buganizervox.onLoad, true);
};

cvoxExt.loadExtension(buganizervox.speakers, buganizervox.init);
