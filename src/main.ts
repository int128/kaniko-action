import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  const outputs = await run({
    executor: core.getInput('executor', { required: true }),
    cache: core.getBooleanInput('cache'),
    cacheRepository: core.getInput('cache-repository'),
    kanikoArgs: core.getMultilineInput('kaniko-args'),
    buildArgs: core.getMultilineInput('build-args'),
    context: core.getInput('context'),
    file: core.getInput('file'),
    labels: core.getMultilineInput('labels'),
    push: core.getBooleanInput('push'),
    tags: core.getMultilineInput('tags'),
    target: core.getInput('target'),
  })
  core.setOutput('digest', outputs.digest)
}

main().catch((e) => core.setFailed(e instanceof Error ? e.message : JSON.stringify(e)))
