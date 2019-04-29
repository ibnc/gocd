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
import {Job} from "./job";
import {NameableSet, NonEmptyCollectionValidator} from "./nameable_set";

export enum ApprovalType {
  success = "success",
    manual = "manual"
}

export class Approval extends ValidatableMixin {
  type: Stream<ApprovalType> = stream(ApprovalType.success);
  //authorization must be present for server side validations
  //even though it's not editable from the create pipeline page
  authorization: Stream<object> = stream({});

  constructor() {
    super();
    ValidatableMixin.call(this);
    this.validatePresenceOf("type");
    this.validatePresenceOf("authorization");
  }

  isSuccessType() {
    return this.type() === ApprovalType.success;
  }
}

export class Stage extends ValidatableMixin {
  name: Stream<string>;
  approval: Stream<Approval> = stream(new Approval());
  jobs: Stream<NameableSet<Job>>;

  constructor(name: string, jobs: Job[]) {
    super();
    this.name = stream(name);
    ValidatableMixin.call(this);
    this.validatePresenceOf("name");
    this.jobs = stream(new NameableSet(jobs));
    this.validateWith(new NonEmptyCollectionValidator({message: `A stage must have at least one job.`}), "jobs");
    this.validateAssociated("jobs");
  }

  toApiPayload() {
    return JsonUtils.toSnakeCasedObject(this);
  }

  modelType(): string {
    return "StageConfig";
  }
}
