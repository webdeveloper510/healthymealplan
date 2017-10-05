import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
// import { timeago, monthDayYearAtTime } from '@cleverbeagle/dates';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import { teal } from 'material-ui/colors';

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import IngredientsCollection from '../../../api/Ingredients/Ingredients';
import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import Loading from '../../components/Loading/Loading';

// import './Ingredients.scss';

const handleRemove = (event, ingredientId) => {
  event.stopPropagation();

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
  <div>
    <AuthenticatedSideNav history={history} />

    <Grid container className="SideContent" style={{ padding: '20px' }} spacing={8}>
      <Grid item xs={12} className="page-header clearfix">
        <Typography type="headline" gutterBottom className="pull-left" color="inherit">Ingredients</Typography>
        <Link className="pull-right" to={`${match.url}/new`}>
          <Button raised color="primary">Add Ingredient</Button>
        </Link>
      </Grid>

      <AppBar position="static" color="default">
        <Toolbar>
          <Typography type="display1" color="inherit">
            Title
          </Typography>
        </Toolbar>
      </AppBar>

      <Grid container>
        {ingredients.length ?
          <Table className="">
            <TableHead>
              <TableRow>
                <TableCell>Ingredient</TableCell>

                <TableCell />
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {ingredients.map(({ _id, title }) => (
                <TableRow hover key={_id} onClick={() => history.push(`${match.url}/${_id}`)}>
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
