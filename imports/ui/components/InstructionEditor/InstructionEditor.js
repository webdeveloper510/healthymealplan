/* eslint-disable max-len, no-return-assign */

/*
  Refactor the autocomplete tabs into their own components
  not a priority for now, but this is an itch that we should really scratch.
*/

import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import Autosuggest from "react-autosuggest";

import _ from "lodash";

import { Meteor } from "meteor/meteor";

import Button from "material-ui/Button";
import { MenuItem } from "material-ui/Menu";
import TextField from "material-ui/TextField";
import Select from "material-ui/Select";
import Input, { InputLabel } from "material-ui/Input";
import { FormControl, FormHelperText } from "material-ui/Form";
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "material-ui/Dialog";

import classNames from "classnames";
import { withStyles } from "material-ui/styles";
import { CircularProgress } from "material-ui/Progress";
import green from "material-ui/colors/green";

import Chip from "material-ui/Chip";
import Paper from "material-ui/Paper";

import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";
import Divider from "material-ui/Divider";
import Avatar from "material-ui/Avatar";

import { teal, red } from "material-ui/colors";
import ChevronLeft from "material-ui-icons/ChevronLeft";
import Search from "material-ui-icons/Search";

import validate from "../../../modules/validate";

const primary = teal[500];
const danger = red[700];

const styles = theme => ({
  root: {
    display: "flex",
    alignItems: "center"
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: "relative"
  },
  buttonSuccess: {
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[700]
    }
  },
  fabProgress: {
    color: green[500],
    position: "absolute",
    top: -6,
    left: -6,
    zIndex: 1
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
});

class InstructionEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deleteDialogOpen: false,
      hasFormChanged: false,
      submitLoading: false,
      submitSuccess: false
    };
  }

  componentDidMount() {
    const component = this;
    validate(component.form, {
      errorPlacement(error, element) {
        error.insertAfter(
          $(element)
            .parent()
            .parent()
        );
      },

      rules: {
        title: {
          required: true
        },

        description: {
          required: true
        }
      },
      messages: {
        title: {
          required: "Name required."
        },

        description: {
          required: "Description required."
        }
      },
      submitHandler() {
        component.handleSubmit();
      }
    });
  }

  /* Dialog box controls */
  deleteDialogHandleClickOpen() {
    this.setState({ deleteDialogOpen: true });
  }

  deleteDialogHandleRequestClose() {
    this.setState({ deleteDialogOpen: false });
  }

  handleRemoveActual() {
    const { popTheSnackbar, history, instruction } = this.props;

    const existingInstruction = instruction && instruction._id;
    localStorage.setItem("instructionDeleted", instruction.title);
    const instructionDeletedMessage = `${localStorage.getItem(
      "instructionDeleted"
    )} deleted from instructions.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call("instructions.remove", existingInstruction, error => {
      if (error) {
        popTheSnackbar({
          message: error.reason
        });
      } else {
        popTheSnackbar({
          message: instructionDeletedMessage
        });

        history.push("/instructions");
      }
    });
  }

  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    this.setState({
      submitSuccess: false,
      submitLoading: true
    });

    const { history, popTheSnackbar } = this.props;
    const existingInstruction =
      this.props.instruction && this.props.instruction._id;
    const methodToCall = existingInstruction
      ? "instructions.update"
      : "instructions.insert";

    const instruction = {
      title: document.querySelector("#title").value.trim(),
      description: document.querySelector("#description").value.trim()
    };

    if (existingInstruction) instruction._id = existingInstruction;

    Meteor.call(methodToCall, instruction, (error, instructionId) => {
      if (error) {
        popTheSnackbar({
          message: error.reason
        });

        this.setState({
          submitSuccess: false,
          submitLoading: false
        });
      } else {
        this.setState({
          submitSuccess: true,
          submitLoading: false
        });

        localStorage.setItem(
          "instructionForSnackbar",
          instruction.title || $('[name="title"]').val()
        );

        const confirmation = existingInstruction
          ? `${localStorage.getItem(
            "instructionForSnackbar"
          )} instruction updated.`
          : `${localStorage.getItem(
            "instructionForSnackbar"
          )} instruction added.`;
        // this.form.reset();

        popTheSnackbar({
          message: confirmation,
          buttonText: "View",
          buttonLink: `/instructions/${instructionId}/edit`
        });

        history.push("/instructions");
      }
    });
  }

  renderDeleteDialog() {
    return (
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
          Delete {this.props.instruction.title.toLowerCase()}?
        </Typography>
        <DialogContent>
          <DialogContentText className="subheading">
            Are you sure you want to delete{" "}
            {this.props.instruction.title.toLowerCase()} ?
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
            onClick={this.handleRemoveActual.bind(this)}
            color="accent"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  titleFieldChanged(e) {
    // console.log(e.currentTarget.value.length);

    const hasFormChanged = e.currentTarget.value.length > 0;

    this.setState({
      hasFormChanged
    });
  }

  descriptionFieldChanged(e) {
    // console.log(e.currentTarget.value.length);

    const hasFormChanged = e.currentTarget.value.length > 0;

    this.setState({
      hasFormChanged
    });
  }

  render() {
    const { instruction, history } = this.props;

    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess
    });

    return (
      <form
        style={{ width: "100%" }}
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid container justify="center">
          <Grid item xs={12}>
            <Button
              onClick={() => this.props.history.push("/instructions")}
              className="button button-secondary button-secondary--top"
            >
              <Typography
                type="subheading"
                className="subheading font-medium"
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row"
                }}
              >
                <ChevronLeft style={{ marginRight: "4px" }} /> Instructions
              </Typography>
            </Button>
          </Grid>
        </Grid>

        <Grid container style={{ marginBottom: "50px" }}>
          <Grid item xs={4}>
            <Typography
              type="headline"
              className="headline"
              style={{ fontWeight: 500 }}
            >
              {instruction && instruction._id
                ? `${instruction.title}`
                : "Add instruction"}
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end"
              }}
            >
              <Button
                style={{ marginRight: "10px" }}
                onClick={() => history.push("/instructions")}
              >
                Cancel
              </Button>
              <Button
                disabled={
                  this.state.submitLoading || !this.state.hasFormChanged
                }
                className={`btn btn-primary ${buttonClassname}`}
                raised
                type="submit"
                color="contrast"
              >
                Save
                {this.state.submitLoading && (
                  <CircularProgress
                    size={24}
                    className={this.props.classes.buttonProgress}
                  />
                )}
              </Button>
            </div>
          </Grid>
        </Grid>

        <Grid container justify="center" style={{ marginBottom: "50px" }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Title
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    id="title"
                    label="Name"
                    name="title"
                    fullWidth
                    defaultValue={instruction && instruction.title}
                    ref={title => (this.title = title)}
                    inputProps={{}}
                    onChange={this.titleFieldChanged.bind(this)}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider light className="divider--space-x" />

        <Grid container justify="center" style={{ marginBottom: "50px" }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Description
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    multiline
                    id="description"
                    label="Description"
                    name="description"
                    fullWidth
                    defaultValue={instruction && instruction.description}
                    ref={description => (this.description = description)}
                    inputProps={{}}
                    onChange={this.descriptionFieldChanged.bind(this)}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container justify="center" style={{ marginBottom: "50px" }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={4}>
                {this.props.newInstruction ? (
                  ""
                ) : (
                    <Button
                      style={{ backgroundColor: danger, color: "#FFFFFF" }}
                      raised
                      onClick={
                        instruction && instruction._id
                          ? this.handleRemove.bind(this)
                          : () => this.props.history.push("/instructions")
                      }
                    >
                      Delete
                  </Button>
                  )}
              </Grid>

              <Grid item xs={8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end"
                  }}
                >
                  <Button
                    style={{ marginRight: "10px" }}
                    onClick={() => history.push("/instructions")}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={
                      this.state.submitLoading || !this.state.hasFormChanged
                    }
                    type="submit"
                    className={`btn btn-primary ${buttonClassname}`}
                    raised
                    color="contrast"
                  >
                    Save
                    {this.state.submitLoading && (
                      <CircularProgress
                        size={24}
                        className={this.props.classes.buttonProgress}
                      />
                    )}
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {this.renderDeleteDialog()}
      </form>
    );
  }
}

InstructionEditor.defaultProps = {
  instruction: { title: "" }
};

InstructionEditor.propTypes = {
  instruction: PropTypes.object,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired
};

export default withStyles(styles)(InstructionEditor);
