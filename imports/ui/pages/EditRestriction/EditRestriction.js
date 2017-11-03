import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Categories from '../../../api/Categories/Categories';
import Restrictions from '../../../api/Restrictions/Restrictions';
import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';

import RestrictionEditor from '../../components/RestrictionEditor/RestrictionEditor';

import NotFound from '../NotFound/NotFound';

const EditRestriction = ({ restriction, history, categories, ingredientTypes, popTheSnackbar, loading }) => (restriction ? (
  <div>
    <Grid container className="EditRestriction SideContent SideContent--spacer-2x--horizontal">
      <RestrictionEditor
        restriction={restriction}
        categories={categories}
        popTheSnackbar={popTheSnackbar}
        ingredientTypes={ingredientTypes}
        history={history}
        newRestriction={false}
        loading={loading}
      />
    </Grid>
  </div>
) : <NotFound />);

EditRestriction.defaultProps = {
  restriction: null,
};

EditRestriction.propTypes = {
  restriction: PropTypes.object,
  history: PropTypes.object.isRequired,
  ingredientTypes: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default createContainer(({ match }) => {
  const restrictionId = match.params._id;
  const subscription = Meteor.subscribe('restrictions.view', restrictionId);
  const subscription2 = Meteor.subscribe('ingredientTypes');
  const subscription3 = Meteor.subscribe('categories');

  return {
    loading: !subscription.ready() && !subscription2.ready() && !subscription3.ready(),
    restriction: Restrictions.findOne(restrictionId),
    categories: Categories.find().fetch(),
    ingredientTypes: IngredientTypes.find().fetch(),
  };
}, EditRestriction);
