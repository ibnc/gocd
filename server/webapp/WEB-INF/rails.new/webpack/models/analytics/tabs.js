/*
 * Copyright 2018 ThoughtWorks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
  "use strict";

  const Stream = require("mithril/stream");
  const      $ = require("jquery");

  function Tabs(callback) {
    let activeTab = 0;
    const tabs = [];

    function push(tab) {
      tabs.push(tab);
    }

    function load() {
      // callback();
    }

    function current() {
      return tabs[activeTab];
    }

    function view() {
      return (
        <div class="content">
            <div class="sub_tabs_container">
              <ul class="columns medium-5 large-5">
                <li class="current">Global</li>
                <li>Pipeline</li>
              </ul>
            </div>
            <div class="sub_tab_container_content"></div>
        </div>
      );
    }

    return {tabs, push, current, load, view};
  }

  module.exports = Tabs;
})();
