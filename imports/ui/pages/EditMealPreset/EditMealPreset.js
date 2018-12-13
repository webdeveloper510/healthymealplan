import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import MealPresets from '../../../api/MealPresets/MealPresets';
import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';

import MealPresetEditor from '../../components/MealPresetEditor/MealPresetEditor';

import NotFound from '../NotFound/NotFound';

const EditMealPreset = ({ category, history, ingredientTypes, popTheSnackbar }) => (preset ? (
  <div>
    <Grid container className="EditMealPreset SideContent SideContent--spacer-2x--horizontal">
      <MealPresetEditor
        preset={preset}
        potentialSubIngredients={[]}
        popTheSnackbar={popTheSnackbar}
        ingredientTypes={ingredientTypes}
        history={history}
        newCategory={false}
      />
    </Grid>
  </div>
) : <NotFound />);

EditMealPreset.defaultProps = {
  preset: null,
};

EditMealPreset.propTypes = {
  preset: PropTypes.object,
  history: PropTypes.object.isRequired,
  ingredientTypes: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const presetId = match.params._id;
  const subscription = Meteor.subscribe('mealpresets.view', presetId);
  const subscription2 = Meteor.subscribe('ingredientTypes');

  return {
    loading: !subscription.ready() && !subscription2.ready(),
    preset: MealPresets.findOne(presetId),
    // allIngredients: MealPresets.find().fetch(),
    // potentialSubIngredients: Ingredients.find().fetch(),
    // currentIngredientTypes: IngredientTypes.find({_id: {$in: ingredient.types }}),
    ingredientTypes: IngredientTypes.find().fetch(),
  };
}, EditMealPreset);
