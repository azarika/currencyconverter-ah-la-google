app.controller('currenciesCtrl', ['$scope', '$http', '$document', function($scope, $http,$document) {

  //getting list of currencies
  $http.get('http://aqueous-temple-6169.herokuapp.com/api/v1/currencies')
    .success(function(data) {
        $scope.currenciesList = data;
        $scope.fromCurrency = data[0];
        $scope.toCurrency = data[1];
    });

  //default values 
  $scope.fromCurrencyAmount = 1;
  $scope.toCurrencyAmount = 1;

  //getting exchange rate for selected from and to currencies
  changeExchangeRate = function() {
    
    if($scope.fromCurrency && $scope.toCurrency)
    {
        $http.get('http://aqueous-temple-6169.herokuapp.com/api/v1/rate/' + $scope.fromCurrency.code+ '/' + $scope.toCurrency.code).success(function(rate) {
          $scope.rate = rate.rate;    
       });

    } 
  }; 

//stuff for the chart, why points are so big :( couldn't make them smaller
var ctx = $("#ratesChart").get(0).getContext("2d");
var today = new Date();
var year = today.getFullYear();

var data = {
    labels: [],
    datasets: [
        {
            fillColor: "rgba(255,255,255,0.2)",
            strokeColor: "#003DF5",
            pointColor: "#003DF5",
            data: []
        }
    ]
};

//getting historical rates
getHistoricalRates = function (json) {
  data.datasets[0].data = [];
  data.labels = [];

    for (var date in json['rates']) {
        var histrate = json['rates'][date]['rate'];
        var histdate = json['rates'][date]['utctime'];
        data.datasets[0].data.push(histrate);
        data.labels.push("");
     }

    var options = {
         showTooltips: false,
         scaleSteps:5
    };

    var myLineChart = new Chart(ctx).Line(data,options);
}

//getting historical rates, cross domain problems so callback function used
invokeHistoricalChart = function(){
   if($scope.fromCurrency && $scope.toCurrency)
    {
      var script = $document[0].createElement('script');
      script.src = 'http://jsonrates.com/historical/?from=' + $scope.fromCurrency.code+ '&to=' + $scope.toCurrency.code+ '&dateStart='+getCurrentDate(false)+'&dateEnd='+getCurrentDate(true)+'&callback=getHistoricalRates&apiKey=jr-480cdde3aae3bf5f7400244a8c3f88b0';
      $document[0].head.appendChild(script);
   }

  };

getCurrentDate = function(isCurrentDate){

    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();

    if(!isCurrentDate)
    {
      yyyy = yyyy - 5;
    }
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
   
   return yyyy+'-'+mm+'-'+dd;
}

//watching inputs ...
 $scope.$watch('toCurrency', function(newValues, oldValues) {
 
  if(newValues && oldValues)
  {
    changeExchangeRate();
    invokeHistoricalChart();
  }
    
  }, true);

 $scope.$watch('fromCurrency', function(newValues, oldValues) {
     
  
      changeExchangeRate();
      invokeHistoricalChart();
  
    
  }, true);

 $scope.$watch('rate', function(newValues, oldValues) {

    if($scope.rate && $scope.fromCurrencyAmount){
       $scope.toCurrencyAmount = +($scope.fromCurrencyAmount * $scope.rate).toFixed(2);
     }
    
  }, true);

  $scope.changeFrom = function() {
        $scope.toCurrencyAmount = +($scope.fromCurrencyAmount * $scope.rate).toFixed(2);
  }


  $scope.changeTo = function() {
         $scope.fromCurrencyAmount = +($scope.toCurrencyAmount / $scope.rate).toFixed(2);
  }

}]);
