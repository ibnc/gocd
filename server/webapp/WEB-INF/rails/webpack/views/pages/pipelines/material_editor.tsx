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
import * as _ from "lodash";
import * as m from "mithril";
import {ConfigReposCRUD} from "models/config_repos/config_repos_crud";
import {DependencyMaterialAttributes, GitMaterialAttributes, HgMaterialAttributes, Material, P4MaterialAttributes, SvnMaterialAttributes, TfsMaterialAttributes} from "models/materials/types";
import * as Buttons from "views/components/buttons";
import {FlashMessage, MessageType} from "views/components/flash_message";
import {Form, FormBody} from "views/components/forms/form";
import {Option, SelectField, SelectFieldOptions} from "views/components/forms/input_fields";
import {DefaultCache, DependencyFields, SuggestionCache} from "./non_scm_material_fields";
import {GitFields, HgFields, P4Fields, SvnFields, TfsFields} from "./scm_material_fields";

interface Attrs {
  material: Material;
  cache?: SuggestionCache;
}

export class MaterialEditor extends MithrilViewComponent<Attrs> {
  cache: SuggestionCache = new DefaultCache();
  private pacMessage: m.Child | undefined;

  oninit(vnode: m.Vnode<Attrs, {}>) {
    if (vnode.attrs.cache) {
      this.cache = vnode.attrs.cache;
    }
  }

  check(material: Material, event: Event) {
    const result = ConfigReposCRUD.dryRun(material);
    result.then((response) => {

      const x = response.unwrap();
      if (x && x.body) {
        const body = JSON.parse(x.body);

        this.pacMessage = <FlashMessage type={MessageType.info} message={<pre>{body.message}</pre>}/>;
      }
    });
  }

  view(vnode: m.Vnode<Attrs>) {
    return <FormBody>
      <SelectField label="Material Type" property={vnode.attrs.material.type} required={true}>
        <SelectFieldOptions selected={vnode.attrs.material.type()} items={this.supportedMaterials()}/>
      </SelectField>

      <Buttons.Primary onclick={this.check.bind(this, vnode.attrs.material)} small={false}>Wubba lubba dub dub!!!!</Buttons.Primary>
      {this.pacMessage}

      <Form last={true} compactForm={true}>
        {this.fieldsForType(vnode.attrs.material, this.cache)}
      </Form>
    </FormBody>;
  }

  supportedMaterials(): Option[] {
    return [
      {id: "git", text: "Git"},
      {id: "hg", text: "Mercurial"},
      {id: "svn", text: "Subversion"},
      {id: "p4", text: "Perforce"},
      {id: "tfs", text: "Team Foundation Server"},
      {id: "dependency", text: "Another Pipeline"},
    ];
  }

  fieldsForType(material: Material, cacheable: SuggestionCache): m.Children {
    switch (material.type()) {
      case "git":
        if (!(material.attributes() instanceof GitMaterialAttributes)) {
          material.attributes(new GitMaterialAttributes());
        }
        return <GitFields material={material}/>;
        break;
      case "hg":
        if (!(material.attributes() instanceof HgMaterialAttributes)) {
          material.attributes(new HgMaterialAttributes());
        }
        return <HgFields material={material}/>;
        break;
      case "svn":
        if (!(material.attributes() instanceof SvnMaterialAttributes)) {
          material.attributes(new SvnMaterialAttributes());
        }
        return <SvnFields material={material}/>;
        break;
      case "p4":
        if (!(material.attributes() instanceof P4MaterialAttributes)) {
          material.attributes(new P4MaterialAttributes());
        }
        return <P4Fields material={material}/>;
        break;
      case "tfs":
        if (!(material.attributes() instanceof TfsMaterialAttributes)) {
          material.attributes(new TfsMaterialAttributes());
        }
        return <TfsFields material={material}/>;
        break;
      case "dependency":
        if (!(material.attributes() instanceof DependencyMaterialAttributes)) {
          material.attributes(new DependencyMaterialAttributes());
        }
        return <DependencyFields material={material} cache={cacheable}/>;
        break;
      default:
        break;
    }
  }
}
