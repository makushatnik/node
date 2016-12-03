var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

function CartDAO(database) {
    "use strict";

    this.db = database;

    this.getCart = function(userId, callback) {
        "use strict";

        this.db.collection('cart').findOne({userId: userId})
            .then(function(doc) {
                callback(doc);
            });
    }

    this.itemInCart = function(userId, itemId, callback) {
        "use strict";

        this.db.collection("cart")
            .find({userId: userId, "items._id": itemId}, {"items.$": 1})
            .limit(1)
            .next(function(err, item) {
                assert.equal(null, err);
                console.log(err);
                if (item != null) {
                    item = item.items[0];
                }
                console.log(item);
                callback(item);
            });
    }

    this.addItem = function(userId, item, callback) {
        "use strict";

        this.db.collection("cart").findOneAndUpdate(
            {userId: userId},
            {"$push": {items: item}},
            {
                upsert: true,
                returnOriginal: false
            },
            function(err, result) {
                assert.equal(null, err);
                callback(result.value);
            });
    };

    this.updateQuantity = function(userId, itemId, quantity, callback) {
        "use strict";

        var updateDoc = {};
        if (quantity == 0) {
            updateDoc = { "$pull": { items: { _id: itemId } } };
        } else {
            updateDoc = { "$set": { "items.$.quantity": quantity } };
        }

        this.db.collection("cart").findOneAndUpdate(
            { userId: userId,
              "items._id": itemId },
            updateDoc,
            { returnOriginal: false },
            function(err, result) {
                assert.equal(null, err);
                console.log(result.value);
                callback(result.value);
            });
    }
}

module.exports.CartDAO = CartDAO;
