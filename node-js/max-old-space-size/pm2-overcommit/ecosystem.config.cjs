module.exports = {
  apps: [
    {
      name: 'pm2-overcommit',
      script: 'app.js',
      exec_mode: 'cluster',
      instances: Number(process.env.PM2_INSTANCES) || 4,
      node_args: `--max-old-space-size=${
        process.env.MAX_OLD_SPACE_SIZE || 512
      }`,
      max_restarts: 10,
      restart_delay: 1000,
      env: {
        PORT: process.env.PORT || 3000,
        TARGET_MB: process.env.TARGET_MB || 0,
        CHUNK_MB: process.env.CHUNK_MB || 50,
        CHURN: process.env.CHURN || 0,
        CYCLE_MS: process.env.CYCLE_MS || 500,
      },
    },
  ],
};
