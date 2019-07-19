import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { Roles } from 'meteor/alanning:roles';

const Authenticated = ({ loggingIn, authenticated, component, path, exact, roles, user, ...rest }) => (
  <Route
    path={path}
    exact={exact}
    render={props => (
      authenticated && roles.join(' ').match(/(super-admin|chef|delivery|kitchen)/) ?
        (React.createElement(component, { ...props, ...rest, loggingIn, authenticated })) :
        authenticated && !roles.join(' ').match(/(super-admin|chef|delivery|kitchen)/) ? <Redirect to="/login" /> && Meteor.logout() :
          (<Redirect to="/login" />)
    )}
  />
);

Authenticated.propTypes = {
  loggingIn: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
};

export default Authenticated;
