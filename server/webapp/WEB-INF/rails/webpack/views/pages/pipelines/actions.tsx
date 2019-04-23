import {MithrilViewComponent} from "jsx/mithril-component";
import * as m from "mithril";
import * as Buttons from "views/components/buttons";
import {FillableSection} from "views/pages/pipelines/fillable_section";
import {PipelineConfig} from "models/pipeline_configs/pipeline_config";

interface Attrs {
  pipelineConfig: PipelineConfig;
}

export class PipelineActions extends MithrilViewComponent<Attrs> {
  view(vnode: m.Vnode<Attrs>): m.Children | void | null {
      return (
        <FillableSection sectionId="">
          <Buttons.Secondary onclick={this.onCancel.bind(this)} small={false}>Cancel</Buttons.Secondary>
          <div class="save-btns">
            <Buttons.Primary  onclick={this.onSave.bind(this, true, vnode.attrs.pipelineConfig)} small={false}>Save + Edit Configuration</Buttons.Primary>
            <Buttons.Primary  onclick={this.onSave.bind(this, false, vnode.attrs.pipelineConfig)} small={false}>Save + Run Pipeline</Buttons.Primary>
          </div>
        </FillableSection>
      );
  }

  onCancel(event: Event): void {
    event.stopPropagation();
    window.location.href = "/go/pipelines";
  }

  onSave(shouldPause: boolean, pipelineConfig: PipelineConfig, event: Event): void {
    event.stopPropagation();
    if (pipelineConfig.isValid()) {
      pipelineConfig.create(shouldPause);
    }
  }
}
