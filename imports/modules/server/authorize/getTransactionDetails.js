import { Meteor } from 'meteor/meteor';

const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;

export default function getTransactionDetails(transactionId, callback) {
  const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(Meteor.settings.public.apiLoginKey);
  merchantAuthenticationType.setTransactionKey(
    Meteor.settings.private.transactionKey,
  );

  const getRequest = new ApiContracts.GetTransactionDetailsRequest();
  getRequest.setMerchantAuthentication(merchantAuthenticationType);
  getRequest.setTransId(transactionId);

  console.log(JSON.stringify(getRequest.getJSON(), null, 2));

  const ctrl = new ApiControllers.GetTransactionDetailsController(
    getRequest.getJSON(),
  );

  ctrl.execute(() => {
    const apiResponse = ctrl.getResponse();

    const response = new ApiContracts.GetTransactionDetailsResponse(
      apiResponse,
    );

    let err = null;

    // console.log(JSON.stringify(response, null, 2));

    if (response != null) {
      if (
        response.getMessages().getResultCode() ==
        ApiContracts.MessageTypeEnum.OK
      ) {
        console.log(
          'Transaction Id : ' + response.getTransaction().getTransId(),
        );
        console.log(
          'Transaction Type : ' + response.getTransaction().getTransactionType(),
        );
        console.log(
          'Message Code : ' +
            response
              .getMessages()
              .getMessage()[0]
              .getCode(),
        );
        console.log(
          'Message Text : ' +
            response
              .getMessages()
              .getMessage()[0]
              .getText(),
        );
      } else {
        console.log('Result Code: ' + response.getMessages().getResultCode());
        console.log(
          'Error Code: ' +
            response
              .getMessages()
              .getMessage()[0]
              .getCode(),
        );
        console.log(
          'Error message: ' +
            response
              .getMessages()
              .getMessage()[0]
              .getText(),
        );
        err = response
          .getMessages()
          .getMessage()[0]
          .getText();
      }
    } else {
      console.log('Null Response.');
      err = 'null response';
    }

    callback(err, response);
  });
}
