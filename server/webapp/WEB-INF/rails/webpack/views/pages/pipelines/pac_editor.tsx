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

import {ApiResult, ErrorResponse, SuccessResponse} from "helpers/api_request_builder";
import {MithrilViewComponent} from "jsx/mithril-component";
import * as m from "mithril";
import {ConfigReposCRUD} from "models/config_repos/config_repos_crud";
import {Material} from "models/materials/types";
import * as Buttons from "views/components/buttons";
import {FlashMessage, MessageType} from "views/components/flash_message";
import * as css from "./components.scss";

interface Attrs {
  material: Material;
}

export class PACEditor extends MithrilViewComponent<Attrs> {
  private pacMessage: m.Child | undefined;

  view(vnode: m.Vnode<Attrs>) {
    return (
      <div class={css.pacEditorDryRunWrapper}>
        <div><Buttons.Secondary onclick={this.check.bind(this, vnode.attrs.material)} small={false}>PACable?</Buttons.Secondary></div>
        <div class={css.pacEditorDryRunResult}>{this.pacMessage}</div>
      </div>
    );
  }

  check(material: Material, event: MouseEvent) {
    const btn = event.target as Element;
    const btnWrapper = btn.parentNode as Element;
    btnWrapper.classList.add(css.pacEditorDryRunInProgress);
    ConfigReposCRUD.dryRun(material).then((result: ApiResult<string>) => {
      result.do((resp: SuccessResponse<string>) => {
        const body = JSON.parse(resp.body);
        this.pacMessage = <FlashMessage type={body.valid ? MessageType.info : MessageType.warning} message={<pre>{body.message}</pre>}/>;
      }, (err: ErrorResponse) => {
        this.pacMessage = <FlashMessage type={MessageType.alert} message={<pre>{err.message}</pre>}/>;
      });
    }).finally(() => {
      btnWrapper.classList.remove(css.pacEditorDryRunInProgress);
    });
  }
}
