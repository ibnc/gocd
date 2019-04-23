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

import {Stream} from "mithril/stream";
import * as stream from "mithril/stream";
import {ValidatableMixin} from "models/mixins/new_validatable_mixin";

/* Move these to another file? */
// export interface Stage extends ValidatableMixin {
//   name: Stream<string>;
//   jobs: Stream<Job[]>;
// }

// interface Job extends ValidatableMixin {
//   name: Stream<string>;
//   tasks: Stream<Task[]>;
// }

// interface Task extends ValidatableMixin {
//   type: Stream<string>;
// }

// TODO: think of a better class name
export class PipelineConfigs extends ValidatableMixin {
  group: Stream<string> = stream("defaultGroup");
  pipeline: Stream<PipelineConfig> = stream(new PipelineConfig(""));

  constructor() {
    super();
    ValidatableMixin.call(this);
    this.validatePresenceOf("group");
    this.validateAssociated("pipeline");
  }

  getPipelineName() {
    return this.pipeline().name();
  }

  toJSON() {
    return {
      group: this.group(),
      pipeline: this.pipeline().toJSON()
    };
  }
}

export class PipelineConfig extends ValidatableMixin {
  name: Stream<string>;
  // materials: Stream<Material[]>;

  constructor(name: string) {
    super();
    ValidatableMixin.call(this);
    this.name = stream(name);
    this.validatePresenceOf("name");

    // this.materials = stream(materials);
    // this.validateAssociated("materials");
    // this.validateAssociated("stages");
  }

  toJSON() {
    return {
      name: this.name()
    };
  }
}

