import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Ingredients from '../../../api/Ingredients/Ingredients';
import Plates from '../../../api/Plates/Plates';

import PlateEditor from '../../components/PlateEditor/PlateEditor';

import NotFound from '../NotFound/NotFound';

const EditPlate = ({ plate, history, potentialSubIngredients, popTheSnackbar, newPlate }) => (plate ? (
  <div>
    <Grid container className="EditPlate SideContent SideContent--spacer-2x--horizontal">
      <PlateEditor
        newPlate={newPlate}
        plate={plate}
        potentialSubIngredients={potentialSubIngredients}
        popTheSnackbar={popTheSnackbar}
        history={history}
      />
    </Grid>
  </div>
) : <NotFound />);

EditPlate.defaultProps = {
  plate: null,
};

EditPlate.propTypes = {
  plate: PropTypes.object,
  history: PropTypes.object.isRequired,
  potentialSubIngredients: PropTypes.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const plateId = match.params._id;
  const subscription = Meteor.subscribe('ingredients');
  const subscription2 = Meteor.subscribe('plates.view', plateId);

  return {
    newPlate: false,
    loading: !subscription.ready() || !subscription2.ready(),
    plate: Plates.findOne(plateId),
    potentialSubIngredients: Ingredients.find().fetch(),
  };
}, EditPlate);
