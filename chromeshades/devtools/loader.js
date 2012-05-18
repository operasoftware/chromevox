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
 * @fileoverview ChromeShades features in Devtools.
 *
 * @author edsun@google.com (Edward Sun)
 */

goog.require('AccessErrors');

/** Populates the Add to AccessErrors form with values in result.
 * @param {Element} addform The form element.
 * @param {Object} result Error object.
 */
function populateForm(addform, result) {
  addform.err_code.value = result.err_code;
  addform.err_type.value = result.err_type;
  addform.url.value = result.url;
  addform.hostname.value = result.hostname;
  addform.tag_name.value = result.tag_name;
  addform.readable_path.value = result.readable_path;
  addform.query_selector_text.value = result.query_selector_text;
  addform.outer_html.value = result.outer_html;
  addform.msg.value = result.msg;
}

chrome.devtools.panels.elements.createSidebarPane('Add to AccessErrors',
    function(sidebar) {
      // Reference to the extensionPanel
      var extensionPanel;

      // Update side pane and extensionPanel form upon a new inspected element
      function update() {
        var passed_fns = [ getQuerySelectorText.toString(),
                           censorHTML.toString(),
                           getReadablePath.toString(),
                           generateError.toString()
                         ].join('\n\n');

        var str = passed_fns +
                  '\n\n' +
                  'generateError($0, "manual_entry", "manual entry", "error");';

        // Pass generateError into the inspected window (along with helper fns)
        // and change the onShown listener to populate the extensionPanel form
        // with the values from the newly inspected element.
        chrome.devtools.inspectedWindow.eval(str, function(result) {
          sidebar.setObject(result);
          extensionPanel.onShown.addListener(function(window) {
            populateForm(window.document['addform'], result);
          });
        });
      }

      // Create the extensionPanel
      chrome.devtools.panels.create(
          'Add to AccessErrors',
          'chromeshades/chromeshades_16.png',
          'chromeshades/devtools/add_error.html',
          function(panel) {
            extensionPanel = panel;
            update();
          });

      chrome.devtools.panels.elements.onSelectionChanged.addListener(update);
    });
