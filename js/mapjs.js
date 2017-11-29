// ****************************************************** CHECK LIST ************************************************************************************
// 1. Write code required to add a full-screen map to your page using the Google Maps API. For sake of efficiency, the map API should be called 		*
//    only once.																																		*
// 2. If you are prompted to do so, you may want to get a Google Maps API key, and include it as the value of the key parameter when loading the 		*
//    Google Maps API in index.html: <script src="http://maps.googleapis.com/maps/api/js?libraries=places&key=[YOUR_API_KEY]"></script> 				*
// 3. Write code required to display map markers identifying at least 5 locations that you are interested in within this neighborhood. Your app should	* 
//    display those locations by default when the page is loaded.																						*
// 4. Implement a list view of the set of locations defined in step 5.																					*
// 5. Provide a filter option that uses an input field to filter both the list view and the map markers displayed by default on load. The list view 	*
//    and the markers should update accordingly in real time. Providing a search function through a third-party API is not enough to meet specifications* 
//    This filter can be a text input or a dropdown menu.																								*
// 6. Add functionality using third-party APIs to provide information when a map marker or list view entry is clicked (ex: Yelp reviews, Wikipedia,		* 
//	  Flickr images, etc). Note that StreetView and Places don't count as an additional 3rd party API because they are libraries included in the google * 
//	  Maps API. If you need a refresher on making AJAX requests to third-party servers, check out our Intro to AJAX course. Please provide attribution 	*
//	  to the data sources/APIs you use. For example if you are using Foursquare, indicate somewhere in your interface and in your README that you used 	*
//	  Foursquare's API.
// ******************************************************************************************************************************************************

var map;
var fs_apikey;
var fs_secret;

//List of Schools near Expressway Noida
var schoolsModel = [
	{
		name: 'Lotus Valley International School',
		lat: 28.5382382,
		long: 77.34513330000004
	}
	//,
	//{
	//	name: 'Step by Step School',
	//	lat: 28.511652,
	//	long: 77.378141
	//},
	//{
	//	name: 'Pathways School',
	//	lat: 28.54226,
	//	long: 77.367722
	//},
	//{
	//	name: 'The Shriram Millennium School',
	//	lat: 28.499339,
	//	long: 77.397373
	//},
	//{
	//	name: 'Gyanshree School',
	//	lat: 28.536222,
	//	long: 77.349374
	//}
];

function InitMap() {
	map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: 28.5382382, lng: 77.34513330000004},
    	zoom: 16
	});

	//info window logic
	var infowindow =  new google.maps.InfoWindow({
		content: ''
	});

	google.maps.event.addListener(map, 'click', function(event) {
		infowindow.setPosition(event.latLng);
		infowindow.open(map);
	});         	

}

var School = function(value) {
	var self = this;
	self.name = value.name;
	self.lat = value.lat;
	self.long = value.long;
	self.latLng = {lat: self.lat, lng: self.long};

	//FourSquare APIs to fetch information on the marker location
	self.photoUrl ='';
	self.sector ='';
	self.city='';
	self.category='';

	fs_apikey = "VFDBW4OD4LSAHNAE5ZT15QBLUKLGNPRPPLZNEVV5RXG30RCZ";
	fs_secret = "L2TC2OZDPAW4UGIWNX2VUNYN2LRTKCYHNEAHBPKHTTOMF2PW";
	fs_version = "20171128";

  	var baseUrl = 'https://api.foursquare.com/v2/';
    var fsSearchVenuesUrl=baseUrl+'venues/search?ll='+self.lat+','+self.long+'&client_id='+fs_apikey+'&client_secret='+fs_secret+'&v='+fs_version+'&query='+self.name;
    
    $.getJSON(fsSearchVenuesUrl).done(function (raspberry) {
		var venue = raspberry.response.venues[0];
		self.venueid = venue.id;

    	var fsVenueDetailsUrl=baseUrl+'venues/'+self.venueid+'?&client_id='+fs_apikey+'&client_secret='+fs_secret+'&v='+fs_version;
	
		$.getJSON(fsVenueDetailsUrl).done(function (strawberry) {
			var venue = strawberry.response.venue;
			self.photoUrl = venue.bestPhoto.prefix+"width100"+venue.bestPhoto.suffix;
			self.sector = venue.location.formattedAddress[0];
			self.city = venue.location.formattedAddress[1];
			self.category = venue.categories[0].name;				
	
		}).fail(function(error){
    		infoWindow.setContent('Fail to connect to Foursquare: ' + error);
 		});
    
    }).fail(function(error){
    		infoWindow.setContent('Fail to connect to Foursquare: ' + error);
 	});;
    
    //Build content for infowindow
 
	//making visible flag an observable so that we can hide/show markers as it changes
	self.visible = ko.observable(true);

	//draw custom markers for each school
	self.marker = new google.maps.Marker({
          position: self.latLng,
          map: map,
          title: self.name
        });

	//this function would be called whenever visible (observable) changes
    self.showMarker = ko.computed( function(){
    	if(!this.visible()){
    		this.marker.setMap(null);
    	}
    	else{
    		this.marker.setMap(map);
    	}
    	return true;	
    }, self);

}

function SchoolViewModel() {
	var self = this;

	//filter string
	self.filterInput = ko.observable('');

	//list of schools
	self.schoolList = ko.observableArray([]);
	self.filteredSchoolList = ko.observableArray([]);

	//load map with default location
	InitMap();

	//Push all school names in an observable array
	schoolsModel.forEach( function(s) {
		var school = new School(s);
		self.schoolList.push(school);
		self.filteredSchoolList.push(school);
	});


	//create an updated list based on what user typed
	//filter checks if the string being typed matches any of the school names (in part starting index 0 to give an incremental serach effect)
	self.updateList = function () {
        var filterStr = self.filterInput().toLowerCase();
        self.filteredSchoolList.removeAll();

        self.schoolList().forEach(function(s){
        	if(!filterStr || (s.name.toLowerCase().indexOf(filterStr)===0)){
        		s.visible(true);
        		self.filteredSchoolList.push(s);
        	}
        	else{
        		s.visible(false);
        	}
        });
        return true;
    }

	//trickery to invoke updateList function via dummy worker
	//Now realise that filteredSchoolList can be an observable as well & that should prevent this trickery 
	self.worker = ko.computed( function(){
		self.updateList();
	}, this); 


}	

function initSchoolsApp() {
	ko.applyBindings(new SchoolViewModel());
}

//TODO
//google.maps.event.addDomListener(window, 'load', initialize);
