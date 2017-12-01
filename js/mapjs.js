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
var currWindow = false;


//List of Places near Expressway Noida
var neighborhoodModel = [
	{
		name: 'DLF Mall of India',
		lat: 28.5675625,
		long: 77.32123019999995
	},
	{
		name: 'The Great India Place',
		lat: 28.567806,
		long: 77.32581600000003
	},
	{
		name: 'Decathlon Noida',
		lat: 28.5637028,
		long: 77.32347649999997
	},
	{
		name: 'Logix City Center',
		lat: 28.5742969,
		long: 77.35411669999996
	},
	{
		name: 'Centerstage Mall',
		lat: 28.5678233,
		long: 77.32288859999994
	}
];

function InitMap() {
	map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: 28.5675625, lng: 77.32123019999995},
    	zoom: 16
	});

}

var Neighborhood = function(value) {
	var self = this;
	self.name = value.name;
	self.lat = value.lat;
	self.long = value.long;
	self.latLng = {lat: self.lat, lng: self.long};

	//info window logic
	self.infoWindow =  new google.maps.InfoWindow({
				content: ''
	});

	//FourSquare APIs to fetch information on the marker location
	self.photoUrl ='';
	self.sector ='';
	self.city='';
	self.category='';
	self.rating='';
	self.url='';
	self.catIcon='';

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
			
			if(venue.bestPhoto){
				self.photoUrl = venue.bestPhoto.prefix+"width100"+venue.bestPhoto.suffix;
			}
			else{
				venue.photo='';
			}
			if(venue.location.formattedAddress[0])
				self.sector = venue.location.formattedAddress[0];
			else
				venue.sector='';
			if(venue.location.formattedAddress[1]){
				self.city = venue.location.formattedAddress[1];
			}
			else{
				self.city = '';
			}
			if(venue.categories[0].name){
				self.category = venue.categories[0].name;
				self.catIcon = venue.categories[0].icon.prefix+"_bg_32"+venue.categories[0].icon.suffix;
			}
			else{
				self.category ='';
				self.catIcon = '';
			}
			if(venue.rating){
				self.rating = venue.rating;
			}
			else{
				self.rating = "NA";
			}
			if(venue.url){
				self.url = venue.url;
			}
			else{
				self.url = '';
			}

		    //Build content for infowindow
			windowContent = '<div class="venueBlock"><div class="venueIcon"><img src="' + self.catIcon + '" class="icon"></div><div class="venueDetails">' +
              '<div class="venueName"><a href="' + self.url + '" target="_blank">' + self.name +'</a></div>' +
              '<div class="venueScore neutral" style="background-color: #FFC800;">' + self.rating + '</div><div class="venueAddressData">' +
               '<div class="venueAddress">' + self.sector + ', ' + self.city + '</div><div class="venueData"><span class="venueDataItem">' +
               '<span class="categoryName">' + self.category + '</span></span></div></div></div></div>';			

  			self.infoWindow.setContent(windowContent);
		}).fail(function(error){
    		self.infoWindow.setContent('Fail to connect to Foursquare: ' + error);
 		});
    
    }).fail(function(error){
    		self.infoWindow.setContent('Fail to connect to Foursquare: ' + error);
 	});
    
        	
	//making visible flag an observable so that we can hide/show markers as it changes
	self.visible = ko.observable(true);

	//draw custom markers for each neighborhood
	self.marker = new google.maps.Marker({
          position: self.latLng,
          map: map,
          title: self.name
        });

	google.maps.event.addListener(self.marker, 'click', function() {			
			if (currWindow){
				currWindow.close();
			} 

			currWindow = self.infoWindow;
			self.infoWindow.open(map, self.marker);
        	self.marker.setAnimation(google.maps.Animation.BOUNCE);
        	setTimeout(function() {
            	self.marker.setAnimation(null);
  		     }, 3000);
 
  		});


    // click handler for click on the list. animate the marker by generating click event
    self.animate = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };

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

function NeighborhoodViewModel() {
	var self = this;

	//filter string
	self.filterInput = ko.observable('');

	//list of schools
	self.neighborhoodList = ko.observableArray([]);
	self.filteredNeighborhoodList = ko.observableArray([]);

	//load map with default location
	InitMap();
	//google.maps.event.addDomListener(window, 'load', InitMap);


	//Push all places names in an observable array
	neighborhoodModel.forEach( function(s) {
		var neighborhood = new Neighborhood(s);
		self.neighborhoodList.push(neighborhood);
		self.filteredNeighborhoodList.push(neighborhood);
	});


	//create an updated list based on what user typed
	//filter checks if the string being typed matches any of the places names (in part starting index 0 to give an incremental serach effect)
	self.updateList = function () {
        var filterStr = self.filterInput().toLowerCase();
        self.filteredNeighborhoodList.removeAll();

        self.neighborhoodList().forEach(function(s){
        	if(!filterStr || (s.name.toLowerCase().indexOf(filterStr)===0)){
        		s.visible(true);
        		self.filteredNeighborhoodList.push(s);
        	}
        	else{
        		s.visible(false);
        	}
        });
        return true;
    }

	//trickery to invoke updateList function via dummy worker
	//Now realise that filteredNeighborhoodList can be an observable as well & that should prevent this trickery 
	self.worker = ko.computed( function(){
		self.updateList();
	}, this); 


}	

function initNeighborhoodApp() {
	ko.applyBindings(new NeighborhoodViewModel());
}


