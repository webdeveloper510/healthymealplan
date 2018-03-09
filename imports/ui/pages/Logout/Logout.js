import React from 'react';
import Icon from '../../components/Icon/Icon';

import './Logout.scss';

class Logout extends React.Component {
  componentDidMount() {
    Meteor.logout();
    this.props.history.push('/login');
  }

  render() {

    return (
      <div className="Logout">
        
      </div>
    );
  }
}

Logout.propTypes = {};

export default Logout;
