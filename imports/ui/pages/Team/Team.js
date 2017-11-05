/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';


import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';


import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';

import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';

import { teal, red } from 'material-ui/colors';
import ChevronLeft from 'material-ui-icons/ChevronLeft';
// import Search from 'material-ui-icons/Search';


// import { Bert } from 'meteor/themeteorchef:bert';
// import validate from '../../../modules/validate';

import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';

const primary = teal[500];
const danger = red[700];

const styles = theme => ({


});


class Team extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };

    // console.log(this.props.ingredient);
  }

  componentDidMount() {
    const component = this;
    // validate(component.form, {
    //   rules: {
    //     title: {
    //       required: true,
    //     },

    //   },
    //   messages: {
    //     title: {
    //       required: 'Need a title in here, Seuss.',
    //     },

    //   },
    //   submitHandler() { component.handleSubmit(); },
    // });
  }


  // Use your imagination to render suggestions.


  render() {
    console.log(this.props.users);
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
                  <Paper elevation={2} className="paper-for-fields" />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider light className="divider--space-x" />

          <Grid container justify="center" style={{ marginBottom: '75px' }}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12} sm={4}>
                  <Typography type="subheading" className="font-medium">Staff Members</Typography>
                  <Typography style={{ paddingRight: '80px' }}>
                    {'Staff members can only see or manage certain features if you give them access.'}
                  </Typography>

                </Grid>
                <Grid item xs={12} sm={8}>
                  <Paper elevation={2} className="paper-for-fields" />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

        </Grid>
      </div>);
  }
}


Team.propTypes = {
  // ingredient: PropTypes.object,
  // ingredientTypes: PropTypes.array.isRequired,
  // potentialSubIngredients: PropTypes.array,
  users: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
};


export default createContainer(() => {
  const subscription = Meteor.subscribe('users.team');

  return {
    loading: !subscription.ready(),
    users: Meteor.users.find().fetch(),
  };
}, Team);

