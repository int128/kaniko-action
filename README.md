# kaniko-action [![ts](https://github.com/int128/kaniko-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/kaniko-action/actions/workflows/ts.yaml)

This is an action to build and push a Docker image using [Kaniko](https://github.com/GoogleContainerTools/kaniko) in GitHub Actions.
It is designed to work with the Docker's official actions such as [docker/login-action](https://github.com/docker/login-action) or [docker/metadata-action](https://github.com/docker/metadata-action).

Kaniko supports layer caching. See https://github.com/GoogleContainerTools/kaniko#caching for more.


## Getting Started

To build and push a container image to GitHub Container Registry,

```yaml
jobs:
  build:
    steps:
      - uses: actions/checkout@v3
      - uses: docker/metadata-action@v3
        id: metadata
        with:
          images: ghcr.io/${{ github.repository }}
      - uses: docker/login-action@v1
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: int128/kaniko-action@v1
        with:
          push: true
          tags: ${{ steps.metadata.outputs.tags }}
          labels: ${{ steps.metadata.outputs.labels }}
          cache: true
          cache-repository: ghcr.io/${{ github.repository }}/cache
```

To build and push a container image to Amazon ECR,

```yaml
jobs:
  build:
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/configure-aws-credentials@v1
        with:
          role-to-assume: arn:aws:iam::ACCOUNT:role/ROLE
      - uses: aws-actions/amazon-ecr-login@v1
        id: ecr
      - uses: docker/metadata-action@v4
        id: metadata
        with:
          images: ${{ steps.ecr.outputs.registry }}/${{ github.repository }}
      - uses: int128/kaniko-action@v1
        with:
          push: true
          tags: ${{ steps.metadata.outputs.tags }}
          labels: ${{ steps.metadata.outputs.labels }}
          cache: true
          cache-repository: ${{ steps.ecr.outputs.registry }}/${{ github.repository }}/cache
```


## Build a multi-architecture image

It can build a multi-architecture image such as `amd64` and `arm64` by GitHub Actions self-hosted runner.
For example, we can deploy [actions-runner-controller](https://github.com/actions/actions-runner-controller) on AWS Graviton (ARM) nodes and build an ARM image on it.

See also https://github.com/int128/docker-manifest-create-action for more.


## Specification

This action runs the image of Kaniko executor using `docker run` command.
It mounts `~/.docker/config.json` to the Kaniko executor for authentication of remote registry.


### Inputs

Here is a list of inputs. See also the flags of [Kaniko executor](https://github.com/GoogleContainerTools/kaniko).

| Name | Description | Corresponding flag
|------|-------------|-------------------
| `executor` | Image of Kaniko executor. Default to `gcr.io/kaniko-project/executor:v1.9.2` | -
| `context` <sup>*1</sup> | Path to the build context. Default to the workspace | -
| `file` <sup>*1</sup> | Path to the Dockerfile. Default to `Dockerfile`. It must be in the context. If set, this action passes the relative path to Kaniko, same as the behavior of [`docker build`](https://docs.docker.com/engine/reference/commandline/build/) | `--dockerfile`
| `build-args` <sup>*1</sup> | List of build args | `--build-arg`
| `labels` <sup>*1</sup> | List of metadata for an image | `--label`
| `push` <sup>*1</sup> | Push an image to the registry. Default to false | `--no-push`
| `tags` <sup>*1</sup> | List of tags | `--destination`
| `target` <sup>*1</sup> | Target stage to build | `--target`
| `cache` | Enable caching layers | `--cache`
| `cache-repository` | Repository for storing cached layers | `--cache-repo`
| `cache-ttl` | Cache timeout | `--cache-ttl`
| `push-retry` | Number of retries for the push of an image | `--push-retry`
| `registry-mirror` | Use registry mirror(s) | `--registry-mirror`
| `verbosity` | Set the logging level | `--verbosity`
| `kaniko-args` | Extra args to Kaniko executor | -

<sup>*1</sup> These inputs are compatible with [docker/build-push-action](https://github.com/docker/build-push-action).


### Outputs

| Name | Description
|------|------------
| `digest` | Image digest such as `sha256:abcdef...`
