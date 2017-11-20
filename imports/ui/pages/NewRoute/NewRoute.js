import React from 'react';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';

import RouteEditor from '../../components/RouteEditor/RouteEditor';

const NewRoute = ({ history, popTheSnackbar, newRoute }) => (
  <div>
    <Grid container className="NewRoute SideContent SideContent--spacer-2x--horizontal">
      <RouteEditor newRoute={true} popTheSnackbar={popTheSnackbar} history={history} />
    </Grid>
  </div>
);

NewRoute.propTypes = {
  newRoute: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default NewRoute;
