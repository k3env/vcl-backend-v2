project = "vcl-back-v2"
app "backend" {
  build {
    use "docker" {
    }
    registry {
      use "docker" {
        image = "k3env/vcl-back"
        tag   = "latest"
      }
    }
  }
  deploy {
    use "nomad" {
      //The following field was skipped during file generation
      auth         = "927a9b61-7695-531c-f0cb-fdd345060283"
      consul_token = "68fda848-1e84-be74-edc8-a65f8c8fc12a"
      vault_token  = "hvs.mLSjr7W8q9oAxgq5Z5seaqz4"
    }
  }
  release {
    use "nomad-jobspec-canary" {
    }
  }
}
