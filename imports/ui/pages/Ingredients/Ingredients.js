import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Alert, Button } from 'react-bootstrap';
// import { timeago, monthDayYearAtTime } from '@cleverbeagle/dates';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import IngredientsCollection from '../../../api/Ingredients/Ingredients';
import Loading from '../../components/Loading/Loading';

import './Ingredients.scss';

const handleRemove = (ingredientId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('documents.remove', ingredientId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Document deleted!', 'success');
      }
    });
  }
};

const Ingredients = ({ loading, ingredients, match, history }) => (!loading ? (
  <div className="Documents">
    <div className="page-header clearfix">
      <h4 className="pull-left">Ingredients</h4>
      <Link className="btn btn-success pull-right" to={`${match.url}/new`}>Add Ingredient</Link>
    </div>
    {ingredients.length ? <Table responsive>
      <thead>
        <tr>
          <th>Title</th>
          {/* <th>Last Updated</th>
          <th>Created</th> */}
          <th />
          <th />
        </tr>
      </thead>
      <tbody>
        {ingredients.map(({ _id, title }) => (
          <tr key={_id}>
            <td>{title}</td>
            {/* <td>{timeago(updatedAt)}</td>
            <td>{monthDayYearAtTime(createdAt)}</td> */}
            <td>
              <Button
                bsStyle="primary"
                onClick={() => history.push(`${match.url}/${_id}`)}
                block
              >View</Button>
            </td>
            <td>
              <Button
                bsStyle="danger"
                onClick={() => handleRemove(_id)}
                block
              >Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table> : <Alert bsStyle="warning">No Ingredients yet!</Alert>}
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
