import React from 'react';
import { LinearProgress } from 'material-ui/Progress';

const Loading = () => (
  <div className="loading-bar--data">
    <LinearProgress color="primary" style={{ width: '100%' }} />
  </div>
);

export default Loading;
