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

import {ApiRequestBuilder, ApiVersion} from "helpers/api_request_builder";
import SparkRoutes from "helpers/spark_routes";
import * as $ from "jquery";
import "jquery-ui/ui/widgets/autocomplete";
import {MithrilComponent, MithrilViewComponent} from "jsx/mithril-component";
import * as _ from "lodash";
import * as m from "mithril";
import {DependencyMaterialAttributes, GitMaterialAttributes, HgMaterialAttributes, Material, MaterialAttributes, P4MaterialAttributes, SvnMaterialAttributes, TfsMaterialAttributes} from "models/materials/types";
import {Form, FormBody} from "views/components/forms/form";
import {CheckboxField, Option, PasswordField, SelectField, SelectFieldOptions, TextField} from "views/components/forms/input_fields";
import {TestConnection} from "views/components/materials/test_connection";
import {AdvancedSettings} from "views/pages/pipelines/advanced_settings";
import * as css from "./components.scss";

interface Attrs {
  material: Material;
}

interface PipelineSuggestion {
  name: string;
  stages: string[];
}

interface PipelineNameCache {
  pipelines?: PipelineSuggestion[];
  syncing: boolean;
  error?: string;
}

type DepAttrs = Attrs & {cache: PipelineNameCache};

export class MaterialEditor extends MithrilViewComponent<Attrs> {
  cache: PipelineNameCache = { syncing: false };

