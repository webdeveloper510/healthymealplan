import React from "react";
import PropTypes from "prop-types";

import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import Containers from "meteor/jivanysh:react-list-container";

import Grid from "material-ui/Grid";

import Ingredients from "../../../api/Ingredients/Ingredients";
import Plates from "../../../api/Plates/Plates";
import InstructionsColl from "../../../api/Instructions/Instructions";

import PlateEditor from "../../components/PlateEditor/PlateEditor";
import Loading from "../../components/Loading/Loading";

import NotFound from "../NotFound/NotFound";

const DocumentContainer = Containers.DocumentContainer;

const EditPlate = ({
  plate,
  history,
  potentialPlates,
  potentialSubIngredients,
  popTheSnackbar,
  newPlate,
  match,
  instructions,
  loading
}) =>
  loading ? <Loading /> : !loading && plate ? (
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
          potentialPlates={potentialPlates}
          popTheSnackbar={popTheSnackbar}
          history={history}
        />
      </DocumentContainer>
    </Grid>
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

export default withTracker(({ match }) => {
  const plateId = match.params._id;
  const subscription = Meteor.subscribe("ingredientsWithoutTypeJoin", {}, {});
  const subscription2 = Meteor.subscribe("plates.view", plateId);
  const subscription3 = Meteor.subscribe("plates", {}, {});
  const subscription4 = Meteor.subscribe("instructions");

  return {
    newPlate: false,
    loading:
      !subscription.ready() &&
      !subscription2.ready() &&
      !subscription3.ready() &&
      !subscription4.ready(),
    plate: Plates.findOne(plateId),
    potentialPlates: Plates.find().fetch(),
    potentialSubIngredients: Ingredients.find().fetch(),
    match,
    instructions: InstructionsColl.find().fetch()
  };
  
})(EditPlate);
