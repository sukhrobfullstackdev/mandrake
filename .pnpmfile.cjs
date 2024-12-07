module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.peerDependencies['react']) {
        pkg.peerDependencies['react'] = '*';
      }
      return pkg;
    },
  },
};
