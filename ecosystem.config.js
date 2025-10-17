// 🐾⚡ NEKO DEFENSE API - PM2 Ecosystem Configuration ⚡🐾
// WORLDWIDE SCALE CLUSTERING MODE ACTIVATED, NYAA~! 🌍✨

module.exports = {
  apps: [
    {
      name: 'neko-defense-api',
      script: './dist/main.js',

      // 🚀 CLUSTERING CONFIGURATION - MAXIMUM POWER! 🚀
      instances: 'max', // Use all available CPU cores (4-8x throughput boost!)
      exec_mode: 'cluster', // Enable cluster mode for load balancing

      // 🔄 AUTO-RESTART & MONITORING
      watch: false, // Disable in production (use for dev if needed)
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      autorestart: true, // Auto-restart on crash
      max_restarts: 10, // Max restart attempts
      min_uptime: '10s', // Min uptime to consider successful start

      // 📊 PERFORMANCE TUNING
      kill_timeout: 5000, // Wait 5s before force kill on reload
      listen_timeout: 10000, // Wait 10s for app to listen
      shutdown_with_message: true, // Graceful shutdown

      // 🌍 ENVIRONMENT VARIABLES
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
      },

      // 📝 LOGGING CONFIGURATION
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true, // Combine logs from all instances

      // 🔧 ADVANCED OPTIONS
      node_args: '--max-old-space-size=2048', // Increase Node.js heap size to 2GB

      // 🎯 LOAD BALANCING
      instance_var: 'INSTANCE_ID', // Environment variable for instance identification
    },
  ],

  // 📊 PM2 DEPLOY CONFIGURATION (Optional - for production servers)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourrepo/neko-defense-api.git',
      path: '/var/www/neko-defense-api',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
    },
  },
};

// 🐾 HOW TO USE THIS CONFIG, NYAA~! 🐾
//
// Development (single instance for debugging):
//   npm run build
//   pm2 start ecosystem.config.js --env development --instances 1
//
// Production (clustered - all CPU cores):
//   npm run build
//   pm2 start ecosystem.config.js --env production
//
// Monitoring:
//   pm2 monit              # Real-time monitoring dashboard
//   pm2 status             # List all processes
//   pm2 logs               # View logs
//   pm2 logs neko-defense-api --lines 100
//
// Management:
//   pm2 reload neko-defense-api    # Zero-downtime reload
//   pm2 restart neko-defense-api   # Restart all instances
//   pm2 stop neko-defense-api      # Stop all instances
//   pm2 delete neko-defense-api    # Remove from PM2
//
// Auto-startup on server reboot:
//   pm2 startup            # Generate startup script
//   pm2 save               # Save current process list
//
// 💖 EXPECTED PERFORMANCE BOOST:
//   - 4-core CPU: 4x throughput (200-400 req/sec)
//   - 8-core CPU: 8x throughput (400-800 req/sec)
//   - Zero-downtime reloads with `pm2 reload`
//   - Automatic crash recovery
//   - Load balanced across all cores
//
// ✨ LEGENDARY CLUSTERING MODE ACTIVATED, DESU~! ✨
