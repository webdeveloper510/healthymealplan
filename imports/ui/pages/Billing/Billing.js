import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";

import $ from "jquery";

import Button from "material-ui/Button";
import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";
import Input from "material-ui/Input";
import SearchIcon from "material-ui-icons/Search";
import ClearIcon from "material-ui-icons/Clear";
import AppBar from "material-ui/AppBar";
import Tabs, { Tab } from "material-ui/Tabs";
import Containers from "meteor/jivanysh:react-list-container";

import InvoicesCollection from "../../../api/Invoices/Invoices";
import Subscriptions from "../../../api/Subscriptions/Subscriptions";

import Loading from "../../components/Loading/Loading";

const ListContainer = Containers.ListContainer;

class Billing extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      options: { sort: { SKU: -1 } },
      searchSelector: "",
      currentTabValue: 0
    };
  }

  searchByName() {

    this.setState({
      searchSelector: $("#search-type-text").val()
    });

  }

  clearSearchBox() {
    $("#search-type-text").val("");

    this.setState({
      searchSelector: {}
    });
  }

  sortByOption(field) {
    // const field = event.currentTarget.getAttribute('data-sortby');

    // This is a filler object that we are going to use set the state with.
    // Putting the sortBy field using index as objects can also be used as arrays.
    // the value of it would be 1 or -1 Asc or Desc

    const stateCopyOptions = this.state.options;
    const newOptions = {};

    // if user has selected to sort by that table column
    if (stateCopyOptions.sort.hasOwnProperty(`${field}`)) {
      if (stateCopyOptions.sort[field] === -1) {
        newOptions[field] = 1;
      } else if (stateCopyOptions.sort[field] === 1) {
        newOptions[field] = -1;
      }
    } else {
      // if user selects a new table column to sort
      newOptions[field] = 1;
    }

    this.setState({
      options: { sort: newOptions }
    });

  }

  handleTabChange(event, value) {
    this.setState({ currentTabValue: value });
  }

  render() {
    const { loading, history } = this.props;

    return !loading ? (
      <div>
        <Grid
          container
          className="SideContent SideContent--spacer-2x--horizontal SideContent--spacer-2x--top"
        >
          <Grid container className="clearfix">
            <Grid item xs={6}>
              <Typography
                type="headline"
                gutterBottom
                className="headline pull-left"
                style={{ fontWeight: 500 }}
              >
                Billing
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Button
                className="btn btn-primary"
                onClick={() => history.push("/categories/new")}
                raised
                color="primary"
                style={{ float: "right" }}
              >
                Add invoice
              </Button>
            </Grid>
          </Grid>

          <div style={{ marginTop: "25px" }}>
            <AppBar
              position="static"
              className="appbar--no-background appbar--no-shadow"
            >
              <Tabs
                indicatorColor="#000"
                value={this.state.currentTabValue}
                onChange={this.handleTabChange.bind(this)}
              >
                <Tab label="All" />
                {/* <Tab label="Item Two" />
                  <Tab label="Item Three" /> */}
              </Tabs>
            </AppBar>
          </div>

          <div
            style={{
              width: "100%",
              background: "#FFF",
              borderTopRightRadius: "2px",
              borderTopLeftRadius: "2px",
              marginTop: "3em",
              padding: "16px 25px 1em",
              boxShadow:
                "0px 0px 5px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 1px -2px rgba(0, 0, 0, 0.12)",
              position: "relative"
            }}
          >
            <SearchIcon
              className="autoinput-icon autoinput-icon--search"
              style={{
                display:
                  this.state.searchSelector.length > 0 ? "none" : "block",
                top: "33%",
                right: "1.8em !important"
              }}
            />

            <ClearIcon
              className="autoinput-icon--clear"
              onClick={this.clearSearchBox.bind(this)}
              style={{
                cursor: "pointer",
                display: this.state.searchSelector.length > 0 ? "block" : "none"
              }}
            />

            <Input
              className="input-box"
              style={{ width: "100%", position: "relative" }}
              placeholder="Search invoices"
              onKeyUp={this.searchByName.bind(this)}
              inputProps={{
                id: "search-type-text",
                "aria-label": "Description"
              }}
            />
          </div>
          <ListContainer
            limit={50}
            collection={InvoicesCollection}
            publication="invoices"
            joins={[
              {
                localProperty: "subscriptionId",
                collection: Subscriptions,
                joinAs: "joinedSubscription"
              },
              {
                localProperty: "customerId",
                collection: Meteor.users,
                joinAs: "joinedCustomer"
              }
            ]}
            options={this.state.options}
            selector={{
              $or: [
                {
                  _id: {
                    $regex: new RegExp(this.state.searchSelector),
                    $options: "i"
                  }
                },
                {
                  customerId: {
                    $regex: new RegExp(this.state.searchSelector),
                    $options: "i"
                  }
                },
                {
                  transactionId: {
                    $regex: new RegExp(this.state.searchSelector),
                    $options: "i"
                  }
                },
                {
                  subscriptionId: {
                    $regex: new RegExp(this.state.searchSelector),
                    $options: "i"
                  }
                }
              ]
            }}
          >
 
          </ListContainer>
        </Grid>
      </div>
    ) : (
        <Loading />
      );
  }
}

Billing.propTypes = {
  loading: PropTypes.bool.isRequired,
  invoices: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

export default createContainer(() => {
  const subscription = Meteor.subscribe("invoices");
  const subscription2 = Meteor.subscribe("subscriptions");
  const subscription3 = Meteor.subscribe("users.customers");

  return {
    loading:
      !subscription.ready() && !subscription2.ready() && !subscription3.ready(),
    invoices: InvoicesCollection.find().fetch()
  };
}, Billing);
