import React from "react";
import PropTypes from "prop-types";
import { createContainer } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import Grid from "material-ui/Grid";

import PostalCodes from "../../../api/PostalCodes/PostalCodes";
import Routes from "../../../api/Routes/Routes";

import PostalCodeEditor from "../../components/PostalCodeEditor/PostalCodeEditor";
import NotFound from "../NotFound/NotFound";

const EditPostalCode = ({
  postalCode,
  routes,
  newPostalCode,
  history,
  popTheSnackbar
}) =>
  postalCode ? (
    <div>
      <Grid
        container
        className="EditPostalCode SideContent SideContent--spacer-2x--horizontal"
      >
        <PostalCodeEditor
          newPostalCode={newPostalCode}
          postalCode={postalCode}
          routes={routes}
          popTheSnackbar={popTheSnackbar}
          history={history}
        />
      </Grid>
    </div>
  ) : (
    <NotFound />
  );

EditPostalCode.defaultProps = {
  postalCode: null
};

EditPostalCode.propTypes = {
  postalCode: PropTypes.object,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  routes: PropTypes.array.isRequired
};

export default createContainer(({ match }) => {
  const postalCodeId = match.params._id;
  const subscription = Meteor.subscribe("postalcodes.view", postalCodeId);
  const subscription2 = Meteor.subscribe("routes");

  return {
    newPostalCode: false,
    loading: !subscription.ready() && !subscription2.ready(),
    postalCode: PostalCodes.findOne(postalCodeId),
    routes: Routes.find().fetch()
  };
}, EditPostalCode);
