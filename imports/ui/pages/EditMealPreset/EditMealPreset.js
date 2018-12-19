import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import MealPresets from '../../../api/MealPresets/MealPresets';
import Plates from '../../../api/Plates/Plates';
import Meals from '../../../api/Meals/Meals';
import Lifestyles from '../../../api/Lifestyles/Lifestyles';

import MealPresetEditor from '../../components/MealPresetEditor/MealPresetEditor';

import NotFound from '../NotFound/NotFound';

const EditMealPreset = ({ preset, loading, history, lifestyles, plates, meals, popTheSnackbar }) => (preset ? (
  <div>
    <Grid container className="EditMealPreset SideContent SideContent--spacer-2x--horizontal">
      <MealPresetEditor
        preset={preset}
        loading={loading}
        potentialSubIngredients={[]}
        popTheSnackbar={popTheSnackbar}
        lifestyles={lifestyles}
        plates={plates}
        meals={meals}
        history={history}
        newCategory={false}
      />
    </Grid>
  </div>
) : <NotFound />);

EditMealPreset.defaultProps = {
  preset: null,
};

EditMealPreset.propTypes = {
  preset: PropTypes.object,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const presetId = match.params._id;
  const subscription = Meteor.subscribe('mealpresets.view', presetId);
  const subscription2 = Meteor.subscribe('Meals');
  const subscription3 = Meteor.subscribe('lifestyles');
  const subscription4 = Meteor.subscribe('plates', {}, {});

  return {
    loading: !subscription4.ready() && !subscription3.ready() && !subscription2.ready() && !subscription.ready(),
    preset: MealPresets.findOne(presetId),
    plates: Plates.find().fetch(),
    meals: Meals.find().fetch(),
    lifestyles: Lifestyles.find().fetch(),
  };
}, EditMealPreset);
