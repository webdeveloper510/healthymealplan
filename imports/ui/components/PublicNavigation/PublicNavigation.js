import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav, NavItem } from 'react-bootstrap';
import Button from 'material-ui/Button';
import { Link } from 'react-router-dom';

const styles = theme => ({
  rightNav: {
    float: 'right',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
});

const PublicNavigation = () => (
  <div className={styles.rightNav}>
    <Link to="/signup">
      <Button color="contrast">Sign up</Button>
    </Link>
    <Link eventKey={2} to="/login">
      <Button color="contrast">Login</Button>
    </Link>
  </div>
);

export default PublicNavigation;
