import { Mongo } from 'meteor/mongo';

import Ingredients from '../imports/api/Ingredients/Ingredients';
import IngredientTypes from '../imports/api/IngredientTypes/IngredientTypes';
import Plates from '../imports/api/Plates/Plates';
import PlateImages from '../imports/api/Plates/Plates';

Ingredients.join(IngredientTypes, 'typeId', 'typeMain', ['title']);

Plates.join(PlateImages, 'imageId', 'image');
