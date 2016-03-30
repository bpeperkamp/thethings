angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('LoginCtrl', function ($scope, $state, $ionicPopup, $ionicHistory, $ionicSideMenuDelegate, $ionicLoading, $timeout, $localstorage, IOT_API, iotService) {
  
  // Disable menu swipe
  $ionicSideMenuDelegate.canDragContent(false);

  // Error message template
  $scope.message = {};
  $scope.logonFailure = function() {
    var confirmPopup = $ionicPopup.alert({
      title: '<h3>Failure...</h3>',
      template: $scope.message
    });
  };

  $scope.user = { email: '', password: '', app: IOT_API.appid };

  $scope.logon = function () {
    // Loader for UI purposes
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
    });
    // Login
    iotService.login($scope.user)
      .then(function (data) {
        // You should probably encrypt the token since it is stored on localstorage... Also a check needs to be made if the token is still valid
        $localstorage.set("token", data.data.token);
        $localstorage.set("authorized", true);
        // Hide loader
        $timeout(function() {
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          // Get and store thingID for usage later
          iotService.getThingID()
            .then(function (data) {
              $localstorage.set("thingid", data.data.thing);
            })
            .catch(function (error) {
              console.log(error)
              // error handling here
            });
          // After login goto proper page
          $state.go('app.actions');
          $ionicLoading.hide();
        }, 2000);
      })
      .catch(function (error) {
        // Handle your error here
        $timeout(function() {
          $ionicLoading.hide();
        }, 2000);
      })
  }

})

.controller('RegisterCtrl', function ($scope, $ionicHistory, $state, $ionicPopup, $ionicLoading, $timeout, $localstorage, IOT_API, iotService) {
  
  // error message template
  $scope.message = {};
  $scope.registerFailure = function() {
    var confirmPopup = $ionicPopup.alert({
      title: 'Registreren is helaas mislukt...',
      template: $scope.message
    });
  };

  $scope.user = { email: '', password: '', app: IOT_API.appid };

  $scope.registerUser = function () {
    // Loader for UI purposes
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
    });
    // Store settings for now, don't register yet...
    var store = JSON.stringify($scope.user);
    var encrypted = CryptoJS.AES.encrypt(store, "salt_password");
    $localstorage.set("app_data", encrypted);
    // Hide loader
    $timeout(function() {
      $state.go('app.link');
      $ionicLoading.hide();
    }, 2000);
  }

})

.controller('LinkCtrl', function ($scope, $http, $state, $localstorage, $ionicHistory, $ionicPopup, $ionicLoading, $timeout, $ionicPopup, IOT_API, iotService) {
  // Decrypt temp register data
  var decrypted  = CryptoJS.AES.decrypt($localstorage.get("app_data"), "salt_password");
  var user_data  = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

  $scope.user = { 'email': user_data.email, 'password': user_data.password, 'app': IOT_API.appid  }
  
  // Setup message
  $scope.message = {};
  $scope.linkFailure = function() {
    var confirmPopup = $ionicPopup.alert({
      title: 'Failure to link',
      template: 'Try again'
    });
  };

  // Input Thingtoken
  $scope.linkthing = { thingToken: ''};

  $scope.link = function() {
    // Register the user and link the thing
    iotService.register($scope.user)
      .then(function (data) {
        // Link the device should become a service....
        $http.post(IOT_API.url + '/me/things/', $scope.linkthing, { headers: { 'Authorization': data.data.token } })
          .then(function (value) {
            // Store the thingID and token for later use
            $localstorage.set("token", data.data.token);
            $localstorage.set("thingid", value.data.thingId);
            // Clear encrypted register data and show login alert
            $localstorage.set('app_data', '');
            // Store the thingID in the user settings for easier access
            $scope.storeThing = { "thing": value.data.thingId }
            iotService.storeThingID($scope.storeThing)
              .then(function (data) {
                //console.log(data)
              })
              .catch(function (error) {
                //console.log(error)
              });
            // end store settings
            $scope.showAlert();
          })
          .catch(function (err) {
            console.log(err);
          });
      })
      .catch(function (err) {
        console.log(err)
        $scope.showError();
      });
  }

  // Error popup
  $scope.showError = function() {
   var alertPopup = $ionicPopup.alert({
     title: 'Fout...',
     template: 'Probeer het opnieuw'
   });
   alertPopup.then(function(res) {
     //$state.go('app.dash');
   });
  };

  // Success popup
  $scope.showAlert = function() {
   var alertPopup = $ionicPopup.alert({
     title: 'Success!',
     template: 'You can now login :)'
   });
   alertPopup.then(function(res) {
      // Clear storage for now...
      $localstorage.set('token', '');
      $localstorage.set('thingid', '');
      // Go to login page
      $state.go('app.login');
   });
  };

  // Disable back button
  $ionicHistory.nextViewOptions({
    disableBack: true
  });

})


.controller('AccountCtrl', function ($http, $scope, $timeout, $state, $localstorage, $ionicLoading, $rootScope, iotService, IOT_API) {

  $scope.logoff = function() {
    // Loader for UI purposes
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
    });
    $timeout(function() {
      // Clear tokens, status etc.
      $localstorage.set("authorized", false);
      $localstorage.set("thingid", '');
      $localstorage.set("token", '');
      $localstorage.set("app_data", '');
      $state.go('app.login');
      $ionicLoading.hide();
    }, 2000);
  }

  $scope.thing = { thingId: ''};

  $scope.unlink = function() {
    // Basic unlink function not yet used in app
    $http.delete(IOT_API.url + '/me/things/' + $scope.thing.thingId, { headers: { 'Authorization': $localstorage.get("token") } })
      .then(function (data) {
        console.log(data);
      })
      .catch(function (err) {
        console.log(err);
      });
  }

})

.controller('ActionsCtrl', function ($scope, iotService) {

  // Define your buttons and actions here, make very sure the resource is available from your dashboard, otherwise this will fail!!!
  // I use 3 resources here, led_1, led_2 and led_3 make them available via your ting settings and via the app settings (dashboard)

  $scope.toggleLed1 = function() {
    var command = 'led_1'
    var thingValues = JSON.stringify( {values:[{key: command,value:'toggle'}]} )
    iotService.sendCommand(command, thingValues)
      .then(function (data) {
        //console.log(data);
      })
      .catch(function (err) {
        //console.log(err);
      });
  }
  $scope.toggleLed2 = function() {
    var command = 'led_2'
    var thingValues = JSON.stringify( {values:[{key: command,value:'toggle'}]} )
    iotService.sendCommand(command, thingValues)
      .then(function (data) {
        //console.log(data);
      })
      .catch(function (err) {
        //console.log(err);
      });
  }
  $scope.toggleLed3 = function() {
    var command = 'led_3'
    var thingValues = JSON.stringify( {values:[{key: command,value:'toggle'}]} )
    iotService.sendCommand(command, thingValues)
      .then(function (data) {
        //console.log(data);
      })
      .catch(function (err) {
        //console.log(err);
      });
  }

});
