import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';

const AuthenticatedNavigation = ({ name, history }) => (
  <div>
    <Nav pullRight>
      <Link to="/ingredients">Ingredients</Link>
      <Link to="/types">Types</Link>
      <NavDropdown title={name} id="user-nav-dropdown">
        <LinkContainer to="/profile">
          <NavItem href="/profile">Profile</NavItem>
        </LinkContainer>
        <MenuItem divider />
        <MenuItem onClick={() => history.push('/logout')}>Logout</MenuItem>
      </NavDropdown>
    </Nav>
  </div>
);

AuthenticatedNavigation.propTypes = {
  name: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(AuthenticatedNavigation);
