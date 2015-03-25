/**
 * @since 150107 09:42
 * @author vivaxy
 */
// Function to show Notification
function createNotification(type) {
  if (type == '')
    type = 'normal';

  if (type != 'html') {
    var title = "You have received HTML 5 Notification";
    var msg = "Content Goes Here......";
    var notification = window.Notifications.createNotification("1.png", title, msg);
  }
  else {
    var notification = window.Notifications.createHTMLNotification('content.html');
  }
  notification.show();
}

// Binding the Click event on buttons.

document.addEventListener('DOMContentLoaded', function () {
  if (window.webkitNotifications) {
    window.Notifications = window.webkitNotifications;
    document.querySelector('#show_notification').addEventListener('click', function () {
      if (window.Notifications.checkPermission() == 0) {
        createNotification('normal');
      }
      else {
        window.Notifications.requestPermission();
      }
    });

    document.querySelector('#show_html_notification').addEventListener('click', function () {
      if (window.Notifications.checkPermission() == 0) {
        createNotification('html');
      }
      else {
        window.Notifications.requestPermission();
      }
    });
  }
  else {
    alert('HTML 5 Notifications are not supported on this browser/OS.');
  }
});