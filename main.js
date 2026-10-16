const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const url = '<insert your MongoDB connection string here>';
const dbName = '<insert your database name here>';
const collectionName = '<insert your collection name here>';

MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  if (err) return console.log(err);

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  app.post('/resetpassword/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const newPassword = req.body.password;

      if (!newPassword) {
        return res.status(400).send('Password is required');
      }

      // Invalid id can never match a user -> 404
      if (!ObjectId.isValid(userId)) {
        return res.status(404).send('User not found');
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { password: newPassword } }
      );

      if (result.matchedCount === 0) {
        return res.status(404).send('User not found');
      }

      res.status(200).send('Password reset successful');
    } catch (e) {
      console.log(e);
      res.status(500).send('Internal server error');
    }
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});