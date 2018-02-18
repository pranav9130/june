module.exports = {

    personDetailsProcess: function (db, parameters, sendResponse) {
	  	let personName = parameters.personName;
	  	let personDetails = parameters.personDetails;

	  	let name = personName[0];

	  	var peopleRef = db.collection('people');
		var people = peopleRef.get()
    		.then(snapshot => {
        		snapshot.forEach(doc => {
           			let record = doc.data();
		            if(record.name.first == name) {
		            	sendResponse(name + "'s mobile number is " + record.mobile);
		            }
        		});
    		})
    		.catch(err => {
        	console.log('Error getting documents', err);
    	});
	}
}