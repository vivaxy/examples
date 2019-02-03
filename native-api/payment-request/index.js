/**
 * @since 2019-02-02 17:32
 * @author vivaxy
 */

document.querySelector('#pay').addEventListener('click', pay);

function pay() {
  const request = new PaymentRequest(buildSupportedPaymentMethodData(), buildShoppingCartDetails());

  request.show().then(function(paymentResponse) {
    log('paymentResponse.details', paymentResponse.details);
    log('paymentResponse.methodName', paymentResponse.methodName);
    log('paymentResponse.payerEmail', paymentResponse.payerEmail);
    log('paymentResponse.payerName', paymentResponse.payerName);
    log('paymentResponse.payerPhone', paymentResponse.payerPhone);
    log('paymentResponse.requestId', paymentResponse.requestId);
    log('paymentResponse.shippingAddress', paymentResponse.shippingAddress);
    log('paymentResponse.shippingOption', paymentResponse.shippingOption);

    paymentResponse.complete('success')
      .then(function() {
        // For demo purposes:
        log('success');
      });
  });
}

function buildSupportedPaymentMethodData() {
  // Example supported payment methods:
  return [
    {
      supportedMethods: 'basic-card',
      data: {
        supportedNetworks: ['visa', 'mastercard'],
        supportedTypes: ['debit', 'credit'],
      },
    },
  ];
}

function buildShoppingCartDetails() {
  // Hardcoded for demo purposes:
  return {
    id: 'order-123',
    displayItems: [
      {
        label: 'Example item',
        amount: { currency: 'IRR', value: '0.000000001' },
      },
    ],
    total: {
      label: 'Total',
      amount: { currency: 'IRR', value: '0.000000001' },
    },
  };
}

function log(tag, detail) {
  const div = document.createElement('div');
  div.innerHTML = tag + ': ' + JSON.stringify(detail, null, 4);
  document.querySelector('#log').appendChild(div);
}
