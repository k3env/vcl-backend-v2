job "vacation-calendar" {
  datacenters = ["dc1"]

  group "backend" {
    count = 1
    network {
      port "http" {
        to = 3000
      }
    }

    task "backend" {
      driver = "docker"
      template {
        data        = <<EOH
{{range ls "app/vacation-calendar/backend/env"}}
{{.Key}}={{.Value}}
{{end}}
EOH
        destination = ".env"
        change_mode = "restart"
        env         = true
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
      service {
        name = "backend-v2"
        port = "http"
        tags = [
          "proxy.enable=true",
          "proxy.labels.domain=k3env.site",
          "proxy.labels.group=vcl"
          "proxy.http.routers.ci.entrypoints=webtls"
        ]
      }
    }
  }
}
