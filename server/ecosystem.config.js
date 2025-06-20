module.exports = {
  apps: [{
    name: 'skinforge-backend',
    script: './index.js',
    interpreter: 'node',
    // This is the crucial part that ensures ES Modules are enabled
    args: '--experimental-modules',
    env: {
      NODE_ENV: 'production',
    },
  }],
}; 