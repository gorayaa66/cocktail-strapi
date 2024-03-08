module.exports = {
  getPlayerSlugs: async (ctx) => {
    try {
      const players = await strapi.entityService.findMany(
        'api::player.player',
        {
          sort: ['updatedAt:desc'],
          filters: {
            publishedAt: { $not: null }
          },
          fields: ['publishedAt', 'slug']
        }
      );
      const slugs = players.map((player) => player?.slug);
      ctx.body = slugs;
    } catch (err) {
      ctx.body = err;
    }
  },

  getPostSlugs: async (ctx) => {
    try {
      const posts = await strapi.entityService.findMany('api::post.post', {
        filters: {
          publishedAt: { $not: null }
        },
        fields: ['title', 'publishedAt', 'slug']
      });
      const slugs = posts.map((post) => post?.slug);
      ctx.body = slugs;
    } catch (err) {
      ctx.body = err;
    }
  }
};
