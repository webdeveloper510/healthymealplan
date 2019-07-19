/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';


import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import Dialog, {
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
} from 'material-ui/Dialog';
import List, { ListItem, ListItemText } from 'material-ui/List';

import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import {
    FormLabel,
    FormControl,
    FormControlLabel,
    FormGroup,
} from 'material-ui/Form';
import Checkbox from 'material-ui/Checkbox';

import Paper from 'material-ui/Paper';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import MoreVert from 'material-ui-icons/MoreVert';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import autoBind from 'react-autobind';

import Loading from '../../components/Loading/Loading';

class Team extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        editDialogOpen: false,
        basicDialogOpen: false,
        resetDialogOpen: false,
        deleteDialogOpen: false,

        selectedUserId: '',
        selectedUserName: '',

        addUserDialogOpen: false,
        addUserType: '',

        rolesToAdd: [],

        editUserFirstName: '',
        editUserLastName: '',
        editUserEmail: '',
    };

    autoBind(this);
  }

  handleEditUserSubmit(e) {

      e.preventDefault();

      console.log("Going here edit");

      const dataToSend = {
          userId: this.state.selectedUserId,
          firstName: document.querySelector("[name='firstNameEdit']").value.trim(),
          lastName: document.querySelector("[name='lastNameEdit']").value.trim(),
          email: document.querySelector("[name='emailEdit']").value.trim(),
          roles: this.state.rolesToAdd,
      };

      console.log(dataToSend);

      Meteor.call('users.editUser', dataToSend, (err, res) => {
          if (err) {
              console.log(err);
              this.props.popTheSnackbar({
                  message: 'There was an error editing the user',
              });
          } else {
              this.props.popTheSnackbar({
                  message: 'User edited successfully',
              });

              this.setState({
                  basicDialogOpen: false,
              })
          }
      });

      return false;
  }

  handleAddUserSubmit(e) {

      e.preventDefault();

      const dataToSend = {
          firstName: document.querySelector("[name='firstName']").value.trim(),
          lastName: document.querySelector("[name='lastName']").value.trim(),
          email: document.querySelector("[name='email']").value.trim(),
          password: document.querySelector("[name='password']").value.trim(),
          roles: this.state.rolesToAdd,
      };

      console.log(dataToSend);

      Meteor.call('users.addNew', dataToSend, (err, res) => {
          if (err) {
              console.log(err);
              this.props.popTheSnackbar({
                  message: 'There was an error adding the user',
              });
          } else {
              this.props.popTheSnackbar({
                  message: this.state.addUserType === 'owner' ? 'Owner added successfully' : 'Staff member added successfully',
              });

              this.setState({
                  addUserDialogOpen: false,
              })
          }
      });

      return false;
  }


  handleClick(event, userId) {

    console.log(event, userId);

    const selectedUser = this.props.users.find(e => e._id === userId);

    this.setState({
        editDialogOpen: true,
        selectedUserName: selectedUser.profile.name.first + " " + selectedUser.profile.name.last || '',
        selectedUserId: userId,
    })
  }

  handleUserAction(e, action) {
    if (action === 'edit') {
        const user = this.props.users.find(e => e._id === this.state.selectedUserId);
        console.log(user);
        this.setState({
            editUserFirstName: user.profile.name.first,
            editUserLastName: user.profile.name.last || '',
            editUserEmail: user.emails['0'].address,
            rolesToAdd: user.roles ? user.roles : [],
            editDialogOpen: false,
            basicDialogOpen: true,
        });
    } else if (action === 'reset') {
        this.setState({
            editDialogOpen: false,
            resetDialogOpen: true,
        });
    } else if (action === 'delete') {
        this.setState({
            editDialogOpen: false,
            deleteDialogOpen: true,
        });
    }
  }

  deleteUser() {
      Meteor.call('users.deleteUser', this.state.selectedUserId, (err, res) => {
          if (err) {
              console.log(err);
              this.props.popTheSnackbar({
                  message: 'There was an error deleting the user',
              });
          } else {
              this.props.popTheSnackbar({
                  message: this.state.addUserType === 'owner' ? 'Owner deleted successfully' : 'Staff member deleted successfully',
              });

              this.setState({
                  deleteDialogOpen: false,
              })
          }
      })
  }

  handleChangeRoleCheckbox(role) {
      const previousRolesToAdd = this.state.rolesToAdd.slice();

      if (previousRolesToAdd.findIndex(e => e === role) !== -1) {
          previousRolesToAdd.splice(previousRolesToAdd.findIndex(e => e === role), 1);
      } else {
          previousRolesToAdd.push(role);
      }

      this.setState({
          rolesToAdd: previousRolesToAdd,
      })
  }

  sendResetPassword() {
      Meteor.call('users.sendResetPassword', this.state.selectedUserId, (err, res) => {
          if (err) {
              console.log(err);
              this.props.popTheSnackbar({
                  message: 'There was an error sending the password reset email',
              });
          } else {
             this.props.popTheSnackbar({
                 message: 'Password reset email sent successfully',
             });

             this.setState({
                 resetDialogOpen: false,
             })
          }
      })
  }

  render() {
    if (this.props.loading) {
      return (
          <Loading />
      )
    }

    return (
      <div>
        <Grid container className="SideContent SideContent--spacer-2x--horizontal SideContent--spacer-2x--top">

          <Grid container style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <Typography type="headline" style={{ fontWeight: 500 }}>Team</Typography>
            </Grid>

          </Grid>


          <Grid container justify="center" style={{ marginBottom: '50px' }}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} sm={4}>
                  <Typography type="subheading" className="font-medium"> Owners
                  </Typography>
                  <Typography style={{ paddingRight: '80px' }}>
                    {'Owners have permission to see and do everything. They can also add and remove other owners.'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields">
                      {this.props.users.filter(e => e.roles.findIndex(el => el === 'super-admin') !== -1).map(user => (
                          <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <div style={{ display: 'flex', alignItems: 'center'}}>
                                <Avatar style={{marginRight: '1em'}}>
                                    {user.profile.name.first.charAt(0)}{user.profile.name.last && user.profile.name.last.charAt(0)}
                                </Avatar>
                                <div>
                                  <Typography type="subheading">
                                      {user.profile.name.first} {user.profile.name.last || ''}
                                  </Typography>
                                    <Typography type="caption">
                                        {user.roles && user.roles.join(', ')}
                                    </Typography>
                                </div>
                            </div>

                            <IconButton onClick={ev => this.handleClick(ev, user._id)}>
                                <MoreVert />
                            </IconButton>

                          </div>
                      ))}

                      <Button style={{marginTop: '1em'}} type="primary" color="primary" raised onClick={() => this.setState({ addUserDialogOpen: true, rolesToAdd: ['super-admin'], addUserType: 'owner' })}>
                        Add owner
                      </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider light className="divider--space-x" />

          <Grid container justify="center" style={{ marginBottom: '75px' }}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} sm={4}>
                  <Typography type="subheading"className="font-medium">Staff Members</Typography>
                  <Typography style={{ paddingRight: '80px' }}>
                    {'Staff members can only see or manage certain features if you give them access.'}
                  </Typography>

                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields">
                      {this.props.users.filter(e => e.roles.findIndex(el => el === 'super-admin') === -1).map(user => (
                          <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center'}}>
                                  <Avatar style={{marginRight: '1em'}}>
                                      {user.profile.name.first.charAt(0)}{user.profile.name.last && user.profile.name.last.charAt(0)}
                                  </Avatar>
                                  <div>
                                      <Typography type="subheading">
                                          {user.profile.name.first} {user.profile.name.last || ''}
                                      </Typography>
                                      <Typography type="caption">
                                        {user.roles && user.roles.join(', ')}
                                      </Typography>
                                  </div>
                              </div>

                              <IconButton onClick={ev => this.handleClick(ev, user._id)}>
                                  <MoreVert />
                              </IconButton>

                          </div>
                      ))}

                      <Button style={{marginTop: '1em'}} type="primary" color="primary" raised onClick={() => this.setState({ addUserDialogOpen: true, addUserType: 'staff' })}>
                          Add staff member
                      </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

        </Grid>

        <Dialog fullWidth={true} maxWidth="sm" open={this.state.editDialogOpen} onClose={() => { this.setState({ editDialogOpen: false, }) }}>
            <DialogTitle id="simple-dialog-title">Modify {this.state.selectedUserName}</DialogTitle>
            <DialogContent>
                <List>
                    <ListItem button onClick={(e) => this.handleUserAction(e, 'edit')}>
                        <ListItemText primary="Basic Details" />
                    </ListItem>

                    <ListItem button onClick={(e) => this.handleUserAction(e, 'reset')}>
                        <ListItemText primary="Reset Password" />
                    </ListItem>

                    <ListItem button onClick={(e) => this.handleUserAction(e, 'delete')}>
                        <ListItemText primary="Delete" />
                    </ListItem>
                </List>
            </DialogContent>
        </Dialog>

      <Dialog fullWidth={true} maxWidth="md" open={this.state.basicDialogOpen} onClose={(ev) => { this.setState({ basicDialogOpen: false, }) }}>
          <DialogTitle id="simple-dialog-title">Edit {this.state.selectedUserName}</DialogTitle>
          <DialogContent>
              <form id="editUser" ref={form => this.form = form} onSubmit={event => this.handleEditUserSubmit(event)}>
                  <Grid container style={{ marginTop: '10px' }}>
                      <Grid item xs={12}>
                          <Typography type="body2">
                              Basic details
                          </Typography>
                      </Grid>
                  </Grid>
                  <Grid container>
                      <Grid item xs={12} md={6}>
                          <TextField
                              paceholder="First name"
                              label="First name"
                              fullWidth
                              name="firstNameEdit"
                              margin="normal"
                              required
                              defaultValue={this.state.editUserFirstName}
                          />
                      </Grid>
                      <Grid item xs={12} md={6}>
                          <TextField
                              paceholder="Last name"
                              label="Last name"
                              fullWidth
                              name="lastNameEdit"
                              margin="normal"
                              required
                              defaultValue={this.state.editUserLastName}
                          />
                      </Grid>
                  </Grid>

                  <Grid container>
                      <Grid item xs={12}>
                          <TextField
                              fullWidth
                              name="emailEdit"
                              label="Email"
                              margin="normal"
                              required
                              inputProps={{
                                  type: 'email',
                              }}
                              defaultValue={this.state.editUserEmail}
                          />
                      </Grid>
                  </Grid>

                  <Grid container style={{marginTop: '10px'}}>
                      <Grid item xs={12}>
                          <Typography type="body2">
                              Roles
                          </Typography>
                      </Grid>
                  </Grid>

                  <FormControl component="fieldset">
                      <FormGroup>
                          <FormControlLabel
                              key={12}
                              checked={this.state.rolesToAdd.findIndex(e => e === 'super-admin') !== -1}
                              onChange={() => this.handleChangeRoleCheckbox('super-admin')}
                              disabled={this.state.addUserType === 'staff'}
                              control={<Checkbox value={'super-admin'} disabled={this.state.addUserType === 'staff'}/>}
                              label={'Super admin'}
                          />
                          <FormControlLabel
                              key={13}
                              checked={this.state.rolesToAdd.findIndex(e => e === 'chef') !== -1}
                              onChange={() => this.handleChangeRoleCheckbox('chef')}
                              disabled={this.state.addUserType === 'owner'}
                              control={<Checkbox value={'chef'} disabled={this.state.addUserType === 'owner'}/>}
                              label={'Kitchen'}
                          />
                          <FormControlLabel
                              key={14}
                              checked={this.state.rolesToAdd.findIndex(e => e === 'delivery') !== -1}
                              onChange={() => this.handleChangeRoleCheckbox('delivery')}
                              disabled={this.state.addUserType === 'owner'}
                              control={<Checkbox value={'delivery'} disabled={this.state.addUserType === 'owner'}/>}
                              label={'Delivery'}
                          />
                      </FormGroup>
                  </FormControl>
                  <Grid container>
                      <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <div>
                              <Button onClick={() => { this.setState({ userDialogOpen: false, }) }}>
                                  Cancel
                              </Button>
                              <Button type="submit" color="primary" autoFocus>
                                  Update
                              </Button>
                          </div>
                      </Grid>
                  </Grid>
              </form>
          </DialogContent>
      </Dialog>

      <Dialog fullWidth={true} maxWidth="sm" open={this.state.resetDialogOpen} onClose={(ev) => { this.setState({ resetDialogOpen: false, }) }}>
          <DialogTitle id="simple-dialog-title">Reset password for {this.state.selectedUserName}?</DialogTitle>
          <DialogContent>
              <DialogContentText>
                  This will send password reset instructions to the users email
              </DialogContentText>
          </DialogContent>
          <DialogActions>
              <Button onClick={(ev) => { this.setState({ resetDialogOpen: false, }) }} >
                  Cancel
              </Button>
              <Button onClick={this.sendResetPassword} color="primary" autoFocus>
                  Reset
              </Button>
          </DialogActions>
      </Dialog>


      <Dialog fullWidth={true} maxWidth="sm" open={this.state.deleteDialogOpen} onClose={(ev) => { this.setState({ deleteDialogOpen: false, }) }}>
          <DialogTitle id="simple-dialog-title">Delete {this.state.selectedUserName}?</DialogTitle>

          <DialogContent>
              <DialogContentText>
                  Are you sure you want to delete {this.state.selectedUserName}?
              </DialogContentText>
          </DialogContent>

          <DialogActions>
              <Button onClick={(ev) => { this.setState({ deleteDialogOpen: false, }) }} color="primary">
                  Cancel
              </Button>
              <Button onClick={this.deleteUser} color="primary" autoFocus>
                  Delete
              </Button>
          </DialogActions>
      </Dialog>

      <Dialog fullWidth={true} maxWidth="md" open={this.state.addUserDialogOpen} onClose={(ev) => { this.setState({ addUserDialogOpen: false, rolesToAdd: [], }) }}>
          <DialogTitle id="simple-dialog-title">Add new {this.state.addUserType === 'owner' ? 'owner' : 'staff member'}</DialogTitle>
          <DialogContent>
              <form id="addUser" ref={form => this.form = form} onSubmit={event => this.handleAddUserSubmit(event)}>
                  <Grid container style={{ marginTop: '10px' }}>
                              <Grid item xs={12}>
                                  <Typography type="body2">
                                  Basic details
                                </Typography>
                          </Grid>
                      </Grid>
                    <Grid container>
                        <Grid item xs={12} md={6}>
                            <TextField
                                paceholder="First name"
                                label="First name"
                                fullWidth
                                name="firstName"
                                margin="normal"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                paceholder="Last name"
                                label="Last name"
                                fullWidth
                                name="lastName"
                                margin="normal"
                                required
                            />
                        </Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="email"
                                label="Email"
                                margin="normal"
                                required
                                inputProps={{
                                    type: 'email',
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="password"
                                label="Password"
                                margin="normal"
                                required
                            />
                        </Grid>
                    </Grid>

                      <Grid container style={{marginTop: '10px'}}>
                          <Grid item xs={12}>
                              <Typography type="body2">
                                  Roles
                              </Typography>
                          </Grid>
                      </Grid>

                      <FormControl component="fieldset">
                          <FormGroup>
                              <FormControlLabel
                                  key={12}
                                  checked={this.state.rolesToAdd.findIndex(e => e === 'super-admin') !== -1}
                                  onChange={() => this.handleChangeRoleCheckbox('super-admin')}
                                  disabled={this.state.addUserType === 'staff'}
                                  control={<Checkbox value={'super-admin'} disabled={this.state.addUserType === 'staff'}/>}
                                  label={'Super admin'}
                              />
                              <FormControlLabel
                                  key={13}
                                  checked={this.state.rolesToAdd.findIndex(e => e === 'chef') !== -1}
                                  onChange={() => this.handleChangeRoleCheckbox('chef')}
                                  disabled={this.state.addUserType === 'owner'}
                                  control={<Checkbox value={'chef'} disabled={this.state.addUserType === 'owner'}/>}
                                  label={'Kitchen'}
                              />
                              <FormControlLabel
                                  key={14}
                                  checked={this.state.rolesToAdd.findIndex(e => e === 'delivery') !== -1}
                                  onChange={() => this.handleChangeRoleCheckbox('delivery')}
                                  disabled={this.state.addUserType === 'owner'}
                                  control={<Checkbox value={'delivery'} disabled={this.state.addUserType === 'owner'}/>}
                                  label={'Delivery'}
                              />
                          </FormGroup>
                      </FormControl>
                      <Grid container>
                          <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end',  }}>
                              <div>
                                  <Button onClick={() => { this.setState({ userDialogOpen: false, }) }}>
                                      Cancel
                                  </Button>
                                  <Button type="submit" color="primary" autoFocus>
                                      Submit
                                  </Button>
                              </div>
                          </Grid>
                      </Grid>
                </form>
          </DialogContent>
      </Dialog>
      </div>);
  }
}


Team.propTypes = {
  users: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('users.team');

  return {
    loading: !subscription.ready(),
    users: Meteor.users.find().fetch(),
  };
})(Team);

