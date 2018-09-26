/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Blog = new Mongo.Collection('Blog');

Blog.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Blog.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Blog.schema = new SimpleSchema({

  title: {
    type: String,
    label: 'The title of the blog.',
  },
  excerpt: {
    type: String,
    label: 'Excerpt of the blog.',
  },
  slug: {
    type: String,
    label: 'The slug of the article',
  },
  status: {
    type: String,
    label: 'The status of the article',
  },
  category: {
    type: String,
    label: 'The category of the article',
  },
  // content: {
  //   type: String,
  //   label: 'Blog content',
  // },
  blocks: {
    type: Array,
    label: 'Content blocks',
    blackbox: true,
  },

  'blocks.$': {
    type: Object,
    label: 'Content blocks',
    blackbox: true,
  },
  imageUrl: {
    type: String,
    label: 'URL of the image.',
    optional: true,
  },
  largeImageUrl: {
    type: String,
    label: 'Featured blog image.',
    optional: true,
  },
  // owner: {
  //   type: String,
  //   label: 'The ID of the user this category belongs to.',
  // },
  createdAt: {
    type: String,
    label: 'The date this category was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date this category was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },

});

Blog.attachSchema(Blog.schema);

export default Blog;
