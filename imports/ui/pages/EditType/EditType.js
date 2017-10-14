import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Grid from 'material-ui/Grid';

import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';
import TypeEditor from '../../components/TypeEditor/TypeEditor';
import NotFound from '../NotFound/NotFound';
import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';

const EditType = ({ ingredientType, history, popTheSnackbar }) => (ingredientType ? (
  <div>
    <Grid container className="EditType SideContent SideContent--spacer-2x--horizontal">
      <TypeEditor ingredientType={ingredientType} popTheSnackbar={popTheSnackbar} history={history} />
    </Grid>
  </div>
) : <NotFound />);

EditType.defaultProps = {
  ingredientType: null,
};

EditType.propTypes = {
  ingredientType: PropTypes.object,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const ingredientTypeId = match.params._id;
  const subscription = Meteor.subscribe('ingredientTypes.view', ingredientTypeId);

  return {
    loading: !subscription.ready(),
    ingredientType: IngredientTypes.findOne(ingredientTypeId),
  };
}, EditType);
