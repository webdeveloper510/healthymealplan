import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
// import { timeago, monthDayYearAtTime } from '@cleverbeagle/dates';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import IngredientTypesCollection from '../../../api/IngredientTypes/IngredientTypes';
import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import Loading from '../../components/Loading/Loading';

// import './Ingredients.scss';

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

    <Grid container className="SideContent">
      <Grid item xs={12} className="page-header clearfix">
        <Typography type="headline" gutterBottom className="pull-left" color="inherit">Types</Typography>
        <Link className="pull-right" to={`${match.url}/new`}>
          <Button raised color="primary">Add Type</Button>
        </Link>
      </Grid>


      <Grid container>
        {ingredients.length ?
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>

                <TableCell />
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {ingredients.map(({ _id, title }) => (
                <TableRow key={_id}>
                  <TableCell><Typography type="subheading">{title}</Typography></TableCell>
                  {/* <TableCell>{timeago(updatedAt)}</TableCell>
            <TableCell>{monthDayYearAtTime(createdAt)}</TableCell> */}
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table> : <Alert bsStyle="warning">No Ingredients yet!</Alert>}
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
