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

import {MithrilViewComponent} from "jsx/mithril-component";
import * as m from "mithril";
import {Form, FormBody} from "views/components/forms/form";
import {TextField} from "views/components/forms/input_fields";

// temporary until PipelineConfig model is available
import {Stream} from "mithril/stream";
import * as stream from "mithril/stream";
const destDir: Stream<string> = stream();

export class PipelineInfoEditor extends MithrilViewComponent {
  view(vnode: m.Vnode) {
    return <FormBody>
      <Form last={true} compactForm={true}>
        <TextField label="Pipeline Name" placeholder="e.g., My-New-Pipeline" required={true} property={destDir}/>
      </Form>
    </FormBody>;

  }
}
