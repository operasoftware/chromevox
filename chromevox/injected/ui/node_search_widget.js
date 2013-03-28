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
 * @fileoverview A search Widget presenting a list of nodes with the ability
 * to sync selection when chosen.
 * @author dtseng@google.com (David Tseng)
 */

goog.provide('cvox.NodeSearchWidget');

goog.require('cvox.ChromeVox');
goog.require('cvox.DomUtil');
goog.require('cvox.SearchWidget');
goog.require('cvox.SpokenMessages');


/**
 * @constructor
 * @param {string} typeMsg A message id identifying the type of items
 * contained in the list.
 * @param {?function(Array.<Node>)} predicate A predicate; if null, no predicate
 * applies.
 * @extends {cvox.SearchWidget}
 */
cvox.NodeSearchWidget = function(typeMsg, predicate) {
  this.typeMsg_ = typeMsg;
  this.predicate_ = predicate;
  goog.base(this);
};
goog.inherits(cvox.NodeSearchWidget, cvox.SearchWidget);


/**
 * @override
 */
cvox.NodeSearchWidget.prototype.getNameMsg = function() {
  return ['choice_widget_name', [cvox.ChromeVox.msgs.getMsg(this.typeMsg_)]];
};


/**
 * @override
 */
cvox.NodeSearchWidget.prototype.getHelpMsg = function() {
  return 'choice_widget_help';
};


/**
 * @override
 */
cvox.NodeSearchWidget.prototype.getPredicate = function() {
  return this.predicate_;
};


/**
 * Shows a list generated dynamic satisfying some predicate.
 * @param {string} typeMsg The message id of the type contained in nodes.
 * @param {function(Array.<Node>)} predicate The predicate.
 * @return {cvox.NodeSearchWidget} The widget.
 */
cvox.NodeSearchWidget.create = function(typeMsg, predicate) {
  return new cvox.NodeSearchWidget(typeMsg, predicate);
};
