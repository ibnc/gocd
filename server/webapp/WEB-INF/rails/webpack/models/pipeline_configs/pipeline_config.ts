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
import {Material} from "models/materials/types";
import {ValidatableMixin} from "models/mixins/new_validatable_mixin";

export interface Stage extends ValidatableMixin {
  name: Stream<string>;
  jobs: Stream<Job[]>;
}

interface Job extends ValidatableMixin {
  name: Stream<string>;
  tasks: Stream<Task[]>;
}

interface Task extends ValidatableMixin {
  type: Stream<string>;
}

export class PipelineConfig extends ValidatableMixin {
  name: Stream<string>;
  materials: Stream<Material[]>;
  stages: Stream<Stage[]>;

  constructor(name: string,
              materials: Material[],
              stages: Stage[]) {
    super();
    ValidatableMixin.call(this);
    this.name = stream(name);
    this.materials = stream(materials);
    this.stages = stream(stages)
    this.validatePresenceOf("name");
    this.validateAssociated("materials");
    this.validateAssociated("stages");
  }
}