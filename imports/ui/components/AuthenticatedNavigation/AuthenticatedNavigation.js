import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import Button from 'material-ui/Button';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import { Meteor } from 'meteor/meteor';

class AuthenticatedNavigation extends Component {


  constructor(props) {
    super(props);
    this.state = {
      navopened: false,
    };
  }



  render() {
    const { name, history } = this.props;
    return (
      <div>
        <Nav pullRight>
          <Link to="/ingredients"><Button raised>Ingredients</Button></Link>
          <Link to="/types"><Button raised>Types</Button></Link>

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
  }
}

AuthenticatedNavigation.propTypes = {
  name: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(AuthenticatedNavigation);
