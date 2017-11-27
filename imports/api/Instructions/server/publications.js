/* esling-disable */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

import Instructions from '../Instructions';


Meteor.publish('instructions', function instructions(selector, options){
  check(selector, Match.Any);
  check(options, Match.Any);

  let cursor = Instructions.find();

  return Instructions.publishJoinedCursors(cursor);
});


Meteor.publish('instructions-all-count', function(){
  Counts.publish(this, 'instructions', Instructions.find())
});

// Note: Ingredients.view is also used when editing an existing document.
Meteor.publish('instructions.view', (instructionId) => {
  check(instructionId, String);
  return Instructions.find({ _id: instructionId });
});
