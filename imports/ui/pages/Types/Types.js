import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { timeago, monthDayYearAtTime } from '@cleverbeagle/dates';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import Checkbox from 'material-ui/Checkbox';

import IngredientTypesCollection from '../../../api/IngredientTypes/IngredientTypes';
import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import Loading from '../../components/Loading/Loading';
import { teal, red } from 'material-ui/colors';

const primary = teal[500];
const danger = red[700];

const handleRemove = (ingredientId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('ingredientTypes.remove', ingredientId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Type deleted!', 'success');
      }
    });
  }
};

const IngredientTypes = ({ loading, ingredients, match, history }) => (!loading ? (
  <div>
    <AuthenticatedSideNav history={history} />

    <Grid container className="SideContent SideContent--spacer-2x--horizontal" spacing={8}>

      <Grid container className="clearfix">
        <Grid item xs={6}>
          <Typography type="headline" gutterBottom className="headline pull-left" style={{ fontWeight: 500 }} color="inherit">Types</Typography>
        </Grid>
        <Grid item xs={6}>
          <Button className="button button--primary" onClick={() => history.push('/types/new')} raised color="primary" style={{ float: 'right', backgroundColor: primary }}>Add type</Button>
        </Grid>
      </Grid>


      <Grid container>
        <Grid item xs={12}>
          <Paper elevation={2} className="table-container">
            {ingredients.length ?
              <Table>
                <TableHead>
                <TableRow>
                    <TableCell padding="checkbox" style={{ width: '100px' }}><Checkbox /></TableCell>

                    <TableCell><Typography type="body2">Type</Typography></TableCell>
                  </TableRow>
              </TableHead>
                <TableBody>
                {ingredients.map(({ _id, title, createdAt }) => (
                    <TableRow hover key={_id} i>
                      <TableCell style={{ paddingTop: '10px', paddingBottom: '10px', width: '100px' }} padding="checkbox">
                        <Checkbox id={_id} onChange={this.rowSelected} />
                      </TableCell>
                      <TableCell onClick={() => history.push(`${match.url}/${_id}`)}><Typography type="subheading">{title}</Typography></TableCell>
                      {/* <TableCell>
                        <Button
                          raised
                          color="primary"
                          onClick={() => history.push(`${match.url}/${_id}`)}
                        >View</Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          raised
                          onClick={() => handleRemove(_id)}
                        >Delete</Button>
                      </TableCell> */}
                    </TableRow>
                  ))}
              </TableBody>
              </Table> : <Alert bsStyle="warning">No Types yet!</Alert>}
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  </div>
) : <Loading />);

IngredientTypes.propTypes = {
  loading: PropTypes.bool.isRequired,
  ingredients: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('ingredientTypes');
  return {
    loading: !subscription.ready(),
    ingredients: IngredientTypesCollection.find().fetch(),
  };
}, IngredientTypes);
