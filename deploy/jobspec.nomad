job "vacation-calendar" {
  datacenters = ["dc1"]

  group "backend" {
    count = 1
    network {
      mode = "bridge"
      port "mongo" {
        to = 27017
      }
      port "http" {
        to = 3000
      }
    }
    service {
      name = "backend"
      port = "http"
      tags = [
        "proxy.enable=true",
        "proxy.labels.domain=k3env.site",
        "proxy.labels.group=vcl",
        "proxy.http.routers.vcl-back-v2.entrypoints=webtls"
      ]
    }
    service {
      name = "backend-api"
      port = "http"

      connect {
        sidecar_service {
          proxy {
            upstreams {
              destination_name = "mongo"
              local_bind_port  = 27017
            }
          }
        }
      }
    }
    service {
      name = "mongo"
      port = "mongo"
      connect {
        sidecar_service {}
      }
    }

    task "backend" {
      driver = "docker"
      env {
        MONGO_URI = "mongodb://${NOMAD_UPSTREAM_ADDR_mongo}/?directConnection=true&ssl=false"
      }
      resources {
        cpu    = 1000
        memory = 256
      }

      config {
        image      = "k3env/vcl-backend:${DRONE_COMMIT_SHA}"
        force_pull = true
        ports      = ["http"]
      }
    }
    task "db" {
      driver = "docker"

      resources {
        cpu    = 1000
        memory = 1024
      }

      config {
        image      = "mongo:latest"
        force_pull = false
        ports      = ["db"]
      }

      volume_mount {
        volume      = "mongo-data"
        destination = "/data/db"
      }
    }
  }
}
