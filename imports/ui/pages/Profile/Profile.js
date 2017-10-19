/* eslint-disable no-underscore-dangle */

import React from 'react';
import PropTypes from 'prop-types';
// import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import _ from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
// import { Bert } from 'meteor/themeteorchef:bert';
import { createContainer } from 'meteor/react-meteor-data';
import InputHint from '../../components/InputHint/InputHint';
import validate from '../../../modules/validate';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Divider from 'material-ui/Divider';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

// import './Profile.scss';

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.getUserType = this.getUserType.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    // this.renderOAuthUser = this.renderOAuthUser.bind(this);
    this.renderPasswordUser = this.renderPasswordUser.bind(this);
    this.renderProfileForm = this.renderProfileForm.bind(this);
    this.dialogHandleClickOpen = this.dialogHandleClickOpen.bind(this);
    this.dialogHandleRequestClose = this.dialogHandleRequestClose.bind(this);
    this.handlePersonalInfoFormChange = this.handlePersonalInfoFormChange.bind(this);
    this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
    
    this.state = {
      formDialogOpen: false,
      personalFormPristine: true
    };
  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
      rules: {
        firstName: {
          required: true,
        },
        lastName: {
          required: true,
        },
        emailAddress: {
          required: true,
          email: true,
        },
        // currentPassword: {
        //   required() {
        //     // Only required if newPassword field has a value.
        //     return component.newPassword.value.length > 0;
        //   },
        // },
        // newPassword: {
        //   required() {
        //     // Only required if currentPassword field has a value.
        //     return component.currentPassword.value.length > 0;
        //   },
        // },
      },
      messages: {
        firstName: {
          required: 'What\'s your first name?',
        },
        lastName: {
          required: 'What\'s your last name?',
        },
        emailAddress: {
          required: 'Need an email address here.',
          email: 'Is this email address correct?',
        },
        // currentPassword: {
        //   required: 'Need your current password if changing.',
        // },
        // newPassword: {
        //   required: 'Need your new password if changing.',
        // },
      },
      submitHandler() { component.handleSubmit(); },
    });

    validate(component.passwordForm, {
      rules: {
        currentPassword: {
         required: true
        },
        newPassword: {
          required: true
        },
      },
      messages: {
        currentPassword: {
          required: 'Need your current password.',
        },
        newPassword: {
          required: 'Need your new password.',
        },
      },
      submitHandler() { component.handlePasswordSubmit(); },
    });
  }

  dialogHandleClickOpen(){
    this.setState({ formDialogOpen: true });
  }

  dialogHandleRequestClose(){
    
    this.setState({ formDialogOpen: false });
  }

  getUserType(user) {
    const userToCheck = user;
    delete userToCheck.services.resume;
    const service = Object.keys(userToCheck.services)[0];
    return service === 'password' ? 'password' : 'oauth';
  }

  handleSubmit() {

    const profile = {
      emailAddress: this.emailAddress.value,
      profile: {
        name: {
          first: this.firstName.value,
          last: this.lastName.value,
        },
      },
    };

    Meteor.call('users.editProfile', profile, (error) => {
      if (error) {
        this.props.popTheSnackbar({ message: error.reason });
      } else {
        this.props.popTheSnackbar({message: 'Profile updated.'});
      }
    });

 
  }

  handlePasswordSubmit(){

    console.log(this.currentPassword.value);
    console.log(this.newPassword.value);
    
    Accounts.changePassword(this.currentPassword.value, this.newPassword.value, (error) => {
      if (error) {
        this.props.popTheSnackbar({
          message: error.reason,
        });
      } else {
        this.currentPassword.value = '';
        this.newPassword.value = '';

        this.props.popTheSnackbar({
          message: "Password updated",
        });

        this.dialogHandleRequestClose();
      }
    });
    
  }

  handlePersonalInfoFormChange(){
    this.setState({
      personalFormPristine: false
    })

  }
  // renderOAuthUser(loading, user) {
  //   return !loading ? (<div className="OAuthProfile">
  //     {Object.keys(user.services).map(service => (
  //       <div key={service} className={`LoggedInWith ${service}`}>
  //         <img src={`/${service}.svg`} alt={service} />
  //         <p>{`You're logged in with ${_.capitalize(service)} using the email address ${user.services[service].email}.`}</p>
  //         <Button
  //           className={`btn btn-${service}`}
  //           href={{
  //             facebook: 'https://www.facebook.com/settings',
  //             google: 'https://myaccount.google.com/privacy#personalinfo',
  //             github: 'https://github.com/settings/profile',
  //           }[service]}
  //           target="_blank"
  //         >Edit Profile on {_.capitalize(service)}</Button>
  //       </div>
  //     ))}
  //   </div>) : <div />;
  // }

  renderPasswordUser(loading, user) {
    return !loading ? (<div>
        <Grid container>
          <Grid item xs={12} sm={6}>
            <TextField
              onChange={() => this.handlePersonalInfoFormChange()}
            fullWidth
              type="text"
              name="firstName"
              defaultValue={user.profile.name.first}
              inputRef={(firstName) => (this.firstName = firstName)}
              
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              onChange={() => this.handlePersonalInfoFormChange()}
            fullWidth
              type="text"
              name="lastName"
              defaultValue={user.profile.name.last}
              inputRef={(lastName) => (this.lastName = lastName)}
            />
          </Grid>

        </Grid>

        <Grid container style={{ marginTop: "1em"}}>
          <Grid item xs={12}>
            <TextField
              onChange={() => this.handlePersonalInfoFormChange()}
              fullWidth
              type="email"
              name="emailAddress"
              defaultValue={user.emails[0].address}
              inputRef={(emailAddress) => (this.emailAddress = emailAddress)}
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" disabled={this.state.personalFormPristine} color="primary" raised>Save</Button>
          </Grid>
        </Grid>

        {/* <Divider light className="divider--space-x" /> */}
        
        <Grid container style={{ marginTop: '30px' }}>
          <Grid item xs={12}>
            <Typography type="body2" className="text-uppercase" style={{ marginBottom: '30px' }}>Password</Typography>
            <Button color="primary" onClick={() => this.dialogHandleClickOpen()} raised>Change password</Button>
          </Grid>
            
        </Grid>

      
    
    </div>) : <div />;
  }

  renderProfileForm(loading, user) {
    return !loading ? ({
      password: this.renderPasswordUser,
      oauth: this.renderOAuthUser,
    }[this.getUserType(user)])(loading, user) : <div />;
  }

  render() {
    const { loading, user } = this.props;
    return (<div className="Profile">
      <Grid container className="SideContent SideContent--spacer-2x--horizontal SideContent--spacer-2x--top">

          <Grid container style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <Typography type="headline" style={{ fontWeight: 500 }}>Account</Typography>
            </Grid>

          </Grid>


          <Grid container justify="center" style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} sm={4} >
                  <Typography type="subheading" className="font-medium"> Personal details
                  </Typography>
                 
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields">
                  <Typography type="body2" className="text-uppercase" style={{ marginBottom: '30px' }}>Perosnal information</Typography>
                  <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
                    {this.renderProfileForm(loading, user)}
                  </form>
          
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>


        </Grid>


        <Dialog open={this.state.formDialogOpen} onRequestClose={() => this.dialogHandleRequestClose()}>
            <DialogTitle>Change your password</DialogTitle>
            <DialogContent>
              <DialogContentText>
                
              </DialogContentText>
                <form ref={(passwordForm) => (this.passwordForm = passwordForm)} onSubmit={event => event.preventDefault()}>

                  <TextField
                    margin="dense"
                    fullWidth
                    label="Current password"
                    type="password"
                    name="currentPassword"
                    inputRef={(currentPassword) => (this.currentPassword = currentPassword)}
                  />
                  <TextField
                    margin="dense"
                    fullWidth
                    label="New password"
                    type="password"
                    name="newPassword"
                    inputRef={(newPassword) => (this.newPassword = newPassword)}
                  />

        
                  <Button type="submit" onClick={() => this.handlePasswordSubmit()} color="primary" raised>Save</Button>
                  
                </form>

              </DialogContent>
              
          </Dialog>
      </div>
    
    );
  }
}

Profile.propTypes = {
  loading: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('users.editProfile');

  return {
    loading: !subscription.ready(),
    user: Meteor.user(),
  };
}, Profile);
