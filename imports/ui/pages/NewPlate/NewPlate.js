import React from "react";
import PropTypes from "prop-types";

import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

import Grid from "material-ui/Grid";

import Ingredients from "../../../api/Ingredients/Ingredients";
import Instructions from "../../../api/Instructions/Instructions";
import Plates from "../../../api/Plates/Plates";

import PlateEditor from "../../components/PlateEditor/PlateEditor";

const NewPlate = ({
  history,
  newPlate,
  potentialSubIngredients,
  potentialPlates,
  popTheSnackbar,
  instructions,
  loading,
}) => (
  <div>
    <Grid
      container
      className="NewIngredient SideContent SideContent--spacer-2x--horizontal"
    >
      <PlateEditor
        history={history}
        potentialSubIngredients={potentialSubIngredients}
        potentialPlates={potentialPlates}
        popTheSnackbar={popTheSnackbar}
        newPlate={newPlate}
        instructions={instructions}
        loading={loading}
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

export default withTracker(() => {
  const subscription = Meteor.subscribe("ingredientsWithoutTypeJoin", {}, {});
  // const subscription2 = Meteor.subscribe("ingredientTypes");
  const subscription3 = Meteor.subscribe("instructions");
  const subscription4 = Meteor.subscribe("plates", {}, {});

  return {
    newPlate: true,
    loading:
      !subscription.ready() && !subscription3.ready() && !subscription4.ready(),
    potentialSubIngredients: Ingredients.find().fetch(),
    potentialPlates: Plates.find().fetch(),
    instructions: Instructions.find().fetch(),
  };
})(NewPlate);
