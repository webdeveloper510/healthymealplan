import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link, NavLink } from 'react-router-dom';
import Button from 'material-ui/Button';
import { LinkContainer } from 'react-router-bootstrap';
// import { Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';

import HomeIcon from 'material-ui-icons/Home';
import KitchenIcon from 'material-ui-icons/Kitchen';
import OrderIcon from 'material-ui-icons/AttachMoney';
import MealsIcon from 'material-ui-icons/LocalDining';
import IngredientsIcon from 'material-ui-icons/Layers';
import TypesIcon from 'material-ui-icons/List';
import LifestylesIcon from 'material-ui-icons/FitnessCenter';
import RestrictionsIcon from 'material-ui-icons/DoNotDisturbAlt';
import DeliveryIcon from 'material-ui-icons/LocalShipping';
import DirectionsIcon from 'material-ui-icons/Directions';
import RoutesIcon from 'material-ui-icons/MyLocation';
import CustomersIcon from 'material-ui-icons/People';
import SettingsIcon from 'material-ui-icons/Settings';
import TeamIcon from 'material-ui-icons/SupervisorAccount';

import Collapse from 'material-ui/transitions/Collapse';

import { Meteor } from 'meteor/meteor';

import './AuthenticatedSideNav.scss';


class AuthenticatedSideNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      settingsOpen: false,
      kitchenOpen: false,
      deliveryOpen: false,
    };
  }

  handleToggle() {
    this.setState({
      open: !this.state.open,
    });
  }

  handleToggleSettings() {
    this.setState({
      settingsOpen: !this.state.settingsOpen,
    });
  }

  handleToggleKitchen() {
    this.setState({
      kitchenOpen: !this.state.kitchenOpen,
    });
  }

  handleToggleDelivery() {
    this.setState({
      deliveryOpen: !this.state.deliveryOpen,
    });
  }

  handleNestedListToggle(item) {
    this.setState({
      open: item.state.open,
    });
  }

  isListItemActive(expected) {
    return this.props.location.pathname;

    if (expected.indexOf(this.props.location.pathname) !== -1) {
      return 'list-item-active';
    }

    return '';

    // switch (currentPath) {
    //   case '/':
    //     return 'list-item-active';

    //   case '/ingredients':
    //     return 'list-item-active';

    //   case '/ingredients/new':
    //     return 'list-item-active';

    //   case '/ingredients/':
    //     return 'list-item-active';

    //   default:
    //     return '';
    // }
  }

  render() {
    const { history } = this.props;

    console.log(this.props.location);

    return (
      <div className="page-container__side-nav">

        <List>
          <NavLink exact to="/">
            <ListItem button>
              <ListItemIcon>
                <HomeIcon className="side-nav-icon" />
              </ListItemIcon>
              <ListItemText className="subheading" primary="Home" />
            </ListItem>
          </NavLink>


          <ListItem button className={this.isListItemActive(['/ingredients', '/types'])} onClick={this.handleToggleKitchen.bind(this)}>

            <ListItemIcon>
              <KitchenIcon className="side-nav-icon" />
            </ListItemIcon>
            <ListItemText className="subheading" primary="Kitchen" />
            {this.state.kitchenOpen ? <ExpandLess /> : <ExpandMore />}

          </ListItem>

          <Collapse in={this.state.kitchenOpen} transitionDuration="auto" unmountOnExit>
            {/* <ListItem className="padding-left-nested-item" button onClick={() => history.push('/orders')}>
              <ListItemIcon>
                <OrderIcon className="side-nav-icon" />
              </ListItemIcon>
              <ListItemText className="subheading" primary="Orders" />
            </ListItem>

            <ListItem className="padding-left-nested-item" button onClick={() => history.push('/meals')}>
              <ListItemIcon>
                <MealsIcon className="side-nav-icon" />
              </ListItemIcon>
              <ListItemText className="subheading" primary="Meals" />
            </ListItem> */}
            <NavLink to="/ingredients">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon >
                  <IngredientsIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Ingredients" />
              </ListItem>
            </NavLink>

            <NavLink to="/types">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <TypesIcon className="side-nav-icon" />
                </ListItemIcon>

                <ListItemText className="subheading" primary="Types" />
              </ListItem>
            </NavLink>
            {/* 
            <ListItem className="padding-left-nested-item" button onClick={() => history.push('/lifestyles')}>
              <ListItemIcon>
                <LifestylesIcon className="side-nav-icon" />
              </ListItemIcon>
              <ListItemText className="subheading" primary="Lifestyles" />
            </ListItem>

            <ListItem className="padding-left-nested-item" button onClick={() => history.push('/restrictions')}>
              <ListItemIcon>
                <RestrictionsIcon className="side-nav-icon" />
              </ListItemIcon>
              <ListItemText className="subheading" primary="Restrictions" />
            </ListItem> */}

          </Collapse>

          {/* <ListItem button onClick={this.handleToggleDelivery.bind(this)}>

            <ListItemIcon>
              <DeliveryIcon className="side-nav-icon" />
            </ListItemIcon>

            <ListItemText className="subheading" primary="Delivery" />
            {this.state.deliveryOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse in={this.state.deliveryOpen} transitionDuration="auto" unmountOnExit>

            <ListItem className="padding-left-nested-item" button onClick={() => history.push('/directions')}>
              <ListItemIcon>
                <DirectionsIcon className="side-nav-icon" />
              </ListItemIcon>
              <ListItemText className="subheading" primary="Directions" />
            </ListItem>

            <ListItem className="padding-left-nested-item" button onClick={() => history.push('/routes')}>
              <ListItemIcon>
                <RoutesIcon className="side-nav-icon" />
              </ListItemIcon>
              <ListItemText className="subheading" primary="Routes" />
            </ListItem>

          </Collapse> */}
          {/* 
          <ListItem button onClick={() => history.push('/customers')}>
            <ListItemIcon>
              <CustomersIcon className="side-nav-icon" />
            </ListItemIcon>

            <ListItemText className="subheading" primary="Customers" />
          </ListItem>


          <ListItem button onClick={this.handleToggleSettings.bind(this)}>
            <ListItemIcon>
              <SettingsIcon className="side-nav-icon" />
            </ListItemIcon>

            <ListItemText className="subheading" primary="Settings" />
            {this.state.settingsOpen ? <ExpandLess /> : <ExpandMore />}

          </ListItem>

          <Collapse in={this.state.settingsOpen} transitionDuration="auto" unmountOnExit>

            <ListItem className="padding-left-nested-item" button onClick={() => history.push('/team')}>
              <ListItemIcon>
                <TeamIcon className="side-nav-icon" />
              </ListItemIcon>
              <ListItemText className="subheading" primary="Team" />
            </ListItem>

          </Collapse> */}

        </List>
      </div>
    );
  }
}

AuthenticatedSideNav.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(AuthenticatedSideNav);
