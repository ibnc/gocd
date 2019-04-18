/*
 * Copyright 2019 ThoughtWorks, Inc.
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

import {bind} from "classnames/bind";
import * as m from "mithril";
import {TestHelper} from "views/pages/spec/test_helper";
import {AdvancedSettings} from "../advanced_settings";
import * as styles from "../components.scss";

describe("AddPipeline: AdvancedSettings", () => {
  const helper = new TestHelper();
  const cls = bind(styles);

  beforeEach(() => {
    helper.mount(() => {
      return <AdvancedSettings>
        <span class="foo">Some content</span>
      </AdvancedSettings>;
    });
  });

  afterEach(helper.unmount.bind(helper));

  it("Generates element hierarchy", () => {
    const top = helper.find(`.${cls(styles.advanced)}`)[0];
    expect(top).toBeTruthy();
    expect(top.querySelector("summary")).toBeTruthy();
    expect(top.querySelector("summary")!.textContent).toBe("Advanced Settings");
  });

  it("Renders child elements", () => {
    const top = helper.find(`.${cls(styles.advanced)}`)[0];
    expect(top.querySelector(".foo")).toBeTruthy();
    expect(top.querySelector(".foo")!.textContent).toBe("Some content");
  });
});
