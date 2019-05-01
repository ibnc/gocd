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

import JsonUtils from "helpers/json_utils";
import {Stream} from "mithril/stream";
import * as stream from "mithril/stream";
import {ValidatableMixin} from "models/mixins/new_validatable_mixin";
import {EnvironmentVariableConfig} from "models/pipeline_configs/environment_variable_config";
import {Task} from "models/pipeline_configs/task";

export class Job extends ValidatableMixin {
  name: Stream<string>;
  environmentVariables?: Stream<EnvironmentVariableConfig[]>;
  tasks: Stream<Task[]>;

  constructor(name: string, tasks: Task[]) {
    super();

    ValidatableMixin.call(this);
    this.name = stream(name);
    this.tasks = stream(tasks);
    this.validatePresenceOf("name");
    this.validatePresenceOf("tasks");
    this.validateEach("tasks");
    this.validateEach("environmentVariables");
  }

  toApiPayload() {
    return JsonUtils.toSnakeCasedObject(this);
  }

  modelType() {
    return "Job";
  }
}
