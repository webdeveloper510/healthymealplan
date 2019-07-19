/* eslint-disable jsx-a11y/no-href */

import React from 'react';
import PropTypes from 'prop-types';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  history,
} from 'react-router-dom';
import { CSSTransitionGroup } from 'react-transition-group';

import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
// import { Bert } from 'meteor/themeteorchef:bert';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

import { withStyles } from 'material-ui/styles';
import Snackbar from 'material-ui/Snackbar';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Drawer from 'material-ui/Drawer';

import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import List from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Hidden from 'material-ui/Hidden';
import Divider from 'material-ui/Divider';
import Tooltip from 'material-ui/Tooltip';
import Avatar from 'material-ui/Avatar';

import MenuIcon from 'material-ui-icons/Menu';
import ExitToAppIcon from 'material-ui-icons/ExitToApp';
import CloseIcon from 'material-ui-icons/Close';
import { blueGrey, green, red } from 'material-ui/colors';

import { Link } from 'react-router-dom';
import Navigation from '../../components/Navigation/Navigation';
import Authenticated from '../../components/Authenticated/Authenticated';
import Authorized from '../../components/Authorized/Authorized';
import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import AuthenticatedNavigation from '../../components/AuthenticatedNavigation/AuthenticatedNavigation';

import Public from '../../components/Public/Public';
import Index from '../../pages/Index/Index';

import Billing from '../../pages/Billing/Billing';

import Blog from '../../pages/Blog/Blog';
import NewBlog from '../../pages/NewBlog/NewBlog';
import EditBlog from '../../pages/EditBlog/EditBlog';

import Categories from '../../pages/Categories/Categories';
import NewCategory from '../../pages/NewCategory/NewCategory';
import EditCategory from '../../pages/EditCategory/EditCategory';

import Customers from '../../pages/Customers/Customers';
import NewCustomer from '../../pages/NewCustomer/NewCustomer';
import EditCustomer from '../../pages/EditCustomer/EditCustomer';

import Directions from '../../pages/Directions/Directions';

import Discounts from '../../pages/Discounts/Discounts';
import NewDiscount from '../../pages/NewDiscount/NewDiscount';
import EditDiscount from '../../pages/EditDiscount/EditDiscount';

import GiftCards from '../../pages/GiftCards/GiftCards';
import NewGiftCard from '../../pages/NewGiftCard/NewGiftCard';
import EditGiftCard from '../../pages/EditGiftCard/EditGiftCard';

import Restrictions from '../../pages/Restrictions/Restrictions';
import NewRestriction from '../../pages/NewRestriction/NewRestriction';
import EditRestriction from '../../pages/EditRestriction/EditRestriction';

import Routes from '../../pages/Routes/Routes';
import NewRoute from '../../pages/NewRoute/NewRoute';
import EditRoute from '../../pages/EditRoute/EditRoute';

import Invoices from '../../pages/Invoices/Invoices';

import PostalCodes from '../../pages/PostalCodes/PostalCodes';
import NewPostalCode from '../../pages/NewPostalCode/NewPostalCode';
import EditPostalCode from '../../pages/EditPostalCode/EditPostalCode';

import Ingredients from '../../pages/Ingredients/Ingredients';
import NewIngredient from '../../pages/NewIngredient/NewIngredient';
import EditIngredient from '../../pages/EditIngredient/EditIngredient';

import Instructions from '../../pages/Instructions/Instructions';
import NewInstruction from '../../pages/NewInstruction/NewInstruction';
import EditInstruction from '../../pages/EditInstruction/EditInstruction';

import Lifestyles from '../../pages/Lifestyles/Lifestyles';
import NewLifestyle from '../../pages/NewLifestyle/NewLifestyle';
import EditLifestyle from '../../pages/EditLifestyle/EditLifestyle';

import Plates from '../../pages/Plates/Plates';
import NewPlate from '../../pages/NewPlate/NewPlate';
import EditPlate from '../../pages/EditPlate/EditPlate';

import Plating from '../../pages/Plating/Plating';


import Sides from '../../pages/Sides/Sides';
import NewSide from '../../pages/NewSide/NewSide';
import EditSide from '../../pages/EditSide/EditSide';

import Types from '../../pages/Types/Types';
import NewType from '../../pages/NewType/NewType';
// import ViewType from '../../pages/ViewType/ViewType';
import EditType from '../../pages/EditType/EditType';

import MealPlanner from '../../pages/MealPlanner/MealPlanner';

import MealPresets from '../../pages/MealPresets/MealPresets';
import NewMealPreset from '../../pages/NewMealPreset/NewMealPreset';
import EditMealPreset from '../../pages/EditMealPreset/EditMealPreset';

