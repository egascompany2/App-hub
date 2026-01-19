const { createRunOncePlugin } = require('@expo/config-plugins');

function withNotifee(config) {
  return config;
}

module.exports = createRunOncePlugin(withNotifee, 'with-notifee', '1.0.0');
