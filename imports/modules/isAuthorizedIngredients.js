/* eslint-disable consistent-return */

import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import Documents from '../api/Ingredients/Ingredients.js';

const isAuthorized = ({ userId, ingredientId, methodName }) => {
  const existingDocument = Documents.findOne(ingredientId);
  const owner = existingDocument ? existingDocument.owner : userId;

  const isInRole = false;

  switch (methodName) {
    case 'ingredients.edit':
      isInRole = Roles.userIsInRole(userId, 'ingredients.edit');
      break;


    default:
      break;
  }


  if (userId && isInRole) return owner;
  throw new Meteor.Error('500', 'Sorry, you\'re not allowed to do that!');
};

export default isAuthorized;
