angular.module('App')
.controller('RatesController', function ($scope, $http, $ionicPopover, Currencies, 
                                         $interval, indexDBService, $window) {
  
  $scope.currencies = Currencies;
  $scope.rates=[];

  $ionicPopover.fromTemplateUrl('views/rates/help-popover.html', {
    scope: $scope,
  }).then(function (popover) {
    $scope.popover = popover;
  });
  $scope.openHelp = function($event) {
    $scope.popover.show($event);
  };
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });

  $scope.load = function () {
    $http.get('https://api.bitcoinaverage.com/ticker/all').success(function (tickers) {
      angular.forEach($scope.currencies, function (currency) {
        currency.ticker = tickers[currency.code];
        currency.ticker.timestamp = new Date(currency.ticker.timestamp);
      });
    }).finally(function () {
      $scope.$broadcast('scroll.refreshComplete');
    });
  };
// indexedDB from Dr. Babb's chapter 5
//methods for the indexedDB service
  $scope.refreshList = function(){
    indexDBService.getRates().then(function(data){
      
      $scope.rates=data;
      
      //write from the temporary to the main
      $scope.currencies = $scope.rates;      
      
    }, function(err){
      $window.alert(err);
    });
  };
   
  $scope.addRates = function(){
    indexDBService.addRates($scope.currencies).then(function(){
      $scope.refreshList();
      
      //write from the temporary to the main
      $scope.currencies = $scope.rates;
    }, function(err){
      $window.alert(err);
    });
  };
   
  $scope.deleteRates = function(id){
    indexDBService.deleteRates(id).then(function(){
      $scope.refreshList();
    }, function(err){
      $window.alert(err);
    });
  };
   
  $scope.init = function(){
    indexDBService.open().then(function(){
      $scope.refreshList();
    });
  };

  //try to call from the DB   
  //$scope.init();

  $interval($scope.load, 60 * 1000);
  
  $scope.load();
});
