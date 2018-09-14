import React from 'react';
import PropTypes from 'prop-types';

import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import green from 'material-ui/colors/green';

import $ from 'jquery';
import validate from '../../../modules/validate';
import moment from 'moment';

const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

class Step1Eligibility extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submitLoading: false,
      submitSuccess: false,
      birthDay: '',
      birthMonth: ''
    };

    this.handleSubmitStep = this.handleSubmitStep.bind(this);
  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
      errorPlacement(error, element) {
        error.insertAfter(
          $(element)
            .parent()
            .parent(),
        );
      },

      rules: {
        first_name: {
          required: true,
        },

        last_name: {
          required: true,
        },

        email: {
          required: true,
          email: true,
        },

        phoneNumber: {
          minlength: 10,
          maxlength: 10,
          number: true,
        },

        type: {
          required: true,
        },

        postal_code: {
          cdnPostal: true,
          required: true,
        },
      },

      submitHandler() {
        component.handleSubmitStep();
      },
    });
  }

  handleSelectChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
      hasFormChanged: true,
    });
  }

  renderMonths() {
    const options = [];

    options.push(<MenuItem key={0} value=""></MenuItem>);

    for (let i = 1; i <= 12; i++) {
      options.push(<MenuItem key={i} value={i}>{moment().month(i - 1).format('MMMM')}</MenuItem>);
    }

    return options.map(e => e);
  }

  renderDays() {
    const options = [];

    options.push(<MenuItem key={0} value=""></MenuItem>);

    for (let i = 1; i <= 31; i++) {
      options.push(<MenuItem key={i} value={i}>{i}</MenuItem>);
    }

    return options.map(e => e);
  }

  handleSubmitStep() {
    this.setState({
      submitSuccess: false,
      submitLoading: true,
    });

    let dataToSave = {
      firstName: $('[name="first_name"]').val().trim(),
      lastName: $('[name="last_name"]').val().trim(),
      postalCode: $('[name="postal_code"]').val().trim(),
      email: $('[name="email"]').val().trim(),
      phoneNumber: $('[name="phoneNumber"]').val().trim(),
    };

    if (this.state.birthDay != "" && this.state.birthMonth != null) {
      dataToSave.birthDay = parseInt(this.state.birthDay, 10);
      dataToSave.birthMonth = parseInt(this.state.birthMonth, 10);
    }

    Meteor.call(
      'customers.step1',
      dataToSave,
      (err, userId) => {
        if (!err) {
          this.setState({
            submitSuccess: true,
            submitLoading: false,
          });

          this.props.saveValues({
            id: userId,
            ...dataToSave
          });

          this.props.handleNext();
        } else {
          console.log(err);

          this.setState({
            submitSuccess: false,
            submitLoading: false,
          });

          let userExists = '';

          if (err.reason.reason == 'Email already exists.') {
            userExists = 'User already exists.';
          }

          this.props.popTheSnackbar({
            message:
              userExists ||
              '' ||
              (err.reason.length ? err.reason : err.reason.reason),
          });
        }
      },
    );
  }

  render() {
    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess,
    });

    return (
      <form
        id="step0"
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid
          container
          justify="center"
          style={{ marginBottom: '50px', marginTop: '25px' }}
        >
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Eligibility
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Grid container>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        margin="normal"
                        id="first_name"
                        label="First name"
                        name="first_name"
                        fullWidth
                        defaultValue={this.props.customerInfo.firstName}
                        inputProps={{}}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        margin="normal"
                        id="last_name"
                        label="Last name"
                        name="last_name"
                        fullWidth
                        defaultValue={this.props.customerInfo.lastName}
                        inputProps={{}}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    margin="normal"
                    id="email"
                    label="Email"
                    name="email"
                    fullWidth
                    defaultValue={this.props.customerInfo.email}
                    inputProps={{}}
                  />
                  <Grid container>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        margin="normal"
                        id="phoneNumber"
                        label="Phone number"
                        name="phoneNumber"
                        fullWidth
                        defaultValue={this.props.customerInfo.phoneNumber}
                        inputProps={{}}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        margin="normal"
                        id="postalCode"
                        label="Postal code"
                        name="postal_code"
                        fullWidth
                        defaultValue={this.props.customerInfo.postalCode}
                        inputProps={{}}
                      />
                    </Grid>
                  </Grid>

                  <Grid container>
                    <Grid item xs={12}><Typography type="body1">Birthday</Typography></Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="birthMonth"
                        select
                        value={this.state.birthMonth}
                        label="Month"
                        onChange={this.handleSelectChange.bind(this)}
                        name="birthMonth"
                      >
                        {this.renderMonths()}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="birthDay"
                        select
                        value={this.state.birthDay}
                        label="Day"
                        onChange={this.handleSelectChange.bind(this)}
                        SelectProps={{ native: false }}
                        name="birthDay"
                      >
                        {this.renderDays()}
                      </TextField>
                    </Grid>
                  </Grid>

                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            disabled={this.state.submitLoading}
            raised
            className={`${buttonClassname}`}
            color="primary"
            type="submit"
          >
            Next
            {this.state.submitLoading && (
              <CircularProgress
                size={24}
                className={this.props.classes.buttonProgress}
              />
            )}
          </Button>
        </div>
      </form>
    );
  }
}

Step1Eligibility.defaultProps = {
  popTheSnackbar: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
};

export default withStyles(styles)(Step1Eligibility);
