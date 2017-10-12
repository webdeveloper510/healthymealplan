import React from 'react';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
// import OAuthLoginButtons from '../../components/OAuthLoginButtons/OAuthLoginButtons';
import AccountPageFooter from '../../components/AccountPageFooter/AccountPageFooter';
import validate from '../../../modules/validate';

import SnackbarCommon from '../../components/Snackbar/SnackbarCommon';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      snackbarOpen: false,
      snackbarMessageText: '',
      snackbarButtonText: '',
      snackbarButtonLink: '',
    };

  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
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
    const { history } = this.props;

    Meteor.loginWithPassword(this.emailAddress.value, this.password.value, (error) => {
      if (error) {
        // Bert.alert(error.reason, 'danger');
        this.openSnackbar({

          message: `There was an error ${error.reason}`,
        });

      } else {
        // history.push('/ingredients');
        this.openSnackbar({
          message: 'Welcome back!',
        });
      }
    });
  }

  openSnackbar({ message, buttonText, link }) {
    this.setState({
      snackbarOpen: true,
      snackbarMessageText: message,
      snackbarButtonText: buttonText || '',
      snackbarButtonLink: link || '',
    });
  }

  closeSnackbar() {
    this.setState({
      snackbarOpen: false,
    });
  }

  render() {
    return (<div className="Login">
      <Row>
        <Col xs={12} sm={6} md={5} lg={4}>
          <h4 className="page-header">Log In</h4>
          <Row>
            <Col xs={12}>
              {/* <OAuthLoginButtons
                services={['facebook', 'github', 'google']}
                emailMessage={{
                  offset: 100,
                  text: 'Log In with an Email Address',
                }}
              /> */}
            </Col>
          </Row>
          <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
            <FormGroup>
              <ControlLabel>Email Address</ControlLabel>
              <input
                type="email"
                name="emailAddress"
                ref={emailAddress => (this.emailAddress = emailAddress)}
                className="form-control"
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel className="clearfix">
                <span className="pull-left">Password</span>
                <Link className="pull-right" to="/recover-password">Forgot password?</Link>
              </ControlLabel>
              <input
                type="password"
                name="password"
                ref={password => (this.password = password)}
                className="form-control"
              />
            </FormGroup>
            <Button type="submit" bsStyle="success">Log In</Button>
            <AccountPageFooter>
              <p>{'Don\'t have an account?'} <Link to="/signup">Sign Up</Link>.</p>
            </AccountPageFooter>
          </form>
        </Col>
      </Row>

      <SnackbarCommon
        snackbarMessageText={this.state.snackbarMessageText}
        snackbarButtonText={this.state.snackbarButtonText}
        snackbarButtonLink={this.state.snackbarButtonLink}
        snackbarOpen={this.state.snackbarOpen}
        handleRequestClose={this.closeSnackbar.bind(this)}
        autoHideDuration={5000}
      />
    </div>);
  }
}

Login.propTypes = {
  history: PropTypes.object.isRequired,
};

export default Login;
