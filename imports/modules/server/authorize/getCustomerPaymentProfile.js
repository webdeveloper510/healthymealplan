import { Meteor } from 'meteor/meteor';
import constants from './constants';

const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;

export default function getCustomerPaymentProfile(customerProfileId, customerPaymentProfileId, callback) {
  const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(Meteor.settings.public.apiLoginKey);
  merchantAuthenticationType.setTransactionKey(
    Meteor.settings.private.transactionKey,
  );

  const getRequest = new ApiContracts.GetCustomerPaymentProfileRequest();
  getRequest.setMerchantAuthentication(merchantAuthenticationType);
  getRequest.setCustomerProfileId(customerProfileId);
  getRequest.setCustomerPaymentProfileId(customerPaymentProfileId);
  getRequest.setUnmaskExpirationDate(true);

  // pretty print reques

  let ctrl = new ApiControllers.GetCustomerProfileController(getRequest.getJSON());
  if (process.env.NODE_ENV == 'development') {
    ctrl.setEnvironment(constants.endpoint.sandbox);
  } else {
    ctrl.setEnvironment(constants.endpoint.production)
  }

  ctrl.execute(() => {

    var apiResponse = ctrl.getResponse();

    var response = new ApiContracts.GetCustomerPaymentProfileResponse(apiResponse);

    //pretty print response
    //console.log(JSON.stringify(response, null, 2));
    let err = null;
    if (response != null) {
      if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
        console.log('Customer Payment Profile ID : ' + response.getPaymentProfile().getCustomerPaymentProfileId());
        console.log('Customer Name : ' + response.getPaymentProfile().getBillTo().getFirstName() + ' ' +
          response.getPaymentProfile().getBillTo().getLastName());
        console.log('Address : ' + response.getPaymentProfile().getBillTo().getAddress());
      }
      else {
        //console.log('Result Code: ' + response.getMessages().getResultCode());
        console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
        console.log('Error message: ' + response.getMessages().getMessage()[0].getText());

        err = response.getMessages().getMessage()[0].getText();
      }
    }
    else {
      console.log('Null response received');
    }

    callback(err, response);
  });
}

