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
// ******************************************************************************************************************************************************

var map;

//List of Schools near Expressway Noida
var schoolsModel = [
	{
		name: 'Lotus Valley International School, Sector 126',
		lat: 28.5382382,
		long: 77.34513330000004
	},
	{
		name: 'Step by Step School, Sector 132',
		lat: 28.511652,
		long: 77.378141
	},
	{
		name: 'Pathways School, Sector 100',
		lat: 28.54226,
		long: 77.367722
	},
	{
		name: 'The Shriram Millennium School',
		lat: 28.499339,
		long: 77.397373
	},
	{
		name: 'Gyanshree School, Sector 127',
		lat: 28.536222,
		long: 77.349374
	}
];

function InitMap() {
	map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: 28.5382382, lng: 77.34513330000004},
    	zoom: 16
	});
}

var School = function(value) {
	var self = this;
	this.name = value.name;
	this.lat = value.lat;
	this.long = value.long;

	//making visible flag an observable so that we can hide/show markers as it changes
	this.visible = ko.observable(true);

	//draw custom markers for each school
	var myLatLng = {lat: this.lat, lng: this.long};
	this.marker = new google.maps.Marker({
          position: myLatLng,
          map: map,
          title: this.name
        });

	//this function would be called whenever visible (observable) changes
    this.showMarker = ko.computed( function(){
    	if(!this.visible()){
    		this.marker.setMap(null);
    	}
    	else{
    		this.marker.setMap(map);
    	}
    	return true;	
    }, this);
    	
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

