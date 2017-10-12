/* eslint-disable jsx-a11y/no-href */

import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
// import { Grid, Alert, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import { Bert } from 'meteor/themeteorchef:bert';
import Navigation from '../../components/Navigation/Navigation';
import Authenticated from '../../components/Authenticated/Authenticated';
import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';

import Public from '../../components/Public/Public';
import Index from '../../pages/Index/Index';

// import AddAccount from '../../pages/Accounts/AddAccount';

import Documents from '../../pages/Documents/Documents';
import NewDocument from '../../pages/NewDocument/NewDocument';
import ViewDocument from '../../pages/ViewDocument/ViewDocument';
import EditDocument from '../../pages/EditDocument/EditDocument';

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
import Footer from '../../components/Footer/Footer';
import Terms from '../../pages/Terms/Terms';
import Privacy from '../../pages/Privacy/Privacy';
import ExamplePage from '../../pages/ExamplePage/ExamplePage';


import Snackbar from 'material-ui/Snackbar';
import Button from 'material-ui/Button';

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

  handleRequestClose() {
    this.setState({
      snackbarOpen: false,
    });
  }

  render() {

    const { vertical, horizontal } = this.state;

    return (

      <Router>
        {!this.props.loading ? <div className="App">
          {/* Check email verification later */}
          {/* {this.props.userId && !this.props.emailVerified ? <Alert className="verify-email text-center"><p>Hey friend! Can you <strong>verify your email address</strong> ({this.props.emailAddress}) for us? <Button bsStyle="link" onClick={() => handleResendVerificationEmail(this.props.emailAddress)} href="#">Re-send verification email</Button></p></Alert> : ''} */}
          <div><Navigation {...this.props} /></div>
          <Snackbar
            anchorOrigin={{ vertical, horizontal }}
            open={this.state.snackbarOpen}
            onRequestClose={this.handleRequestClose.bind(this)}
            action={this.state.snackbarButtonText ? (<Link to={this.state.snackbarButtonLink}><Button color="accent" dense onClick={this.props.onClickHandler}>{this.state.snackbarButtonText}</Button></Link>) : ''}
            message={<span id="message-id" className="body2 font-uppercase">{this.state.snackbarMessageText}</span>}
            autoHideDuration={5000}
          />

          <Switch>
            <Route exact name="index" path="/" component={Index} />


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

            <Route path="/logout" popTheSnackbar={this.popTheSnackbar.bind(this)} component={Logout} {...this.props} />
            <Route name="verify-email" path="/verify-email/:token" component={VerifyEmail} />
            <Route name="recover-password" path="/recover-password" component={RecoverPassword} />
            <Route name="reset-password" path="/reset-password/:token" component={ResetPassword} />
            <Route name="terms" path="/terms" component={Terms} />
            <Route name="privacy" path="/privacy" component={Privacy} />
            <Route name="examplePage" path="/example-page" component={ExamplePage} />
            <Route component={NotFound} />
          </Switch>

        </div> : ''}
      </Router>
    );
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
}, App);
