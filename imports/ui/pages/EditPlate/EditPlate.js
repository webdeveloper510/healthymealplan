import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Containers from 'meteor/utilities:react-list-container';


import Grid from 'material-ui/Grid';

import Ingredients from '../../../api/Ingredients/Ingredients';
import Plates from '../../../api/Plates/Plates';
import PlateImages from '../../../api/PlateImages/PlateImages';

import PlateEditor from '../../components/PlateEditor/PlateEditor';

import NotFound from '../NotFound/NotFound';

const DocumentContainer = Containers.DocumentContainer;

const EditPlate = ({ plate, history, potentialSubIngredients, popTheSnackbar, newPlate, match }) => (plate ? (
  <div>
    <Grid container className="EditPlate SideContent SideContent--spacer-2x--horizontal">
      <DocumentContainer
        collection={Plates}
        joins={[{ localProperty: 'imageId',
          collection: PlateImages,
          joinAs: 'image' }]}
        selector={{ _id: match.params._id }}
      >
        <PlateEditor
          newPlate={newPlate}
          plate={plate}
          potentialSubIngredients={potentialSubIngredients}
          popTheSnackbar={popTheSnackbar}
          history={history}
        />
      </DocumentContainer>
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
  const subscription3 = Meteor.subscribe('plateImages.all', {}, {});

  return {
    newPlate: false,
    loading: !subscription.ready() || !subscription2.ready(),
    plate: Plates.findOne(plateId),
    potentialSubIngredients: Ingredients.find().fetch(),
    match,
  };
}, EditPlate);
