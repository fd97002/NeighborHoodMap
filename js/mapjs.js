var map;

//List of Schools near Expressway Noida
var schoolsModel = [
	{
		name: 'Lotus Valley International School, Sector 126',
		lat: '28.5382382',
		long: '77.34513330000004'
	},
	{
		name: 'Step by Step School, Sector 132',
		lat: '28.511652',
		long: '77.378141'
	},
	{
		name: 'Pathways School, Sector 100',
		lat: '28.54226',
		long: '77.367722'
	},
	{
		name: 'The Shriram Millennium School',
		lat: '28.499339',
		long: '77.397373'
	},
	{
		name: 'Gyanshree School, Sector 127',
		lat: '28.536222',
		long: '77.349374'
	}
];

function initmap() {
	map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 28.5382382, lng: 77.34513330000004},
    zoom: 16
	});
}

function SchoolViewModel() {
	var self = this;
	self.schoolList = ko.observableArray([]);

	//Push all school names in an observable array
	schoolsModel.forEach( function(school) {
		self.schoolList.push(school);
		});

	//load map with default location
	initmap();
}	

function initSchoolsApp() {
	ko.applyBindings(new SchoolViewModel());
}

