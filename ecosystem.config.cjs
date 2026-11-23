module.exports = {
  apps: [
    {
      name: 'tandis-web',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        TANDIS_DJANGO_BASE_URL: 'http://127.0.0.1:8000/api/v1/',
      },
    },
  ],
};
