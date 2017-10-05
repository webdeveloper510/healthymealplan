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

const EditIngredient = ({ ingredient, history, potentialSubIngredients }) => (ingredient ? (
  <div>
    <AuthenticatedSideNav history={history} />,
    <Grid container className="EditIngredient SideContent">
      <IngredientEditor ingredient={ingredient} potentialSubIngredients={potentialSubIngredients} history={history} />
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
};

export default createContainer(({ match }) => {
  const ingredientId = match.params._id;
  const subscription = Meteor.subscribe('ingredients');
  const subscription2 = Meteor.subscribe('ingredientTypes');

  return {
    loading: !subscription.ready() || !subscription2.ready(),
    ingredient: Ingredients.findOne(ingredientId),
    // subIngredients: Ingredients.find({ _id: { $in: ingredient.subIngredients }}).fetch(),
    potentialSubIngredients: Ingredients.find().fetch(),
  };
}, EditIngredient);
