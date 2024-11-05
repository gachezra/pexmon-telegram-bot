const isValidPhoneNumber = (phoneNumber) => {
  const pattern = /^(254\d{9}|0\d{9})$/;
  return pattern.test(phoneNumber);
};

const isValidPaymentData = (paymentData, tariffValue) => {
  const requiredProps = ['success', 'callbackData', 'errorMessage', 'phoneNumber'];
  const hasRequiredProps = requiredProps.every((prop) => paymentData.hasOwnProperty(prop));

  if (!hasRequiredProps) {
    return false;
  }

  const { callbackData } = paymentData;
  const [amount, phoneNumber] = callbackData.split('|');
  const isValidTariffAmount = amount == tariffValue;
  const isValidPhoneNumber = /^254\d{9}$/.test(phoneNumber);

  if (!isValidTariffAmount || !isValidPhoneNumber) {
    return false;
  }

  return true;
};

module.exports = {
  isValidPhoneNumber,
  isValidPaymentData
};