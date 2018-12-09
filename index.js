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
  
  var keywords = ['hello','hi', 'greetings','quote','who', 'sad'];
  var newtext = 'null';
  // Checks if the message contains text
  if (received_message.text) {    

    // Finds out if a keyword is in the text message
    for (var dict = 0; dict < keywords.length; dict++) {
      if (keywordmatch(received_message.text.trim().toLowerCase(), keywords[dict]) == true) {
          newtext = keywords[dict];
      } 
    };

    // sends a different message for the found keyword
    switch(newtext) {
      case 'quote':
      quotemessage(sender_psid);
      break;
      case 'sad':
      sadmessage(sender_psid);
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
    "text": 'Hi! I am the Motivation Bot. Ask me anything!'
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

//Sends quote for "sad" messages
function sadmessage(sender_psid) {
  let response;
  let rand = Math.floor(Math.random() * 5) + 1; // gives random number between 1 and 5
  switch (rand) {
    case 1:
    response = {
      "text": '"Remember that sometimes not getting what you want is a wonderful stroke of luck." - Dalai Lama.'
    }
    break;
    case 2:
    response = {
      "text": 'I am sorry you are sad, but how can I be sorry if I am just a bot. Sorry.'
    }
    break;
    case 3:
    response = {
      "text": '"First accept sadness. Realize that without losing, winning is not so great" - Alyssa Milano.'
    }
    break;
    case 4:
    response = {
      "text": '"We must understand that sadness is an ocean, and sometimes we drown, while other days we are forced to swim." - R.M. Drake.'
    }
    break;
    case 5:
    response = {
      "text": 'Experiencing sadness and anger can make you feel more creative, and by being creative you can get beyond your pain or negativity" - Yoko Ono.'
    }
    break;
  }

  callSendAPI(sender_psid, response);
}

//Sends random motivational quote
function quotemessage(sender_psid) {
  let response;
  let rand = Math.floor(Math.random() * 10) + 1; // gives random number between 1 and 10;
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
    case 7:
    response = {
      "text": '"It does not matter how slowly you go as long as you do not stop." - Confucius.'
    }
    break;
    case 8:
    response = {
      "text": '"We should not give up and we should not allow the problem to defeat us" - A. P. J. Abdul Kalam.'
    }
    break;
    case 9:
    response = {
      "text": '"Either you run the day or the day runs you." - Jim Rohn.'
    }
    break;
    case 10:
    response = {
      "text": '"Never, never, never give up." - Winston Churchill.'
    }
    break;
  }
  
  callSendAPI(sender_psid, response);
}