/**
 * @since 150628 12:30
 * @author vivaxy
 */
var canOnlyFireOnce = once(function() {
    console.log('Fired!');
});

canOnlyFireOnce();

canOnlyFireOnce();
