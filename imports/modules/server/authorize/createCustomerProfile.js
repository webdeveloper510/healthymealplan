import { Meteor } from 'meteor/meteor';
import constants from './constants';
const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;

import { Random } from 'meteor/random';

/*
  opaque Object - comes from Accept.js authorization response

*/

export default function createCustomerProfile(
  descriptor,
  value,
  customer,
  callback,
) {
  const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(Meteor.settings.public.apiLoginKey);
  merchantAuthenticationType.setTransactionKey(
    Meteor.settings.private.transactionKey,
  );

  // console.log("Inside createCustomerProfile");
  // console.log(customer);

  const opaqueData = new ApiContracts.OpaqueDataType();
  opaqueData.setDataDescriptor(descriptor);
  opaqueData.setDataValue(value);

  const paymentType = new ApiContracts.PaymentType();
  paymentType.setOpaqueData(opaqueData);

  const customerAddress = new ApiContracts.CustomerAddressType();
  customerAddress.setFirstName(customer.nameOnCard);
  customerAddress.setLastName('-');
  customerAddress.setZip(customer.postalCode);

  const customerPaymentProfileType = new ApiContracts.CustomerPaymentProfileType();
  customerPaymentProfileType.setCustomerType(
    ApiContracts.CustomerTypeEnum.INDIVIDUAL,
  );
  customerPaymentProfileType.setPayment(paymentType);
  customerPaymentProfileType.setBillTo(customerAddress);

  const paymentProfilesList = [];
  paymentProfilesList.push(customerPaymentProfileType);

  const customerProfileType = new ApiContracts.CustomerProfileType();
  customerProfileType.setMerchantCustomerId(customer.id);
  customerProfileType.setDescription('Profile description here');
  customerProfileType.setEmail(customer.email);
  customerProfileType.setPaymentProfiles(paymentProfilesList);

  const createRequest = new ApiContracts.CreateCustomerProfileRequest();
  createRequest.setProfile(customerProfileType);
  createRequest.setValidationMode(ApiContracts.ValidationModeEnum.TESTMODE);
  createRequest.setMerchantAuthentication(merchantAuthenticationType);

  // pretty print request
  // console.log(JSON.stringify(createRequest.getJSON(), null, 2));

  const ctrl = new ApiControllers.CreateCustomerProfileController(
    createRequest.getJSON(),
  );

  if (process.env.NODE_ENV == 'development') {
    ctrl.setEnvironment(constants.endpoint.sandbox);
  } else {
    ctrl.setEnvironment(constants.endpoint.production)
  }


  ctrl.execute(() => {
    const apiResponse = ctrl.getResponse();
    let err;
    const response = new ApiContracts.CreateCustomerProfileResponse(
      apiResponse,
    );

    // pretty print response
    console.log(JSON.stringify(response, null, 2));

    if (response != null) {
      if (
        response.getMessages().getResultCode() ==
        ApiContracts.MessageTypeEnum.OK
      ) {
        console.log(
          'Successfully created a customer profile with id: ' +
          response.getCustomerProfileId(),
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
    } else {
      console.log('Null response received');
      err = 'null response received';
    }

    callback(err, response);
  });
}
