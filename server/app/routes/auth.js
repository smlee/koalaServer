/**
 * Created by sangmin on 6/22/15.
 */
var ensureAuthenticated = function (req, res, next) {
    console.log('is this working??');
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};

module.exports = ensureAuthenticated;