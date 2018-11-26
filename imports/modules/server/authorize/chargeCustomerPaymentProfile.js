const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
import constants from './constants';
import { Random } from 'meteor/random';

export default function chargeCustomerProfile(customerProfileId, customerPaymentProfileId, subscriptionAmount, callback) {
  const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(Meteor.settings.public.apiLoginKey);
  merchantAuthenticationType.setTransactionKey(Meteor.settings.private.transactionKey);

  const profileToCharge = new ApiContracts.CustomerProfilePaymentType();
  profileToCharge.setCustomerProfileId(customerProfileId);

  const paymentProfile = new ApiContracts.PaymentProfile();
  paymentProfile.setPaymentProfileId(customerPaymentProfileId);
  profileToCharge.setPaymentProfile(paymentProfile);

  const orderDetails = new ApiContracts.OrderType();
  const invoiceNumber = 'INV-' + Random.id(6);
  orderDetails.setInvoiceNumber(invoiceNumber);
  orderDetails.setDescription('');

  const transactionRequestType = new ApiContracts.TransactionRequestType();
  transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
  transactionRequestType.setProfile(profileToCharge);
  transactionRequestType.setAmount(subscriptionAmount);
  transactionRequestType.setOrder(orderDetails);

  const createRequest = new ApiContracts.CreateTransactionRequest();
  createRequest.setMerchantAuthentication(merchantAuthenticationType);
  createRequest.setTransactionRequest(transactionRequestType);

  //pretty print request
  console.log(JSON.stringify(createRequest.getJSON(), null, 2));

  const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

  ctrl.execute(function () {

    const apiResponse = ctrl.getResponse();
    let err = "";
    const response = new ApiContracts.CreateTransactionResponse(apiResponse);

    //pretty print response
    console.log(JSON.stringify(response, null, 2));

    if (response != null) {
      if (response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK) {
        if (response.getTransactionResponse().getMessages() != null) {
          console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
          console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
          console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
          console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
         
          err = {
            message: response
              .getMessages()
              .getMessage()[0]
              .getText(),
            code: response
              .getMessages()
              .getMessage()[0]
              .getCode(),
          };
        }
        else {
          console.log('Failed Transaction.');
          if (response.getTransactionResponse().getErrors() != null) {
            console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
            console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());

            err = {
              message: response
                .getMessages()
                .getMessage()[0]
                .getText(),
              code: response
                .getMessages()
                .getMessage()[0]
                .getCode(),
            };
          }
        }
      } else {
        console.log('Failed Transaction. ');
        if (response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null) {

          console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
          console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
          
          err = {
            message: response
              .getMessages()
              .getMessage()[0]
              .getText(),
            code: response
              .getMessages()
              .getMessage()[0]
              .getCode(),
          };
        }
        else {
          console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
          console.log('Error message: ' + response.getMessages().getMessage()[0].getText());

          err = {
            message: response
              .getMessages()
              .getMessage()[0]
              .getText(),
            code: response
              .getMessages()
              .getMessage()[0]
              .getCode(),
          };
        }

      }
    }
    else {
      console.log('Null Response.');
      err = 'null response received';
    }

    callback(err, response);
  });
}