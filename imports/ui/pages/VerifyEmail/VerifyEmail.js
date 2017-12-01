import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

// Verify email needs to use the snackbar instead of bert! Redo!

class VerifyEmail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  componentDidMount() {
    const { match, history } = this.props;
    Accounts.verifyEmail(match.params.token, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
        this.setState({ error: `${error.reason}. Please try again.` });
      } else {
        setTimeout(() => {
          Bert.alert('All set, thanks!', 'success');
          history.push('/documents');
        }, 1500);
      }
    });
  }

  render() {
    return (
      <div className="VerifyEmail">
        {!this.state.error ? 'Verifying...' : this.state.error}
      </div>
    );
  }
}

VerifyEmail.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default VerifyEmail;
