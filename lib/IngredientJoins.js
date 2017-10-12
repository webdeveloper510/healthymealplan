import { Mongo } from 'meteor/mongo';

import Ingredients from '../imports/api/Ingredients/Ingredients';
import IngredientTypes from '../imports/api/IngredientTypes/IngredientTypes';


Ingredients.join(IngredientTypes, 'typeId', 'typeMain', ['title']);
