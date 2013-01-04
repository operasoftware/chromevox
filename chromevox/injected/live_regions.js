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
 * @fileoverview Keeps track of live regions on the page and speaks updates
 * when they change.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.LiveRegions');

goog.require('cvox.AriaUtil');
goog.require('cvox.ChromeVox');
goog.require('cvox.DescriptionUtil');
goog.require('cvox.DomUtil');
goog.require('cvox.NavDescription');
goog.require('cvox.NavigationSpeaker');

/**
 * @constructor
 */
cvox.LiveRegions = function() {
};

/**
 * @type {Date}
 */
cvox.LiveRegions.pageLoadTime = null;

/**
 * Time in milliseconds after initial page load to ignore live region
 * updates, to avoid announcing regions as they're initially created.
 * The exception is alerts, they're announced when a page is loaded.
 * @type {number}
 * @const
 */
cvox.LiveRegions.INITIAL_SILENCE_MS = 2000;

/**
 * @param {Date} pageLoadTime The time the page was loaded. Live region
 *     updates within the first INITIAL_SILENCE_MS milliseconds are ignored.
 * @param {number} queueMode Interrupt or flush.  Polite live region
 *   changes always queue.
 * @param {boolean} disableSpeak true if change announcement should be disabled.
 * @return {boolean} true if any regions announced.
 */
cvox.LiveRegions.init = function(pageLoadTime, queueMode, disableSpeak) {
  if (queueMode == undefined) {
    queueMode = cvox.AbstractTts.QUEUE_MODE_FLUSH;
  }

  cvox.LiveRegions.pageLoadTime = pageLoadTime;

  if (disableSpeak || !document.hasFocus()) {
    return false;
  }

  // Speak any live regions already on the page. The logic below will
  // make sure that only alerts are actually announced.
  var anyRegionsAnnounced = false;
  var regions = cvox.AriaUtil.getLiveRegions(document.body);
  for (var i = 0; i < regions.length; i++) {
    cvox.LiveRegions.handleOneChangedNode(
        regions[i],
        regions[i],
        false,
        false,
        function(assertive, navDescriptions) {
          if (!assertive && queueMode == cvox.AbstractTts.QUEUE_MODE_FLUSH) {
            queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
          }
          var descSpeaker = new cvox.NavigationSpeaker();
          descSpeaker.speakDescriptionArray(navDescriptions, queueMode, null);
          anyRegionsAnnounced = true;
        });
  }

  return anyRegionsAnnounced;
};

/**
 * See if any mutations pertain to a live region, and speak them if so.
 *
 * @param {Array.<MutationRecord>} mutations The mutations.
 * @param {function(boolean, Array.<cvox.NavDescription>)} handler
 *     A callback function that handles each live region description found.
 *     The function is passed a boolean indicating if the live region is
 *     assertive, and an array of navdescriptions to speak.
 */
cvox.LiveRegions.processMutations = function(mutations, handler) {
  mutations.forEach(function(mutation) {
    if (mutation.target.hasAttribute &&
        mutation.target.hasAttribute('cvoxIgnore')) {
      return;
    }
    if (mutation.addedNodes) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        if (mutation.addedNodes[i].hasAttribute &&
            mutation.addedNodes[i].hasAttribute('cvoxIgnore')) {
          continue;
        }
        cvox.LiveRegions.handleOneChangedNode(
            mutation.addedNodes[i], mutation.target, false, true, handler);
      }
    }
    if (mutation.removedNodes) {
      for (var i = 0; i < mutation.removedNodes.length; i++) {
        if (mutation.removedNodes[i].hasAttribute &&
            mutation.removedNodes[i].hasAttribute('cvoxIgnore')) {
          continue;
        }
        cvox.LiveRegions.handleOneChangedNode(
            mutation.removedNodes[i], mutation.target, true, false, handler);
      }
    }
    if (mutation.type == 'characterData') {
      cvox.LiveRegions.handleOneChangedNode(
          mutation.target, mutation.target, false, false, handler);
    }
    if (mutation.attributeName == 'class' ||
        mutation.attributeName == 'style' ||
        mutation.attributeName == 'hidden') {
      var attr = mutation.attributeName;
      var target = mutation.target;
      var newStyle = document.defaultView.getComputedStyle(target, null);
      var newInvisible = cvox.DomUtil.isInvisibleStyle(newStyle, false);

      // Create a fake element on the page with the old values of
      // class, style, and hidden for this element, to see if that test
      // element would have had different visibility.
      var testElement = document.createElement('div');
      testElement.setAttribute('cvoxIgnore', '1');
      testElement.setAttribute('class', target.getAttribute('class'));
      testElement.setAttribute('style', target.getAttribute('style'));
      testElement.setAttribute('hidden', target.getAttribute('hidden'));
      testElement.setAttribute(attr, mutation.oldValue);

      var oldInvisible = true;
      if (target.parentElement) {
        target.parentElement.appendChild(testElement);
        var oldStyle = document.defaultView.getComputedStyle(testElement, null);
        oldInvisible = cvox.DomUtil.isInvisibleStyle(oldStyle, false);
        target.parentElement.removeChild(testElement);
      }

      if (oldInvisible === true && newInvisible === false) {
        cvox.LiveRegions.handleOneChangedNode(
            mutation.target, mutation.target, false, true, handler);
      } else if (oldInvisible === false && newInvisible === true) {
        cvox.LiveRegions.handleOneChangedNode(
            mutation.target, mutation.target, true, false, handler);
      }
    }
  });
};

