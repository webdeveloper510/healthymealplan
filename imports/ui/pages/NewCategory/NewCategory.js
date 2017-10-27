import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Ingredients from '../../../api/Ingredients/Ingredients';
import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';

import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import CategoryEditor from '../../components/CategoryEditor/CategoryEditor';

const NewCategory = ({ history, ingredientTypes, potentialSubIngredients, newCategory, popTheSnackbar }) => (
  <div>
    <Grid container className="NewCategory SideContent SideContent--spacer-2x--horizontal">
      <CategoryEditor
        history={history}
        potentialSubIngredients={potentialSubIngredients}
        popTheSnackbar={popTheSnackbar}
        newCategory={newCategory}
        ingredientTypes={ingredientTypes}
      />
    </Grid>
  </div>
);

NewCategory.propTypes = {
  history: PropTypes.object.isRequired,
  potentialSubIngredients: PropTypes.array.isRequired,
  ingredientTypes: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(() => {
  // const subscription = Meteor.subscribe('ingredients');
  const subscription2 = Meteor.subscribe('ingredientTypes');

  return {
    newCategory: true,
    loading: !subscription2.ready(), // || !subscription.ready(),
    // potentialSubIngredients: Ingredients.find().fetch(),
    ingredientTypes: IngredientTypes.find().fetch(),
  };
}, NewCategory);

