const express = require("express");
const TextGenerator = require("./lib/text-generator");
const bodyParser = require("body-parser");
const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());

app.post("/api/generate", (req, res) => {
  const config = {};
  const { text, order, length } = req.body;
  try {
    if (text) {
      config.text = text;
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

app.listen(process.env.PORT || 8080, function() {
  console.log(`Server started on port ${this.address().port}`);
});
