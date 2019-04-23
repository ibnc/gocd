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
import {GitMaterialAttributes, HgMaterialAttributes, Material, MaterialAttributes} from "models/materials/types";
import {Form, FormBody} from "views/components/forms/form";
import {Option, SelectField, SelectFieldOptions, TextField} from "views/components/forms/input_fields";
import {TestConnection} from "views/components/materials/test_connection";
import {AdvancedSettings} from "views/pages/pipelines/advanced_settings";

// temporary until PipelineConfig model is available
import {Stream} from "mithril/stream";
import * as stream from "mithril/stream";
const destDir: Stream<string> = stream();

interface Attrs {
  material: Material;
}

export class MaterialEditor extends MithrilViewComponent<Attrs> {
  view(vnode: m.Vnode<Attrs>) {
    return <FormBody>
      <SelectField label="Material Type"property={vnode.attrs.material.type} required={true}>
        <SelectFieldOptions selected={vnode.attrs.material.type()} items={this.supportedMaterials()}/>
      </SelectField>

      <Form last={true} compactForm={true}>
        {this.fieldsForType(vnode.attrs.material)}
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
      {id: "pipeline", text: "Pipeline"},
      {id: "pkg", text: "Package Repository"},
    ];
  }

  fieldsForType(material: Material): m.Children {
    switch (material.type()) {
      case "git":
        return <GitFields material={material} />;
        break;
      case "hg":
        return <HgFields material={material} />;
        break;
      default:
        break;
    }
  }
}

abstract class ScmFields extends MithrilViewComponent<Attrs> {
  view(vnode: m.Vnode<Attrs>): m.Children {
    return [
      this.requiredFields(vnode.attrs.material.attributes()),
      <TestConnection material={vnode.attrs.material} />,
      <AdvancedSettings>
        {this.extraFields(vnode.attrs.material.attributes())}
        <TextField label="Alternate Checkout Path" property={destDir}/>
        <TextField label="Material Name" placeholder="A human-friendly label for this material" property={vnode.attrs.material.attributes().name}/>
      </AdvancedSettings>
    ];
  }

  abstract requiredFields(attrs: MaterialAttributes): m.Children;
  abstract extraFields(attrs: MaterialAttributes): m.Children;
}

class GitFields extends ScmFields {
  requiredFields(attrs: MaterialAttributes): m.Children {
    const mat = attrs as GitMaterialAttributes;
    return [<TextField label="Repository URL" property={mat.url} required={true} />];
  }

  extraFields(attrs: MaterialAttributes): m.Children {
    const mat = attrs as GitMaterialAttributes;
    return [<TextField label="Repository Branch" property={mat.branch} />];
  }
}

class HgFields extends ScmFields {
  requiredFields(attrs: MaterialAttributes): m.Children {
    const mat = attrs as HgMaterialAttributes;
    return [<TextField label="Repository URL" property={mat.url} required={true} />];
  }

  extraFields(attrs: MaterialAttributes): m.Children {
    return [];
  }
}
