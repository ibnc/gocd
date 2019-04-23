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

import {Material} from "models/materials/types";
import {ValidatableMixin, Validator} from "models/mixins/new_validatable_mixin";

export class NonEmptySetValidator<T> extends Validator {
  protected doValidate(entity: any, attr: string): void {
    const property: Set<T> = ("function" === typeof entity[attr] ? entity[attr]() : entity[attr]) as Set<T>;

    if (property.size === 0) {
      entity.errors().add(attr, this.options.message || `${attr} cannot be empty`);
    }
  }
}

// Specialized Set<Material> implementation where member equality is based on only the `name`
// of the material, and NOT the identity or the structure.
export class MaterialSet extends ValidatableMixin implements Set<Material> {

  get size(): number {
    return this._members.size;
  }

  [Symbol.toStringTag]: string = "MaterialSet";
  private _members: Map<string, Material> = new Map(); // preserves insertion order

  constructor(materials: Material[]) {
    super();

    for (let i = 0, len = materials.length; i < len; i++) {
      this.add(materials[i]);
    }
  }

  validate(key?: string) {
    this.clearErrors(key);
    this.forEach((material: Material) => {
      if (!material.isValid()) {
        this.errors().add(material.name(), `Material named \`${material.name()}\` is invalid`);
      }
    }, this);
    return this.errors();
  }

  add(value: Material): this {
    this._members.set(value.name(), value);
    return this;
  }

  clear() {
    this._members.clear();
  }

  delete(value: Material): boolean {
    return this._members.delete(value.name());
  }

  forEach(callbackfn: (value: Material, value2: Material, set: Set<Material>) => void, thisArg?: any) {
    const thisProvided = arguments.length > 1;

    this._members.forEach((val: Material, name: string, _: Map<string, Material>) => {
      if (thisProvided) {
        callbackfn.apply(thisArg, [val, val, this]);
      } else {
        callbackfn(val, val, this);
      }
    });
  }

  has(value: Material): boolean {
    return this._members.has(value.name());
  }

  [Symbol.iterator](): IterableIterator<Material> {
    return this._members.values();
  }

  entries(): IterableIterator<[Material, Material]> {
    return new Set<Material>(this._members.values()).entries();
  }

  keys(): IterableIterator<Material> {
    return this[Symbol.iterator]();
  }

  values(): IterableIterator<Material> {
    return this[Symbol.iterator]();
  }
}
