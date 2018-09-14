import $ from "jquery";
import "jquery-validation";


  $.validator.addMethod(
    'cdnPostal', 
    function postalCodeValidation(value) {
      return /^([a-yA-Y][0-9][a-zA-Z])([\\ ])?([0-9][a-zA-Z][0-9])$/.test(value);
    },
    'Please enter a valid postal code.',
  );

export default (form, options) => $(form).validate(options);


