# kaniko-action [![ts](https://github.com/int128/kaniko-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/kaniko-action/actions/workflows/ts.yaml)

This is an action to build and push a Docker image using [Kaniko](https://github.com/GoogleContainerTools/kaniko) in GitHub Actions.
It is designed to work with the Docker's official actions such as `docker/login-action` or `docker/metadata-action`.

Kaniko supports layer caching. See https://github.com/GoogleContainerTools/kaniko#caching for more.


## Getting Started

To build and push a container image to GitHub Container Registry,

```yaml
jobs:
  build:
    steps:
      - uses: actions/checkout@v2
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
      - uses: actions/checkout@v2
      - uses: aws-actions/amazon-ecr-login@v1
      - uses: int128/create-ecr-repository-action@v1
        id: ecr
        with:
          repository: example
      - uses: int128/create-ecr-repository-action@v1
        id: ecr-cache
        with:
          repository: example/cache
      - uses: docker/metadata-action@v3
        id: metadata
        with:
          images: ${{ steps.ecr.outputs.repository-uri }}
      - uses: int128/kaniko-action@v1
        with:
          push: true
          tags: ${{ steps.metadata.outputs.tags }}
          labels: ${{ steps.metadata.outputs.labels }}
          cache: true
          cache-repository: ${{ steps.ecr-cache.outputs.repository-uri }}
```


## Specification

This action runs the image of Kaniko executor using `docker run` command.
It mounts `~/.docker/config.json` to the Kaniko executor for authentication of remote registry.


### Inputs

Here is a list of inputs. See also the flags of [Kaniko executor](https://github.com/GoogleContainerTools/kaniko).

| Name | Description | Corresponding flag
|------|-------------|-------------------
| `executor` | Image of Kaniko executor. Default to `gcr.io/kaniko-project/executor:v1.7.0` | -
| `context` <sup>*1</sup> | Path to the build context. Default to the workspace | -
| `file` <sup>*1</sup> | Path to the Dockerfile. Default to `Dockerfile`. It must be in the context. If set, this action passes the relative path to Kaniko, same as the behavior of [`docker build`](https://docs.docker.com/engine/reference/commandline/build/) | `--dockerfile`
| `build-args` <sup>*1</sup> | List of build args | `--build-arg`
| `labels` <sup>*1</sup> | List of metadata for an image | `--label`
| `push` <sup>*1</sup> | Push an image to the registry. Default to true | `--no-push`
| `tags` <sup>*1</sup> | List of tags | `--destination`
| `target` <sup>*1</sup> | Target stage to build | `--target`
| `cache` | Enable caching layers | `--cache`
| `cache-repository` | Repository for storing cached layers | `--cache-repo`
| `cache-ttl` | Cache timeout | `--cache-ttl`
| `push-retry` | Number of retries for the push of an image | `--push-retry`
| `registry-mirror` | Use registry mirror(s) | `--registry-mirror`
| `verbosity` | Set the logging level | `--verbosity`
| `kaniko-args` | Extra args to Kaniko executor | -

<sup>*1</sup> These inputs are compatible with `docker/build-push-action`


### Outputs

| Name | Description
|------|------------
| `digest` | Image digest such as `sha256:abcdef...`
