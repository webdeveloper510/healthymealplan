import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import ArrowBack from 'material-ui-icons/ArrowBack';

import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import IngredientEditor from '../../components/IngredientEditor/IngredientEditor';

const NewIngredient = ({ history }) => (
  <div>
    <AuthenticatedSideNav history={history} />,
    <Grid container className="NewIngredient SideContent" style={{ padding: '20px' }} spacing={8}>
      <Grid item xs={12} style={{ color: '#333333', padding: '20px' }}>

        <Link to="/ingredients/">
          <Typography type="subheading" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}><ArrowBack /> Ingredients</Typography>
        </Link>

        <Typography type="headline">New Ingredient</Typography>
        <IngredientEditor history={history} />
      </Grid>
    </Grid>
  </div>
);

NewIngredient.propTypes = {
  history: PropTypes.object.isRequired,
};

export default NewIngredient;
