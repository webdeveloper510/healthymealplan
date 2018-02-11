/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const MealPlanner = new Mongo.Collection('MealPlanner');

MealPlanner.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

MealPlanner.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

MealPlanner.schema = new SimpleSchema({

  lifestyleId: {
    type: String,
    label: 'Customer ID of the delivery.',
  },
  mealId: {
    type: String,
    label: 'The subscription id of the delivery.',
  },
  plateId: {
    type: String,
    label: 'The id of the meal',
  },
  onDate: {
    type: String,
    label: 'Date to be cooked on',
  },

  createdAt: {
    type: String,
    label: 'The date this delivery was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date this delivery was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },

});

MealPlanner.attachSchema(MealPlanner.schema);

export default MealPlanner;
