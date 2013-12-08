var TfIdf = require('natural').TfIdf;

function Index() {
    this.tfidf = new TfIdf();
    this.index = {};
    this.docs = {};
}
module.exports = Index;

Index.prototype.addDocument = function(key, doc) {
    this.docs[key] = doc;

    for (var field in doc) {
        this.tfidf.addDocument(doc[field], key + ":" + field);
    }
};

var splitRegex = /[^\w\-]+/g;
Index.prototype.query = function(query) {
    var tfidf = this.tfidf;
    var results = {};
    query.split(splitRegex).forEach(function(word) {
        tfidf.tfidfs(word, function(i, measure, keyAndField) {
            keyAndField = keyAndField.split(':');
            var key = keyAndField[0];
            var field = keyAndField[1]; // XXX use field if we want to add weights
            if (!results[key]) {
                results[key] = 0;
            }

            results[key] += measure;
        });
    });

    var resArr = [];
    for (var k in results) {
        if (results[k] > 0) {
            resArr.push({key: k, measure: results[k], doc: this.docs[k]});
        }
    }
    return resArr.sort(function(a, b) {
        return b.measure - a.measure;
    });
};
