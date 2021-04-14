/**
 * @since 2016-06-25 17:38
 * @author vivaxy
 */

var ajax = function (config) {
  var url = config.url;
  var success = config.success;
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      success(xhr.responseText);
    }
  });
  xhr.open('GET', url, true);
  xhr.send();
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('service-worker.js', {
      scope: './',
    })
    .then(function (registration) {
      var serviceWorker;
      if (registration.installing) {
        serviceWorker = registration.installing;
        console.log('installing');
      } else if (registration.waiting) {
        serviceWorker = registration.waiting;
        console.log('waiting');
      } else if (registration.active) {
        serviceWorker = registration.active;
        console.log('active');
      }
      if (serviceWorker) {
        console.log(serviceWorker.state);
      }
      if (navigator.serviceWorker.controller) {
        console.log(
          'The service worker is currently handling network operations.',
        );
      } else {
        console.log(
          'Please reload this page to allow the service worker to handle network operations.',
        );
      }
    })
    .catch(function (error) {
      /**
       * “Secure origins” are origins that match at least one of the following (scheme, host, port) patterns:
       * (https, *, *)
       * (wss, *, *)
       * (*, localhost, *)
       * (*, 127/8, *)
       * (*, ::1/128, *)
       * (file, *, —)
       * (chrome-extension, *, —)
       */
      console.log(error);
    });
} else {
  console.log('service worker unavailable');
}

var sendMessageButton = document.querySelector('.js-send-message');

sendMessageButton.addEventListener('click', function () {
  ajax({
    url: 'data.json',
    success: function (res) {
      console.log(res);
    },
  });
});
