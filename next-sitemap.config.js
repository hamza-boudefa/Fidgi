/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://www.fidgi.world', // Change this to your domain
    generateRobotsTxt: true, // Generates robots.txt
    changefreq: 'daily',
    priority: 0.7,
    sitemapSize: 5000,
    generateIndexSitemap: false,
    i18n: true, // Enable i18n support
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/',
        },
      ],
    },
  };