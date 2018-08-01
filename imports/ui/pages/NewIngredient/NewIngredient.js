import React from 'react';
import PropTypes from 'prop-types';

import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Ingredients from '../../../api/Ingredients/Ingredients';
import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';

import IngredientEditor from '../../components/IngredientEditor/IngredientEditor';

const NewIngredient = ({ history, ingredientTypes, potentialSubIngredients, newIngredient, popTheSnackbar, loading }) => (
  <div>
    <Grid container className="NewIngredient SideContent SideContent--spacer-2x--horizontal">
      <IngredientEditor 
        history={history} 
        potentialSubIngredients={potentialSubIngredients} 
        popTheSnackbar={popTheSnackbar} 
        newIngredient={true} 
        ingredientTypes={ingredientTypes}
        loading={loading} 
      />
    </Grid>
  </div>
);

NewIngredient.propTypes = {
  history: PropTypes.object.isRequired,
  potentialSubIngredients: PropTypes.array.isRequired,
  ingredientTypes: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('ingredients');
  const subscription2 = Meteor.subscribe('ingredientTypes');

  return {
    loading: !subscription.ready() && !subscription2.ready(),
    potentialSubIngredients: Ingredients.find().fetch(),
    ingredientTypes: IngredientTypes.find().fetch(),
  };
})(NewIngredient);

