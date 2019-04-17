import {bind} from "classnames/bind";
import {MithrilViewComponent} from "jsx/mithril-component";
import * as m from "mithril";
import * as styles from "./components.scss";

const cls = bind(styles);

interface Attrs {
  conceptId: string;
}

export class ConceptDiagram extends MithrilViewComponent<Attrs> {
  view(vnode: m.Vnode<Attrs>): m.Children | void | null {
    return <figure className={cls(styles.conceptDiagram, vnode.attrs.conceptId)}>
      <figcaption>
        {vnode.children}
      </figcaption>
    </figure>;
  }
}
