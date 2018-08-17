import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import Blog from '../Blog';

Meteor.publish('blog', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return Blog.find();
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('blog.view', (blogId) => {
  check(blogId, String);

  return Blog.find({ _id: blogId });
});

Meteor.publish('blog-all-count', function categoryCount() {
  Counts.publish(this, 'blogs', Blog.find());
});

