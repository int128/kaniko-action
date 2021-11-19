import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { promises as fs } from 'fs'
import * as os from 'os'
import * as path from 'path'

type Inputs = {
  executor: string
  cache: boolean
  cacheRepository: string
  cacheTTL: string
  pushRetry: string
  registryMirrors: string[]
  verbosity: string
  kanikoArgs: string[]
  buildArgs: string[]
  context: string
  file: string
  labels: string[]
  push: boolean
  tags: string[]
  target: string
}

type Outputs = {
  digest: string
}

export const run = async (inputs: Inputs): Promise<Outputs> => {
  await withTime('Pulled', () => exec.exec('docker', ['pull', '-q', inputs.executor]))

  const outputDir = await fs.mkdtemp(`${os.tmpdir()}/kaniko-action-`)
  const args = generateArgs(inputs, outputDir)
  await withTime('Built', () => core.group('Build', () => exec.exec('docker', args)))

  const digest = await readContent(`${outputDir}/digest`)
  core.info(digest)
  return { digest }
}

const withTime = async <T>(message: string, f: () => Promise<T>): Promise<T> => {
  const start = Date.now()
  const value = await f()
  const end = Date.now()
  const seconds = (end - start) / 1000
  core.info(`${message} in ${seconds}s`)
  return value
}

export const generateArgs = (inputs: Inputs, outputDir: string): string[] => {
  const args = [
    // docker args
    'run',
    '--rm',
    '-v',
    `${path.resolve(inputs.context)}:/kaniko/action/context:ro`,
    '-v',
    `${outputDir}:/kaniko/action/output`,
    '-v',
    `${os.homedir()}/.docker/config.json:/kaniko/.docker/config.json:ro`,
    inputs.executor,
    // kaniko args
    '--context',
    'dir:///kaniko/action/context/',
    '--digest-file',
    '/kaniko/action/output/digest',
  ]

  if (inputs.file) {
    // docker build command resolves the Dockerfile from the context root
    // https://docs.docker.com/engine/reference/commandline/build/#specify-a-dockerfile--f
    const dockerfileInContext = path.relative(inputs.context, inputs.file)
    args.push('--dockerfile', dockerfileInContext)
  }
  for (const buildArg of inputs.buildArgs) {
    args.push('--build-arg', buildArg)
  }
  for (const label of inputs.labels) {
    args.push('--label', label)
  }
  if (!inputs.push) {
    args.push('--no-push')
  }
  for (const tag of inputs.tags) {
    args.push('--destination', tag)
  }
  if (inputs.target) {
    args.push('--target', inputs.target)
  }

  if (inputs.cache) {
    args.push('--cache=true')
    if (inputs.cacheRepository) {
      args.push('--cache-repo', inputs.cacheRepository)
    }
  }
  if (inputs.cacheTTL) {
    args.push('--cache-ttl', inputs.cacheTTL)
  }
  if (inputs.pushRetry) {
    args.push('--push-retry', inputs.pushRetry)
  }
  for (const mirror of inputs.registryMirrors) {
    args.push('--registry-mirror', mirror)
  }
  if (inputs.verbosity) {
    args.push('--verbosity', inputs.verbosity)
  }

  args.push(...inputs.kanikoArgs)
  return args
}

const readContent = async (p: string) => (await fs.readFile(p)).toString().trim()
