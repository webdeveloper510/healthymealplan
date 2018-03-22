import { Meteor } from 'meteor/meteor';
import constants from './constants';

const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;

export default function cancelSubscription(subscriptionId, callback) {
  const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(Meteor.settings.public.apiLoginKey);
  merchantAuthenticationType.setTransactionKey(
    Meteor.settings.private.transactionKey,
  );

  const cancelRequest = new ApiContracts.ARBCancelSubscriptionRequest();
  cancelRequest.setMerchantAuthentication(merchantAuthenticationType);
  cancelRequest.setSubscriptionId(subscriptionId);

  // console.log(JSON.stringify(cancelRequest.getJSON(), null, 2));

  const ctrl = new ApiControllers.ARBCancelSubscriptionController(cancelRequest.getJSON());

  if (process.env.NODE_ENV == 'development') {
    ctrl.setEnvironment(constants.endpoint.sandbox);
  } else {
    ctrl.setEnvironment(constants.endpoint.production)
  }

  ctrl.execute(() => {
    const apiResponse = ctrl.getResponse();

    const response = new ApiContracts.ARBCancelSubscriptionResponse(apiResponse);

    let err = null;
    // console.log(JSON.stringify(response, null, 2));

    if (response != null) {
      if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
        console.log(`Message Code : ${response.getMessages().getMessage()[0].getCode()}`);
        console.log(`Message Text : ${response.getMessages().getMessage()[0].getText()}`);
      } else {
        console.log(`Result Code: ${response.getMessages().getResultCode()}`);
        console.log(`Error Code: ${response.getMessages().getMessage()[0].getCode()}`);
        console.log(`Error message: ${response.getMessages().getMessage()[0].getText()}`);
        err = response.getMessages().getMessage()[0].getText();
      }
    } else {
      console.log('Null Response.');
      err = 'Null response from the server';
    }

    callback(err, response);
  });
}
