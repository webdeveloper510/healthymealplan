import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import GroceryEditor from '../../components/GroceryEditor/GroceryEditor';

const NewGrocery = ({
  history,
  popTheSnackbar,
}) => (
  <div>
    <Grid
      container
      className="NewIngredient SideContent SideContent--spacer-2x--horizontal"
    >
      <GroceryEditor
        history={history}
        popTheSnackbar={popTheSnackbar}
        newPlate
      />
    </Grid>
  </div>
);

NewGrocery.propTypes = {
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(() => {
  return {
    loading: false,
  };
}, NewGrocery);
