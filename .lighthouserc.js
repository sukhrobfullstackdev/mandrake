module.exports = {
  ci: {
    collect: {
      settings: {
        skipAudits: ['robots-txt', 'canonical', 'tap-targets', 'is-crawlable', 'works-offline', 'offline-start-url'],
      },
      startServerCommand: 'pnpm start',
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    // Enable assertions when we have content
    // assert: {
    //   preset: 'lighthouse:recommended',
    // },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
