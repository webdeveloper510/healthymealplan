import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import InstructionsCollection from "../../../api/Instructions/Instructions";

import InstructionEditor from '../../components/InstructionEditor/InstructionEditor';

import NotFound from '../NotFound/NotFound';

const EditInstruction = ({ instruction, history, newInstruction, popTheSnackbar }) => (instruction ? (
  <div>
    <Grid container className="EditInstruction SideContent SideContent--spacer-2x--horizontal">
      <InstructionEditor
        instruction={instruction}
        popTheSnackbar={popTheSnackbar}
        history={history}
        newInstruction={newInstruction}
      />
    </Grid>
  </div>
) : <NotFound />);

EditInstruction.defaultProps = {
  ingredient: null,
};

EditInstruction.propTypes = {
  instruction: PropTypes.object,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const instructionId = match.params._id;
  const subscription = Meteor.subscribe('instructions.view', instructionId);

  return {
    newInstruction: false,
    loading: !subscription.ready() ,
    instruction: InstructionsCollection.findOne(instructionId),
  };
}, EditInstruction);
