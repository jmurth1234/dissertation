module.exports = {
  apps: [
    {
      name: "app",
      watch: true,
      script: "./bin/www",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    },
  ],
};
