const { revalidateApp } = require('../../../../../config/utils/revalidateApp');
const { errors } = require('@strapi/utils');
const { ApplicationError } = errors;
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = {
  async beforeUpdate(event) {
    const { data, where } = event.params;

    const isPublishedAt = Object.prototype.hasOwnProperty.call(
      data,
      'publishedAt'
    );

    if (isPublishedAt) {
      const previousPost = await getFullPost(where);
      const schemaMarkUp = generateSchemaMarkUp(
        previousPost,
        previousPost.feature_image,
        previousPost.createdBy,
        data.publishedAt
      );
      await updateSeo(previousPost.seo.id, {
        structuredData: schemaMarkUp
      });
    } else {
      if (data.type === 'Event') validateEvent(data);

      data.url = `${process.env.FRONTEND_APP_URL}${process.env.BLOG_BASE_URL}${data.slug}`;
      const faqSchemaMarkUp = setContentFaqSchemaMarkUp(data);
      const [featureImage, previousPost] = await Promise.all([
        strapi.db.connection
          .table('files')
          .where('id', data.feature_image)
          .first('id', 'name', 'url'),
        getFullPost(where)
      ]);

      const schemaMarkUp = generateSchemaMarkUp(
        data,
        featureImage,
        previousPost.createdBy
      );
      const updatedSeo = updateSeo(data.seo.id, {
        canonicalURL: `${process.env.FRONTEND_APP_URL}${process.env.BLOG_BASE_URL}${data.slug}`,
        structuredData: schemaMarkUp
      });

      const post = setContentUrl(data.content);
      event.params.data.content = post.content;
      event.params.data.internalLinks = post.internal.length;
      event.params.data.externalLinks = post.external.length;

      await Promise.all([faqSchemaMarkUp, updatedSeo]);
    }
  },
  async afterUpdate(event) {
    const { result } = event;
    if (result.publishedAt) await revalidateApp('blog', result.slug);
  },
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.type === 'Event') {
      validateEvent(data);
    }
    data.url = `${process.env.FRONTEND_APP_URL}${process.env.BLOG_BASE_URL}${data.slug}`;
    const faqSchemaMarkUp = setContentFaqSchemaMarkUp(data);
    const [postFeatureImage, postAuthor, postSeo] = await Promise.all([
      strapi.db.connection
        .table('files')
        .where('id', data.feature_image)
        .first('id', 'name', 'url'),
      strapi.db.connection
        .table('admin_users')
        .where('id', data.createdBy)
        .first('id', 'firstname', 'lastname'),
      findSeo(data.seo.id)
    ]);
    const seoMetaImage = setSeoMetaImage(data, postSeo);

    const schemaMarkUp = generateSchemaMarkUp(
      data,
      postFeatureImage,
      postAuthor
    );
    const defaultMetaTags = await createDefaultMetaTags(
      data,
      postFeatureImage,
      postAuthor
    );

    const updateSeoPayload = {
      metaTitle: postSeo.metaTitle || data.title.slice(0, 60),
      metaDescription:
        postSeo.metaDescription || data.description.slice(0, 160),
      canonicalURL: `${process.env.FRONTEND_APP_URL}${process.env.BLOG_BASE_URL}${data.slug}`,
      structuredData: schemaMarkUp,
      meta: defaultMetaTags
    };
    const updatedSeo = updateSeo(data.seo.id, updateSeoPayload);

    const post = setContentUrl(data.content);
    event.params.data.content = post.content;
    event.params.data.internalLinks = post.internal.length;
    event.params.data.externalLinks = post.external.length;
    await Promise.all([faqSchemaMarkUp, seoMetaImage, updatedSeo]);
  }
};

const updateSeo = async (id, body) => {
  await strapi.db.query('shared.seo').update({
    where: { id: id },
    data: { ...body }
  });
};
const findSeo = async (id) => {
  const seo = await strapi.db.query('shared.seo').findOne({
    where: { id: id },
    populate: true
  });
  return seo;
};
const setContentFaqSchemaMarkUp = async (data) => {
  if (data?.FAQ) {
    const faq = await strapi.db.query('components.faq').findOne({
      where: { id: data.FAQ.id },
      populate: true
    });
    await strapi.db.query('components.faq').update({
      where: { id: faq.id },
      data: {
        schema_markup: generateFaqSchemaMarkUp(faq)
      }
    });
  }
};

