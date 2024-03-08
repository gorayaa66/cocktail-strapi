import type { Schema, Attribute } from '@strapi/strapi';

export interface ComponentsBody extends Schema.Component {
  collectionName: 'components_components_bodies';
  info: {
    displayName: 'Paragraph';
    icon: 'cube';
    description: '';
  };
  attributes: {
    value: Attribute.Text & Attribute.Required;
    type: Attribute.Enumeration<
      ['b-large', 'b-medium', 'b-small', 'b-extra-small']
    > &
      Attribute.Required;
  };
}

export interface ComponentsButton extends Schema.Component {
  collectionName: 'components_components_buttons';
  info: {
    displayName: 'Button';
    icon: 'cube';
    description: '';
  };
  attributes: {
    value: Attribute.String & Attribute.Required;
    url: Attribute.String & Attribute.Required;
    btn_size: Attribute.Enumeration<['large', 'medium', 'small']> &
      Attribute.Required;
    btn_color: Attribute.Enumeration<['primary', 'secondary']> &
      Attribute.Required;
    btn_kind: Attribute.Enumeration<['primary', 'secondary']> &
      Attribute.Required;
  };
}

export interface ComponentsFaq extends Schema.Component {
  collectionName: 'components_components_faqs';
  info: {
    displayName: 'FAQ';
    icon: 'cube';
    description: '';
  };
  attributes: {
    schema_markup: Attribute.JSON;
    AskedQuestions: Attribute.Component<'components.qa', true> &
      Attribute.Required;
  };
}

export interface ComponentsFocusKeyword extends Schema.Component {
  collectionName: 'components_components_focus_keywords';
  info: {
    displayName: 'Focus Keyword';
    icon: 'cube';
    description: '';
  };
  attributes: {
    value: Attribute.String & Attribute.Required;
    score: Attribute.Integer & Attribute.DefaultTo<0>;
    text: Attribute.Text & Attribute.DefaultTo<'auto generated '>;
  };
}

export interface ComponentsHeading extends Schema.Component {
  collectionName: 'components_components_headings';
  info: {
    displayName: 'Heading';
    icon: 'cube';
    description: '';
  };
  attributes: {
    value: Attribute.String & Attribute.Required;
    type: Attribute.Enumeration<['h2', 'h3', 'h4', 'h5', 'h6']> &
      Attribute.Required;
  };
}

export interface ComponentsLineBreak extends Schema.Component {
  collectionName: 'components_components_line_breaks';
  info: {
    displayName: 'LineBreak';
    icon: 'cube';
  };
  attributes: {
    value: Attribute.Enumeration<['line-break']> &
      Attribute.Required &
      Attribute.DefaultTo<'line-break'>;
  };
}

export interface ComponentsMedia extends Schema.Component {
  collectionName: 'components_components_media';
  info: {
    displayName: 'Media';
    icon: 'cube';
    description: '';
  };
  attributes: {
    image: Attribute.Media & Attribute.Required;
  };
}

export interface ComponentsMeta extends Schema.Component {
  collectionName: 'components_components_metas';
  info: {
    displayName: 'Meta';
    icon: 'cube';
    description: '';
  };
  attributes: {
    type: Attribute.Enumeration<['name', 'property']> &
      Attribute.Required &
      Attribute.DefaultTo<'name'>;
    value: Attribute.String & Attribute.Required;
    content: Attribute.Text & Attribute.Required;
  };
}

export interface ComponentsQa extends Schema.Component {
  collectionName: 'components_components_qas';
  info: {
    displayName: 'QA';
    icon: 'cube';
    description: '';
  };
  attributes: {
    question: Attribute.String & Attribute.Required;
    answer: Attribute.Text & Attribute.Required;
  };
}

export interface ComponentsSeo extends Schema.Component {
  collectionName: 'components_components_seos';
  info: {
    displayName: 'Seo';
    icon: 'cube';
    description: '';
  };
  attributes: {
    title: Attribute.String &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }> &
      Attribute.DefaultTo<'auto generated '>;
    description: Attribute.Text &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        maxLength: 160;
      }> &
      Attribute.DefaultTo<'auto generated '>;
    meta: Attribute.Component<'components.meta', true>;
    focus_Keyword: Attribute.Component<'components.focus-keyword'>;
  };
}

export interface SharedMetaSocial extends Schema.Component {
  collectionName: 'components_shared_meta_socials';
  info: {
    displayName: 'metaSocial';
    icon: 'project-diagram';
  };
  attributes: {
    socialNetwork: Attribute.Enumeration<['Facebook', 'Twitter']> &
      Attribute.Required;
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    description: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 65;
      }>;
    image: Attribute.Media;
  };
}

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
    description: '';
  };
  attributes: {
    metaTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaDescription: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 50;
        maxLength: 160;
      }>;
    metaImage: Attribute.Media;
    metaSocial: Attribute.Component<'shared.meta-social', true> &
      Attribute.SetMinMax<{
        max: 2;
      }>;
    keywords: Attribute.Text;
    metaRobots: Attribute.String;
    structuredData: Attribute.JSON;
    metaViewport: Attribute.String;
    canonicalURL: Attribute.String;
    meta: Attribute.Component<'components.meta', true>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'components.body': ComponentsBody;
      'components.button': ComponentsButton;
      'components.faq': ComponentsFaq;
      'components.focus-keyword': ComponentsFocusKeyword;
      'components.heading': ComponentsHeading;
      'components.line-break': ComponentsLineBreak;
      'components.media': ComponentsMedia;
      'components.meta': ComponentsMeta;
      'components.qa': ComponentsQa;
      'components.seo': ComponentsSeo;
      'shared.meta-social': SharedMetaSocial;
      'shared.seo': SharedSeo;
    }
  }
}
