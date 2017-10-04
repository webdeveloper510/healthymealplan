import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import Button from 'material-ui/Button';
import { LinkContainer } from 'react-router-bootstrap';
// import { Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import Collapse from 'material-ui/transitions/Collapse';

import { Meteor } from 'meteor/meteor';

import './AuthenticatedSideNav.scss';

class AuthenticatedSideNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  handleToggle() {
    this.setState({
      open: !this.state.open,
    });
  }

  handleNestedListToggle(item) {
    this.setState({
      open: item.state.open,
    });
  }

  render() {
    const { history } = this.props;

    return (
      <div className="page-container__side-nav">
        <List>
          <ListItem button>
            <ListItemText primary="Customers" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Chefs" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Drivers" />
          </ListItem>

          <ListItem button>
            <ListItemText primary="Deliveries" />
          </ListItem>

          <ListItem button onClick={this.handleToggle.bind(this)}>

            <ListItemText primary="Ingredients" />
            {this.state.open ? <ExpandLess /> : <ExpandMore />}

          </ListItem>

          <Collapse in={this.state.open} transitionDuration="auto" unmountOnExit>

            <Link to="/ingredients">
              <ListItem button>
                <ListItemText inset primary="Ingredients" />
              </ListItem>
            </Link>

            <Link to="/types">
              <ListItem button>
                <ListItemText inset primary="Types" />
              </ListItem>
            </Link>

          </Collapse>

        </List>
      </div>

      // <aside className="page-container__side-nav">
      //   <Nav pullRight>
      //     <Link to="/ingredients"><Button raised>Ingredients</Button></Link>
      //     <Link to="/types"><Button raised>Types</Button></Link>

      //     <NavDropdown title={name} id="user-nav-dropdown">
      //       <LinkContainer to="/profile">
      //         <NavItem href="/profile">Profile</NavItem>
      //       </LinkContainer>
      //       <MenuItem divider />
      //       <MenuItem onClick={() => history.push('/logout')}>Logout</MenuItem>
      //     </NavDropdown>
      //   </Nav>
      // </aside>
    );
  }
}

AuthenticatedSideNav.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(AuthenticatedSideNav);
