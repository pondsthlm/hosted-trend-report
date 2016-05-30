# Application Operations

## SSH to servers

You use your AD-account to access the servers. Infra needs to give your account access per server.
To simplify, you can add these rows to your config, `~/.ssh/config`:

```txt
Host *.sth.basefarm.net
  User  ad\user.name
```

This will make sure you always access the servers using your own account (without specifying at each request).

## Find container hosts

1. Navigate to application directory.
2. Run `npm run xpr:status`. This will show you what nodes the application runs on, and their status.
3. Add `.sth.basefarm.net` to the `Host` column node-id (ex: `xpr-p-app101.sth.basefarm.net`).

## Restart container host

1. Use SSH to login to the application container host.
2. Run `docker ps` to find the container ID and port.
3. Run `docker restart [container ID]`.
4. To check that the server is started run `curl http://localhost:[port]/_alive` and verify that it returns "Yes".

## Logs

1. Use SSH to login to the application container host.
2. The logs can be found at `/var/log/containers/production/haddock`.

Alternatively, use the command `npm run xpr:logs` to pipe all server logs from production to your local machine.

## Manual verification

1. Use SSH to login to the application container host.
2. Run `docker ps` to find the container port.
3. Run the application specific status check, for example: `curl -v http://[username]:[password]@localhost:[port]/_status`. The credentials (basic auth) are listed in application config.

## Links

Use Consul to find application status and where it runs:

`http://consul-web.service.consul.xpr.dex.nu/ui`

Use Grafana to monitor application:

`http://grafana.service.consul.xpr.dex.nu/dashboard/db/applications`

Use Kibana to search application logs (if configured):

`http://kibana.service.consul.xpr.dex.nu/app/kibana`

## Disc is full

1. Remove log files at `/var/log/containers/production/$APPLICATION_NAME`.
2. You must restart the container after truncating/removing the logs.

## Dependencies

List your application dependencies here!

## Troubleshooting

1. Contact the infra team at Expressen.
2. Check documentation for the `exp-containership` repository on GitHub.
