var http = require('http');
var fs = require('fs');
var express = require('express');
var google = require('googleapis');

var jsonfile = require('jsonfile')

var OAuth2 = google.auth.OAuth2;

const ClientId = "636525215968-du8oc1ucdqju8nlc3att4ovp435ifdhg.apps.googleusercontent.com";
const ClientSecret = "eg9YqWihuMxNjyd45u1-dvup";
const RedirectionUrl = "http://localhost:5454/oauthCallback/";

var app = express();

var oauth2Client = new OAuth2(ClientId, ClientSecret, RedirectionUrl);

var oauth2ClientJson = {
    "auth_code" : "",
    "access_token": "",
    "refresh_token": "",
}

var config_file = 'tmp/basic.oauth2Client.json'

function getAuthUrl() {
    // generate a url that asks permissions for GoogleClassroom
    var scopes = [
        "https://www.googleapis.com/auth/classroom.rosters.readonly",
        "https://www.googleapis.com/auth/classroom.profile.emails",
        "https://www.googleapis.com/auth/classroom.profile.photos",
        "https://www.googleapis.com/auth/classroom.courses.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/chromewebstore.readonly"
    ];

    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });

    return url;
}


app.use("/oauthCallback", function (req, res) {

    var code = req.query.code;

    oauth2ClientJson.auth_code = req.query.code;

    oauth2Client.getToken(code, function (err, tokens) {
        // Now tokens contains an access_token and an optional refresh_token. Save them.

        console.log("here are tokens:");
        console.log(tokens);
        console.log("\n");

        if (!err) {

            oauth2ClientJson.access_token = tokens.access_token;
            oauth2ClientJson.refresh_token = tokens.refresh_token;

            jsonfile.writeFileSync(config_file, oauth2ClientJson);

            res.send(` <h2>Successfully authenticated!</h2>
                <h3>Now save your config file for the teacher or student (the one you authenticated with).</h3>
                <b>The config file keeps the access_token and refresh_token for that user, and will be used later to refresh access to our application
                when token expires.<br> Keep in mind that you only need to create a config file once.</b>
                <br><br>
                <a href="/save-student">Save student config file</a>
                <br><br>
                <a href="/save-teacher">Save teacher config file</a>`); 


        } else {
            res.send(`<h1>FAILED!</h1>`);
        }
    });
});

app.use("/save-student", function (req, res) {

    if (fs.existsSync('tmp/student.oauth2Client.json')) {
        res.send(`<h2>Config file for student allready exists: tmp/student.oauth2Client.json</h2>`)
        return;
    } else {

        var file_content = jsonfile.readFileSync('tmp/basic.oauth2Client.json');

        file_content.name = "VSD Student 5";
        file_content.email = "vsd_s5@gedu-demo-ampit.com";

        jsonfile.writeFileSync('tmp/student.oauth2Client.json', file_content, { spaces: 2 });

        res.send(`<h2>Success. New config file created for the student: tmp/student.oauth2Client.json</h2>`)
    }
});

app.use("/save-teacher", function (req, res) {

    if (fs.existsSync('tmp/teacher.oauth2Client.json')) {
        res.send(`<h2>Config file for teacher allready exists: tmp/teacher.oauth2Client.json</h2>`)
        return;
    } else {

        var file_content = jsonfile.readFileSync('tmp/basic.oauth2Client.json');

        file_content.name = "Vsd Teacher 1";
        file_content.email = "vsd_t1@gedu-demo-ampit.com";

        jsonfile.writeFileSync('tmp/teacher.oauth2Client.json', file_content, { spaces: 2 });

        res.send(`<h2>Success. New config file created for the teacher: tmp/teacher.oauth2Client.json</h2>`)
    }
});

app.use("/", function (req, res) {
    var url = getAuthUrl();
    res.send(`
        <h1>Authentication using google oAuth2.</h1><h2>Click Login to authenticate into the Vision Online Test Stress app!</h2>
        <a href=${url}>Login</a>
    `)
});


var port = 5454;
var server = http.createServer(app);
server.listen(port);
server.on('listening', function () {
    console.log(`listening to ${port}`);
});

