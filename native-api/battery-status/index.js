/**
 * @since 15-08-04 20:21
 * @author vivaxy
 */
var log = function (string) {
    var log = document.querySelector('log'),
        entry = document.createElement('entry');
    entry.innerHTML = string;
    log.appendChild(entry);
    console.log(string);
};

navigator.getBattery().then(function (battery) {

    log('Battery charging? ' + (battery.charging ? 'Yes' : 'No'));
    log('Battery level: ' + battery.level * 100 + '%');
    log('Battery charging time: ' + battery.chargingTime + ' seconds');
    log('Battery discharging time: ' + battery.dischargingTime + ' seconds');

    battery.addEventListener('chargingchange', function () {
        log('Battery charging? ' + (battery.charging ? 'Yes' : 'No'));
    });

    battery.addEventListener('levelchange', function () {
        log('Battery level: ' + battery.level * 100 + '%');
    });

    battery.addEventListener('chargingtimechange', function () {
        log('Battery charging time: ' + battery.chargingTime + ' seconds');
    });

    battery.addEventListener('dischargingtimechange', function () {
        log('Battery discharging time: ' + battery.dischargingTime + ' seconds');
    });

});
