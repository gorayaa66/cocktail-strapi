module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/build/player-slugs',
      handler: 'appbuild.getPlayerSlugs'
    },
    {
      method: 'GET',
      path: '/build/post-slugs',
      handler: 'appbuild.getPostSlugs'
    }
  ]
};
