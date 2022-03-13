import * as os from 'os'
import { generateArgs } from '../src/run'

const defaultInputs = {
  executor: 'gcr.io/kaniko-project/executor:latest',
  cache: false,
  cacheRepository: '',
  cacheTTL: '',
  pushRetry: '',
  registryMirrors: [],
  verbosity: '',
  kanikoArgs: [],
  buildArgs: [],
  context: '',
  file: '',
  labels: [],
  push: false,
  tags: [],
  target: '',
}

test('default args', () => {
  const args = generateArgs(defaultInputs, '/tmp/kaniko-action')
  expect(args).toStrictEqual([
    // docker args
    'run',
    '--rm',
    '-v',
    `${process.cwd()}:/kaniko/action/context:ro`,
    '-v',
    `/tmp/kaniko-action:/kaniko/action/output`,
    '-v',
    `${os.homedir()}/.docker/config.json:/kaniko/.docker/config.json:ro`,
    '-e',
    'container=docker',
    'gcr.io/kaniko-project/executor:latest',
    // kaniko args
    '--context',
    'dir:///kaniko/action/context/',
    '--digest-file',
    '/kaniko/action/output/digest',
    '--no-push',
  ])
})

test('full args', () => {
  const args = generateArgs(
    {
      executor: 'gcr.io/kaniko-project/executor:latest',
      cache: true,
      cacheRepository: 'ghcr.io/int128/kaniko-action/cache',
      cacheTTL: '30d',
      pushRetry: '100',
      registryMirrors: ['mirror.example.com', 'mirror.gcr.io'],
      verbosity: 'debug',
      kanikoArgs: ['--skip-tls-verify', '--help'],
      buildArgs: ['foo=1', 'bar=2'],
      context: 'foo/bar',
      file: 'foo/bar/baz/my.Dockerfile',
      labels: ['org.opencontainers.image.description=foo', 'org.opencontainers.image.url=https://www.example.com'],
      push: false,
      tags: ['helloworld:latest', 'ghcr.io/int128/kaniko-action/example:v1.0.0'],
      target: 'server',
    },
    '/tmp/kaniko-action'
  )
  expect(args).toStrictEqual([
    // docker args
    'run',
    '--rm',
    '-v',
    `${process.cwd()}/foo/bar:/kaniko/action/context:ro`,
    '-v',
    `/tmp/kaniko-action:/kaniko/action/output`,
    '-v',
    `${os.homedir()}/.docker/config.json:/kaniko/.docker/config.json:ro`,
    '-e',
    'container=docker',
    'gcr.io/kaniko-project/executor:latest',
    // kaniko args
    '--context',
    'dir:///kaniko/action/context/',
    '--digest-file',
    '/kaniko/action/output/digest',
    '--dockerfile',
    'baz/my.Dockerfile',
    '--build-arg',
    'foo=1',
    '--build-arg',
    'bar=2',
    '--label',
    'org.opencontainers.image.description=foo',
    '--label',
    'org.opencontainers.image.url=https://www.example.com',
    '--no-push',
    '--destination',
    'helloworld:latest',
    '--destination',
    'ghcr.io/int128/kaniko-action/example:v1.0.0',
    '--target',
    'server',
    '--cache=true',
    '--cache-repo',
    'ghcr.io/int128/kaniko-action/cache',
    '--cache-ttl',
    '30d',
    '--push-retry',
    '100',
    '--registry-mirror',
    'mirror.example.com',
    '--registry-mirror',
    'mirror.gcr.io',
    '--verbosity',
    'debug',
    '--skip-tls-verify',
    '--help',
  ])
})

test('with dockerfile', () => {
  const args = generateArgs(
    {
      ...defaultInputs,
      file: 'my.Dockerfile',
    },
    '/tmp/kaniko-action'
  )
  expect(args).toStrictEqual([
    // docker args
    'run',
    '--rm',
    '-v',
    `${process.cwd()}:/kaniko/action/context:ro`,
    '-v',
    `/tmp/kaniko-action:/kaniko/action/output`,
    '-v',
    `${os.homedir()}/.docker/config.json:/kaniko/.docker/config.json:ro`,
    '-e',
    'container=docker',
    'gcr.io/kaniko-project/executor:latest',
    // kaniko args
    '--context',
    'dir:///kaniko/action/context/',
    '--digest-file',
    '/kaniko/action/output/digest',
    '--dockerfile',
    'my.Dockerfile',
    '--no-push',
  ])
})
