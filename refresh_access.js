var google = require('googleapis');
var jsonfile = require('jsonfile');
var fs = require('fs');
var OAuth2 = google.auth.OAuth2;

// GOOGLE APP OAUTH IDS
const ClientId = "636525215968-du8oc1ucdqju8nlc3att4ovp435ifdhg.apps.googleusercontent.com";
const ClientSecret = "eg9YqWihuMxNjyd45u1-dvup";
const RedirectionUrl = "http://localhost:5454/oauthCallback/";

// create new oauth client
var oauth2Client = new OAuth2(ClientId, ClientSecret, RedirectionUrl);

var arg = process.argv.slice(2)[0];

if (arg !== "teacher" && arg !== "student") {
    console.log(arg + " should be teacher or student\n");
    console.log("use this script like: node script student/teacher")
    return;
}

// read file with current user (student/teacher)
var file_content = jsonfile.readFileSync('auth/tmp/' + arg +'.oauth2Client.json');

// update object ouath2Clinet with 
oauth2Client.setCredentials({
    refresh_token: file_content.refresh_token
});

oauth2Client.refreshAccessToken(function (err, tokens) {

    if (err) {
        console.warn(err);
    }

    //update old access_token with new one
    file_content.access_token = tokens.access_token;

    // write new contents back to file // just for persistently purposes
    //jsonfile.writeFileSync('auth/tmp/' + arg + '.oauth2Client.json', file_content, {spaces: 2});

    // create new access_token for student/teacher
    if (arg === "teacher") {
        fs.writeFile('token_teacher.csv', tokens.access_token, function (err) {
            if (err) return console.log(err);
            console.log('Refreshed access_token for teacher in token_teacher.csv');
        });
    } else {
        fs.writeFile('token_student.csv', tokens.access_token, function (err) {
            if (err) return console.log(err);
            console.log('Refreshed access_token for student in token_student.csv');
        });
    }

});
