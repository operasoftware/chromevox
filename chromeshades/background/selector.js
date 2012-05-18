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
 * @fileoverview ChromeShades popup selector functionality.
 *
 * @author edsun@google.com (Edward Sun)
 */


var chromeshades_on;
var accesserrors_on;
var silentcapture_on;


function init() {
  chrome.extension.sendRequest({getFlag: 'chromeshades_on'}, function(
    response) {
    console.log(response.value);
    chromeshades_on = response.value;
    updateFlag('chromeshades_on', response.value);
  });

  chrome.extension.sendRequest({getFlag: 'accesserrors_on'}, function(
    response) {
    console.log(response.value);
    accesserrors_on = response.value;
    updateFlag('accesserrors_on', response.value);
  });

  chrome.extension.sendRequest({getFlag: 'silentcapture_on'}, function(
    response) {
    console.log(response.value);
    silentcapture_on = response.value;
    updateFlag('silentcapture_on', response.value);
  });
}


function updateFlag(id, val) {
  if (val == true) {
    document.getElementById(id + '_html').style.backgroundColor = '#00933B';
    document.getElementById(id + '_html').style.color = '#ffffff';
  }
  else {
    document.getElementById(id + '_html').style.backgroundColor = '#ffffff';
    document.getElementById(id + '_html').style.color = '#000000';
  }
}


function reverseBool(var_name) {
  eval(var_name + ' = ' + var_name + ' == false ? true : false');
  return eval(var_name);
}


function toggle(feature, val, rel) {
  updateFlag(feature, val);
  chrome.extension.sendRequest({'toggle' : feature,
                                'value' : val,
                                'reload': rel});
}


document.addEventListener('DOMContentLoaded', init, false);
