import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Categories from '../../../api/Categories/Categories';
import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';

import RestrictionEditor from '../../components/RestrictionEditor/RestrictionEditor';

const NewRestriction = ({ history, ingredientTypes, categories, newRestriction, popTheSnackbar }) => (
  <div>
    <Grid container className="NewRestriction SideContent SideContent--spacer-2x--horizontal">
      <RestrictionEditor
        history={history}
        popTheSnackbar={popTheSnackbar}
        newRestriction={newRestriction}
        ingredientTypes={ingredientTypes}
        categories={categories}
      />
    </Grid>
  </div>
);

NewRestriction.propTypes = {
  history: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  ingredientTypes: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  newRestriction: PropTypes.bool.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('categories');
  const subscription2 = Meteor.subscribe('ingredientTypes');

  return {
    newRestriction: true,
    loading: !subscription2.ready() && !subscription.ready(),
    categories: Categories.find().fetch(),
    ingredientTypes: IngredientTypes.find().fetch(),
  };
}, NewRestriction);

