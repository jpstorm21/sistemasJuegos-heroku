"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _postgresApi = _interopRequireDefault(require("../middleware/postgresApi"));

var _FormValidator = _interopRequireDefault(require("../middleware/FormValidator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = new _express.default.Router();
/**
 * Handle request with form validation.
 *
 * @param {function} preValidation - form data validation function.
 * @param {function} callback - to do after a validation success.
 * @return {function} request handler.
 */

var requestFormValidation = function requestFormValidation(preValidation, callback) {
  return function (req, res, next) {
    if (req.body && req.body.data) req.body = JSON.parse(req.body.data);
    var formValidation = preValidation(req.body, req.method);
    if (formValidation.isValid) return callback(req, res, next);
    res.status(400).json(formValidation);
  };
}; // Return logged user information request


router.get('/userInfo', function (req, res) {
  res.status(200).json({
    id: req.user.id,
    name: req.user.name,
    userId: req.user['user_id'],
    type: req.user['user_type_id']
  });
});
router.post('/authenticatedUser', _postgresApi.default.getAuthenticatedUserData); // DELETE request

router.delete('/deleteGame/:id/:user', _postgresApi.default.deleteGame); // GET request

router.get('/user', _postgresApi.default.getUserList);
router.get('/user/:id', _postgresApi.default.getUserById);
router.get('/userType', _postgresApi.default.getUserTypeList);
router.get('/GamesByUser/:id/:plataform', _postgresApi.default.getGamaByUser);
router.get('/CategoryList', _postgresApi.default.getCategoryList);
router.get('/PlataformList', _postgresApi.default.getPlataformList);
router.get('/infoGame/:id/:user', _postgresApi.default.getInfoGame);
router.get('/sumaryGames/:id', _postgresApi.default.sumaryGames);
router.get('/pdfps4', _postgresApi.default.pdfPs4);
router.get('/pdfswitch', _postgresApi.default.pdfSwitch); // POST request

router.post('/user', requestFormValidation(_FormValidator.default.userForm, _postgresApi.default.insertUser));
router.post('/insertGame', requestFormValidation(_FormValidator.default.gameForm, _postgresApi.default.insertGame)); // PUT request

router.put('/user/:id', requestFormValidation(_FormValidator.default.userForm, _postgresApi.default.updateUser));
router.put('/updateGame/:id', requestFormValidation(_FormValidator.default.gameForm, _postgresApi.default.updateGame)); // Handle invalid URI request.

router.all('*', function (req, res) {
  res.status(404).json({
    message: 'La ruta de la solicitud HTTP no es reconocida por el servidor.'
  });
});
var _default = router;
exports.default = _default;