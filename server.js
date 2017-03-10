var http = require('http');
var express = require('express');
var Session = require('express-session');
var google = require('googleapis');
var plus = google.plus('v1');
var OAuth2 = google.auth.OAuth2;
const ClientId = "636525215968-ld7s5qbpjmt1rms47vkt0u3nha2meujm.apps.googleusercontent.com";
const ClientSecret = "WJXfxr2xIeC4WHjzaT2C2LWF";
const RedirectionUrl = "http://localhost:1234/oauthCallback/";

////4/befYMzlicqidDcKRpChDnT8HGhwRKercnm16Jhd7plE#

var app = express();
app.use(Session({
    secret: 'raysources-secret-19890913007',
    resave: true,
    saveUninitialized: true
}));

function getOAuthClient() {
    return new OAuth2(ClientId, ClientSecret, RedirectionUrl);
}

var oauth2Client = getOAuthClient();

oauth2Client.setCredentials({
    refresh_token: '1/0Ldo0Yroo5Zt9BHiNbuMn2TVk8I-Fn-svv3HwE2cMOg'
    // Optional, provide an expiry_date (milliseconds since the Unix Epoch)
    // expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
});

function getAuthUrl() {
    // generate a url that asks permissions for Google+ and Google Calendar scopes
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
        scope: scopes // If you only need one scope you can pass it as string
    });

    return url;
}


app.use("/oauthCallback", function (req, res) {

    var code = req.query.code;

    console.log("here is auth code :");
    console.log(req.query.code + "\n") ;
    

    oauth2Client.getToken(code, function (err, tokens) {
        // Now tokens contains an access_token and an optional refresh_token. Save them.

        console.log("here are tokens:");
        console.log(tokens);
        console.log("\n");

        if (!err) {
            res.send(tokens.access_token); 
        } else {
            res.send(`FAILS;`);
        }
    });
});

app.use("/ceva", function (req, res) {

    oauth2Client.refreshAccessToken(function (err, tokens) {
        if (err) {
            console.warn(err);
        }
        console.log(tokens);
    });

    res.send(`
        <h1>REFRESH</h1>
    `)
});

app.use("/", function (req, res) {
    var url = getAuthUrl();
    res.send(`
        <h1>Authentication using google oAuth2</h1>
        <a href=${url}>Login</a>
    `)
});




var port = 1234;
var server = http.createServer(app);
server.listen(port);
server.on('listening', function () {
    console.log(`listening to ${port}`);
});