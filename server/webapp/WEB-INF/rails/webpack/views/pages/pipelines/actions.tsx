import {MithrilViewComponent} from "jsx/mithril-component";
import * as m from "mithril";
import * as Buttons from "views/components/buttons";
import {FillableSection} from "views/pages/pipelines/fillable_section";
import {PipelineConfigs} from "models/pipeline_configs/pipeline_config";

interface Attrs {
  pipelineConfigs: PipelineConfigs;
}

export class PipelineActions extends MithrilViewComponent<Attrs> {
  view(vnode: m.Vnode<Attrs>): m.Children | void | null {
      return (
        <FillableSection sectionId="">
          <Buttons.Secondary onclick={this.onCancel.bind(this)} small={false}>Cancel</Buttons.Secondary>
          <div class="save-btns">
            <Buttons.Primary  onclick={this.onSave.bind(this, true, vnode.attrs.pipelineConfigs)} small={false}>Save + Edit Configuration</Buttons.Primary>
            <Buttons.Primary  onclick={this.onSave.bind(this, false, vnode.attrs.pipelineConfigs)} small={false}>Save + Run Pipeline</Buttons.Primary>
          </div>
        </FillableSection>
      );
  }

  onCancel(event: Event): void {
    event.stopPropagation();
    window.location.href = "/go/pipelines";
  }

  onSave(shouldPause: boolean, pipelineConfigs: PipelineConfigs, event: Event): void {
    event.stopPropagation();
    if (pipelineConfigs.isValid()) {
      pipelineConfigs.create(shouldPause);
    }
  }
}
