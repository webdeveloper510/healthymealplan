import React from 'react';
import PropTypes from 'prop-types';

import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Ingredients from '../../../api/Ingredients/Ingredients';
import MealPresets from '../../../api/MealPresets/MealPresets';

import MealPresetEditor from '../../components/MealPresetEditor/MealPresetEditor';
import Loading from '../../components/Loading/Loading';

const NewMealPreset = ({ history, newPreset, popTheSnackbar }) => loading ? (
  <Loading />
) : (
  <div>
    <Grid container className="NewMealPreset SideContent SideContent--spacer-2x--horizontal">
      <MealPresetEditor
        history={history}
        popTheSnackbar={popTheSnackbar}
        newPreset
      />
    </Grid>
  </div>
);

NewMealPreset.propTypes = {
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('mealpresets');
  const subscription2 = Meteor.subscribe('ingredientTypes');

  return {
    loading: !subscription2.ready() && !subscription.ready(),
    mealPresets: MealPresets.find().fetch(),
  };
})(NewMealPreset);

