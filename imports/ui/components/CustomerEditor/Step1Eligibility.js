import React from "react";

import Grid from "material-ui/Grid";
import Button from "material-ui/Button";
import { MenuItem } from "material-ui/Menu";
import TextField from "material-ui/TextField";
import Paper from "material-ui/Paper";
import Typography from "material-ui/Typography";
import $ from "jquery";
import validate from "../../../modules/validate";

export default class Step1Eligibility extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let component = this;

    validate(component.form, {
      errorPlacement(error, element) {
        error.insertAfter(
          $(element)
            .parent()
            .parent()
        );
      },

      rules: {
        first_name: {
          required: true
        },
        email: {
          required: true,
          email: true
        },
        postal_code: {
          minlength: 6,
          maxlength: 6,
          cdnPostal: true,
          required: true
        }
      },

      submitHandler() {
        component.handleSubmitStep();
      }
    });
  }

  handleSubmitStep() {
    this.props.saveValues({
      firstName: $('[name="first_name"]')
        .val()
        .trim(),
      email: $('[name="email"]')
        .val()
        .trim(),
      postalCode: $('[name="postal_code"]')
        .val()
        .trim()
    });

    this.props.handleNext();
  }

  render() {
    return (
      <form
        id="step0"
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid
          container
          justify="center"
          style={{ marginBottom: "50px", marginTop: "25px" }}
        >
          <Grid item xs={12} style={{ marginBottom: "25px" }}>
            <Typography type="title">Eligibility</Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  First name
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    id="first_name"
                    label="First name"
                    name="first_name"
                    fullWidth
                    defaultValue={this.props.customerInfo.firstName}
                    inputProps={{}}
                  />
                </Paper>
              </Grid>
            </Grid>
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
                  Email
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    id="email"
                    label="Email"
                    name="email"
                    fullWidth
                    defaultValue={this.props.customerInfo.email}
                    inputProps={{}}
                  />
                </Paper>
              </Grid>
            </Grid>
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
                  Postal code
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    id="postalCode"
                    label="Postal code"
                    name="postal_code"
                    fullWidth
                    defaultValue={this.props.customerInfo.postalCode}
                    inputProps={{}}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end"
          }}
        >
          <Button raised color="primary" type="submit">
            Next
          </Button>
        </div>
      </form>
    );
  }
}
