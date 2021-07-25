const express = require('express');
const fs = require('fs');
const TextGenerator = require('./lib/text-generator');
const bodyParser = require('body-parser');
const app = express();

let manele = null;
let artists = null;

function getArtists (manele) {
  const artists = {};
  for (let manea of manele) {
    let artist = manea.author.replace(/\sfeat.*$/gi, '');
    if (typeof artists[artist] !== 'undefined') {
      artists[artist]++;
    } else {
      artists[artist] = 0;
    }
  }
  return artists;
}

function getTextByArtist (artists, manele) {
  let text = '';
  for (let manea of manele) {
    for (let artist of artists) {
      if (manea.author.indexOf(artist) > -1) {
        text += manea.lyrics + '\n';
      }
    }
  }
  return text;
}

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/api/artists', (req, res) => {
  if (artists) {
    res.status(200).json({ success: true, data: artists });
  } else {
    res.status(500).json({ success: false, error: 'Artists were not loaded.' });
  }
});

app.post('/api/generate', (req, res) => {
  const config = {};
  const { artists, order, length } = req.body;
  try {
    if (artists) {
      config.text = getTextByArtist(artists, manele);
    }
    if (order) {
      config.order = parseInt(order);
    }
    if (length) {
      config.length = parseInt(length);
    }

    const textGenerator = new TextGenerator(config);
    textGenerator.generateText();
    const result = textGenerator.getResult();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
    console.error(err);
  }
});

app.listen(process.env.PORT || 8080, async function () {
  console.log(`Server started on port ${this.address().port}. Loading manele.json...`);
  const json = await fs.promises.readFile('./content/manele.json', 'utf-8');
  manele = JSON.parse(json);
  console.log('Loaded manele.json.');
  artists = getArtists(manele);
});