import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Grid from 'material-ui/Grid';

import Routes from '../../../api/Routes/Routes';
import RouteEditor from '../../components/RouteEditor/RouteEditor';
import NotFound from '../NotFound/NotFound';

const EditRoute = ({ meal, newMeal, history, popTheSnackbar }) => (meal ? (
  <div>
    <Grid container className="EditRoute SideContent SideContent--spacer-2x--horizontal">
      <RouteEditor newMeal={newMeal} meal={meal} popTheSnackbar={popTheSnackbar} history={history} />
    </Grid>
  </div>
) : <NotFound />);

EditRoute.defaultProps = {
  meal: null,
};

EditRoute.propTypes = {
  meal: PropTypes.object, 
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const routeId = match.params._id;
  const subscription = Meteor.subscribe('routes.view', routeId);

  return {
    newMeal: false,
    loading: !subscription.ready(),
    meal: Routes.findOne(routeId),
  };
}, EditRoute);
