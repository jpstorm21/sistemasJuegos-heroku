"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _routes = require("./routes.json");

var _passport = _interopRequireDefault(require("passport"));

var _user = _interopRequireDefault(require("../models/user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = new _express.default.Router();
router.post('/login', _passport.default.authenticate('local'), function (req, res) {
  return res.json({
    success: true,
    message: 'Ha logrado ingresar al sistema con éxito!',
    user: req.user
  });
});
router.get('/checkLogin', function (req, res) {
  res.status(200).json({
    logged: req.isAuthenticated()
  });
});
router.get('/logout', function (req, res) {
  req.logOut();
  res.redirect(_routes.basename + _routes.client.login);
});
router.get('/register', function (req, res) {
  _user.default.register({
    user_id: '19.042.481-2',
    user_type_id: 'ADM',
    name: 'Juan Pablo Martínez',
    email: 'jmr032@alumnos.ucn.cl',
    phone: 963511317
  }, 'lolowerty21', function (err, user) {
    console.log(err);
    res.json({
      user: user,
      err: err
    });
  });
});
var _default = router;
exports.default = _default;