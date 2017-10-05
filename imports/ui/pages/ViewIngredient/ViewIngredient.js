import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, ButtonGroup } from 'react-bootstrap';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import Ingredients from '../../../api/Ingredients/Ingredients';
import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';

import NotFound from '../NotFound/NotFound';
import Loading from '../../components/Loading/Loading';

const handleRemove = (documentId, history) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('ingredients.remove', documentId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Ingredient deleted!', 'success');
        history.push('/ingredients');
      }
    });
  }
};

const renderIngredient = (ingredient, match, history) => (ingredient ? (
  <div>
    <AuthenticatedSideNav history={history} />,
    <Grid container className="ViewIngredient SideContent">
      <Grid item xs={12} className="page-header clearfix">
        <h4 className="pull-left">{ ingredient && ingredient.title }</h4>
        <ButtonToolbar className="pull-right">
          <ButtonGroup>
            <Button onClick={() => history.push(`${match.url}/edit`)}>Edit</Button>
            <Button onClick={() => handleRemove(ingredient._id, history)} className="text-danger">
            Delete
            </Button>
          </ButtonGroup>
        </ButtonToolbar>
      </Grid>
      <Grid item xs={12}>
        { ingredient && ingredient.title }
      </Grid>
    </Grid>
  </div>
) : <NotFound />);

const ViewIngredient = ({ loading, ingredient, match, history }) => (
  !loading ? renderIngredient(ingredient, match, history) : <Loading />
);

ViewIngredient.propTypes = {
  loading: PropTypes.bool.isRequired,
  ingredient: PropTypes.object,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const ingredientId = match.params._id;
  const subscription = Meteor.subscribe('ingredients.view', ingredientId);

  return {
    loading: !subscription.ready(),
    ingredient: Ingredients.findOne(ingredientId),
  };
}, ViewIngredient);
