import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, ButtonGroup } from 'react-bootstrap';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';
import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';

import NotFound from '../NotFound/NotFound';
import Loading from '../../components/Loading/Loading';

const handleRemove = (ingredientTypeId, history) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('ingredientTypes.remove', ingredientTypeId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Type deleted!', 'success');
        history.push('/types');
      }
    });
  }
};

const renderIngredientType = (ingredientType, match, history) => (ingredientType ? (
  <div>
    <AuthenticatedSideNav history={history} />,
    <Grid container className="ViewIngredient SideContent" spacing={8} style={{ padding: '20px' }}>
      <Grid item xs={12} className="page-header clearfix">
        <h4 className="pull-left">{ ingredientType && ingredientType.title }</h4>
        <ButtonToolbar className="pull-right">
          <ButtonGroup>
            <Button onClick={() => history.push(`${match.url}/edit`)}>Edit</Button>
            <Button onClick={() => handleRemove(ingredientType._id, history)} className="text-danger">
            Delete
            </Button>
          </ButtonGroup>
        </ButtonToolbar>
      </Grid>
      <Grid item xs={12}>
        { ingredientType && ingredientType.title }
      </Grid>
    </Grid>
  </div>
) : <NotFound />);

const ViewType = ({ loading, ingredientType, match, history }) => (
  !loading ? renderIngredientType(ingredientType, match, history) : <Loading />
);

ViewType.propTypes = {
  loading: PropTypes.bool.isRequired,
  ingredientType: PropTypes.object,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const ingredientTypeId = match.params._id;
  const subscription = Meteor.subscribe('ingredientTypes.view', ingredientTypeId);

  return {
    loading: !subscription.ready(),
    ingredientType: IngredientTypes.findOne(ingredientTypeId),
  };
}, ViewType);
