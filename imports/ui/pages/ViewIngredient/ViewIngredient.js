import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import Ingredients from '../../../api/Ingredients/Ingredients';
import NotFound from '../NotFound/NotFound';
import Loading from '../../components/Loading/Loading';

const handleRemove = (ingredientId, history) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('ingredients.remove', ingredientId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Ingredient deleted!', 'success');
        history.push('/ingredients');
      }
    });
  }
};

const renderIngredient = (doc, match, history) => (doc ? (
  <div className="ViewIngredient">
    <div className="page-header clearfix">
      <h4 className="pull-left">{ doc && doc.title }</h4>
      <ButtonToolbar className="pull-right">
        <ButtonGroup bsSize="small">
          <Button onClick={() => history.push(`${match.url}/edit`)}>Edit</Button>
          <Button onClick={() => handleRemove(doc._id, history)} className="text-danger">
            Delete
          </Button>
        </ButtonGroup>
      </ButtonToolbar>
    </div>
    { doc && doc.body }
  </div>
) : <NotFound />);

const ViewIngredient = ({ loading, doc, match, history }) => (
  !loading ? renderIngredient(doc, match, history) : <Loading />
);

ViewIngredient.propTypes = {
  loading: PropTypes.bool.isRequired,
  doc: PropTypes.object,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const ingredientId = match.params._id;
  const subscription = Meteor.subscribe('ingredients.view', ingredientId);

  return {
    loading: !subscription.ready(),
    doc: Ingredients.findOne(ingredientId),
  };
}, ViewIngredient);
