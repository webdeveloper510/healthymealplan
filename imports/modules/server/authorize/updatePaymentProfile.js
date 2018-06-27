import { Meteor } from 'meteor/meteor';
import constants from './constants';

const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;

export default function updateCustomerPaymentProfile(customerProfileId, customerPaymentProfileId, customerDetails, callback) {
  const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(Meteor.settings.public.apiLoginKey);
  merchantAuthenticationType.setTransactionKey(
    Meteor.settings.private.transactionKey,
  );

  const creditCardForUpdate = new ApiContracts.CreditCardType();
  creditCardForUpdate.setCardNumber(customerDetails.cardNumber);
  creditCardForUpdate.setExpirationDate(customerDetails.expiry);

  const paymentType = new ApiContracts.PaymentType();
  paymentType.setCreditCard(creditCardForUpdate);

  const customerAddressType = new ApiContracts.CustomerAddressType();
  customerAddressType.setFirstName(customerDetails.firstName);
  customerAddressType.setLastName(customerDetails.lastName);
  customerAddressType.setAddress(customerDetails.streetAddress);
  customerAddressType.setZip(customerDetails.billingPostalCode);

  const customerForUpdate = new ApiContracts.CustomerPaymentProfileExType();
  customerForUpdate.setPayment(paymentType);
  customerForUpdate.setDefaultPaymentProfile(true);

  customerForUpdate.setCustomerPaymentProfileId(customerPaymentProfileId);
  customerForUpdate.setBillTo(customerAddressType);

  const updateRequest = new ApiContracts.UpdateCustomerPaymentProfileRequest();
  updateRequest.setMerchantAuthentication(merchantAuthenticationType);
  updateRequest.setCustomerProfileId(customerProfileId);
  updateRequest.setPaymentProfile(customerForUpdate);
  updateRequest.setValidationMode(ApiContracts.ValidationModeEnum.LIVEMODE);

  // pretty print request
  console.log(JSON.stringify(updateRequest.getJSON(), null, 2));

  const ctrl = new ApiControllers.UpdateCustomerPaymentProfileController(updateRequest.getJSON());

  if (process.env.NODE_ENV == 'development') {
    ctrl.setEnvironment(constants.endpoint.sandbox);
  } else {
    ctrl.setEnvironment(constants.endpoint.production);
  }

  ctrl.execute(() => {
    let err = null;
    const apiResponse = ctrl.getResponse();
    const response = new ApiContracts.UpdateCustomerPaymentProfileResponse(apiResponse);

    // pretty print response
    // console.log(JSON.stringify(response, null, 2));

    if (response != null) {
      if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
        console.log(`Successfully updated a customer payment profile with id: ${customerPaymentProfileId}`);
      } else {
        // console.log('Result Code: ' + response.getMessages().getResultCode());
        console.log(`Error Code: ${response.getMessages().getMessage()[0].getCode()}`);
        console.log(`Error message: ${response.getMessages().getMessage()[0].getText()}`);
        err = response.getMessages().getMessage()[0].getText();
      }
    } else {
      console.log('Null response received');
      err = 'Null response';
    }

    callback(err, response);
  });
}
