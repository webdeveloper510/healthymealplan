import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Grid from 'material-ui/Grid';

import Meals from '../../../api/Meals/Meals';
import MealEditor from '../../components/MealEditor/MealEditor';
import NotFound from '../NotFound/NotFound';

const EditMeal = ({ meal, newMeal, history, popTheSnackbar }) => (meal ? (
  <div>
    <Grid container className="EditMeal SideContent SideContent--spacer-2x--horizontal">
      <MealEditor newMeal={newMeal} meal={meal} popTheSnackbar={popTheSnackbar} history={history} />
    </Grid>
  </div>
) : <NotFound />);

EditMeal.defaultProps = {
  meal: null,
};

EditMeal.propTypes = {
  meal: PropTypes.object,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const mealId = match.params._id;
  const subscription = Meteor.subscribe('meals.view', mealId);

  return {
    newMeal: false,
    loading: !subscription.ready(),
    meal: Meals.findOne(mealId),
  };
}, EditMeal);