import Meals from '../../pages/Meals/Meals';
import NewMeal from '../../pages/NewMeal/NewMeal';
import EditMeal from '../../pages/EditMeal/EditMeal';

import Team from '../../pages/Team/Team';

import Signup from '../../pages/Signup/Signup';
import Login from '../../pages/Login/Login';
import Logout from '../../pages/Logout/Logout';
import VerifyEmail from '../../pages/VerifyEmail/VerifyEmail';
import RecoverPassword from '../../pages/RecoverPassword/RecoverPassword';
import ResetPassword from '../../pages/ResetPassword/ResetPassword';
import Profile from '../../pages/Profile/Profile';
import NotFound from '../../pages/NotFound/NotFound';
// import Footer from '../../components/Footer/Footer';

import './App.scss';

// const handleResendVerificationEmail = (emailAddress) => {
//   Meteor.call('users.sendVerificationEmail', (error) => {
//     if (error) {
//       Bert.alert(error.reason, 'danger');
//     } else {
//       Bert.alert(`Check ${emailAddress} for a verification link!`, 'success');
//     }
//   });
// };

const drawerWidth = 260;

const styles = theme => ({
  root: {
    width: '100%',
    zIndex: 1,
    overflow: 'hidden',
    minHeight: '100%',
  },
  rootNotAuthenticated: {
    width: '100%',
    zIndex: 1,
    overflow: 'hidden',
    minHeight: '100%',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center ',
  },
  appFrameNotAuthenticated: {
    width: '100%',
    zIndex: 1,
    overflow: 'hidden',
    minHeight: '100%',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
  },
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
    minHeight: '100%',
  },
  appFrameNotAuthenticated: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minHeight: '100%',
  },
  appBar: {
    position: 'absolute',
    boxShadow: 'none',
    backgroundColor: '#263238',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('lg')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  navIconHide: {
    [theme.breakpoints.up('lg')]: {
      display: 'none',
    },
  },
  drawerHeader: theme.mixins.toolbar,
  drawerPaper: {
    width: 250,
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      // position: 'fixed',
      height: '100%',
      height: '100vh',
      minHeight: '100%',
    },
  },
  contentNotAuthenticated: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    height: '100%',
    minHeight: '100%',
  },

  content: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    padding: theme.spacing.unit * 3,
    height: 'calc(100% - 56px)',
    marginTop: 56,
    marginLeft: 0,
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 64px)',
      marginTop: 64,
    },
    [theme.breakpoints.up('lg')]: {
      marginLeft: `${drawerWidth}px`,
    },
  },
});

const themeRoot = createMuiTheme({
  palette: {
    primary: {
      ...blueGrey,
      A500: '#000000',
    }, // Purple and green play nicely together.
    secondary: {
      ...green,
      A500: '#69f0ae',
    },

    error: red,
  },
});

