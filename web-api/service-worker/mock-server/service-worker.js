/**
 * @since 2016-06-25 17:39
 * @author vivaxy
 */

self.addEventListener('fetch', function (event) {
  var request = event.request;
  console.log('Handling fetch event for', request.url);
  var requestUrl = new URL(request.url);

  // Determine whether this is a URL Shortener API request that should be mocked.
  // Matching on just the pathname gives some flexibility in case there are multiple domains that
  // might host the same RESTful API (imagine this being used to mock responses against what might be
  // a test, or QA, or production environment).
  // Also check for the existence of the 'X-Mock-Response' header.
  if (requestUrl.pathname.indexOf('data.json') !== -1) {
    // This matches the result format documented at
    // https://developers.google.com/url-shortener/v1/getting_started#shorten
    var responseBody = {
      code: 200,
    };

    var responseConfig = {
      // status/statusText default to 200/OK, but we're explicitly setting them here.
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        // Purely optional, but we return a custom response header indicating that this is a
        // mock response. The controlled page could check for this header if it wanted to.
        'X-Mock-Response': 'yes',
      },
    };

    var mockResponse = new Response(
      JSON.stringify(responseBody),
      responseConfig,
    );

    event.respondWith(mockResponse);
    console.log('Respond with a mock response body:', responseBody);
  }

  // If event.respondWith() isn't called because this wasn't a request that we want to mock,
  // then the default request/response behavior will automatically be used.
});
