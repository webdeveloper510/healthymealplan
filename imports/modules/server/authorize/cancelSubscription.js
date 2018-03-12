import { Meteor } from 'meteor/meteor';

let ApiContracts = require('authorizenet').APIContracts;
let ApiControllers = require('authorizenet').APIControllers;

function cancelSubscription(subscriptionId, callback) {
  const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(Meteor.settings.public.apiLoginKey);
  merchantAuthenticationType.setTransactionKey(
    Meteor.settings.private.transactionKey,
  );

  let cancelRequest = new ApiContracts.ARBCancelSubscriptionRequest();
  cancelRequest.setMerchantAuthentication(merchantAuthenticationType);
  cancelRequest.setSubscriptionId(subscriptionId);

  console.log(JSON.stringify(cancelRequest.getJSON(), null, 2));

  const ctrl = new ApiControllers.ARBCancelSubscriptionController(cancelRequest.getJSON());

  ctrl.execute(() => {

    const apiResponse = ctrl.getResponse();

    const response = new ApiContracts.ARBCancelSubscriptionResponse(apiResponse);

    let err = null;
    console.log(JSON.stringify(response, null, 2));

    if (response != null) {
      if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
        console.log('Message Code : ' + response.getMessages().getMessage()[0].getCode());
        console.log('Message Text : ' + response.getMessages().getMessage()[0].getText());
      }
      else {
        console.log('Result Code: ' + response.getMessages().getResultCode());
        console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
        console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
        err = response.getMessages().getMessage()[0].getText();
      }
    }
    else {
      console.log('Null Response.');
    }

    callback(err, response);
  });
}
