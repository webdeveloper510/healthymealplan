import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Grid from 'material-ui/Grid';

import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import TypeEditor from '../../components/TypeEditor/TypeEditor';

const NewType = ({ history }) => (
  <div>
    <AuthenticatedSideNav history={history} />,
    <Grid container className="NewType SideContent">
      <Grid item xs={12} style={{ color: '#333333' }}>
        <TypeEditor history={history} />
      </Grid>
    </Grid>
  </div>
);

NewType.propTypes = {
  history: PropTypes.object.isRequired,
};

export default NewType;
