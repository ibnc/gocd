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

const _ = require('lodash');

import {ApiRequestBuilder, ApiVersion} from "helpers/api_request_builder";
import SparkRoutes from "helpers/spark_routes";
import {Stream} from "mithril/stream";
import * as stream from "mithril/stream";
import {Material} from "models/materials/types";
import {ValidatableMixin} from "models/mixins/new_validatable_mixin";
import {MaterialSet, NonEmptySetValidator} from "./material_set";
import {Stage} from "./stage";

/* Move these to another file? */
// interface Job extends ValidatableMixin {
//   name: Stream<string>;
//   tasks: Stream<Task[]>;
// }

// interface Task extends ValidatableMixin {
//   type: Stream<string>;
// }

export class PipelineConfig extends ValidatableMixin {
  group: Stream<string> = stream("defaultGroup");
  name: Stream<string>;
  materials: Stream<MaterialSet>;
  stages: Stream<Stage[]>;

  constructor(name: string, materials: Material[], stages: Stage[]) {
    super();

    ValidatableMixin.call(this);
    this.name = stream(name);
    this.stages = stream(stages);
    this.validatePresenceOf("name");
    this.validatePresenceOf("group");
    this.validateEach("stages");

    this.materials = stream(new MaterialSet(materials));
    this.validateWith(new NonEmptySetValidator({message: `A pipeline must have at least one material.`}), "materials");
    this.validateAssociated("materials");
  }

  create() {
    return ApiRequestBuilder.POST(SparkRoutes.pipelineConfigCreatePath(), ApiVersion.v6, {
      payload: this.toJSON()
    });
  }

  pause() {
    return ApiRequestBuilder.POST(SparkRoutes.pipelinePausePath(this.name()), ApiVersion.v1);
  }

  toJSON() {
    return {
      group: this.group(),
      pipeline: {
        name: this.name(),
        stages: _.map(this.stages(), (stage: Stage) => { return stage.toJSON(); })
      }
    };
  }
}
