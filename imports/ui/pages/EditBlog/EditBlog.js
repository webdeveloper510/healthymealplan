import React from "react";
import PropTypes from "prop-types";

import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import Containers from "meteor/utilities:react-list-container";

import Grid from "material-ui/Grid";

import Ingredients from "../../../api/Ingredients/Ingredients";
import BlogCollection from "../../../api/Blog/Blog";
import InstructionsColl from "../../../api/Instructions/Instructions";

import BlogEditor from "../../components/BlogEditor/BlogEditor";
import Loading from "../../components/Loading/Loading";

import NotFound from "../NotFound/NotFound";

const DocumentContainer = Containers.DocumentContainer;

const EditBlog = ({
  blog,
  history,
  popTheSnackbar,
  match,
  loading
}) =>
  loading ? <Loading /> : !loading && blog ? (
    <Grid
      container
      className="EditBlog SideContent SideContent--spacer-2x--horizontal"
    >
      <DocumentContainer
        collection={BlogCollection}
        selector={{ _id: match.params._id }}
      >
        <BlogEditor
          loading={loading}
          newBlog={false}
          blog={blog}
          popTheSnackbar={popTheSnackbar}
          history={history}
        />
      </DocumentContainer>
    </Grid>
  ) : (
      <NotFound />
    );

EditBlog.defaultProps = {
  blog: null
};

EditBlog.propTypes = {
  blog: PropTypes.object,
  history: PropTypes.object.isRequired,
  potentialSubIngredients: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default withTracker(({ match }) => {
  const blogId = match.params._id;
  const subscription2 = Meteor.subscribe("blog.view", blogId);

  return {
    newBlog: false,
    loading: !subscription2.ready(),
    blog: BlogCollection.findOne(blogId),
    match,
  };

})(EditBlog);
