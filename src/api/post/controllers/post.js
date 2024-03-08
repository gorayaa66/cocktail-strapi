'use strict';

/**
 * post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  async findOne(ctx) {
    const { slug } = ctx.params;
    const post = await strapi.db.query('api::post.post').findOne({
      where: { $and: [{ slug: slug }, { publishedAt: { $not: null } }] },
      populate: {
        categories: true,
        FAQ: {
          populate: true
        },
        feature_image: true,
        seo: {
          populate: {
            meta: true,
            metaSocial: { populate: true },
            metaImage: true
          }
        },
        createdBy: {
          select: ['id', 'firstname', 'lastname', 'email', 'username']
        },
        updatedBy: {
          select: ['id', 'firstname', 'lastname', 'email', 'username']
        }
      }
    });
    return post;
  }
}));
