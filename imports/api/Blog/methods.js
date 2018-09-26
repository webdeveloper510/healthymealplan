import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Blog from './Blog';
import rateLimit from '../../modules/rate-limit';
import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'blog.insert': function blogInsert(blog) {
    check(blog, {
      title: String,
      excerpt: String,
      slug: String,
      status: String,
      category: String,
      blocks: Array,
    });

    const existsCategory = Blog.findOne({ title: blog.title });

    if (existsCategory) {
      throw new Meteor.Error('500', `${blog.title} is already present`);
    }

    console.log(blog);

    try {
      return Blog.insert(blog);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'blog.update': function blogUpdate(blog) {
    check(blog, {
      _id: String,
      title: String,
      excerpt: String,
      slug: String,
      status: String,
      category: String,
      blocks: Array,
    });

    try {
      const blogId = blog._id;
      Blog.update(blogId, { $set: blog });
      return blogId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'blog.updateImageUrl': function blogUpdateImageUrl(blog) {
    check(blog, {
      _id: String,
      imageUrl: String,
      large: Boolean,
    });

    try {
      const blogId = blog._id;

      const toSet = {};

      if (blog.large) {
        toSet.largeImageUrl = blog.imageUrl;
      } else {
        toSet.imageUrl = blog.imageUrl;
      }

      Blog.update(blogId, {
        $set: toSet,
      });

      return blogId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'blog.remove': function blogRemove(catId) {
    check(catId, String);

    try {
      return Blog.remove(catId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'blog.batchRemove': function blogBatchRemove(ingredientIds) {
    check(ingredientIds, Array);
    console.log('Server: blog.batchRemove');

    try {
      return Blog.remove({ _id: { $in: ingredientIds } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'blog.insert',
    'blog.update',
    'blog.remove',
    'blog.batchRemove',
  ],
  limit: 5,
  timeRange: 1000,
});
