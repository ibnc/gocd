import * as Routes from "gen/ts-routes";
import {ApiRequestBuilder, ApiVersion} from "helpers/api_request_builder";
import SparkRoutes from "helpers/spark_routes";
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

    if (!pipelineConfigs.isValid()) {
      //TODO Error handling
      //eslint-ignore-line no-console
      console.log(pipelineConfigs.errors());
      return;
    }

    ApiRequestBuilder.POST(SparkRoutes.pipelineConfigCreatePath(), ApiVersion.v6, {
      payload: pipelineConfigs.toJSON()
    }).then((response) => {
      response.getOrThrow();
      if (shouldPause) {
        ApiRequestBuilder.POST(SparkRoutes.pipelinePausePath(pipelineConfigs.getPipelineName()), ApiVersion.v1).then(() => {
          window.location.href = Routes.pipelineEditPath("pipelines", pipelineConfigs.getPipelineName(), "general");
        });
      } else  {
        window.location.href = "/go/pipelines";
      }
    }).catch((reason) => {
      //TODO: add some error handling
      //tslint:disable-next-line
      console.log(reason);
    });
  }
}
