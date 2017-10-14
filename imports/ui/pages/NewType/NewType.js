import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Grid from 'material-ui/Grid';

import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import TypeEditor from '../../components/TypeEditor/TypeEditor';

const NewType = ({ history, popTheSnackbar }) => (
  <div>
    <Grid container className="NewType SideContent SideContent--spacer-2x--horizontal">
      <TypeEditor popTheSnackbar={popTheSnackbar} history={history} />
    </Grid>
  </div>
);

NewType.propTypes = {
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default NewType;
