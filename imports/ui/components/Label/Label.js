import React from 'react';
import InlineCss from 'react-inline-css';
import { Meteor } from 'meteor/meteor';

const Label = ({ title, onDate, postalCode }) => (
  <InlineCss stylesheet={`
      .Label {
        font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
      }

      @media print {
        .Label {
          display: block;
          border: 1px solid red;
          padding: 20px;
        }

        .btn { display: none; }

        hr { display: none; }

        h3 {
          font-size: 28px;
          margin-top: 0px;
          margin-bottom: 0px;
        }

        p {
          margin-top: 10px;
          margin-bottom: 0px;
          font-size: 18px;
        }
      }
  `}>
    <div className="Label">
      <hr />
      <h3>{title}</h3>
      <p>{onDate}</p>
      <p>{postalCode}</p>

    </div>
  </InlineCss>
);

// Label.propTypes = {
//   delivery: React.PropTypes.object.isRequired,
// };

export default Label;