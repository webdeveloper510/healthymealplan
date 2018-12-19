import React from 'react';
import PropTypes from 'prop-types';

import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Plates from '../../../api/Plates/Plates';
import Meals from '../../../api/Meals/Meals';
import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import MealPresets from '../../../api/MealPresets/MealPresets';

import MealPresetEditor from '../../components/MealPresetEditor/MealPresetEditor';
import Loading from '../../components/Loading/Loading';

const NewMealPreset = ({ history, loading, popTheSnackbar, lifestyles, plates, meals, presets }) => loading ? (
  <Loading />
) : (
    <div>
      <Grid container className="NewMealPreset SideContent SideContent--spacer-2x--horizontal">
        <MealPresetEditor
          loading={loading}
          history={history}
          popTheSnackbar={popTheSnackbar}
          newPreset
          lifestyles={lifestyles}
          presets={presets}
          meals={meals}
          plates={plates}
        />
      </Grid>
    </div>
  );

NewMealPreset.propTypes = {
  loading: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('mealpresets');
  const subscription2 = Meteor.subscribe('Meals');
  const subscription3 = Meteor.subscribe('lifestyles');
  const subscription4 = Meteor.subscribe('plates', {}, {});

  return {
    loading: !subscription4.ready() && !subscription3.ready() && !subscription2.ready() && !subscription.ready(),
    presets: MealPresets.find().fetch(),
    plates: Plates.find().fetch(),
    meals: Meals.find().fetch(),
    lifestyles: Lifestyles.find().fetch(),
  };
})(NewMealPreset);

