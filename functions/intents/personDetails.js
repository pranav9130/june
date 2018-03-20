module.exports = {

    personDetailsProcess: function (db, parameters, sendResponse) {
	  	let personName = parameters.personName;
	  	let personDetails = parameters.personDetails;
	  	let firstName = "first";
	  	let lastName = "last";
	  	let peopleRef = db.collection('people');

	  	if(personName.length == 0) {
	  		sendResponse("no name :(");
	  		return;
	  	}

	  	firstName = personName[0];
	  	if(personName.length > 1) {
	  		lastName = personName[1];
	  	}
  		
  		let recordsRetrieved = [];

    	if(personName.length == 1) {
    		//only first name given
    		return personFirstName(peopleRef, firstName, sendResponse, personDetails, recordsRetrieved);
    	}
    	else if(personName.length == 2) {
    		//first name last name given
    		return personFirstNameLastName(peopleRef, firstName, lastName, sendResponse, personDetails, recordsRetrieved);
    	}
    	else {
    		sendResponse("Oops! no person details and name :(");
    	}
	}
}

function queryLastName(peopleRef, name, personDetails, recordsRetrieved) {
	return peopleRef.where('name.last', '==', name).get()
    				.then(snapshot => {
        				snapshot.forEach(doc => {
           					let record = doc.data();
           					recordsRetrieved.push(record);
           					console.log(record);
        				});
    				})
    				.catch(err => {
    				console.log("error getting docs, in queryLastName");
    			});
}

function personFirstName(peopleRef, firstName, sendResponse, personDetails, recordsRetrieved) {
	return peopleRef.where('name.first', '==', firstName).get()
    			.then(snapshot => {
    				console.log("snapshot length: " + snapshot.size);

        			snapshot.forEach(doc => {
           				let record = doc.data();
           				recordsRetrieved.push(record);		//record pushed
           				console.log(record);
        			});
        			//if name equals last name
       				queryLastName(peopleRef, firstName, personDetails, recordsRetrieved).then(
       						() => {
       							generateResponse(recordsRetrieved, personDetails, sendResponse);
       						})
       						.catch(err => {
       							console.log("error performing last name query");
       						});
    			})
    			.catch(err => {
    				console.log("error getting docs");
    			});
}

function personFirstNameLastName(peopleRef, firstName, lastName, sendResponse, personDetails, recordsRetrieved) {
	return peopleRef.where('name.first', '==', firstName).where('name.last', '==', lastName).get()
    			.then(snapshot => {
        			snapshot.forEach(doc => {
           				let record = doc.data();
           				console.log(record);
           				recordsRetrieved.push(record);
        			});
        			//querying lastName firstName
       				personLastNameFirstName(peopleRef, firstName, lastName, recordsRetrieved).then(
       						() => {
       							generateResponse(recordsRetrieved, personDetails, sendResponse);
       						})
       						.catch(err => {
       							console.log("error performing whoIsLastNameFirstName query");
       						});
    			})
    			.catch(err => {
    				console.log("error getting docs");
    			});
}

function personLastNameFirstName(peopleRef, firstName, lastName, recordsRetrieved) {
	return peopleRef.where('name.first', '==', lastName).where('name.last', '==', firstName).get()
    				.then(snapshot => {
        				snapshot.forEach(doc => {
           					let record = doc.data();
           					console.log(record);
           					recordsRetrieved.push(record);
        				});
    				})
    				.catch(err => {
    				console.log("error getting docs, in queryLastName");
    			});
}

function generateResponse(recordsRetrieved, personDetails, sendResponse) {
	console.log(recordsRetrieved);
	let response = "";
	if(recordsRetrieved.length == 1) {
		let record = recordsRetrieved[0];
		if(personDetails.length != 0) {
				if(personDetails[0] == "contact details" || personDetails.length == 2) {
					response = record.name.first + " " + record.name.last + "'s mobile no is " + record.mobile + " and email is "+ record.email;
				}
				else if(personDetails[0] == "details") {
					response = JSON.stringify(record);
				}
				else if(personDetails[0] == "mobile") {
					response = record.name.first + " " + record.name.last + "'s mobile no " + record.mobile;
				}
				else if(personDetails[0] == "email") {
					response = record.name.first + " " + record.name.last + "'s email id is " + record.email;
				}
				else {
					response = "Invalid query";
				}
		}
		else {
			response += record.name.first + " " + record.name.last + " is a " + record.type;
			if(record.type == "student") {
				response += " of " + record.class + " " + record.division;
			}
			else {
				//teacher of class
			}
		}
	}
	else {
			response += "Click name to know more";
			recordsRetrieved.forEach(record => {
				if(response)
					response += ", ";
				response += record.name.first + " " + record.name.last + " is a " + record.type;
			});
	}
	sendResponse(response);
}