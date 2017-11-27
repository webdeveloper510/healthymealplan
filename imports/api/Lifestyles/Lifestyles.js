/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Lifestyles = new Mongo.Collection('Lifestyles');

Lifestyles.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Lifestyles.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Lifestyles.schema = new SimpleSchema({
  SKU: {
    type: String,
    label: 'The SKU of the ',
  },
  title: {
    type: String,
    label: 'The title of the category.',
  },
  restrictions: {
    type: Array,
    label: 'The types that belong to this category',
  },
  'restrictions.$': {
    type: String,
    label: 'The id of each type',
  },
  prices: {
    type: Object,
    label: 'Prices for this type of lifestyle.',
  },
  'prices.breakfast': {
    type: Array,
    label: 'Price for breakfast meal type',
  },
  'prices.lunch': {
    type: Array,
    label: 'Price for lunch meal type.',
  },
  'prices.dinner': {
    type: Array,
    label: 'Price for breakfast dinner meal type.',
  },
  'prices.breakfast.$': {
    type: Number,
    label:
      'Price of the meal type for each person. Index is the number of people 0 - 7.',
  },
  'prices.lunch.$': {
    type: Number,
    label:
      'Price of the meal type for each person. Index is the number of people 0 - 7.',
  },
  'prices.dinner.$': {
    type: Number,
    label:
      'Price of the meal type for each person. Index is the number of people 0 - 7.',
  },
  discountAthletic: {
    type: Number,
    label: 'The amount of discount',
    optional: true,
  },
  extraAthletic: {
    type: Number,
    label: 'The amount of extra',
    optional: true,
  },
  discountOrExtraTypeAthletic: {
    type: String,
    label: 'Percentage or Fixed amount',
    optional: true,
  },
  discountBodybuilder: {
    type: Number,
    label: 'The amount of discount',
    optional: true,
  },
  extraBodybuilder: {
    type: Number,
    label: 'The amount of extra',
    optional: true,
  },
  discountOrExtraTypeBodybuilder: {
    type: String,
    label: 'Percentage or Fixed amount',
    optional: true,
  },
  discountStudent: {
    type: Number,
    label: 'The amount of discount',
    optional: true,
  },
  extraStudent: {
    type: Number,
    label: 'The amount of extra',
    optional: true,
  },
  discountOrExtraTypeStudent: {
    type: String,
    label: 'Percentage or Fixed amount',
    optional: true,
  },
  discountSenior: {
    type: Number,
    label: 'The amount of discount',
    optional: true,
  },
  extraSenior: {
    type: Number,
    label: 'The amount of extra',
    optional: true,
  },
  discountOrExtraTypeSenior: {
    type: String,
    label: 'Percentage or Fixed amount',
    optional: true,
  },
  owner: {
    type: String,
    label: 'The ID of the user this category belongs to.',
  },
  createdAt: {
    type: String,
    label: 'The date this category was created.',
    autoValue() {
      if (this.isInsert) return new Date().toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date this category was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return new Date().toISOString();
    },
  },
});

Lifestyles.attachSchema(Lifestyles.schema);

export default Lifestyles;
