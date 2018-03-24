import React from "react";
import PropTypes from "prop-types";

import { createContainer } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import Containers from "meteor/utilities:react-list-container";

import Grid from "material-ui/Grid";

import Ingredients from "../../../api/Ingredients/Ingredients";
import Plates from "../../../api/Plates/Plates";
import PlateImages from "../../../api/PlateImages/PlateImages";
import InstructionsColl from "../../../api/Instructions/Instructions";

import PlateEditor from "../../components/PlateEditor/PlateEditor";

import NotFound from "../NotFound/NotFound";

const DocumentContainer = Containers.DocumentContainer;

const EditPlate = ({
  plate,
  history,
  potentialSubIngredients,
  popTheSnackbar,
  newPlate,
  match,
  instructions,
  loading
}) =>
  plate ? (
    <div>
      <Grid
        container
        className="EditPlate SideContent SideContent--spacer-2x--horizontal"
      >
        <DocumentContainer
          collection={Plates}
          joins={[
            {
              localProperty: "instructionId",
              collection: InstructionsColl,
              joinAs: "joinedInstruction"
            }
          ]}
          selector={{ _id: match.params._id }}
        >
          <PlateEditor
            loading={loading}
            newPlate={newPlate}
            plate={plate}
            instructions={instructions}
            potentialSubIngredients={potentialSubIngredients}
            popTheSnackbar={popTheSnackbar}
            history={history}
          />
        </DocumentContainer>
      </Grid>
    </div>
  ) : (
      <NotFound />
    );

EditPlate.defaultProps = {
  plate: null
};

EditPlate.propTypes = {
  plate: PropTypes.object,
  history: PropTypes.object.isRequired,
  potentialSubIngredients: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const plateId = match.params._id;
  const subscription = Meteor.subscribe("ingredients");
  const subscription2 = Meteor.subscribe("plates.view", plateId);
  const subscription4 = Meteor.subscribe("instructions");

  return {
    newPlate: false,
    loading:
      !subscription.ready() &&
      !subscription2.ready() &&
      !subscription4.ready(),
    plate: Plates.findOne(plateId),
    potentialSubIngredients: Ingredients.find().fetch(),
    match,
    instructions: InstructionsColl.find().fetch()
  };
}, EditPlate);
