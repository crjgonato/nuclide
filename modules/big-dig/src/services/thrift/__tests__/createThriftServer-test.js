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
 * @emails oncall+nuclide
 */
import type {ThriftServerConfig} from '../types';

import {createThriftServer} from '../createThriftServer';
import thrift from 'thrift';
import * as portHelper from '../../../common/ports';

const ThriftFileSystemServiceHandler = jest.fn(function(root, watchman) {
  this._watcher = watchman;
});
const mockPort = 9090;

jest.mock(require.resolve('../../fs/ThriftFileSystemServiceHandler'), () => ({
  ThriftFileSystemServiceHandler,
}));

jest
  .spyOn(portHelper, 'scanPortsToListen')
  .mockImplementation(async (server: any, ports: string) => true);

jest.spyOn(thrift, 'createServer').mockImplementation(() => {
  return {
    address() {
      return {port: mockPort};
    },
    on(tag: string, cb: any) {},
    once(tag: string, cb: any) {},
    listen(port: number, cb: any) {},
    removeListener(tag: string, cb: any) {},
  };
});

test.skip('remote file system client factory function', async () => {
  const serverConfig: ThriftServerConfig = {
    name: 'thrift-rfs',
    remoteCommand: '',
    remoteCommandArgs: [],
    remotePort: mockPort,
    killOldThriftServerProcess: true,
  };
  const server = await createThriftServer(serverConfig);
  expect(server.getPort()).toBe(mockPort);
});
