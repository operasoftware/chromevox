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
 * @fileoverview Code to support writing macros in ChromeVox.
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.MacroWriter');

goog.require('cvox.ChromeVoxUserCommands');

// TODO(dtseng): Bad idea; we are not set up to define commands outside of
// ChromeVoxUserCommands.
cvox.ChromeVoxUserCommands.commands['readMacroFromHtml'] =
cvox.MacroWriter.readMacroFromHtml = function() {
  // Find the node called 'cvoxMacroCode'
  var elt = document.getElementById('cvoxMacroWriterCode');
  if (!elt) {
    window.console.log('Could not find the macro writer text box');
    return false;
  }

  // A list of commands:
  var commands = elt.value.split('\n');
  // Parse it
  var code = '';
  for (var i = 0; i < commands.length; i++) {
    code += 'queueToRun("' + commands[i] + '");\n';
  }

  function queueToRun(cmd) {
    if (cvox.ChromeVoxUserCommands.commands[cmd]) {
      cvox.ChromeVoxEventWatcher.addReadyCallback(
          cvox.ChromeVoxUserCommands.commands[cmd]);
    }
  }

  window.console.log('Code: ' + code);
  eval(code);
};

cvox.ChromeVoxUserCommands.commands['addMacroWriter'] =
    /** @type {function(): boolean} */ (function() {
  var ta = document.createElement('textarea');
  ta.id = 'cvoxMacroWriterCode';
  ta.style.height = '200px';
  ta.style.width = '200px';

  var p = document.createElement('p');
  p.innerHTML = 'Add user commands, one per line.';

  var a = document.createElement('a');
  a.style.display = 'block';
  a.href = '#';
  a.onclick = cvox.MacroWriter.readMacroFromHtml;
  a.innerHTML = 'Run the macro (or press Cvox+B>F)';

  var div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.bottom = '0';
  div.style.zIndex = '999';
  div.appendChild(p);
  div.appendChild(ta);
  div.appendChild(a);

  document.body.appendChild(div);
});
