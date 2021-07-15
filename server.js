const path = require("path");
const express = require("express");
const app = express();
const port = 5000;

app.use("/public", express.static(path.join(__dirname, "public")))

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.listen(port, () => {
    console.log(`Listening on port:${port}`);
});