'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import featureConfig from '../../nuclide-feature-config';
import {normalizeIdentifier} from './settings-utils';
import {React} from 'react-for-atom';
import type {SettingsPropsDefault} from './types';

type Props = SettingsPropsDefault & {
  value: number;
};

export default class SettingsSelect extends React.Component {
  props: Props;

  constructor(props: Object) {
    super(props);
    (this: any)._onChanged = this._onChanged.bind(this);
  }

  _onChanged(event: SyntheticEvent) {
    const value = ((event.target: any): HTMLInputElement).value;
    this.props.onChanged({
      keyPath: this.props.keyPath,
      newValue: value,
    });
  }

  render(): React.Element<any> {
    const keyPath = this.props.keyPath;
    const id = normalizeIdentifier(keyPath);
    const title = this.props.title;
    const description = this.props.description;
    const value = this.props.value;

    const options = featureConfig.getSchema(keyPath);

    const optionElements = [];
    if (options.enum) {
      options.enum.forEach((option, i) => {
        optionElements.push(<option value={option} key={i}>{option}</option>);
      });
    }

    return (
      <div>
        <label className="control-label">
          <div className="setting-title">{title}</div>
          <div className="setting-description">{description}</div>
        </label>
        <select
          className="form-control"
          id={id}
          onChange={this._onChanged}
          value={value}>
          {optionElements}
        </select>
      </div>
    );
  }
}
