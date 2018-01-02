import React from "react";
import PropTypes from "prop-types";

import { createContainer } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

import Grid from "material-ui/Grid";

import Categories from "../../../api/Categories/Categories";
import IngredientTypes from "../../../api/IngredientTypes/IngredientTypes";
import Ingredients from "../../../api/Ingredients/Ingredients";

import RestrictionEditor from "../../components/RestrictionEditor/RestrictionEditor";

const NewRestriction = ({
  history,
  ingredientTypes,
  ingredients,
  categories,
  newRestriction,
  popTheSnackbar
}) => (
  <div>
    <Grid
      container
      className="NewRestriction SideContent SideContent--spacer-2x--horizontal"
    >
      <RestrictionEditor
        history={history}
        popTheSnackbar={popTheSnackbar}
        newRestriction={newRestriction}
        ingredientTypes={ingredientTypes}
        ingredients={ingredients}
        categories={categories}
      />
    </Grid>
  </div>
);

NewRestriction.propTypes = {
  history: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  ingredientTypes: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  newRestriction: PropTypes.bool.isRequired,
  ingredients: PropTypes.array.isRequired
};

export default createContainer(() => {
  const subscription = Meteor.subscribe("categories");
  const subscription2 = Meteor.subscribe("ingredientTypes");
  const subscription3 = Meteor.subscribe("ingredients");

  return {
    newRestriction: true,
    loading:
      !subscription2.ready() && !subscription.ready() && !subscription3.ready(),
    categories: Categories.find().fetch(),
    ingredientTypes: IngredientTypes.find().fetch(),
    ingredients: Ingredients.find().fetch()
  };
}, NewRestriction);
