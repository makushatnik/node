var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function(callback) {
        "use strict";
        
        this.db.collection('items').aggregate([
            {$group: {_id: "$category", num: {$sum: 1}}},
            {$sort: {_id: 1}}
        ]).toArray(function(err, docs) {
            assert.equal(err, null);
            //assert.notEqual(docs.length, 0);

            var num = 0;
            docs.forEach(x => num += x.num);
            var category = {
                _id: "All",
                num: num
            };
            docs.push(category);
            docs.sort(function(a,b) {
                return a._id > b._id ? 1 : a._id > b._id ? -1 : 0;
            });
            callback(docs);
        });
    }

    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";

        var query = {};
        if (category !== 'All') query = {"category": category};
        this.db.collection('items').find(query)
            .sort({"_id": 1})
            .skip(itemsPerPage * (page + 1) - itemsPerPage)
            .limit(itemsPerPage)
            .toArray(function(err, docs) {
                assert.equal(err, null);

                callback(docs);
            });
    }

    this.getNumItems = function(category, callback) {
        "use strict";

        var query = {};
        if (category !== 'All') query = {"category": category};
        this.db.collection('items').count(query)
            .then(function(data) {
                callback(data);
            });
    }

    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

        this.db.collection('items').find({"$text": {"$search": 'leaf'}})
            .sort({"_id": 1})
            .skip(itemsPerPage * (page + 1) - itemsPerPage)
            .limit(itemsPerPage)
            .toArray(function(err, docs) {
                assert.equal(err, null);
                callback(docs);
            });
    }

    this.getNumSearchItems = function(query, callback) {
        "use strict";

        this.db.collection('items').count({"$text": {"$search": 'leaf'}})
            .then(function(data) {
                callback(data);
            });
    }

    this.getItem = function(itemId, callback) {
        "use strict";

        this.db.collection('items').findOne({_id: itemId})
            .then(function(data) {
                callback(data);
            });
    }

    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };

    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        };
        this.db.collection('items').update({_id: itemId}, {$push: {reviews: reviewDoc}})
            .then(function(doc) {
                callback(doc);
            });
    }
}

module.exports.ItemDAO = ItemDAO;
