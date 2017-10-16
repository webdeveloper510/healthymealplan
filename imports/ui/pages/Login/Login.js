import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import $ from 'jquery';
// import OAuthLoginButtons from '../../components/OAuthLoginButtons/OAuthLoginButtons';
import AccountPageFooter from '../../components/AccountPageFooter/AccountPageFooter';
import validate from '../../../modules/validate';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
      
      errorPlacement(error, element) {
        error.insertAfter($(element).parent().parent());
      },
      
      rules: {
        emailAddress: {
          required: true,
          email: true,
        },
        password: {
          required: true,
        },
      },
      messages: {
        emailAddress: {
          required: 'Need an email address here.',
          email: 'Is this email address correct?',
        },
        password: {
          required: 'Need a password here.',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  handleSubmit() {

    const { popTheSnackbar } = this.props;

    Meteor.loginWithPassword($('#email').val(), $('#password').val(), (error) => {
      if (error) {
        // Bert.alert(error.reason, 'danger');
        popTheSnackbar({

          message: `Email or password does not match.`,
        });

      } else {
        // history.push('/ingredients');
        popTheSnackbar({
          message: 'Welcome back!',
        });
      }
    });
  }


  render() {
    return (<div className="Login">
      <Grid container justify="center" style={{ height: '100%' }}>
        <Paper elevation={2} className="login-container">
          <Grid item xs={12}>
              <Typography type="headline" className="headline font-medium" style={{ paddingBottom: "20px" }}>Log in</Typography>

            {/* <Grid container>
                <Grid xs={12}>
                  {/* <OAuthLoginButtons
                    services={['facebook', 'github', 'google']}
                    emailMessage={{
                      offset: 100,
                      text: 'Log In with an Email Address',
                    }}
                  /> 
                </Grid>
                  </Grid> */}
            <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
              {/* <FormGroup>
                  <ControlLabel>Email Address</ControlLabel>
                  <input
                    type="email"
                    name="emailAddress"
                    ref={emailAddress => (this.emailAddress = emailAddress)}
                  />
                </FormGroup> */}
              <Grid item xs={12}>
                <TextField
                  style={{ marginTop: "1em" }}
                  fullWidth
                  id="email"
                  label="Email"
                  margin="normal"
                  InputProps={{
                    type: 'email',
                    name: 'emailAddress',
                  }}
                />
              </Grid>

              {/* <FormGroup>
                  <ControlLabel className="clearfix">
                    <span className="pull-left">Password</span>
                    {/* <Link className="pull-right" to="/recover-password">Forgot password?</Link> */}
              {/* </ControlLabel>
                  <input
                    type="password"
                    name="password"
                    ref={password => (this.password = password)}
                    className="form-control"
                  />
                </FormGroup> */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="password"
                  label="Password"
                  margin="normal"
                  InputProps={{
                    type: 'password',
                    name: 'password',
                  }}
                />
              </Grid>

              <Button type="submit" raised color="primary" className="btn btn-primary" style={{ marginTop: "25px", textTransform: 'none', float: 'right' }}>Log in</Button>
              {/* <AccountPageFooter>
                  <p>{'Don\'t have an account?'} <Link to="/signup">Sign Up</Link>.</p>
                </AccountPageFooter> */}
            </form>
          </Grid>
        </Paper>

      </Grid>

    </div>);
  }
}

Login.propTypes = {
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default Login;