const generateSchemaMarkUp = (
  post,
  featureImage,
  author,
  publishedAt = null
) => {
  if (post.type === 'Event') {
    const schemaMarkUp = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: post.title,
      description: post.description,
      image: `${process.env.IMAGE_BASE_URL}${featureImage.url}`,
      startDate: post.eventStartDate,
      endDate: post.eventEndDate
    };
    if (post?.eventStatus != null) {
      schemaMarkUp['eventStatus'] = `https://schema.org/${post.eventStatus}`;
    }
    return schemaMarkUp;
  } else {
    const schemaMarkUp = {
      '@context': 'https://schema.org',
      '@type': post.type,
      author: {
        '@type': 'Person',
        name: `${author.firstname} ${author.lastname}`
        // url: `${process.env.FRONTEND_APP_URL}/author/john`,
      },
      dateModified: publishedAt ? publishedAt : post.updatedAt,
      datePublished: publishedAt ? publishedAt : '',
      description: post.description,
      headline: post.title,
      image: `${process.env.IMAGE_BASE_URL}${featureImage.url}`,
      mainEntityOfPage: {
        '@id': `${process.env.FRONTEND_APP_URL}${process.env.BLOG_BASE_URL}${post.slug}`,
        '@type': 'WebPage'
      },
      publisher: {
        '@type': 'Organization',
        logo: {
          '@type': 'ImageObject',
          url: `${process.env.SITE_LOGO_URL}`
        },
        name: 'NBA'
      }
    };

    return schemaMarkUp;
  }
};
const generateFaqSchemaMarkUp = (faq) => {
  const mainEntity = faq.AskedQuestions.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }));
  return mainEntity.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity
      }
    : null;
};

const validateEvent = (data) => {
  if (!(data?.eventStartDate ?? null)) {
    throw new ApplicationError('eventStartDate Required for Event', {
      errors: [
        {
          path: ['eventStartDate'],
          message: 'eventStartDate Required for Event',
          name: 'ValidationError'
        }
      ]
    });
  } else if (!(data?.eventEndDate ?? null)) {
    throw new ApplicationError('eventEndDate Required for Event', {
      errors: [
        {
          path: ['eventEndDate'],
          message: 'eventEndDate Required for Event',
          name: 'ValidationError'
        }
      ]
    });
  } else if (data.eventStartDate > data.eventEndDate) {
    throw new ApplicationError("StartDate can't be Greater than EndDate", {
      errors: [
        {
          path: ['eventStartDate'],
          message: 'StartTime Must be less than EndDate',
          name: 'ValidationError'
        }
      ]
    });
  }
};
const getFullPost = async (where) => {
  const previousPost = await strapi.db.query('api::post.post').findOne({
    where: where,
    populate: {
      feature_image: true,
      FAQ: {
        populate: true
      },
      seo: {
        populate: true
      },
      createdBy: {
        select: ['id', 'firstname', 'lastname', 'email', 'username']
      },
      updatedBy: {
        select: ['id', 'firstname', 'lastname', 'email', 'username']
      }
    }
  });
  return previousPost;
};

const createDefaultMetaTags = async (post, featureImage, author) => {
  const metaTagsPayload = createMetaTagsPayload(post, featureImage, author);
  const data = await strapi.db.query('components.meta').createMany({
    data: metaTagsPayload
  });

  const metaTags = data.ids.map((id) => {
    return {
      id: id,
      __pivot: { field: 'meta', component_type: 'components.meta' }
    };
  });
  return metaTags;
};
const createMetaTagsPayload = (post, featureImage, author) => {
  const payload = [
    {
      type: 'property',
      value: 'og:title',
      content: post.title
    },
    {
      type: 'name',
      value: 'twitter:title',
      content: post.title
    },
    {
      type: 'property',
      value: 'og:description',
      content: post.description
    },
    {
      type: 'name',
      value: 'twitter:description',
      content: post.description
    },
    {
      type: 'name',
      value: 'description',
      content: post.description
    },
    {
      type: 'property',
      value: 'og:type',
      content: 'article'
    },
    {
      type: 'property',
      value: 'og:url',
      content: post.url
    },
    {
      type: 'name',
      value: 'twitter:url',
      content: post.url
    },
    {
      type: 'property',
      value: 'og:site_name',
      content: process.env.ORG_NAME
    },
    {
      type: 'name',
      value: 'twitter:image',
      content: `${process.env.IMAGE_BASE_URL}${featureImage.url}`
    },
    {
      type: 'property',
      value: 'og:article:author',
      content: `${author.firstname} ${author.lastname}`
    },
    {
      type: 'property',
      value: 'og:image',
      content: `${process.env.IMAGE_BASE_URL}${featureImage.url}`
    }
  ];

  if (post?.Tag && post.Tag.length > 0) {
    const inputTags = post.Tag.map((item) => item.name).join(',');
    const inputTagsMeta = [
      {
        type: 'property',
        value: 'og:article:tag',
        content: inputTags
      },
      {
        type: 'name',
        value: 'tag',
        content: inputTags
      }
    ];
    payload.push(...inputTagsMeta);
  }

  return payload;
};

const setContentUrl = (content) => {
  const dom = new JSDOM(content);
  const document = dom.window.document;
  const siteUrl = process.env.FRONTEND_APP_URL;
  const links = { internal: [], external: [] };
  const anchorElements = Array.from(document.querySelectorAll('a'));
  anchorElements.forEach((element) => {
    const href = element.getAttribute('href');
    if (href) {
      const rel = href.includes(siteUrl) ? 'follow' : 'nofollow';
      element.setAttribute('rel', rel);
      links[rel === 'follow' ? 'internal' : 'external'].push(href);
    }
  });
  links.content = dom.serialize();

  return links;
};

const setSeoMetaImage = async (post, seo) => {
  if (seo.metaImage == null)
    await strapi.db.connection.table('files_related_morphs').insert({
      file_id: post.feature_image,
      related_id: post.seo.id,
      related_type: 'shared.seo',
      field: 'metaImage'
    });
};
