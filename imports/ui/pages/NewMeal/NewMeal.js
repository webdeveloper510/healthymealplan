import React from 'react';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';

import MealEditor from '../../components/MealEditor/MealEditor';

const NewMeal = ({ history, popTheSnackbar, newMeal }) => (
  <div>
    <Grid container className="NewMeal SideContent SideContent--spacer-2x--horizontal">
      <MealEditor newMeal={true} popTheSnackbar={popTheSnackbar} history={history} />
    </Grid>
  </div>
);

NewMeal.propTypes = {
  newMeal: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default NewMeal;
