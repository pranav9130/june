'use strict';

const admin = require('firebase-admin'); //required for cloud firestore
const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const personDetails = require('./intents/personDetails');

admin.initializeApp(functions.config().firebase);			//initialize cloud firestore
var db = admin.firestore();									// db reference


const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  //console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  //console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  if (request.body.result) {
    processV1Request(request, response);
  } else {
    console.log('Invalid Request');
    return response.status(400).end('Invalid Webhook Request (expecting v1 or v2 webhook request)');
  }
});
/*
* Function to handle v1 webhook requests from Dialogflow
*/
function processV1Request (request, response) {
  let action = request.body.result.action; // https://dialogflow.com/docs/actions-and-parameters
  let parameters = request.body.result.parameters; // https://dialogflow.com/docs/actions-and-parameters
  let inputContexts = request.body.result.contexts; // https://dialogflow.com/docs/contexts
  let requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
  const app = new DialogflowApp({request: request, response: response});
  // Create handlers for Dialogflow actions as well as a 'default' handler
  const actionHandlers = {
    // The default welcome intent has been matched, welcome the user (https://dialogflow.com/docs/events#default_welcome_intent)
    'input.welcome': () => {
        sendResponse('Hello, Welcome to Harsh Dialogflow agent!'); // Send simple response to user
    },
    //Person details intent
    'getPersonDetails': () => {
    	personDetails.personDetailsProcess(db, parameters, function(res){
    		sendResponse(res);
    	});
    },
    // The default fallback intent has been matched, try to recover (https://dialogflow.com/docs/intents#fallback_intents)
    'input.unknown': () => {
        sendResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
    },
    // Default handler for unknown or undefined actions
    'default': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
        let responseToUser = {
          //data: richResponsesV1, // Optional, uncomment to enable
          //outputContexts: [{'name': 'weather', 'lifespan': 2, 'parameters': {'city': 'Rome'}}], // Optional, uncomment to enable
          speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!', // spoken response
          text: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)' // displayed response
        };
        sendResponse(responseToUser);
    }
  };
  // If undefined or unknown action use the default handler
  if (!actionHandlers[action]) {
    action = 'default';
  }
  // Run the proper handler function to handle the request from Dialogflow
  actionHandlers[action]();

  // function personDetailsProcess(db, parameters) {
  	
  // }
  function sendResponse(responseToUser) {
	    // if the response is a string send it as a response to the user
	    if (typeof responseToUser === 'string') {
	      let responseJson = {};
	      responseJson.speech = responseToUser; // spoken response
	      responseJson.displayText = responseToUser; // displayed response
	      response.json(responseJson); // Send response to Dialogflow
	    } else {
	      // If the response to the user includes rich responses or contexts send them to Dialogflow
	      let responseJson = {};
	      // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
	      responseJson.speech = responseToUser.speech || responseToUser.displayText;
	      responseJson.displayText = responseToUser.displayText || responseToUser.speech;
	      // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
	      responseJson.data = responseToUser.data;
	      // Optional: add contexts (https://dialogflow.com/docs/contexts)
	      responseJson.contextOut = responseToUser.outputContexts;
	      console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
	      response.json(responseJson); // Send response to Dialogflow
	    }
	  }
}

  // Function to send correctly formatted responses to Dialogflow which are then sent to the user

 

//module.exports = {sendResponse};