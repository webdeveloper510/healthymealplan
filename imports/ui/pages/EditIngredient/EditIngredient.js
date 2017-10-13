import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Ingredients from '../../../api/Ingredients/Ingredients';
import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';

import IngredientEditor from '../../components/IngredientEditor/IngredientEditor';
import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';

import NotFound from '../NotFound/NotFound';

const EditIngredient = ({ ingredient, history, potentialSubIngredients, ingredientTypes, popTheSnackbar }) => (ingredient ? (
  <div>
    <AuthenticatedSideNav history={history} />,
    <Grid container className="EditIngredient SideContent SideContent--spacer-2x--horizontal">
      <IngredientEditor
        ingredient={ingredient}
        potentialSubIngredients={potentialSubIngredients}
        popTheSnackbar={popTheSnackbar}
        ingredientTypes={ingredientTypes}
        history={history}
      />
    </Grid>
  </div>
) : <NotFound />);

EditIngredient.defaultProps = {
  ingredient: null,
};

EditIngredient.propTypes = {
  ingredient: PropTypes.object,
  history: PropTypes.object.isRequired,
  potentialSubIngredients: PropTypes.isRequired,
  ingredientTypes: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const ingredientId = match.params._id;
  const subscription = Meteor.subscribe('ingredients');
  const subscription2 = Meteor.subscribe('ingredientTypes');

  return {
    loading: !subscription.ready() || !subscription2.ready(),
    ingredient: Ingredients.findOne(ingredientId),
    allIngredients: Ingredients.find().fetch(),
    potentialSubIngredients: Ingredients.find().fetch(),
    ingredientTypes: IngredientTypes.find().fetch(),
  };
}, EditIngredient);
