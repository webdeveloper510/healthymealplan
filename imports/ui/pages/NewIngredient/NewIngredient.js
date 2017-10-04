import React from 'react';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';

import IngredientEditor from '../../components/IngredientEditor/IngredientEditor';

const NewIngredient = ({ history }) => (
  <Grid container className="NewIngredient" style={{ padding: '20px' }} spacing={8}>
    <Grid item xs={12} style={{ color: '#333333', padding: '20px' }}>
      <h4 className="page-header">New Ingredient</h4>
      <IngredientEditor history={history} />
    </Grid>
  </Grid>
);

NewIngredient.propTypes = {
  history: PropTypes.object.isRequired,
};

export default NewIngredient;