/**
 * Handle one changed node. First check if this node is itself within
 * a live region, and if that fails see if there's a live region within it
 * and call this method recursively. For each actual live region, call a
 * method to recursively announce all changes.
 *
 * @param {Node} node A node that's changed.
 * @param {Node} parent The parent node.
 * @param {boolean} isRemoval True if this node was removed.
 * @param {boolean} subtree True if we should check the subtree.
 * @param {function(boolean, Array.<cvox.NavDescription>)} handler
 *     Callback function to be called for each live region found.
 */
cvox.LiveRegions.handleOneChangedNode = function(
    node, parent, isRemoval, subtree, handler) {
  var liveRoot = isRemoval ? parent : node;
  if (!(liveRoot instanceof Element)) {
    liveRoot = liveRoot.parentElement;
  }
  while (liveRoot) {
    if (cvox.AriaUtil.getAriaLive(liveRoot)) {
      break;
    }
    liveRoot = liveRoot.parentElement;
  }
  if (!liveRoot) {
    if (subtree && node != document.body) {
      var subLiveRegions = cvox.AriaUtil.getLiveRegions(node);
      for (var i = 0; i < subLiveRegions.length; i++) {
        cvox.LiveRegions.handleOneChangedNode(
            subLiveRegions[i], parent, isRemoval, false, handler);
      }
    }
    return;
  }

  if (cvox.AriaUtil.getAriaBusy(liveRoot)) {
    return;
  }

  if (isRemoval) {
    if (!cvox.AriaUtil.getAriaRelevant(liveRoot, 'removals')) {
      return;
    }
  } else {
    if (!cvox.AriaUtil.getAriaRelevant(liveRoot, 'additions')) {
      return;
    }
  }

  cvox.LiveRegions.announceChange(node, liveRoot, isRemoval, handler);
};

/**
 * Announce one node within a live region.
 *
 * @param {Node} node A node in a live region.
 * @param {Node} liveRoot The root of the live region this node is in.
 * @param {boolean} isRemoval True if this node was removed.
 * @param {function(boolean, Array.<cvox.NavDescription>)} handler
 *     Callback function to be called for each live region found.
 */
cvox.LiveRegions.announceChange = function(
    node, liveRoot, isRemoval, handler) {
  // If the page just loaded and this is any region type other than 'alert',
  // skip it. Alerts are the exception, they're announced on page load.
  var deltaTime = new Date() - cvox.LiveRegions.pageLoadTime;
  if ((cvox.AriaUtil.getRoleAttribute(liveRoot) != 'alert' &&
          deltaTime < cvox.LiveRegions.INITIAL_SILENCE_MS) ||
      !cvox.DomUtil.isVisible(liveRoot)) {
    return;
  }

  // If this node is in an atomic container, announce the whole container.
  // This includes aria-atomic, but also ARIA controls and other nodes
  // whose ARIA roles make them leaves.
  if (node != liveRoot) {
    var atomicContainer = node.parentElement;
    while (atomicContainer) {
      if ((cvox.AriaUtil.getAriaAtomic(atomicContainer) ||
           cvox.AriaUtil.isLeafElement(atomicContainer) ||
           cvox.AriaUtil.isControlWidget(atomicContainer)) &&
          !cvox.AriaUtil.isCompositeControl(atomicContainer)) {
        node = atomicContainer;
      }
      if (atomicContainer == liveRoot) {
        break;
      }
      atomicContainer = atomicContainer.parentElement;
    }
  }

  var navDescriptions = cvox.LiveRegions.getNavDescriptionsRecursive(node);
  if (isRemoval) {
    navDescriptions = [new cvox.NavDescription({
      context: cvox.ChromeVox.msgs.getMsg('live_regions_removed')
    })].concat(navDescriptions);
  }

  // Don't announce alerts on page load if their text and values consist of
  // just whitespace.
  if (cvox.AriaUtil.getRoleAttribute(liveRoot) == 'alert' &&
      deltaTime < cvox.LiveRegions.INITIAL_SILENCE_MS) {
    var regionText = '';
    for (var i = 0; i < navDescriptions.length; i++) {
      regionText += navDescriptions[i].text;
      regionText += navDescriptions[i].userValue;
    }
    if (cvox.DomUtil.collapseWhitespace(regionText) == '') {
      return;
    }
  }

  var assertive = cvox.AriaUtil.getAriaLive(liveRoot) == 'assertive';
  handler(assertive, navDescriptions);
};

/**
 * Recursively build up the value of a live region and return it as
 * an array of NavDescriptions. Each atomic portion of the region gets a
 * single string, otherwise each leaf node gets its own string.
 *
 * @param {Node} node A node in a live region.
 * @return {Array.<cvox.NavDescription>} An array of NavDescriptions
 *     describing atomic nodes or leaf nodes in the subtree rooted
 *     at this node.
 */
cvox.LiveRegions.getNavDescriptionsRecursive = function(node) {
  if (cvox.AriaUtil.getAriaAtomic(node) ||
      cvox.DomUtil.isLeafNode(node)) {
    var description = cvox.DescriptionUtil.getDescriptionFromAncestors(
        [node], true, cvox.ChromeVox.verbosity);
    if (!description.isEmpty()) {
      return [description];
    } else {
      return [];
    }
  }

  var result = [];

  // Start with the description of this node.
  var description = cvox.DescriptionUtil.getDescriptionFromAncestors(
      [node], false, cvox.ChromeVox.verbosity);
  if (!description.isEmpty()) {
    result.push(description);
  }

  // Recursively add descriptions of child nodes.
  for (var i = 0; i < node.childNodes.length; i++) {
    var child = node.childNodes[i];
    if (cvox.DomUtil.isVisible(child, {checkAncestors: false}) &&
        !cvox.AriaUtil.isHidden(child)) {
      var recursiveArray = cvox.LiveRegions.getNavDescriptionsRecursive(child);
      result = result.concat(recursiveArray);
    }
  }
  return result;
};
