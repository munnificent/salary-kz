// vue.config.js - Compatibility configuration for publicPath
// Note: This project uses Vite/React. The actual base path is configured in vite.config.ts
// This file is provided for compatibility only and should not interfere with Vite builds.

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/salary-kz/'
    : '/'
}
