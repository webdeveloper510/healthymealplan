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
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import IngredientsCollection from '../../../api/Ingredients/Ingredients';
import Loading from '../../components/Loading/Loading';

// import './Ingredients.scss';

const handleRemove = (ingredientId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('ingredients.remove', ingredientId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Ingredient deleted!', 'success');
      }
    });
  }
};

const Ingredients = ({ loading, ingredients, match, history }) => (!loading ? (
  <Grid container className="Documents" style={{ padding: '20px' }} spacing={8}>
    <Grid item xs={12} className="page-header clearfix">
      <h4 className="pull-left">Ingredients</h4>
      <Link className="pull-right" to={`${match.url}/new`}><Button raised color="primary">Add Ingredient</Button></Link>
    </Grid>
    <Grid container style={{ padding: '20px' }}>
      {ingredients.length ?
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ingredient</TableCell>

              <TableCell />
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.map(({ _id, title }) => (
              <TableRow key={_id}>
                <TableCell>{title}</TableCell>
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
) : <Loading />);

Ingredients.propTypes = {
  loading: PropTypes.bool.isRequired,
  ingredients: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('ingredients');
  return {
    loading: !subscription.ready(),
    ingredients: IngredientsCollection.find().fetch(),
  };
}, Ingredients);