// {!this.state.snackbarButtonText ? (<CloseIcon onClick={this.handleRequestClose.bind(this)} />) : ''}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      vertical: 'bottom',
      horizontal: 'center',
      snackbarOpen: false,
      snackbarMessageText: '',
      snackbarButtonText: '',
      snackbarButtonLink: '',
      mobileOpen: false,
    };
  }

  popTheSnackbar(snackbarVariables) {
    const { message, buttonText, duration, buttonLink } = snackbarVariables;

    this.setState({
      snackbarOpen: true,
      snackbarMessageText: message,
      snackbarButtonText: buttonText,
      snackbarButtonLink: buttonLink,
    });
  }

  handleDrawerToggle() {
    const currentState = this.state.mobileOpen;

    this.setState({
      mobileOpen: !currentState,
    });
  }

  handleRequestClose() {
    this.setState({
      snackbarOpen: false,
    });
  }

  getInitials(name) {
    if (name) {
      const split = name.split(' ');

      return split[0].charAt(0) + split[1].charAt(0);
    }

    return '';
  }

  render() {
    const { vertical, horizontal } = this.state;

    const { classes, theme } = this.props;

    // console.log(this.props);

    return (
      <MuiThemeProvider theme={themeRoot}>
        <Router>
          <div
            className={
              this.props.authenticated
                ? classes.root
                : classes.rootNotAuthenticated
            }
          >
            <Snackbar
              anchorOrigin={{ vertical, horizontal }}
              open={this.state.snackbarOpen}
              autoHideDuration={4000}
              onClose={this.handleRequestClose.bind(this)}
              action={[
                this.state.snackbarButtonText ? (
                  <Link
                    to={this.state.snackbarButtonLink}
                    className="link--no-hover"
                  >
                    <Button color="accent" dense>
                      {this.state.snackbarButtonText}
                    </Button>
                  </Link>
                ) : (
                    ''
                  ),
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  onClick={this.handleRequestClose.bind(this)}
                >
                  <CloseIcon />
                </IconButton>,
              ]}
              message={
                <span id="message-id" className="body2">
                  {this.state.snackbarMessageText}
                </span>
              }
            />
            <div
              className={
                this.props.authenticated
                  ? classes.appFrame
                  : classes.appFrameNotAuthenticated
              }
            >
              {this.props.authenticated ? (
                <AppBar
                  className={
                    this.props.authenticated
                      ? classes.appBar
                      : 'appbar--no-shadow appbar-no-auth'
                  }
                >
                  <Toolbar>
                    <IconButton
                      color="contrast"
                      aria-label="open drawer"
                      onClick={this.handleDrawerToggle.bind(this)}
                      className={classes.navIconHide}
                    >
                      <MenuIcon />
                    </IconButton>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        width: '100%',
                        alignItems: 'center',
                      }}
                    >
                      <Link to="/profile" className="link--no-hover">
                        <Typography
                          type="subheading"
                          className="subheading font-medium"
                          style={{
                            color: '#FFF',
                            alignItems: 'center',
                            display: 'flex',
                            paddingRight: '15px',
                          }}
                        >
                          <Avatar style={{ marginRight: '.8em' }}>
                            {this.getInitials(
                              this.props.name ? this.props.name : '',
                            )}
                          </Avatar>
                          {this.props.name}
                        </Typography>
                      </Link>
                      <Tooltip title="Log out">
                        <Link to="/logout">
                          <IconButton>
                            <ExitToAppIcon
                              className="logout-icon"
                              style={{ fillOpacity: '0.54', fill: '#FFFFFF' }}
                            />
                          </IconButton>
                        </Link>
                      </Tooltip>
                    </div>
                  </Toolbar>
                </AppBar>
              ) : (
                  ''
                )}
              {this.props.authenticated ? (
                <div style={{ backgroundColor: '#FFFFFF' }}>
                  <Hidden lgUp>
                    <Drawer
                      type="temporary"
                      anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                      open={this.state.mobileOpen}
                      classes={{
                        paper: classes.drawerPaper,
                      }}
                      onClose={this.handleDrawerToggle.bind(this)}
                      ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 20px 0',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                        className={classes.drawerHeader}
                      >
                        <Typography
                          type="headline"
                          style={{ color: 'rgba(0, 0, 0, 0.38)' }}
                          className="headline font-medium"
                        >
                          Vittle
                        </Typography>
                        <Typography
                          style={{ color: 'rgba(0, 0, 0, 0.38)' }}
                          type="body2"
                          className="body2"
                        >
                          v 0.25
                        </Typography>
                      </div>

                      <AuthenticatedSideNav handleDrawerToggle={this.handleDrawerToggle.bind(this)} {...this.props} />
                    </Drawer>
                  </Hidden>

                  <Hidden mdDown implementation="css">
                    <Drawer
                      type="permanent"
                      open
                      classes={{
                        paper: classes.drawerPaper,
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 20px 0',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                        className={classes.drawerHeader}
                      >
                        <Typography
                          type="headline"
                          style={{ color: 'rgba(0, 0, 0, 0.38)' }}
                          className="headline font-medium"
                        >
                          Vittle
                        </Typography>
                        <Typography
                          style={{ color: 'rgba(0, 0, 0, 0.38)' }}
                          type="body2"
                          className="body2"
                        >
                          v 0.25
                        </Typography>
                      </div>
                      <AuthenticatedSideNav {...this.props} />
                    </Drawer>
                  </Hidden>
                </div>
              ) : (
                  ''
                )}

              <main
                className={
                  this.props.authenticated
                    ? classes.content
                    : classes.contentNotAuthenticated
                }
              >
                {!this.props.loading ? (
                  <Switch key={this.props.key} location={this.props.location}>
                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/billing"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Billing}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/blog"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Blog}
                      {...this.props}
                    />



                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/blog/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewBlog}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/blog/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditBlog}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/categories"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Categories}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/categories/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewCategory}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/categories/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditCategory}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/customers"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Customers}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/customers/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewCustomer}
                      {...this.props}
                    />


                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/customers/new/:_id"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewCustomer}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/customers/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditCustomer}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'deliveries', 'delivery']}
                      exact
                      path="/directions"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Directions}
                      {...this.props}
                    />


                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/discounts"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Discounts}
                      {...this.props}
                    />


                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/discounts/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewDiscount}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/discounts/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditDiscount}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/gift-cards"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={GiftCards}
                      {...this.props}
                    />


                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/gift-cards/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewGiftCard}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/gift-cards/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditGiftCard}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/ingredients"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Ingredients}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/ingredients/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewIngredient}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/ingredients/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditIngredient}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/instructions"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Instructions}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/invoices"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Invoices}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/instructions/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewInstruction}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/instructions/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditInstruction}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/lifestyles"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Lifestyles}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/lifestyles/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewLifestyle}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/lifestyles/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditLifestyle}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/meal-planner"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={MealPlanner}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/meal-planner-presets"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={MealPresets}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/meal-planner-presets/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewMealPreset}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/meal-planner-presets/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditMealPreset}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/meals"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Meals}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/meals/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewMeal}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/meals/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditMeal}
                      {...this.props}
                    />


                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/plates"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Plates}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/plates/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewPlate}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/plates/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditPlate}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/postal-codes"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={PostalCodes}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/postal-codes/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewPostalCode}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/postal-codes/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditPostalCode}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/plating"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Plating}
                      {...this.props}
                    />

                    <Authenticated
                      exact
                      path="/profile"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Profile}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/restrictions"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Restrictions}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/restrictions/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewRestriction}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/restrictions/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditRestriction}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/routes"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Routes}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/routes/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewRoute}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/routes/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditRoute}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/sides"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Sides}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/sides/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewSide}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/sides/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditSide}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin']}
                      exact
                      path="/team"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Team}
                      {...this.props}
                    />

                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/types"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Types}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/types/new"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={NewType}
                      {...this.props}
                    />
                    <Authorized
                      allowedRoles={['super-admin', 'chef']}
                      exact
                      path="/types/:_id/edit"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={EditType}
                      {...this.props}
                    />

                    <Public
                      path="/signup"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Signup}
                      {...this.props}
                    />
                    <Public
                      path="/login"
                      popTheSnackbar={this.popTheSnackbar.bind(this)}
                      component={Login}
                      {...this.props}
                    />

                    <Authenticated
                      exact
                      path="/"
                      component={Index}
                      {...this.props}
                    />

                    <Route
                      path="/logout"
                      component={Logout}
                      {...this.props}
                    />
                    <Route
                      name="verify-email"
                      path="/verify-email/:token"
                      component={VerifyEmail}
                    />
                    <Route
                      name="recover-password"
                      path="/recover-password"
                      component={RecoverPassword}
                    />
                    <Route
                      name="reset-password"
                      path="/reset-password/:token"
                      component={ResetPassword}
                    />

                    <Route component={NotFound} />
                  </Switch>

                ) : (
                    ''
                  )}
              </main>
            </div>
          </div>
        </Router>
      </MuiThemeProvider>
    );

    // return (

    //
    //     {!this.props.loading ? <div className="App">
    //       {/* Check email verification later */}
    //       {/* {this.props.userId && !this.props.emailVerified ? <Alert className="verify-email text-center"><p>Hey friend! Can you <strong>verify your email address</strong> ({this.props.emailAddress}) for us? <Button bsStyle="link" onClick={() => handleResendVerificationEmail(this.props.emailAddress)} href="#">Re-send verification email</Button></p></Alert> : ''} */}
    //       <div><Navigation {...this.props} /></div>
    //

    //

    //     </div> : ''}
    //
    // );
  }
}

App.defaultProps = {
  userId: '',
  emailAddress: '',
};

App.propTypes = {
  loading: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  emailAddress: PropTypes.string,
  emailVerified: PropTypes.bool.isRequired,
};

const getUserName = name =>
  ({
    string: name,
    object: `${name.first} ${name.last}`,
  }[typeof name]);

export default createContainer(() => {
  const loggingIn = Meteor.loggingIn();
  const user = Meteor.user();
  const userId = Meteor.userId();
  const loading = !Roles.subscription.ready();
  const name =
    user && user.profile && user.profile.name && getUserName(user.profile.name);
  const emailAddress = user && user.emails && user.emails[0].address;

  return {
    loading,
    loggingIn,
    authenticated: !loggingIn && !!userId,
    name: name || emailAddress,
    roles: !loading && Roles.getRolesForUser(userId),
    userId,
    emailAddress,
    emailVerified:
      user && user.emails
        ? user && user.emails && user.emails[0].verified
        : true,
  };
}, withStyles(styles, { withTheme: true })(App));
