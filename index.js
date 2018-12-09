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
  
  var keywords = ['hello','hi', 'greetings','quote','who'];
  var newtext = 'null';
  // Checks if the message contains text
  if (received_message.text) {    
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API

    for (var dict = 0; dict < keywords.length; dict++) {
      if (keywordmatch(received_message.text, keywords[dict]) == true) {
          newtext = keywords[dict];
      } 
    };


    switch(newtext) {
      case 'quote':
      quotemessage(sender_psid);
      break;
      case 'greetings':
      hellomessage(sender_psid);
      break;
      case 'hello':
      hellomessage(sender_psid);
      break;
      case 'hi':
      hellomessage(sender_psid);
      break;
      case 'who':
      whomessage(sender_psid);
      break;
      default:
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

//keyword match to messagetext
//if keyword is found in string, returns true otherwise false
//i hope this works i got this off the internet
function keywordmatch(bstring, lstring) {
  let bstringlength = bstring.length;
  let lstringlength = lstring.length;

  for (var i = 0; i <= bstringlength - lstringlength; i++) {
    for (var j = 0; j < lstring.length; j++ ) {
      if (bstring[i + j] != lstring[j]) break;
      if (j = lstringlength) return true;
    }
  }

  return false;

}

//Sends default message if message does not contain an existing keyword
function defaultmessage(sender_psid) {
  let response;
  response = {
    "text": `Sorry, I didn't understand that.`
  }
  callSendAPI(sender_psid, response);
}

//greeting message
function hellomessage(sender_psid) {
  let response;
  response = {
    "text": 'Hi! I am the Motivation Bot.'
  }
  callSendAPI(sender_psid, response);
}

//Sends 'who am i' message 
function whomessage(sender_psid) {
  let response;
  response = {
    "text": 'I am the Motivation Bot. I give you motivational quotes when you need it! Just ask for a quote.'
  }
  callSendAPI(sender_psid, response);
}

//Sends random motivational quote
function quotemessage(sender_psid) {
  let response;
  let rand = Math.floor(Math.random() * 6) + 1; // gives random number between 1 and 5;
  switch (rand) {
    case 1:
    response = {
      "text": '"Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence." - Helen Keller.'
    };
    break;
    case 2:
    response = {
      "text": '"Life is 10% what happens to you and 90% how you react to it." - Charles R. Swindoll.'
    };
    break;
    case 3:
    response = {
      "text": '"With the new day comes new strength and new thoughts." - Eleanor Roosevelt.'
    };
    break;
    case 4:
    response = {
      "text": '"If you can dream it, you can do it." - Walt Disney.'
    };
    break;
    case 5:
    response = {
      "text": '"Problems are not stop signs, they are guidelines." - Robert H. Schuller.'
    };
    break;
    case 6:
    response = {
      "text": '"The way to get started is to quit talking and begin doing." - Walt Disney.'
    }
    break;
  }
  
  callSendAPI(sender_psid, response);
}