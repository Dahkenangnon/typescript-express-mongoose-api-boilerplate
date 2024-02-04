module.exports = {
  apps: [
    {
      // App env
      env: {
        NODE_ENV: 'production',
      },
      // auto restart
      autorestart: true,

      // application name (default to script filename without extension)
      name: 'type-safe-nodejs-api',

      // time
      time: true,

      // mode to start your app, can be “cluster” or “fork”, default fork
      exec_mode: 'cluster',

      //number of app instance to be launched
      instances: 1, // Or a number of instances. Default to max available cpu core

      // script path relative to pm2 start
      script: 'dist/index.js',

      // string containing all arguments passed via CLI to script
      args: 'start',

      // enable watch & restart feature, if a file change in the folder or subfolder, your app will get reloaded
      watch: false,

      ignore_watch: [
        './node_modules',
        './dist',
        './public',
        './.DS_Store',
        './package.json',
        './yarn.lock',
      ], // ignore files change

      // your app will be restarted if it exceeds the amount of memory specified. human-friendly format : it can be “10M”, “100K”, “2G” and so on…
      max_memory_restart: '250M',

      // log date format (see log section)
      log_date_format: 'DD-MM-YYYY HH:mm:ss.SSS',

      // error file path (default to $HOME/.pm2/logs/XXXerr.log)
      error_file: './logs/pm2.error.log',

      // out file path (default to $HOME/.pm2/logs/XXXout.log)
      out_file: './logs/pm2.out.log',

      // Set a cron job to restart the app every day at 00:00
      cron_restart: '0 0 * * *',
    },
  ],
};
