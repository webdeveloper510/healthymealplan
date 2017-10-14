/* esling-disable */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

import Ingredients from '../Ingredients';

// import IngredientTypes from '../../IngredientTypes/IngredientTypes';


Meteor.publish('ingredients', function ingredients(selector, options){
  check(selector, Match.Any);
  check(options, Match.Any);

  let cursor = Ingredients.find();

  return Ingredients.publishJoinedCursors(cursor);
});


Meteor.publish('ingredients-all-count', function(){
  Counts.publish(this, 'ingredients', Ingredients.find())
});


// Meteor.publish('ingredients.table', function ingredientsTable(query, options) {
//   console.log(query);
//   console.log(options);
//   check(query, Object || null || undefined);

//   check(options, Object || null || undefined);


//   const cursor = Ingredients.find({ query, options });

//   Counts.publish(this, 'matching-ingredients', Ingredients.find({ query, options }));

//   return cursor;
// });


// Meteor.publishComposite('ingredients', {

//   find() {
//     return Ingredients.find();
//   },

//   children: [
//     {
//       find(ingredient) {
//         if (ingredient.subIngredients) {
//           return Ingredients.find({ _id: { $in: [ingredient.subIngredients] } });
//         }

//         return '';
//       },
//       children: [

//         {
//           collectionName: 'IngredientsWithTypes',
//           find(ingredient) {
//             return IngredientTypes.find({ _id: ingredient.typeId }, { fields: { _id: 1, title: 1 } });
//           },
//         },

//       ],
//     },


//   ],

// });


// Meteor.publishComposite('ingredients', {

//   find() {
//     return Ingredients.find({}, { fields: { _id: 1, title: 1, subIngredients: 1, typeId: 1 } });
//   },

//   children: [
//     {
//       find(ingredient) {
//         if (ingredient.subIngredients) {
//           return Ingredients.find({ _id: { $in: [ingredient.subIngredients] } });
//         }

//         return ingredient;
//       },
//       children: [

//         {
//           collectionName: 'IngredientsWithTypes',
//           find(ingredient) {
//             return IngredientTypes.find({ _id: ingredient.typeId });
//           },
//         },

//       ],
//     },


//   ],

// });

// Note: Ingredients.view is also used when editing an existing document.
Meteor.publish('ingredients.view', (ingredientId) => {
  check(ingredientId, String);
  return Ingredients.find({ _id: ingredientId });
});


// Meteor.publishComposite('ingredients.view', (ingredientId) => {
//   check(ingredientId, String);

//   return {
//     find() {
//       return Ingredients.find({ _id: ingredientId });
//     },

//     children: [
//       {
//         find(ingredient) {
//           return Ingredients.find({ _id: { $in: ingredient.subIngredients } });
//         },
//       },
//       {
//         find(ingredient) {
//           return IngredientTypes.find({ _id: ingredient.typeId });
//         },
//       },

//     ],
//   };
// });
