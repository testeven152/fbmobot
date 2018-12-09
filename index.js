//webhook from facebook
var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
const PAGE_ACCESS_TOKEN = 'EAAfkc5lPdkMBAECzCnDACepZA4rqWGMXZBpvPR6n6pEz0ys6CCRKwD4UR113n4wXuXheCSDP9ZCgBHf0WTZAvYaXZCfZAJSJCScCFP8qaTOTMeMzf7bsv4n0hIlHPfXqhZCzgth6D4XyJeZAA7TC7JLvfa4QNBGVWlXuLvOLeCC6GwZDZD';

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Server index page
app.get("/", function (req, res) {
  res.send("Deployed!");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === "motivationbottoken") {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }

  
});

app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Get the webhook event. entry.messaging icoms an array, but 
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

        // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } 
      
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Handles messages events
function handleMessage(sender_psid, received_message) {
  
  // Checks if the message contains text
  if (received_message.text) {    
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    if (received_message.text.replace(/[^\w\s]/gi, '').trim().toLowerCase() == 'quote') {
      quotemessage(sender_psid);
    } else {
      defaultmessage(sender_psid);
    }
  }  
  
}


// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}

//Sends default message if message does not contain an existing keyword
function defaultmessage(sender_psid) {
  let response;
  response = {
    "text": `Sorry, I didn't understand that.`
  }
  callSendAPI(sender_psid, response);
}

function quotemessage(sender_psid) {
  let response;
  response = {
    "text": '"Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence." - Helen Keller.'
  }
  callSendAPI(sender_psid, response);
}