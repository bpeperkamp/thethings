angular.module('starter')

.constant('IOT_API', {
	url: 'https://api.thethings.io/v2',
	appid: 'paste your own app id here', // Your AppID here, you can find it in your dashboard
	thingid: '' // Either use a fixed thingID, or properly use the link thing procedure and login to get the thingid. The app does just that
});