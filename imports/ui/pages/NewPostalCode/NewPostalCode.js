import React from "react";
import { createContainer } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

import PropTypes from "prop-types";
import Grid from "material-ui/Grid";

import Routes from "../../../api/Routes/Routes";
import PostalCodeEditor from "../../components/PostalCodeEditor/PostalCodeEditor";

const NewPostalCode = ({
  history,
  popTheSnackbar,
  newPostalCode,
  routes,
  loading
}) => (
  <div>
    <Grid
      container
      className="NewPostalCode SideContent SideContent--spacer-2x--horizontal"
    >
      <PostalCodeEditor
        loading={loading}
        newPostalCode={true}
        popTheSnackbar={popTheSnackbar}
        history={history}
        routes={routes}
      />
    </Grid>
  </div>
);

NewPostalCode.propTypes = {
  newPostalCode: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired
};

export default createContainer(() => {
  const subscription = Meteor.subscribe("routes");

  return {
    loading: !subscription.ready(),
    routes: Routes.find().fetch()
  };
}, NewPostalCode);
