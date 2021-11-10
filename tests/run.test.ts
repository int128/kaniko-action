import * as os from 'os'
import { generateArgs } from '../src/run'

test('default args', () => {
  const args = generateArgs(
    {
      executor: 'gcr.io/kaniko-project/executor:latest',
      cache: false,
      cacheRepository: '',
      kanikoArgs: [],
      buildArgs: [],
      context: '',
      file: '',
      labels: [],
      push: false,
      tags: [],
      target: '',
    },
    '/tmp/kaniko-action'
  )
  expect(args).toStrictEqual([
    // docker args
    'run',
    '--rm',
    '-v',
    `${process.cwd()}:/var/tmp/kaniko-build-context:ro`,
    '-v',
    `/tmp/kaniko-action:/var/tmp/kaniko-output`,
    '-v',
    `${os.homedir()}/.docker/config.json:/kaniko/.docker/config.json:ro`,
    'gcr.io/kaniko-project/executor:latest',
    // kaniko args
    '--context',
    'dir:///var/tmp/kaniko-build-context/',
    '--digest-file',
    '/var/tmp/kaniko-output/digest',
    '--no-push',
  ])
})

test('full args', () => {
  const args = generateArgs(
    {
      executor: 'gcr.io/kaniko-project/executor:latest',
      cache: true,
      cacheRepository: 'ghcr.io/int128/kaniko-action/cache',
      kanikoArgs: ['--verbosity=debug'],
      buildArgs: ['foo=1', 'bar=2'],
      context: '.',
      file: 'Dockerfile',
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
    `${process.cwd()}:/var/tmp/kaniko-build-context:ro`,
    '-v',
    `/tmp/kaniko-action:/var/tmp/kaniko-output`,
    '-v',
    `${os.homedir()}/.docker/config.json:/kaniko/.docker/config.json:ro`,
    'gcr.io/kaniko-project/executor:latest',
    // kaniko args
    '--context',
    'dir:///var/tmp/kaniko-build-context/',
    '--digest-file',
    '/var/tmp/kaniko-output/digest',
    '--dockerfile',
    'Dockerfile',
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
    '--verbosity=debug',
  ])
})
