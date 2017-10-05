import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import Button from 'material-ui/Button';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav, NavItem, NavDropdown } from 'react-bootstrap';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';
import Typography from 'material-ui/Typography';

import MoreVertIcon from 'material-ui-icons/MoreVert';
import { Meteor } from 'meteor/meteor';

const ITEM_HEIGHT = 48;

class AuthenticatedNavigation extends Component {


  constructor(props) {
    super(props);
    this.state = {
      navopened: false,
      anchorEl: null,
      open: false,
    };
  }

  handleClick = event => {
    this.setState({ open: true, anchorEl: event.currentTarget });
  };

  handleRequestClose = () => {
    this.setState({ open: false });
  };


  render() {
    const { name, history } = this.props;
    return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        <Typography style={{ 'color': "#FFF" }}>

          {this.props.emailAddress}

        </Typography>
        <IconButton
          aria-label="More"
          aria-owns={this.state.open ? 'long-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <MoreVertIcon color="#FFFFFF" />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onRequestClose={this.handleRequestClose}
          PaperProps={{
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: 200,
            },
          }}
        >
            <MenuItem key={1}  onClick={() => { (history.push('/profile') && this.setState({open: false})) } }>Profile</MenuItem>
            <MenuItem key={2}  onClick={() => history.push('/logout')}>Logout</MenuItem>
            <MenuItem key={3}  onClick={() => history.push('/ingredients')}>Ingredients</MenuItem>
            <MenuItem key={4}  onClick={() => history.push('/types')}>Types</MenuItem>

        </Menu>
      </div>
    );
  }
}


AuthenticatedNavigation.propTypes = {
  name: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(AuthenticatedNavigation);
