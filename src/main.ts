import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  const outputs = await run({
    executor: core.getInput('executor', { required: true }),
    kanikoArgs: core.getMultilineInput('kaniko-args'),
    buildArgs: core.getMultilineInput('build-args'),
    context: core.getInput('context', { required: true }),
    file: core.getInput('file', { required: true }),
    labels: core.getMultilineInput('labels'),
    noCache: core.getBooleanInput('no-cache'),
    push: core.getBooleanInput('push'),
    tags: core.getMultilineInput('tags'),
    target: core.getInput('target'),
  })
  core.setOutput('digest', outputs.digest)
}

main().catch((e) => core.setFailed(e instanceof Error ? e.message : JSON.stringify(e)))
