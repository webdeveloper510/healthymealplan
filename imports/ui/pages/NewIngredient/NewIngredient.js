import React from 'react';
import PropTypes from 'prop-types';

import Grid from 'material-ui/Grid';

import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import IngredientEditor from '../../components/IngredientEditor/IngredientEditor';

const NewIngredient = ({ history }) => (
  <div>
    <AuthenticatedSideNav history={history} />,
    <Grid container className="NewIngredient SideContent">
      <Grid item xs={12} style={{ color: '#333333' }}>
        <IngredientEditor history={history} />
      </Grid>
    </Grid>
  </div>
);

NewIngredient.propTypes = {
  history: PropTypes.object.isRequired,
};

export default NewIngredient;
