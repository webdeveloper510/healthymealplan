import React from 'react';
import PropTypes from 'prop-types';
import { Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Grid from 'material-ui/Grid';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';

import PublicNavigation from '../PublicNavigation/PublicNavigation';
import AuthenticatedNavigation from '../AuthenticatedNavigation/AuthenticatedNavigation';

import './Navigation.scss';

const styles = theme => ({
  root: {
    marginTop: theme.spacing.unit * 3,
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
});

const Navigation = props => (
  // <Navbar>
  //   <Navbar.Header>
  //     <Navbar.Brand>
  //       <Link to="/">Healthy Meal Plan</Link>
  //     </Navbar.Brand>
  //     <Navbar.Toggle />
  //   </Navbar.Header>
  //   <Navbar.Collapse>
  //     {!props.authenticated ? <PublicNavigation /> : <AuthenticatedNavigation {...props} />}
  //   </Navbar.Collapse>
  // </Navbar>
  <AppBar position="static">
    <Toolbar>
      <Grid
        container
        align={'center'}
        justify={'space-between'}
      >
        <Typography type="title" color="inherit" className={styles.flex}>
        Healthy Meal Plan
        </Typography>
        {!props.authenticated ? <PublicNavigation /> : <AuthenticatedNavigation {...props} />}
      </Grid>
    </Toolbar>
  </AppBar>
);

Navigation.defaultProps = {
  name: '',
};

Navigation.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default Navigation;
