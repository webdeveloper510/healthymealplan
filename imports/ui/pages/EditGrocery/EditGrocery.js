import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Containers from 'meteor/jivanysh:react-list-container';

import Grid from 'material-ui/Grid';

import Groceries from '../../../api/Groceries/Groceries';

import GroceryEditor from '../../components/GroceryEditor/GroceryEditor';

import NotFound from '../NotFound/NotFound';

const DocumentContainer = Containers.DocumentContainer;

const EditGrocery = ({
  plate,
  history,
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
          collection={Groceries}
          selector={{ _id: match.params._id }}
        >
          <GroceryEditor
            loading={loading}
            newPlate={newPlate}
            plate={plate}
            popTheSnackbar={popTheSnackbar}
            history={history}
          />
        </DocumentContainer>
      </Grid>
    </div>
  ) : (
    <NotFound />
  ));

EditGrocery.defaultProps = {
  plate: null,
};

EditGrocery.propTypes = {
  plate: PropTypes.object,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const groceryId = match.params._id;
  const subscription = Meteor.subscribe('groceries.view', groceryId);

  return {
    newPlate: false,
    loading:
      !subscription.ready(),
    plate: Groceries.findOne(groceryId),
    match,
  };
}, EditGrocery);
