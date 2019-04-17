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

import * as m from "mithril";
import {Page, PageState} from "views/pages/page";
import {ConceptDiagram} from "views/pages/pipelines/concept_diagram";
import {FillableSection} from "views/pages/pipelines/fillable_section";
import {UserInputPane} from "views/pages/pipelines/user_input_pane";

export class PipelineCreatePage extends Page {
  pageName(): string {
    return "Add a New Pipeline";
  }

  oninit(vnode: m.Vnode) {
    this.pageState = PageState.OK;
  }

  componentToDisplay(vnode: m.Vnode): m.Children {
    return [
      <FillableSection sectionId="material">
        <UserInputPane heading="Part 1: Material">
          <p>Some content here</p>
        </UserInputPane>
        <ConceptDiagram conceptId="material">
          A <strong>material</strong> triggers your pipeline to run. Typically this is a
          <strong>source repository</strong> or an <strong>upstream pipeline</strong>.
        </ConceptDiagram>
      </FillableSection>,
    ];
  }

  fetchData(vnode: m.Vnode): Promise<any> {
    return new Promise(() => null);
  }
}
