/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {IDebugService, IProcess} from '../types';

import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import * as React from 'react';
import {TreeList} from 'nuclide-commons-ui/Tree';
import FrameTreeNode from './FrameTreeNode';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {fastDebounce} from 'nuclide-commons/observable';
import {Observable} from 'rxjs';
import ProcessTreeNode from './ProcessTreeNode';
import ThreadTreeNode from './ThreadTreeNode';

type Props = {
  service: IDebugService,
};

type State = {
  processList: Array<IProcess>,
};

export default class DebuggerProcessComponent extends React.PureComponent<
  Props,
  State,
> {
  _disposables: UniversalDisposable;
  _treeView: ?TreeList;

  constructor(props: Props) {
    super(props);
    this.state = this._getState();
    this._disposables = new UniversalDisposable();
  }

  componentDidMount(): void {
    const {service} = this.props;
    const {viewModel} = service;
    const model = service.getModel();
    this._disposables.add(
      Observable.merge(
        observableFromSubscribeFunction(
          viewModel.onDidFocusStackFrame.bind(viewModel),
        ),
        observableFromSubscribeFunction(model.onDidChangeCallStack.bind(model)),
        observableFromSubscribeFunction(service.onDidChangeMode.bind(service)),
      )
        .let(fastDebounce(150))
        .subscribe(this._handleThreadsChanged),
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  _handleThreadsChanged = (): void => {
    this.setState(this._getState());
  };

  _getState(): $Shape<State> {
    return {
      processList: this.props.service
        .getModel()
        .getProcesses()
        .slice(),
    };
  }

  render(): React.Node {
    const {processList} = this.state;
    const {service} = this.props;

    const processElements = processList.map((process, processIndex) => {
      const threadElements = process
        .getAllThreads()
        .map((thread, threadIndex) => {
          const stackFrameElements = thread
            .getCallStack()
            .map((frame, frameIndex) => {
              return (
                <FrameTreeNode
                  text={'Frame ID: ' + frame.frameId + ', Name: ' + frame.name}
                  frame={frame}
                  key={frameIndex}
                  service={service}
                />
              );
            });
          return (
            <ThreadTreeNode
              title={'Thread ID: ' + thread.threadId + ', Name: ' + thread.name}
              key={threadIndex}
              childItems={stackFrameElements}
              thread={thread}
              service={service}
            />
          );
        });
      let processTitle = 'Process';
      if (process != null) {
        processTitle += ' Adapter Type: ' + process.configuration.adapterType;
        if (process.configuration.adapterExecutable != null) {
          processTitle +=
            ', Command: ' + process.configuration.adapterExecutable.command;
        }
      }
      return (
        <ProcessTreeNode
          title={processTitle}
          key={processIndex}
          childItems={threadElements}
          process={process}
          service={service}
        />
      );
    });

    return <TreeList showArrows={true}>{processElements}</TreeList>;
  }
}
