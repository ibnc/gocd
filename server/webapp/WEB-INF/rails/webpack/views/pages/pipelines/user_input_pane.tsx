import {bind} from "classnames/bind";
import {MithrilViewComponent} from "jsx/mithril-component";
import * as m from "mithril";
import * as styles from "./components.scss";

interface Attrs {
  heading: string;
}

const cls = bind(styles);

export class UserInputPane extends MithrilViewComponent<Attrs> {
  view(vnode: m.Vnode<Attrs>): m.Children | void | null {
    return <section className={cls(styles.userInput)}>
      <h3 className={cls(styles.sectionHeading)}>{vnode.attrs.heading}</h3>
      <p className={cls(styles.sectionNote)}><span className={cls(styles.attention)}>*</span> denotes a required field</p>
      {vnode.children}
    </section>;
  }
}