  view(vnode: m.Vnode<Attrs>) {
    return <FormBody>
      <SelectField label="Material Type"property={vnode.attrs.material.type} required={true}>
        <SelectFieldOptions selected={vnode.attrs.material.type()} items={this.supportedMaterials()}/>
      </SelectField>

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
      // {id: "package", text: "Package Repository"},
    ];
  }

  fieldsForType(material: Material, cacheable: PipelineNameCache): m.Children {
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

abstract class ScmFields extends MithrilViewComponent<Attrs> {
  view(vnode: m.Vnode<Attrs>): m.Children {
    const mattrs = vnode.attrs.material.attributes();
    return [
      this.requiredFields(mattrs),
      <TestConnection material={vnode.attrs.material}/>,
      <AdvancedSettings>
        {this.extraFields(mattrs)}
        <TextField label="Alternate Checkout Path" property={mattrs.destination}/>
        <TextField label="Material Name" placeholder="A human-friendly label for this material" property={mattrs.name}/>
      </AdvancedSettings>
    ];
  }

  abstract requiredFields(attrs: MaterialAttributes): m.Children;
  abstract extraFields(attrs: MaterialAttributes): m.Children;
}

class GitFields extends ScmFields {
  requiredFields(attrs: MaterialAttributes): m.Children {
    const mat = attrs as GitMaterialAttributes;
    return [<TextField label="Repository URL" property={mat.url} errorText={errorsFor(attrs, "url")} required={true}/>];
  }

  extraFields(attrs: MaterialAttributes): m.Children {
    const mat = attrs as GitMaterialAttributes;
    return [<TextField label="Repository Branch" property={mat.branch}/>];
  }
}

class HgFields extends ScmFields {
  requiredFields(attrs: MaterialAttributes): m.Children {
    const mat = attrs as HgMaterialAttributes;
    return [<TextField label="Repository URL" property={mat.url} errorText={errorsFor(attrs, "url")} required={true}/>];
  }

  extraFields(attrs: MaterialAttributes): m.Children {
    return [];
  }
}

class SvnFields extends ScmFields {
  requiredFields(attrs: MaterialAttributes): m.Children {
    const mat = attrs as SvnMaterialAttributes;
    return [<TextField label="Repository URL" property={mat.url} errorText={errorsFor(attrs, "url")} required={true}/>];
  }

  extraFields(attrs: MaterialAttributes): m.Children {
    const mat = attrs as SvnMaterialAttributes;
    return [
      <TextField label="Username" property={mat.username}/>,
      <PasswordField label="Password" property={mat.password}/>,
      <CheckboxField label="Check Externals" property={mat.checkExternals}/>,
    ];
  }
}

class P4Fields extends ScmFields {
  requiredFields(attrs: MaterialAttributes): m.Children {
    const mat = attrs as P4MaterialAttributes;
    return [
      <TextField label="P4 [Protocol:][Host:]Port" property={mat.port} errorText={errorsFor(attrs, "port")} required={true}/>,
      <TextField label="P4 View" property={mat.view} errorText={errorsFor(attrs, "view")} required={true}/>,
    ];
  }

  extraFields(attrs: MaterialAttributes): m.Children {
    const mat = attrs as P4MaterialAttributes;
    return [
      <TextField label="Username" property={mat.username}/>,
      <PasswordField label="Password" property={mat.password}/>,
      <CheckboxField label="Use Ticket Authentication" property={mat.useTickets}/>,
    ];
  }
}

class TfsFields extends ScmFields {
  requiredFields(attrs: MaterialAttributes): m.Children {
    const mat = attrs as TfsMaterialAttributes;
    return [
      <TextField label="Repository URL" property={mat.url} errorText={errorsFor(attrs, "url")} required={true}/>,
      <TextField label="Project Path" property={mat.projectPath} errorText={errorsFor(attrs, "projectPath")} required={true}/>,
      <TextField label="Username" property={mat.username} errorText={errorsFor(attrs, "username")} required={true}/>,
      <PasswordField label="Password" property={mat.password} errorText={errorsFor(attrs, "password")} required={true}/>,
    ];
  }

  extraFields(attrs: MaterialAttributes): m.Children {
    const mat = attrs as TfsMaterialAttributes;
    return [<TextField label="Domain" property={mat.domain}/>];
  }
}

class DependencyFields extends MithrilComponent<DepAttrs> {
  autocomplete?: JQuery<Element>;
  private EMPTY: Option[] = [{id: "", text: "-"}];

  oncreate(vnode: m.VnodeDOM<DepAttrs, {}>) {
    const input = vnode.dom.querySelector(`input[type="text"]`);
    const cache = vnode.attrs.cache;
    const mat = vnode.attrs.material.attributes() as DependencyMaterialAttributes;
    if (!!cache.error || !cache.pipelines) {
      this.fetchSuggestions(vnode.attrs.cache, input as HTMLElement, (val: string) => {
        mat.pipeline(val);
        m.redraw();
      });
    }
  }

  view(vnode: m.Vnode<DepAttrs, {}>): m.Children {
    const mat = vnode.attrs.material.attributes() as DependencyMaterialAttributes;
    const cache = vnode.attrs.cache;
    return [
      <TextField label="Upstream Pipeline" property={mat.pipeline} errorText={errorsFor(mat, "pipeline")} required={true} />,
      <SelectField label="Upstream Stage" property={mat.stage} errorText={errorsFor(mat, "stage")} required={true}>
        <SelectFieldOptions selected={mat.stage()} items={this.stages(cache, mat)}/>
      </SelectField>,
      <AdvancedSettings>
        <TextField label="Material Name" placeholder="A human-friendly label for this material" property={mat.name}/>
      </AdvancedSettings>
    ];
  }

  pipelines(cache: PipelineNameCache): string[] {
    return !!cache.pipelines ? _.map(cache.pipelines!, (p) => p.name) : [];
  }

  stages(cache: PipelineNameCache, mat: DependencyMaterialAttributes): Option[] {
    if (!cache.pipelines || !mat.pipeline()) {
      mat.stage("");
      return this.EMPTY;
    }
    const current = _.find(cache.pipelines, (entry) => entry.name === mat.pipeline());
    return current ? this.EMPTY.concat(_.map(current.stages, (s: string) => ({ id: s, text: s } as Option))) : this.EMPTY;
  }

  fetchSuggestions(cache: PipelineNameCache, input: HTMLElement, callback: (val: string) => void) {
    if (cache.syncing) {
      return;
    }

    cache.syncing = true;

    ApiRequestBuilder.GET(SparkRoutes.internalDependencyMaterialSuggestionsPath(), ApiVersion.v1).then((res) => {
      res.map((body) => {
        delete cache.error;
        return cache.pipelines = JSON.parse(body) as PipelineSuggestion[];
      });

      function onValue(e: any, ui: any) {

        callback(ui.item ? ui.item.value : "");
      }

      const c = $(input).autocomplete({
        source: this.pipelines(cache),
        change: onValue,
        select: onValue,
        search: onValue,
        autoFocus: true,
        classes: {
          "ui-autocomplete": css.autocompletePane
        }
      });

      c.data("ui-autocomplete")._renderItem = (ul: HTMLElement, item: {label: string, value: string}) => {
        return $( "<li>" )
        .attr( "data-value", item.value )
        .addClass(css.autocompleteItem)
        .append( item.label )
        .appendTo( ul );
      };
    }).catch((reason) => {
      cache.error = reason;
    }).finally(() => {
      cache.syncing = false;
      // m.redraw();
    });
  }
}

function errorsFor(attrs: MaterialAttributes, key: string): string {
  return attrs.errors().errorsForDisplay(key);
}
