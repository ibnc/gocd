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
import * as Routes from "gen/ts-routes";
import SparkRoutes from "helpers/spark_routes";
import {ApiRequestBuilder, ApiVersion} from "helpers/api_request_builder";

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

export class PipelineConfig extends ValidatableMixin {
  group: Stream<string> = stream("defaultGroup");
  name: Stream<string>;
  // materials: Stream<Material[]>;

  constructor(name: string) {
    super();
    ValidatableMixin.call(this);
    this.name = stream(name);
    this.validatePresenceOf("name");
    this.validatePresenceOf("group");

    // this.materials = stream(materials);
    // this.validateAssociated("materials");
    // this.validateAssociated("stages");
  }

  create(shouldPause: boolean) {
    ApiRequestBuilder.POST(SparkRoutes.pipelineConfigCreatePath(), ApiVersion.v6, {
      payload: this.toJSON()
    }).then((response) => {
      response.getOrThrow();
      if (shouldPause) {
        this.pause();
      } else  {
        window.location.href = "/go/pipelines";
      }
    }).catch((reason) => {
      //TODO: add some error handling
      //tslint:disable-next-line
      console.log(reason);
    });
  }

  pause() {
    ApiRequestBuilder.POST(SparkRoutes.pipelinePausePath(this.name()), ApiVersion.v1).then(() => {
      window.location.href = Routes.pipelineEditPath("pipelines", this.name(), "general");
    });
  }

  toJSON() {
    return {
      group: this.group(),
      pipeline: {
        name: this.name()
      }
    };
  }
}

