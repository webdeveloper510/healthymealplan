/* eslint-disable jsx-a11y/no-href */

import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Switch, Route, history } from 'react-router-dom';
// import { Grid, Alert, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
// import { Bert } from 'meteor/themeteorchef:bert';
import Navigation from '../../components/Navigation/Navigation';
import Authenticated from '../../components/Authenticated/Authenticated';
import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import AuthenticatedNavigation from '../../components/AuthenticatedNavigation/AuthenticatedNavigation';

import Public from '../../components/Public/Public';
// import Index from '../../pages/Index/Index';

// import AddAccount from '../../pages/Accounts/AddAccount';

// import Documents from '../../pages/Documents/Documents';
// import NewDocument from '../../pages/NewDocument/NewDocument';
// import ViewDocument from '../../pages/ViewDocument/ViewDocument';
// import EditDocument from '../../pages/EditDocument/EditDocument';

import Ingredients from '../../pages/Ingredients/Ingredients';
import NewIngredient from '../../pages/NewIngredient/NewIngredient';
import ViewIngredient from '../../pages/ViewIngredient/ViewIngredient';
import EditIngredient from '../../pages/EditIngredient/EditIngredient';

import Types from '../../pages/Types/Types';
import NewType from '../../pages/NewType/NewType';
import ViewType from '../../pages/ViewType/ViewType';
import EditType from '../../pages/EditType/EditType';

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
import Terms from '../../pages/Terms/Terms';
import Privacy from '../../pages/Privacy/Privacy';
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

