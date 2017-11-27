import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';


import InstructionEditor from '../../components/InstructionEditor/InstructionEditor';

const NewInstruction = ({ history, newInstruction, popTheSnackbar }) => (
  <div>
    <Grid container className="NewInstruction SideContent SideContent--spacer-2x--horizontal">
      <InstructionEditor history={history} popTheSnackbar={popTheSnackbar} newInstruction={newInstruction}  />
    </Grid>
  </div>
);

NewInstruction.propTypes = {
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(() => {

  return {
    newInstruction: true,
  };
}, NewInstruction);

