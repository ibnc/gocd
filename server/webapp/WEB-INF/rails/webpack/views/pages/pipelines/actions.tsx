import * as Routes from "gen/ts-routes";
import {ApiRequestBuilder, ApiVersion} from "helpers/api_request_builder";
import SparkRoutes from "helpers/spark_routes";
import {MithrilViewComponent} from "jsx/mithril-component";
import * as m from "mithril";
import * as Buttons from "views/components/buttons";
import {FillableSection} from "views/pages/pipelines/fillable_section";

export class PipelineActions extends MithrilViewComponent {
  view(vnode: m.Vnode): m.Children | void | null {
      return (
        <FillableSection sectionId="">
          <Buttons.Secondary onclick={this.onCancel.bind(this)} small={false}>Cancel</Buttons.Secondary>
          <div class="save-btns">
            <Buttons.Primary  onclick={this.onSave.bind(this, true)} small={false}>Save + Edit Configuration</Buttons.Primary>
            <Buttons.Primary  onclick={this.onSave.bind(this, false)} small={false}>Save + Run Pipeline</Buttons.Primary>
          </div>
        </FillableSection>
      );
  }

  onCancel(event: Event): void {
    event.stopPropagation();
    window.location.href = "/go/pipelines";
  }

  onSave(shouldPause: boolean, event: Event): void {
    const payload = {
      group: "first",
      pipeline: {
        name: "save_and_run_pipeline",
        materials: [
          {
            type: "git",
            attributes: {
              url: "git@github.com:ibnc/tablinate.git",
              auto_update: false,
              branch: "eek"
            }
          }
        ],
        stages: [
          {
            name: "defaultStage",
            fetch_materials: true,
            clean_working_directory: false,
            never_cleanup_artifacts: false,
            jobs: [
              {
                name: "defaultJob",
                run_instance_count: null,
                timeout: 0,
                environment_variables: [],
                resources: [],
                tasks: [
                  {
                    type: "exec",
                    attributes: {
                      run_if: [
                        "passed"
                      ],
                      command: "ls",
                      working_directory: null
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    };
    let pipelineName = "save_and_run_pipeline";
    if (shouldPause) {
      pipelineName = "save_and_edit_pipeline";
      payload.pipeline.name = "save_and_edit_pipeline";
    }
    event.stopPropagation();
    //TODO create pipeline through pipeline config api
    ApiRequestBuilder.POST(SparkRoutes.pipelineConfigCreatePath(), ApiVersion.v6, {
      payload
    }).then((response) => {
      response.getOrThrow();
      if (shouldPause) {
        ApiRequestBuilder.POST(SparkRoutes.pipelinePausePath(pipelineName), ApiVersion.v1).then(() => {
          window.location.href = Routes.pipelineEditPath("pipelines", pipelineName, "general");
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
