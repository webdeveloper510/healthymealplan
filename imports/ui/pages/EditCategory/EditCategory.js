import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Categories from '../../../api/Categories/Categories';
import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';

import CategoryEditor from '../../components/CategoryEditor/CategoryEditor';

import NotFound from '../NotFound/NotFound';

const EditCategory = ({ ingredient, history, ingredientTypes, popTheSnackbar }) => (ingredient ? (
  <div>
    <Grid container className="EditCategory SideContent SideContent--spacer-2x--horizontal">
      <CategoryEditor
        ingredient={ingredient}
        potentialSubIngredients={[]}
        popTheSnackbar={popTheSnackbar}
        ingredientTypes={ingredientTypes}
        history={history}
        newIngredient={false}
      />
    </Grid>
  </div>
) : <NotFound />);

EditCategory.defaultProps = {
  ingredient: null,
};

EditCategory.propTypes = {
  ingredient: PropTypes.object,
  history: PropTypes.object.isRequired,
  potentialSubIngredients: PropTypes.isRequired,
  ingredientTypes: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const categoryId = match.params._id;
  const subscription = Meteor.subscribe('categories');
  const subscription2 = Meteor.subscribe('ingredientTypes');

  return {
    loading: !subscription.ready() || !subscription2.ready(),
    ingredient: Categories.findOne(categoryId),
    allIngredients: Categories.find().fetch(),
    // potentialSubIngredients: Ingredients.find().fetch(),
    ingredientTypes: IngredientTypes.find().fetch(),
  };
}, EditCategory);
