import {bind} from "classnames/bind";
import {MithrilViewComponent} from "jsx/mithril-component";
import * as m from "mithril";
import * as styles from "./components.scss";

const cls = bind(styles);

interface Attrs {
  sectionId: string;
}

export class FillableSection extends MithrilViewComponent<Attrs> {
  view(vnode: m.Vnode<Attrs>): m.Children | void | null {
    return <article className={cls(styles.fillable, vnode.attrs.sectionId)}>
      {vnode.children}
    </article>;
  }
}
