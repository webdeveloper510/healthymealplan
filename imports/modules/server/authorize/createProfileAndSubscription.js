import { Meteor } from "meteor/meteor";

const ApiContracts = require("authorizenet").APIContracts;
const ApiControllers = require("authorizenet").APIControllers;

/*
  opque Object - comes from Accept.js authorization response

*/

export default function createProfileAndSubscription(
  descriptor,
  value,
  callback
) {
  const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(Meteor.settings.public.apiLoginKey);
  merchantAuthenticationType.setTransactionKey(
    Meteor.settings.private.transactionKey
  );

  const opaqueData = new ApiContracts.OpaqueDataType();
  opaqueData.setDataDescriptor(descriptor);
  opaqueData.setDataValue(value);

  const paymentType = new ApiContracts.PaymentType();
  paymentType.setOpaqueData(opaqueData);

  const customerPaymentProfileType = new ApiContracts.CustomerPaymentProfileType();
  customerPaymentProfileType.setCustomerType(
    ApiContracts.CustomerTypeEnum.INDIVIDUAL
  );
  customerPaymentProfileType.setPayment(paymentType);

  const paymentProfilesList = [];
  paymentProfilesList.push(customerPaymentProfileType);

  const customerProfileType = new ApiContracts.CustomerProfileType();
  customerProfileType.setMerchantCustomerId("M");
  customerProfileType.setDescription("Profile description here");
  customerProfileType.setEmail("jivanyesh@gmail.com");
  customerProfileType.setPaymentProfiles(paymentProfilesList);

  const createRequest = new ApiContracts.CreateCustomerProfileRequest();
  createRequest.setProfile(customerProfileType);
  createRequest.setValidationMode(ApiContracts.ValidationModeEnum.TESTMODE);
  createRequest.setMerchantAuthentication(merchantAuthenticationType);

  // pretty print request
  // console.log(JSON.stringify(createRequest.getJSON(), null, 2));

  const ctrl = new ApiControllers.CreateCustomerProfileController(
    createRequest.getJSON()
  );

  ctrl.execute(() => {
    const apiResponse = ctrl.getResponse();

    const response = new ApiContracts.CreateCustomerProfileResponse(
      apiResponse
    );

    // pretty print response
    console.log(JSON.stringify(response, null, 2));

    if (response != null) {
      if (
        response.getMessages().getResultCode() ==
        ApiContracts.MessageTypeEnum.OK
      ) {
        console.log(
          "Successfully created a customer profile with id: " +
            response.getCustomerProfileId()
        );
      } else {
        console.log("Result Code: " + response.getMessages().getResultCode());
        console.log(
          "Error Code: " +
            response
              .getMessages()
              .getMessage()[0]
              .getCode()
        );
        console.log(
          "Error message: " +
            response
              .getMessages()
              .getMessage()[0]
              .getText()
        );
      }
    } else {
      console.log("Null response received");
    }

    callback(response);
  });
}
