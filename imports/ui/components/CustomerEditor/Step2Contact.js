
import React from 'react';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';


const Step2Contact = () => (
  <div>
    <Grid container justify="center" style={{ marginBottom: '50px', marginTop: '25px' }}>
      <Grid item xs={12} style={{ marginBottom: '25px' }}>
        <Typography type="title">Contact</Typography>
      </Grid>

      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={12} sm={4}>
            <Typography type="subheading" className="subheading font-medium">
              First name
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Paper elevation={2} className="paper-for-fields">
              <TextField
                id="first_name"
                label="First name"
                name="first_name"
                defaultValue=""
                inputProps={{}}
              />
               <TextField
                id="last_name"
                label="Last name"
                name="last_name"
                defaultValue=""
                inputProps={{}}
              />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>

    <Grid container justify="center" style={{ marginBottom: '50px' }}>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={12} sm={4}>
            <Typography type="subheading" className="subheading font-medium">
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
                defaultValue=""
                inputProps={{}}
              />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>

    <Grid container justify="center" style={{ marginBottom: '50px' }}>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={12} sm={4}>
            <Typography type="subheading" className="subheading font-medium">
            Phone number
            </Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Paper elevation={2} className="paper-for-fields">
              <TextField
                id="phoneNumber"
                label="Phone number"
                name="phoneNumber"
                fullWidth
                defaultValue=""
                inputProps={{}}
              />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </div>
);


export default Step2Contact;
