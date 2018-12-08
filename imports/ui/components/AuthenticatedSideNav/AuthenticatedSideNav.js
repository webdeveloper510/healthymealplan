import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link, NavLink } from 'react-router-dom';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';

import HomeIcon from 'material-ui-icons/Home';
import KitchenIcon from 'material-ui-icons/Kitchen';
import OrderIcon from 'material-ui-icons/AttachMoney';
import MealsIcon from 'material-ui-icons/LocalDining';
import MealPlannerIcon from 'material-ui-icons/DateRange';

import IngredientsIcon from 'material-ui-icons/Layers';
import TypesIcon from 'material-ui-icons/List';
import FolderIcon from 'material-ui-icons/Folder';

import LifestylesIcon from 'material-ui-icons/FitnessCenter';
import PlatingIcon from 'material-ui-icons/RoomService';
import SubscriptionsIcon from 'material-ui-icons/CreditCard';
import ReceiptIcon from 'material-ui-icons/Receipt';
import DiscountsIcon from 'material-ui-icons/LocalOffer';

import RestrictionsIcon from 'material-ui-icons/DoNotDisturbAlt';
import PlatesIcon from 'material-ui-icons/LocalPizza';
import SidesIcon from 'material-ui-icons/LibraryAdd';
import InstructionsIcon from 'material-ui-icons/Note';

import DeliveryIcon from 'material-ui-icons/LocalShipping';
import DirectionsIcon from 'material-ui-icons/Directions';
import RoutesIcon from 'material-ui-icons/MyLocation';
import DriversIcon from 'material-ui-icons/DriveEta';

import CustomersIcon from 'material-ui-icons/Person';
import SettingsIcon from 'material-ui-icons/Settings';
import TeamIcon from 'material-ui-icons/SupervisorAccount';
import EditIcon from 'material-ui-icons/Edit';

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
      ordersOpen: false,
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

  handleToggleOrder() {
    this.setState({
      ordersOpen: !this.state.ordersOpen,
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

    return (
      <div className="page-container__side-nav">
        <List style={{ paddingTop: '0 !important' }}>
          <NavLink onClick={this.props.handleDrawerToggle} exact to="/">
            <ListItem button>
              <ListItemIcon>
                <HomeIcon className="side-nav-icon" />
              </ListItemIcon>
              <ListItemText className="subheading" primary="Home" />
            </ListItem>
          </NavLink>

          <ListItem button onClick={this.handleToggleOrder.bind(this)}>
            <ListItemIcon>
              <OrderIcon className="side-nav-icon" />
            </ListItemIcon>

            <ListItemText className="subheading" primary="Orders" />
            {this.state.ordersOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse
            in={this.state.ordersOpen}
            transitionDuration="auto"
            unmountOnExit
          >
            <NavLink onClick={this.props.handleDrawerToggle} to="/lifestyles">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <LifestylesIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Lifestyles" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/plating">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <PlatingIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Plating" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/invoices">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <SubscriptionsIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Invoices" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/billing">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <ReceiptIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Billing" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/discounts">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <DiscountsIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Discounts" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/gift-cards">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" className="side-nav-icon" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                    <path d="M0 0h24v24H0z" fill="none"/>
                  </svg>
                </ListItemIcon>
                <ListItemText className="subheading" primary="Gift Cards" />
              </ListItem>
            </NavLink>

          </Collapse>

          <NavLink onClick={this.props.handleDrawerToggle} to="/customers">
            <ListItem button>
              <ListItemIcon>
                <CustomersIcon className="side-nav-icon" />
              </ListItemIcon>
              <ListItemText className="subheading" primary="Customers" />
            </ListItem>
          </NavLink>

          <ListItem button onClick={this.handleToggleKitchen.bind(this)}>
            <ListItemIcon>
              <KitchenIcon className="side-nav-icon" />
            </ListItemIcon>
            <ListItemText className="subheading" primary="Kitchen" />
            {this.state.kitchenOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse
            in={this.state.kitchenOpen}
            transitionDuration="auto"
            unmountOnExit
          >
            <ListItem className="padding-left-nested-item" button onClick={() => history.push('/meal-planner')}>
              <ListItemIcon>
                <MealPlannerIcon className="side-nav-icon" />
              </ListItemIcon>
              <ListItemText className="subheading" primary="Meal Planner" />
            </ListItem>

            <NavLink onClick={this.props.handleDrawerToggle} to="/plates">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <PlatesIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Mains" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/sides">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <SidesIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Sides" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/instructions">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <InstructionsIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Instructions" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/meals">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <MealsIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Meals" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/ingredients">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <IngredientsIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Ingredients" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/types">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <TypesIcon className="side-nav-icon" />
                </ListItemIcon>

                <ListItemText className="subheading" primary="Types" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/categories">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <FolderIcon className="side-nav-icon" />
                </ListItemIcon>

                <ListItemText className="subheading" primary="Categories" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/restrictions">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <RestrictionsIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Restrictions" />
              </ListItem>
            </NavLink>
          </Collapse>

          <ListItem button onClick={this.handleToggleDelivery.bind(this)}>
            <ListItemIcon>
              <DeliveryIcon className="side-nav-icon" />
            </ListItemIcon>
            <ListItemText className="subheading" primary="Delivery" />
            {this.state.deliveryOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse
            in={this.state.deliveryOpen}
            transitionDuration="auto"
            unmountOnExit
          >
            <NavLink onClick={this.props.handleDrawerToggle} to="/directions">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <DirectionsIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Directions" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/postal-codes">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <RoutesIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Postal codes" />
              </ListItem>
            </NavLink>

            <NavLink onClick={this.props.handleDrawerToggle} to="/routes">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <DriversIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Routes" />
              </ListItem>
            </NavLink>
          </Collapse>

          <NavLink onClick={this.props.handleDrawerToggle} to="/blog">
            <ListItem button>
              <ListItemIcon>
                <EditIcon className="side-nav-icon" />
              </ListItemIcon>
              <ListItemText className="subheading" primary="Blog" />
            </ListItem>
          </NavLink>

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
*/}
          <ListItem button onClick={this.handleToggleSettings.bind(this)}>
            <ListItemIcon>
              <SettingsIcon className="side-nav-icon" />
            </ListItemIcon>

            <ListItemText className="subheading" primary="Settings" />
            {this.state.settingsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse
            in={this.state.settingsOpen}
            transitionDuration="auto"
            unmountOnExit
          >
            <NavLink onClick={this.props.handleDrawerToggle} to="/team">
              <ListItem className="padding-left-nested-item" button>
                <ListItemIcon>
                  <TeamIcon className="side-nav-icon" />
                </ListItemIcon>
                <ListItemText className="subheading" primary="Team" />
              </ListItem>
            </NavLink>
          </Collapse>
        </List>
      </div>
    );
  }
}

AuthenticatedSideNav.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(AuthenticatedSideNav);
