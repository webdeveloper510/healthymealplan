import { Meteor } from 'meteor/meteor';
import constants from './constants';

const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;

export default function updateSubscription(subscriptionId, newSubscriptionAmount, callback) {
  const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(Meteor.settings.public.apiLoginKey);
  merchantAuthenticationType.setTransactionKey(
    Meteor.settings.private.transactionKey,
  );

  // const orderType = new ApiContracts.OrderType();
  // orderType.setInvoiceNumber(utils.getRandomString('Inv:'));
  // orderType.setDescription(utils.getRandomString('Description'));

  const arbSubscriptionType = new ApiContracts.ARBSubscriptionType();
  // arbSubscriptionType.setOrder(orderType);
  arbSubscriptionType.setAmount(newSubscriptionAmount);

  const updateRequest = new ApiContracts.ARBUpdateSubscriptionRequest();
  updateRequest.setMerchantAuthentication(merchantAuthenticationType);
  updateRequest.setSubscriptionId(subscriptionId);
  updateRequest.setSubscription(arbSubscriptionType);

  console.log(JSON.stringify(updateRequest.getJSON(), null, 2));

  const ctrl = new ApiControllers.ARBUpdateSubscriptionController(updateRequest.getJSON());


  if (process.env.NODE_ENV == 'development') {
    ctrl.setEnvironment(constants.endpoint.sandbox);
  } else {
    ctrl.setEnvironment(constants.endpoint.production);
  }

  ctrl.execute(() => {
    let err = null;

    const apiResponse = ctrl.getResponse();

    const response = new ApiContracts.ARBUpdateSubscriptionResponse(apiResponse);

    console.log(JSON.stringify(response, null, 2));

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
      err = 'null response';
    }

    callback(err, response);
  });
}
