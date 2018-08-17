import React from "react";
import PropTypes from "prop-types";

import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

import Grid from "material-ui/Grid";

import Blog from "../../../api/Blog/Blog";

import BlogEditor from "../../components/BlogEditor/BlogEditor";

const BlogNew = ({
  history,
  popTheSnackbar,
  loading,
  newBlog,
}) => (
    <div>
      <Grid
        container
        className="NewBlog SideContent SideContent--spacer-2x--horizontal"
      >
        <BlogEditor
          history={history}
          popTheSnackbar={popTheSnackbar}
          newBlog={newBlog}
          loading={loading}
        />
      </Grid>
    </div>
  );

BlogNew.propTypes = {
  history: PropTypes.object.isRequired,
  potentialSubIngredients: PropTypes.array.isRequired,
  instructions: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired
};

export default withTracker(() => {

  return {
    newBlog: true,
    loading: false,
  };
})(BlogNew);
