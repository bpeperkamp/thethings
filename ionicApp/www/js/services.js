angular.module('starter.services', ['ngResource'])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    clear: function () {
      $window.localStorage.clear();
    }
  }
}])

.factory('iotService', function ($resource, $http, $localstorage, IOT_API) {
  var iotService = {};
  iotService.sendCommand = function (command, data) {
    return $http.post(IOT_API.url + '/me/resources/'+command+'/'+$localstorage.get("thingid"), data, { headers: { 'Authorization': $localstorage.get("token") } })
  };
  iotService.linkThing = function (data) {
    return $http.post(IOT_API.url + '/me/things', data, { headers: { 'Authorization': $localstorage.get("token") } });
  };
  iotService.login = function (data) {
    return $http.post(IOT_API.url + '/login', data);
  };
  iotService.register = function (data) {
    return $http.post(IOT_API.url + '/register', data);
  };
  iotService.resources = function () {
    return $http.get(IOT_API.url + '/me/resources', { headers: { 'Authorization': $localstorage.get("token") } });
  };
  iotService.storeThingID = function (data) {
    return $http.put(IOT_API.url + '/me/settings', data, { headers: { 'Authorization': $localstorage.get("token") } });
  };
  iotService.getThingID = function () {
    return $http.get(IOT_API.url + '/me/settings', { headers: { 'Authorization': $localstorage.get("token") } });
  };
  return iotService;
});