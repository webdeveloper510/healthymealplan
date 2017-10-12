import React from 'react';
import Button from 'material-ui/Button';
import Snackbar from 'material-ui/Snackbar';

export default class SnackbarCommon extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      vertical: 'bottom',
      horizontal: 'center',
    };
  }

  handleClick(state) {
    this.setState({ open: true, ...state });
  }


  render() {
    const { vertical, horizontal } = this.state;
    return (
      <div>
        <Snackbar
          style={{ fontSize: '16px' }}
          anchorOrigin={{ vertical, horizontal }}
          open={this.props.snackbarOpen}
          onRequestClose={this.props.handleRequestClose}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}

          action={this.props.onClickHandler ? (<Button color="accent" dense onClick={this.props.onClickHandler}>{this.props.snackbarButtonText}</Button>) : ''}
          message={<span id="message-id">{this.props.snackbarMessageText}</span>}
          autoHideDuration={this.props.autoHideDuration || null}
        />
      </div>
    );
  }
}


{ /* <Snackbar
anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
open={this.props.snackbarOpen}
onRequestClose={this.handleRequestClose}
SnackbarContentProps={{
  'aria-describedby': 'message-id',
}}
action={<Button color="accent" dense onClick={this.props.onClickHandler}>lorem ipsum dolorem</Button>}
message={<span id="message-id">I love snacks</span>}
/> */ }
