import { Meteor } from 'meteor/meteor';

const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;

/*
   Object - comes from Accept.js authorization response

*/
export default function createSubscriptionFromCustomerProfile(
  customerProfileId,
  customerPaymentProfileId,
  subscriptionStartDate,
  subscriptionAmount,
  callback,
) {
  const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(Meteor.settings.public.apiLoginKey);
  merchantAuthenticationType.setTransactionKey(
    Meteor.settings.private.transactionKey,
  );

  const interval = new ApiContracts.PaymentScheduleType.Interval();
  interval.setLength(7);
  interval.setUnit(ApiContracts.ARBSubscriptionUnitEnum.DAYS);

  const paymentScheduleType = new ApiContracts.PaymentScheduleType();
  paymentScheduleType.setInterval(interval);
  paymentScheduleType.setStartDate(subscriptionStartDate);
  paymentScheduleType.setTotalOccurrences(9999);

  const customerProfileIdType = new ApiContracts.CustomerProfileIdType();
  customerProfileIdType.setCustomerProfileId(customerProfileId);
  customerProfileIdType.setCustomerPaymentProfileId(customerPaymentProfileId);
  // customerProfileIdType.setCustomerAddressId(customerAddressId);

  const arbSubscription = new ApiContracts.ARBSubscriptionType();
  arbSubscription.setName('Some lifestyle - some name');
  arbSubscription.setPaymentSchedule(paymentScheduleType);
  arbSubscription.setAmount(subscriptionAmount);
  arbSubscription.setProfile(customerProfileIdType);

  const createRequest = new ApiContracts.ARBCreateSubscriptionRequest();
  createRequest.setMerchantAuthentication(merchantAuthenticationType);
  createRequest.setSubscription(arbSubscription);

  console.log(JSON.stringify(createRequest.getJSON(), null, 2));

  const ctrl = new ApiControllers.ARBCreateSubscriptionController(
    createRequest.getJSON(),
  );

  ctrl.execute(() => {
    const apiResponse = ctrl.getResponse();
    let err;

    const response = new ApiContracts.ARBCreateSubscriptionResponse(
      apiResponse,
    );

    console.log(JSON.stringify(response, null, 2));

    if (response != null) {
      if (
        response.getMessages().getResultCode() ==
        ApiContracts.MessageTypeEnum.OK
      ) {
        console.log('Subscription Id : ' + response.getSubscriptionId());
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
      console.log('Null Response.');
      err = 'null response received';
    }

    callback(err, response);
  });
}
