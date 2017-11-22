import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';


import CustomerEditor from '../../components/CustomerEditor/CustomerEditor';

const NewCustomer = ({ history, ingredientTypes, potentialSubIngredients, newCategory, popTheSnackbar }) => (
  <div>
    <Grid container className="NewCustomer SideContent SideContent--spacer-2x--horizontal">
      <CustomerEditor
        history={history}
        popTheSnackbar={popTheSnackbar}
        newCategory={newCategory}
      />
    </Grid>
  </div>
);

NewCustomer.propTypes = {
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(() =>
  // const subscription = Meteor.subscribe('ingredients');

  ({
    newCategory: true,
    // loading: !subscription2.ready(), // || !subscription.ready(),
    // potentialSubIngredients: Ingredients.find().fetch(),
    // ingredientTypes: IngredientTypes.find().fetch(),
  })
  , NewCustomer);

