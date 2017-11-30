import React from "react";
import PropTypes from "prop-types";

import { createContainer } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

import Grid from "material-ui/Grid";
import Ingredients from "../../../api/Ingredients/Ingredients";
import IngredientTypes from "../../../api/IngredientTypes/IngredientTypes";
import Lifestyles from "../../../api/Lifestyles/Lifestyles";
import Restrictions from "../../../api/Restrictions/Restrictions";

import CustomerEditor from "../../components/CustomerEditor/CustomerEditor";

const NewCustomer = ({
  history,
  ingredientTypes,
  potentialSubIngredients,
  newCategory,
  popTheSnackbar,
  lifestyles,
  restrictions
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
        lifestyles={lifestyles}
        restrictions={restrictions}
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
  const subscription3 = Meteor.subscribe("lifestyles");
  const subscription4 = Meteor.subscribe("restrictions");

  return {
    loading: !subscription2.ready() || !subscription.ready(),
    potentialSubIngredients: Ingredients.find().fetch(),
    ingredientTypes: IngredientTypes.find().fetch(),
    lifestyles: Lifestyles.find().fetch(),
    restrictions: Restrictions.find().fetch()
  };
}, NewCustomer);
