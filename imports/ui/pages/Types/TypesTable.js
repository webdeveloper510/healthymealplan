import { Meteor } from "meteor/meteor";
import React from "react";
import PropTypes from "prop-types";
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel
} from "material-ui/Table";

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "material-ui/Dialog";

import $ from "jquery";
import Paper from "material-ui/Paper";
import Typography from "material-ui/Typography";
import Checkbox from "material-ui/Checkbox";
import Button from "material-ui/Button";
import Menu, { MenuItem } from "material-ui/Menu";

import { createContainer } from "meteor/react-meteor-data";
import IngredientTypesCollection from "../../../api/IngredientTypes/IngredientTypes";
import Loading from "../../components/Loading/Loading";

class TypesTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkboxesSelected: false,
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      deleteDialogOpen: false
    };
  }
  rowSelected(e, event, checked) {
    const selectedRowId = event.target.parentNode.parentNode.getAttribute("id");
    $(`.${selectedRowId}`).toggleClass("row-selected");
    let currentlySelectedCheckboxes;

    const clonedSelectedCheckboxes = this.state.selectedCheckboxes
      ? this.state.selectedCheckboxes.slice()
      : [];

    if ($(event.target).prop("checked")) {
      currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber + 1;
      clonedSelectedCheckboxes.push(e._id);
    } else {
      currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber - 1;
      clonedSelectedCheckboxes.splice(
        clonedSelectedCheckboxes.indexOf(e._id),
        1
      );
    }

    this.setState({
      selectedCheckboxesNumber: currentlySelectedCheckboxes,
      selectedCheckboxes: clonedSelectedCheckboxes
    });
  }

  selectAllRows(event) {
    let allCheckboxIds = [];

    if ($(event.target).prop("checked")) {
      $(".row-checkbox").each((index, el) => {
        // make the row selected
        $(`.${el.getAttribute("id")}`).addClass("row-selected");

        // push the ids to a array
        allCheckboxIds.push(el.getAttribute("id"));

        // set each checkbox checked
        $(el)
          .children()
          .find('input[type="checkbox"]')
          .prop("checked", true);
      });
    } else {
      allCheckboxIds = [];

      $(".row-checkbox").each((index, el) => {
        // // make the row selected
        $(`.${el.getAttribute("id")}`).removeClass("row-selected");

        // set each checkbox checked
        $(el)
          .children()
          .find('input[type="checkbox"]')
          .prop("checked", false);
      });
    }

    this.setState({
      selectedCheckboxesNumber: allCheckboxIds.length,
      selectedCheckboxes: allCheckboxIds
    });
  }

  deleteSelectedRows() {

    localStorage.setItem(
      "ingredientTypeTableDeleted",
      this.state.selectedCheckboxesNumber
    );

    const ingredientIds = this.state.selectedCheckboxes;

    Meteor.call("ingredientTypes.batchRemove", ingredientIds, error => {
      if (error) {
        this.props.popTheSnackbar({
          message: error.reason
        });
      } else {
        this.props.popTheSnackbar({
          message: `${localStorage.getItem(
            "ingredientTypeTableDeleted"
          )} type deleted.`
        });
      }
    });

    this.setState({
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      deleteDialogOpen: false
    });
  }

  renderNoResults(count) {
    if (count == 0) {
      return (
        <p style={{ padding: "25px" }} className="subheading">
          No type found for &lsquo;<span className="font-medium">
            {this.props.searchTerm}
          </span>&rsquo;
        </p>
      );
    }
  }

  isCheckboxSelected(id) {

    if (this.state.selectedCheckboxes.length) {
      if (this.state.selectedCheckboxes.indexOf(id) !== -1) {
        return true;
      }
    }

    return false;
  }

  deleteDialogHandleClickOpen() {
    this.setState({ deleteDialogOpen: true });
  }

  deleteDialogHandleRequestClose() {
    this.setState({ deleteDialogOpen: false });
  }

  render() {
    console.log(this.props);

    return (
      <div>
        <Paper elevation={2} className="table-container">
          {this.state.selectedCheckboxes.length > 0 ? (
            <div className="table-container--delete-rows-container">
              <Typography
                style={{ color: "#fff" }}
                className="subheading"
                type="subheading"
              >
                {this.state.selectedCheckboxesNumber} type{this.state
                  .selectedCheckboxes.length > 1
                  ? "s"
                  : ""}{" "}
                selected
              </Typography>
              <Button
                style={{ color: "#FFF" }}
                onClick={this.deleteDialogHandleClickOpen.bind(this)}
              >
                Delete
              </Button>
            </div>
          ) : (
              ""
            )}

          <Table style={{ tableLayout: "fixed" }}>
            {this.props.count > 0 ? (
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" style={{ width: "12%" }}>
                    <Checkbox onClick={this.selectAllRows.bind(this)} />
                  </TableCell>
                  <TableCell
                    padding="none"
                    style={{ width: "44%" }}
                    onClick={() => this.props.sortByOptions("SKU")}
                  >
                    <Typography
                      className="body2 table-head-col-hover"
                      type="body2"
                    >
                      SKU
                    </Typography>
                  </TableCell>

                  <TableCell
                    padding="none"
                    style={{ width: "44%" }}
                    onClick={() => this.props.sortByOptions("title")}
                  >
                    <Typography
                      className="body2 table-head-col-hover"
                      type="body2"
                    >
                      Type
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
            ) : (
                ""
              )}
            <TableBody>
              {this.props.results.map((e, i) => {
                const isSelected = this.isCheckboxSelected(e._id);

                return (
                  <TableRow hover className={e._id} key={e._id}>
                    <TableCell
                      style={{
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        width: "12%"
                      }}
                      padding="checkbox"
                    >
                      <Checkbox
                        className="row-checkbox"
                        id={e._id}
                        checked={isSelected}
                        onChange={this.rowSelected.bind(this, e)}
                      />
                    </TableCell>
                    <TableCell
                      style={{ width: "44%" }}
                      padding="none"
                      onClick={() =>
                        this.props.history.push(`types/${e._id}/edit`)
                      }
                    >
                      <Typography className="subheading" type="subheading">
                        {e.SKU ? e.SKU : ""}
                      </Typography>
                    </TableCell>
                    <TableCell
                      style={{
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        width: "44%"
                      }}
                      padding="none"
                      onClick={() =>
                        this.props.history.push(`types/${e._id}/edit`)
                      }
                    >
                      <Typography
                        type="subheading"
                        className="subheading"
                        style={{ textTransform: "capitalize" }}
                      >
                        {e.title}
                      </Typography>
                    </TableCell>
                    {/* <TableCell
                      style={{
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        width: "12%"
                      }}
                      padding="none"
                      onClick={() =>
                        this.props.history.push(`types/${e._id}/edit`)
                      }
                    >
                      <Typography
                        type="subheading"
                        className="subheading"
                        style={{ textTransform: "capitalize" }}
                      >
                        {e.typeCategory}
                      </Typography>
                    </TableCell> */}
                  </TableRow>
                );
              })}

              {this.renderNoResults(this.props.count)}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>
                  <Typography
                    className="body2 font-medium"
                    type="body2"
                    style={{ color: "rgba(0, 0, 0, .54)" }}
                  >
                    {this.props.count} of {this.props.typesCount} types
                  </Typography>
                </TableCell>

                <TableCell />
                <TableCell
                  style={{
                    display: "flex",
                    height: "56px",
                    alignItems: "center",
                    justifyContent: "flex-end"
                  }}
                >
                  {this.props.hasMore ? (
                    <Button onClick={this.props.loadMore}>Load More</Button>
                  ) : (
                      ""
                    )}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </Paper>
        <Dialog
          open={this.state.deleteDialogOpen}
          onClose={this.deleteDialogHandleRequestClose.bind(this)}
        >
          <Typography
            style={{
              flex: "0 0 auto",
              margin: "0",
              padding: "24px 24px 20px 24px"
            }}
            className="title font-medium"
            type="title"
          >
            Delete {this.state.selectedCheckboxesNumber} type{this.state
              .selectedCheckboxes.length > 1
              ? "s"
              : ""}?
          </Typography>
          <DialogContent>
            <DialogContentText className="subheading">
              {" "}
              Are you sure you want to delete{" "}
              {this.state.selectedCheckboxesNumber} type{this.state
                .selectedCheckboxes.length > 1
                ? "s"
                : ""}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.deleteDialogHandleRequestClose.bind(this)}
              color="default"
            >
              Cancel
            </Button>
            <Button
              stroked
              className="button--bordered button--bordered--accent"
              onClick={this.deleteSelectedRows.bind(this)}
              color="accent"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

TypesTable.propTypes = {
  results: PropTypes.isRequired,
  history: PropTypes.func.isRequired,
  sortByOptions: PropTypes.func.isRequired
};

export default createContainer(() => {
  const typesCountSub = Meteor.subscribe("types-all-count");

  return {
    // ingredientTypes: IngredientsWithTypes.find().fetch(),
    typesCount: Counts.get("types")
  };
}, TypesTable);
