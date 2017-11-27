import React from "react";
import PropTypes from "prop-types";

import { createContainer } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

import Grid from "material-ui/Grid";

import Ingredients from "../../../api/Ingredients/Ingredients";
import Instructions from "../../../api/Instructions/Instructions";

import PlateEditor from "../../components/PlateEditor/PlateEditor";

const NewPlate = ({
  history,
  potentialSubIngredients,
  newPlate,
  popTheSnackbar,
  instructions
}) => (
  <div>
    <Grid
      container
      className="NewIngredient SideContent SideContent--spacer-2x--horizontal"
    >
      <PlateEditor
        history={history}
        potentialSubIngredients={potentialSubIngredients}
        popTheSnackbar={popTheSnackbar}
        newPlate={newPlate}
        instructions={instructions}
      />
    </Grid>
  </div>
);

NewPlate.propTypes = {
  history: PropTypes.object.isRequired,
  potentialSubIngredients: PropTypes.array.isRequired,
  instructions: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired
};

export default createContainer(() => {
  const subscription = Meteor.subscribe("ingredients");
  const subscription2 = Meteor.subscribe("ingredientTypes");
  const subscription3 = Meteor.subscribe("instructions");

  return {
    newPlate: true,
    loading:
      !subscription.ready() && !subscription2.ready() && !subscription3.ready(),
    potentialSubIngredients: Ingredients.find().fetch(),
    instructions: Instructions.find().fetch()
    // ingredientTypes: IngredientTypes.find().fetch(),
  };
}, NewPlate);
