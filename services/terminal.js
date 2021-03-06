/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

let pty;
try {
  pty = require('node-pty-prebuilt');
} catch (e) {
}

const {ServiceBase} = require('./service_base.js');

class Terminal extends ServiceBase {
  init(params) {
    if (!pty)
      throw new Error('There were some errors with building terminal on this platform');
    this._term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
      name: 'xterm-color',
      cols: params.cols || 80,
      rows: params.rows || 24,
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_OPTIONS: `--require ${require.resolve('../node_debug_demon/preload.js')} --inspect=0`,
        NDD_DEASYNC_JS: require.resolve('deasync'),
        NDD_STORE: params.nddStore,
        NDD_WAIT_AT_START: 1
      }
    });

    this._term.on('data', data => this._notify('data', {data}));
    return Promise.resolve({});
  }

  resize(params) {
    if (this._term)
      this._term.resize(params.cols, params.rows);
    return Promise.resolve({});
  }

  write(params) {
    if (this._term)
      this._term.write(params.data);
    return Promise.resolve({});
  }
}

new Terminal();
