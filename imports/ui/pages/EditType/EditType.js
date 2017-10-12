import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';
import TypeEditor from '../../components/TypeEditor/TypeEditor';
import NotFound from '../NotFound/NotFound';

const EditType = ({ ingredientType, history }) => (ingredientType ? (
  <div className="EditType">
    <h4 className="page-header">{`Editing "${ingredientType.title}"`}</h4>
    <TypeEditor ingredientType={ingredientType} history={history} />
  </div>
) : <NotFound />);

EditType.defaultProps = {
  ingredientType: null,
};

EditType.propTypes = {
  ingredientType: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const ingredientTypeId = match.params._id;
  const subscription = Meteor.subscribe('ingredientTypes.view', ingredientTypeId);

  return {
    loading: !subscription.ready(),
    ingredientType: IngredientTypes.findOne(ingredientTypeId),
  };
}, EditType);
