import React from "react";
import PropTypes from "prop-types";

import { createContainer } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

import Grid from "material-ui/Grid";
import Ingredients from "../../../api/Ingredients/Ingredients";
import IngredientTypes from "../../../api/IngredientTypes/IngredientTypes";

import CustomerEditor from "../../components/CustomerEditor/CustomerEditor";

const NewCustomer = ({
  history,
  ingredientTypes,
  potentialSubIngredients,
  newCategory,
  popTheSnackbar
}) => (
  <div>
    <Grid
      container
      className="NewCustomer SideContent SideContent--spacer-2x--horizontal"
    >
      <CustomerEditor
        ingredientTypes={ingredientTypes}
        potentialSubIngredients={potentialSubIngredients}
        history={history}
        popTheSnackbar={popTheSnackbar}
        newCategory={newCategory}
      />
    </Grid>
  </div>
);

NewCustomer.propTypes = {
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired
};

export default createContainer(() => {
  const subscription = Meteor.subscribe("ingredients");
  const subscription2 = Meteor.subscribe("ingredientTypes");

  return {
    loading: !subscription2.ready() || !subscription.ready(),
    potentialSubIngredients: Ingredients.find().fetch(),
    ingredientTypes: IngredientTypes.find().fetch()
  };
}, NewCustomer);
