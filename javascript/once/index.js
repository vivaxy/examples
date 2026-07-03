var canOnlyFireOnce = once(function () {
  console.log('Fired!');
});

canOnlyFireOnce();

canOnlyFireOnce();