import { Link } from 'react-router-dom';

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
  },
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  appBar: {
    position: 'absolute',
    boxShadow: 'none',
    backgroundColor: "#263238",
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  drawerHeader: theme.mixins.toolbar,
  drawerPaper: {
    width: 250,
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      position: 'relative',
      height: '100%',
      height: '100vh',
      minHeight: '100%'
    },
  },
  content: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    padding: theme.spacing.unit * 3,
    height: 'calc(100% - 56px)',
    marginTop: 56,
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 64px)',
      marginTop: 64,
    },
  },
});

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

  getInitials(name){

    if(name){
    const split = name.split(" ");

    return split[0].charAt(0) + split[1].charAt(0);
    }
    
    return ''
  }

  render() {

    const { vertical, horizontal } = this.state;

    const { classes, theme } = this.props;


    return (

      <Router>
        <div className={classes.root}>
          <Snackbar
            anchorOrigin={{ vertical, horizontal }}
            open={this.state.snackbarOpen}
            onRequestClose={this.handleRequestClose.bind(this)}
            action={this.state.snackbarButtonText ? (<Link to={this.state.snackbarButtonLink}><Button color="accent" dense onClick={this.props.onClickHandler}>{this.state.snackbarButtonText}</Button></Link>) : ''}
            message={<span id="message-id" className="body2">{this.state.snackbarMessageText}</span>}
            autoHideDuration={4000}
          />
          <div className={classes.appFrame}>
            <AppBar className={this.props.authenticated ? classes.appBar : 'appbar--no-shadow appbar-no-auth'}>
              <Toolbar>
                <IconButton
                  color="contrast"
                  aria-label="open drawer"
                  onClick={this.handleDrawerToggle.bind(this)}
                  className={classes.navIconHide}
                >
                  <MenuIcon />
                </IconButton>

                { this.props.authenticated ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
                  <Typography type="subheading" className="subheading font-medium" style={{ color: '#FFF', alignItems: 'center', display: 'flex', paddingRight: '15px' }}>
                    <Avatar style={{ marginRight: '1em' }}>{this.getInitials(this.props.name ? this.props.name : '')}</Avatar>{this.props.name}
                  </Typography>
                  <Tooltip title="Log out">
                    <Link to="/logout">
                      <IconButton>
                        <ExitToAppIcon className="logout-icon" style={{ fillOpacity: '0.54', fill: '#FFFFFF' }}/>
                      </IconButton>
                    </Link>
                  </Tooltip>
                </div>) : ''
                }
              </Toolbar> 
            </AppBar>
            {this.props.authenticated ? (<div>
            <Hidden mdUp>
              <Drawer
                type="temporary"
                anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                open={this.state.mobileOpen}
                classes={{
                  paper: classes.drawerPaper,
                }}
                onRequestClose={this.handleDrawerToggle.bind(this)}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
              >
              <div style={{ padding: "10px 20px 10px", display: 'flex', flexDirection: 'column' }} className={classes.drawerHeader}>
                <Typography type="headline" style={{ color: "rgba(0, 0, 0, 0.38)" }} className="headline font-medium">Healthy Meal Plan</Typography>
                <p style={{ color: "rgba(0, 0, 0, 0.38)" }} className="body1"><small>v 0.10</small></p>
              </div>

                <AuthenticatedSideNav {...this.props} />
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
              <div style={{ padding: "10px 20px 10px", display: 'flex', flexDirection: 'column' }} className={classes.drawerHeader}>
                <Typography type="headline" style={{ color: "rgba(0, 0, 0, 0.38)" }} className="headline font-medium">Healthy Meal Plan</Typography>
                <p style={{ color: "rgba(0, 0, 0, 0.38)" }} className="body1"><small>v 0.10</small></p>
              </div>
                <AuthenticatedSideNav {...this.props} />

              </Drawer>
            </Hidden></div>) : '' }
            
            <main className={classes.content}>
              {!this.props.loading ? (
                <Switch>
                  <Authenticated exact path="/ingredients" popTheSnackbar={this.popTheSnackbar.bind(this)} component={Ingredients} {...this.props} />
                  <Authenticated exact path="/ingredients/new" popTheSnackbar={this.popTheSnackbar.bind(this)} component={NewIngredient} {...this.props} />
                  <Authenticated exact path="/ingredients/:_id" popTheSnackbar={this.popTheSnackbar.bind(this)} component={ViewIngredient} {...this.props} />
                  <Authenticated exact path="/ingredients/:_id/edit" popTheSnackbar={this.popTheSnackbar.bind(this)} component={EditIngredient} {...this.props} />

                  <Authenticated exact path="/profile" component={Profile} {...this.props} />

                  <Authenticated exact path="/team" popTheSnackbar={this.popTheSnackbar.bind(this)} component={Team} {...this.props} />

                  <Authenticated exact path="/types" popTheSnackbar={this.popTheSnackbar.bind(this)} component={Types} {...this.props} />
                  <Authenticated exact path="/types/new" popTheSnackbar={this.popTheSnackbar.bind(this)} component={NewType} {...this.props} />
                  <Authenticated exact path="/types/:_id" popTheSnackbar={this.popTheSnackbar.bind(this)} component={ViewType} {...this.props} />
                  <Authenticated exact path="/types/:_id/edit" popTheSnackbar={this.popTheSnackbar.bind(this)} component={EditType} {...this.props} />

                  <Public path="/signup" popTheSnackbar={this.popTheSnackbar.bind(this)} component={Signup} {...this.props} />
                  <Public path="/login" popTheSnackbar={this.popTheSnackbar.bind(this)} component={Login} {...this.props} />

                  <Route path="/logout" component={Logout} {...this.props} />
                  <Route name="verify-email" path="/verify-email/:token" component={VerifyEmail} />
                  <Route name="recover-password" path="/recover-password" component={RecoverPassword} />
                  <Route name="reset-password" path="/reset-password/:token" component={ResetPassword} />
                  <Route name="terms" path="/terms" component={Terms} />
                  <Route name="privacy" path="/privacy" component={Privacy} />
                  <Route component={NotFound} />
                </Switch>
              ) : ''}
            </main>
          </div>
        </div>
      </Router>
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

const getUserName = name => ({
  string: name,
  object: `${name.first} ${name.last}`,
}[typeof name]);

export default createContainer(() => {
  const loggingIn = Meteor.loggingIn();
  const user = Meteor.user();
  const userId = Meteor.userId();
  const loading = !Roles.subscription.ready();
  const name = user && user.profile && user.profile.name && getUserName(user.profile.name);
  const emailAddress = user && user.emails && user.emails[0].address;

  return {
    loading,
    loggingIn,
    authenticated: !loggingIn && !!userId,
    name: name || emailAddress,
    roles: !loading && Roles.getRolesForUser(userId),
    userId,
    emailAddress,
    emailVerified: user && user.emails ? user && user.emails && user.emails[0].verified : true,
  };
}, withStyles(styles, { withTheme: true })(App));
