require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const dns = require('dns'); 

// Basic Configuration

process.env.MONGO_URI="mongodb+srv://tepa6aut:pasdword@cluster0.sbkcl.mongodb.net/test?retryWrites=true&w=majority";


mongoose.connect(process.env.MONGO_URI)


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const linkSchema = new mongoose.Schema({
  originalLink: String,
  shortLink: Number
})

const Link = mongoose.model('Link', linkSchema)

const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



app.post("/api/shorturl/new", function(req, res) {
  if (!/^https:\/\//.test(req.body.url)) {
    res.json({error: "Invalid URL"});
  }
  var urlObject = new URL(req.body.url);

  dns.lookup(urlObject.hostname, function(err) {
    if (err) {
      res.json({"error":"invalid URL"});
    } else {
         Link.findOne({ "originalLink": req.body.url }, function(err,data) {
           if (err) {
              return done(err);
           }
           if (!data) {
              var num = Math.round(Math.random()*1000);
              const link = new Link();
              link.originalLink = req.body.url;
              link.shortLink = num;
              link.save(function(err,data) {
                if (err) {
                  return done(err);
                }
                });
              res.json({"original_url": req.body.url, "short_url": num});
            } else {
                res.json({"original_url": data.originalLink, "short_url": data.shortLink});
             }
        })    
    }})

    });

app.get("/api/shorturl/:identifier", function(req, res) {
  var identifier = req.params.identifier;
  Link.find({shortLink: identifier} , function(err, data) {
    if (err) {
      return done(err);
    }
    res.redirect(data[0].originalLink);
  });
 });


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
