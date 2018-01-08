var map;
var markers = [];
var windows = [];

var locations = [{
        title: 'Peabody Hotel',
        show: ko.observable(true),
        location: {
            lat: 35.142354,
            lng: -90.051941
        }
    },
    {
        title: 'FedEx Forum',
        show: ko.observable(true),
        location: {
            lat: 35.138204,
            lng: -90.050474
        }
    },
    {
        title: 'Orpheum Theatre',
        show: ko.observable(true),
        location: {
            lat: 35.140127,
            lng: -90.055039
        }
    },
    {
        title: 'AutoZone Park',
        show: ko.observable(true),
        location: {
            lat: 35.142687,
            lng: -90.049954
        }
    },
    {
        title: 'Memphis Music Hall of Fame',
        show: ko.observable(true),
        location: {
            lat: 35.140437,
            lng: -90.053610
        }
    },

];


function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 35.140437,
            lng: -90.053610
        },
        zoom: 16,
        mapTypeControl: true
    });

    var largeInfowindow = new google.maps.InfoWindow();
    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');

    //Creates Markers
    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            position: position,
            lat: locations[i].location.lat,
            lng: locations[i].location.lng,
            map: map,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        markers.push(marker);
        addNewListener();
    }

    function addNewListener() {

        marker.addListener('click', function() {
            makeBox(this);
            changeMarker(this);

        });
    }
}

// Creates new box above Marker locations
function makeBox(marker) {

    var largeInfowindow = new google.maps.InfoWindow();
    largeInfowindow.marker = marker;
    var response = "";

    // FourSquare API Setup
    clientID = "QM2RZZRUITRBK0QL0JBHNQN0YRAUNPXU5USX1WNXRFMTJB4W";
    clientSecret = "PIA21HFQ5QYJ5WQOBTNUG3YH0SCTJTCCDOPCKISYKQ1CVQ3J";
    var api = 'https://api.foursquare.com/v2/venues/search?ll=' + marker.lat + ',' + marker.lng + '&client_id=' + clientID +
        '&client_secret=' + clientSecret + '&query=' + marker.title + '&v=20170708' + '&m=foursquare';

    // Retrieve information about location from FourSquare API
    $.getJSON(api).done(function(marker) {
        self.response = marker.response.venues[0];
        largeInfowindow.setContent('<div>' + (self.response.name) + (" ,") + (self.response.location.formattedAddress[0]) + '</div>');
    }).fail(function() {
        alert("Foursquare API call failure. Failed to retrieve data.");
    });



    closeAllInfoWindows();
    largeInfowindow.open(map, marker);
    windows.push(largeInfowindow);

}

function openBox() {

    closeAllInfoWindows();
    largeInfowindow.open(map, marker);
    windows.push(largeInfowindow);
}


// Highlight marker when selected marker changes
function changeMarker(marker) {

    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');

    for (var i = 0; i < markers.length; i++) {
        markers[i].setIcon(defaultIcon);
        markers[i].setAnimation(null);

    }
    marker.setIcon(highlightedIcon);
    marker.setAnimation(google.maps.Animation.BOUNCE);
}

//Create new markers
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}


function closeAllInfoWindows() {
    for (var i = 0; i < windows.length; i++) {
        windows[i].close();
    }
}


var ViewModel = function() {

    initMap();
    var self = this;
    this.searchTerm = ko.observable("");

    // Assign locations to array
    this.locationArray = ko.observableArray([]);

    locations.forEach(function(place) {
        self.locationArray.push(place);
    });

    this.setClick = function(x) {

        //filter Markers
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title == x) {
                changeMarker(markers[i]);
                console.log(markers[i].title);
                makeBox(markers[i]);
            }
        }
    };


    ViewModel.filteredItems = ko.computed(function() {
        closeAllInfoWindows();
        var filter = self.searchTerm().toLowerCase();
        console.log(filter);
        if (!filter) {
            console.log("no filter");
            self.locationArray().forEach(function(place) {
                place.show(true);
            });

            for (var i = 0; i < markers.length; i++) {
                markers[i].setVisible(true);

            }

        } else {

            return ko.utils.arrayFilter(self.locationArray(), function(place) {
                var string = place.title.toLowerCase();
                var result = (string.search(filter) >= 0);
                place.show(result);


                for (var i = 0; i < markers.length; i++) {
                    if (markers[i].title == place.title) {
                        markers[i].setVisible(result);
                    }
                }

                return result;
            });

        }
    }, ViewModel);
};


function startApp() {
    ko.applyBindings(new ViewModel());
}
// Error Handling in the event Google Maps fails to load.
function errorHandling() {
    alert("Failed to load Google Maps");
}