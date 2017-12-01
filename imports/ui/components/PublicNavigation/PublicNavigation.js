import React from 'react';
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
    <Link to="/login">
      <Button color="contrast">Login</Button>
    </Link>
  </div>
);

export default PublicNavigation;
