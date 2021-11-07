# kaniko-action [![ts](https://github.com/int128/kaniko-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/kaniko-action/actions/workflows/ts.yaml)

This is an action to build and push a Docker image using [Kaniko](https://github.com/GoogleContainerTools/kaniko) in GitHub Actions.
It is designed to work with the Docker's official actions such as `docker/login-action` or `docker/metadata-action`.


## Getting Started

To build and push an image to GHCR:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
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
```

To enable [caching layers](https://github.com/GoogleContainerTools/kaniko#caching):

```yaml
      - uses: int128/kaniko-action@v1
        with:
          cache: true
          cache-repository: ghcr.io/${{ github.repository }}/cache
```


## Specification

This action runs the image of Kaniko executor using `docker run` command.
It mounts `~/.docker/config.json` to the Kaniko executor for authentication of remote registry.


### Inputs

| Name | Default | Description
|------|----------|------------
| `executor` | `gcr.io/kaniko-project/executor:v1.6.0` | Image of Kaniko executor
| `cache` | `false` | Enable caching layers
| `cache-repository` | - | Repository for storing cached layers
| `kaniko-args` | - | Extra args to Kaniko executor
| `build-args` | - | List of build args
| `context` | `.` | Path to the build context
| `file` | `Dockerfile` | Path to the Dockerfile
| `labels` | - | List of metadata for an image
| `push` | `false` | Push an image to the registry
| `tags` | - | List of tags
| `target` | - | Target stage to build


### Outputs

| Name | Description
|------|------------
| `digest` | Image digest such as `sha256:abcdef...`
