import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Containers from 'meteor/utilities:react-list-container';

import Grid from 'material-ui/Grid';

import InstructionsColl from '../../../api/Instructions/Instructions';
import Ingredients from '../../../api/Ingredients/Ingredients';
import Sides from '../../../api/Sides/Sides';

import SideEditor from '../../components/SideEditor/SideEditor';

import NotFound from '../NotFound/NotFound';

const DocumentContainer = Containers.DocumentContainer;

const EditSide = ({
  plate,
  instructions,
  history,
  potentialSubIngredients,
  popTheSnackbar,
  newPlate,
  match,
  loading,
}) =>
  (plate ? (
    <div>
      <Grid
        container
        className="EditSide SideContent SideContent--spacer-2x--horizontal"
      >
        <DocumentContainer
          collection={Sides}
          joins={[
            {
              localProperty: 'instructionId',
              collection: InstructionsColl,
              joinAs: 'joinedInstruction',
            },
          ]}
          selector={{ _id: match.params._id }}
        >
          <SideEditor
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
  ));

EditSide.defaultProps = {
  plate: null,
};

EditSide.propTypes = {
  plate: PropTypes.object,
  history: PropTypes.object.isRequired,
  potentialSubIngredients: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const sideId = match.params._id;
  const subscription = Meteor.subscribe('ingredientsWithoutTypeJoin', {}, {});
  const subscription2 = Meteor.subscribe('sides.view', sideId);
  const subscription4 = Meteor.subscribe('instructions');

  return {
    newPlate: false,
    loading:
      !subscription.ready() &&
      !subscription2.ready() &&
      !subscription4.ready(),
    plate: Sides.findOne(sideId),
    potentialSubIngredients: Ingredients.find().fetch(),
    match,
    instructions: InstructionsColl.find().fetch(),
  };
}, EditSide);
