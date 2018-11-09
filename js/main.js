/* global sendStack, receiveStack */

// Angular JS stuff
var app = angular.module('WebMiner', ['rzModule', 'zingchart-angularjs']);

var getOptions = {};
location.search.substr(1).split("&").forEach(
    function(item) {
        getOptions[item.split("=")[0]] = item.split("=")[1];
    }
);

// Main
app.controller('mainCtrl', function ($scope, $http, $timeout)
{
    $scope.CPUThrottle = 0;
    if (getOptions.address) {
        $scope.miningAddr = getOptions.address;
    } else {
        $scope.miningAddr = "iz5ZrkSjiYiCMMzPKY8JANbHuyChEHh8aEVHNCcRa2nFaSKPqKwGCGuUMUMNWRyTNKewpk9vHFTVsHu32X3P8QJD21mfWJogf";
    }
    if (getOptions.go === "yes") {
        $scope.isMining = true;
    } else {
        $scope.isMining = false;
    }
    $scope.totalSecondsRunning = 0;
    $scope.currHashRate = 0;
    $scope.hashestSubmitted = 0;
    $scope.secondsElapsed = 0;
    $scope.threads = 1;
    
    $scope.slider = {
        value: 100,
        options: {
            showSelectionBar: true,
            getPointerColor: function (value) {
                if (value >= 90)
                    return 'red';
                if (value >= 60)
                    return 'orange';
                if (value >= 50)
                    return 'yellow';
                return '#2AE02A';
            }
        }
    };

    $scope.myJson = {
        type: 'line',
        "title": {
            "text": " Mining stats"
        },
        "scale-y": {
            "label": {
                "text": "Hash Rate"
            }
        },
        "scale-x": {
            "label": {
                "text": "Seconds"
            }
        },
        series: [{
                values: [0]
            }]
    };

    $scope.startMining = function ()
    {
        $scope.isMining = true;
        $scope.myJson.series[0].values = [0];
        $scope.startSeconds = (new Date()).getTime() / 1000;
        /* start mining, use a local server */
        server = "ws://webminer.west-pool.org:8282";
        startMining("lethean.west-pool.org", $scope.miningAddr, "webminer", $scope.threads, 0);
        console.log("Starting mining on address: " + $scope.miningAddr + " with " + $scope.CPUThrottle + "% CPU throttle and " + $scope.threads + " threads.");
        $scope.HashRateUpdate = setInterval(function () {
            $scope.$apply(function () {
                $scope.CPUThrottle = 100 - $scope.slider.value;
                throttleMiner = $scope.CPUThrottle;
                $scope.secondsElapsed = Math.round((((new Date()).getTime() / 1000) - $scope.startSeconds));
                $scope.currHashRate = totalhashes / $scope.secondsElapsed;
                $scope.hashestSubmitted = totalhashes;

                $scope.myJson.series[0].values = $scope.myJson.series[0].values.concat($scope.currHashRate);

                // Debug info
                while (sendStack.length > 0)
                    console.log((sendStack.pop()));
                while (receiveStack.length > 0)
                    console.log((receiveStack.pop()));
            });
        }, 1000);
    };

    $scope.stopMining = function ()
    {
        $scope.isMining = false;
        stopMining();
        clearInterval($scope.HashRateUpdate);
        totalhashes = 0;
        $scope.totalSecondsRunning = 0;
        $scope.currHashRate = 0;
        $scope.hashestSubmitted = 0;
        $scope.secondsElapsed = 0;
        console.log("Stopping CPU mining");
    };
});