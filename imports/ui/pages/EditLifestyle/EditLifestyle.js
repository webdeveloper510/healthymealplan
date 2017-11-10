import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Categories from '../../../api/Categories/Categories';
import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';

import LifestyleEditor from '../../components/LifestyleEditor/LifestyleEditor';

import NotFound from '../NotFound/NotFound';

const EditLifestyle = ({ category, history, ingredientTypes, popTheSnackbar }) => (category ? (
  <div>
    <Grid container className="EditLifestyle SideContent SideContent--spacer-2x--horizontal">
      <LifestyleEditor
        category={category}
        potentialSubIngredients={[]}
        popTheSnackbar={popTheSnackbar}
        ingredientTypes={ingredientTypes}
        history={history}
        newCategory={false}
      />
    </Grid>
  </div>
) : <NotFound />);

EditLifestyle.defaultProps = {
  category: null,
};

EditLifestyle.propTypes = {
  category: PropTypes.object,
  history: PropTypes.object.isRequired,
  // potentialSubIngredients: PropTypes.isRequired,
  ingredientTypes: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const categoryId = match.params._id;
  const subscription = Meteor.subscribe('categories.view', categoryId);
  const subscription2 = Meteor.subscribe('ingredientTypes');

  // let categorySubReady = new ReactiveVar(false);

  // if(subscription.ready()){
  //   currentIngredientTypes = 
  // }

  return {
    loading: !subscription.ready() && !subscription2.ready(),
    category: Categories.findOne(categoryId),
    // allIngredients: Categories.find().fetch(),
    // potentialSubIngredients: Ingredients.find().fetch(),
    // currentIngredientTypes: IngredientTypes.find({_id: {$in: ingredient.types }}),
    ingredientTypes: IngredientTypes.find().fetch(),
  };
}, EditLifestyle);
