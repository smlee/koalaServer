/**
 * Created by sangmin on 6/22/15.
 */
app.config(function ($stateProvider) {
    $stateProvider.state('main', {
        url: '/app',
        templateUrl: 'js/main/main.html',
        controller: 'MainCtrl'
    });
});

app.controller('MainCtrl', function($scope){

});