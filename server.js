// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request-promise');
var app = express();

app.use(bodyParser.json());

app.get("/", function(request,response) {
  response.send("nope")
});

var seen_events = {};

function postTest (text) {
  console.log(text);
  return request({
            url: process.env.WEBHOOK_URL,
            method: "POST",
            form: {
              token: process.env.OAUTH_TOKEN,
              channel: '#slack-itself',
              text: text
            }
          }).catch(function(e) {if (e) {console.log(e);}});
}

app.post("/slack/event", function (req, response) {
  const e = req.body.event;
  console.log(e);
  if (req.body.token === process.env.EVENT_TOKEN) {
    if (!seen_events[e.event_ts]) {
        seen_events[e.event_ts] = true;
        if (e.type === 'emoji_changed' &&
            e.subtype === 'add' ) {
          postTest(e.name + ": :" + e.name + ":")
            .then(() => postTest(":" + e.name + ":"));
        }
    }
    response.status(200).send(req.body.challenge||"");
  } else {
    response.status(404).send("I don't really *do* that kind of thing.");
  }
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
