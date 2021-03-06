// Brown Bear Alexa sample skill
// see https://amzn.com/0805047905

// var AWS = require('aws-sdk');

exports.handler = function( event, context ) {
    var say = "";
    var endsession = false;
    var sessionAttributes = {};
    var myColor = "brown";
    var myAnimal = "bear";

    if (event.session.attributes) {
        sessionAttributes = event.session.attributes;
    }

    if (event.request.type === "LaunchRequest") {
        say = "Welcome to the game, Werewolf. How many players are in the game?";

    } else {
        var IntentName = event.request.intent.name;

        if (IntentName === "NumberIntent") {

            if(event.request.intent.slots.Number.value) {

                theNumbers  = event.request.intent.slots.Number.value;

                if (!sessionAttributes.myList)  {sessionAttributes.myList = []; }

                  for(i = 1; i <= theNumbers; i++){
                      var player={
                      number:i, health:"alive",
                    };
                    sessionAttributes.myList.push(player);
                  }
                say = "There are "+ theNumbers +" players. The joker card is the death card. If you find this card if front of you, you have been killed in the night. Hopefully the villagers will avenge your death. Number one and two are werewolves. Number three is the doctor. Number four is the fortuneteller. The remaining players are the villagers. Would you like to continue?";

            } else {
                say = "you can say things like, five players in the game";
            }

          } else if (IntentName === "ContinueIntent") {
                if(event.request.intent.slots.Continue.value){
                  say = "Everyone fall asleep. Werewolves, wake up. You have thirty seconds to place the death card in front of who you want to kill. ten nine eight seven six five four three two one. Werewolves, close your eyes. Doctor, wake up. If you want to save this person, move the death card to the middle of the circle. You have fifteen seconds. ten nine eight seven six five four three two one. Doctor, close your eyes. Fortuneteller, wake up. Choose one card to look at. You have fifteen seconds.ten nine eight seven six five four three two one. Fortuneteller, close your eyes."

                } else {
                    say = "you can say things like, five players in the game";
                }

          } else if (IntentName === "EndIntent") {
              var s = "";
              for (var i = 0; i < sessionAttributes.myList.length ; i++){
                  s += "Number " + sessionAttributes.myList[i].number + " is "+ sessionAttributes.myList[i].health+". ";
              }
              say = s + "Good game!";
              endsession = true;
          }
    }

    var response = {
        outputSpeech: {
            type: "SSML",
            ssml: "<speak>" + say + "</speak>"
        },
        reprompt: {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>Please try again. " + say + "</speak>"
            }
        },
        card: {
            type: "Simple",
            title: "My Card Title",
            content: "My Card Content, displayed on the Alexa Companion mobile App or alexa.amazon.com"
        },

        shouldEndSession: endsession
    };



    Respond(  // Respond with normal speech only
        function() {context.succeed( {sessionAttributes: sessionAttributes, response: response } ); }
    );


    // --------- Uncomment for AWS SQS Integration -------------------------------------------------
    //RespondSendSqsMessage(  // use this to send a new message to an SQS Queue
    //    {
    //        MessageBody:  "https://www.google.com/search?tbm=isch&q=" + myColor + "%20" + myAnimal  // Message Body (Image Search URL)
    //    },
    //     function() {context.succeed( {sessionAttributes: sessionAttributes, response: response } ); }
    //);


    // --------- Uncomment for AWS IOT Integration -------------------------------------------------
    //RespondUpdateIotShadow(  // use this to update an IoT device state
    //    {
    //        IOT_THING_NAME: "MyDevice",
    //        IOT_DESIRED_STATE: {"pump":1}  // or send spoken slot value detected
    //    },
    //    function() {context.succeed( {sessionAttributes: sessionAttributes, response: response } ); }
    //);


};

// -----------------------------------------------------------------------------

function Respond(callback) {
    callback();
}

function RespondSendSqsMessage(sqs_params, callback) {

    sqs_params.QueueUrl = "https://sqs.us-east-1.amazonaws.com/333304289684/AlexaQueue";

    var sqs = new AWS.SQS({region : 'us-east-1'});


    sqs.sendMessage(sqs_params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            console.log("success calling sqs sendMessage");

            callback();  // after performing SQS send, execute the caller's context.succeed function to complete
        }
    });

}


function RespondUpdateIotShadow(iot_config, callback) {

    iot_config.IOT_BROKER_ENDPOINT      = "https://A2ESHRCP6U0Y0C.iot.us-east-1.amazonaws.com".toLowerCase();
    iot_config.IOT_BROKER_REGION       = "us-east-1";


    var iotData = new AWS.IotData({endpoint: iot_config.IOT_BROKER_ENDPOINT});

    //Set the pump to 1 for activation on the device
    var payloadObj={ "state":
    { "desired":
    iot_config.IOT_DESIRED_STATE // {"pump":1}
    }
    };

    //Prepare the parameters of the update call
    var paramsUpdate = {
        "thingName" : iot_config.IOT_THING_NAME,
        "payload" : JSON.stringify(payloadObj)
    };
    // see results in IoT console, MQTT client tab, subscribe to $aws/things/YourDevice/shadow/update/delta

    //Update Device Shadow
    iotData.updateThingShadow(paramsUpdate, function(err, data) {
        if (err){
            console.log(err.toString());
        }
        else {
            console.log("success calling IoT updateThingShadow");
            callback();  // after performing Iot action, execute the caller's context.succeed function to complete
        }
    });



}
