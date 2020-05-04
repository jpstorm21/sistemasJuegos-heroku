"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pdfSwicth = exports.pdfPs4 = void 0;

var _pdfmake = _interopRequireDefault(require("pdfmake/build/pdfmake"));

var _vfs_fonts = _interopRequireDefault(require("pdfmake/build/vfs_fonts"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = _interopRequireDefault(require("path"));

var _routes = require("../routes/routes.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_pdfmake.default.vfs = _vfs_fonts.default.pdfMake.vfs;

var createPDF = function createPDF(docDefinition, filePath) {
  return new Promise(function (resolve, reject) {
    _pdfmake.default.createPdf(docDefinition).getBase64(function (base64) {
      _fsExtra.default.outputFile(filePath, base64, 'base64').then(function () {
        return resolve(filePath);
      }).catch(function (err) {
        return reject(err);
      });
    });
  });
};

var pdfPs4 = function pdfPs4(data) {
  var table = [];
  var indexColumns = ['Nombre', 'Categoria', 'Estado', 'Instalado'];
  table.push(indexColumns);
  data.map(function (j) {
    var data = [];
    data.push(j.nombre);
    data.push(j.categoria);
    data.push(j.estado ? 'Terminado' : 'En juego');
    data.push(j.instalado ? 'SI' : 'NO');
    table.push(data);
  });
  var docDefinition = {
    content: [{
      text: 'Reporte Juegos PS4',
      style: 'header'
    }, {
      style: 'tableExample',
      table: {
        body: table,
        widths: [150, 100, 100, 100]
      }
    }],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
        alignment: 'center'
      },
      tableExample: {
        margin: [20, 20, 100, 100],
        alignment: 'center'
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black'
      }
    },
    defaultStyle: {
      alignment: 'justify'
    }
  };

  var filePath = _path.default.join(_routes.staticFolderPath, _routes.uploadPath, '/temp', 'Reporte Juegos PS4.pdf');

  return createPDF(docDefinition, filePath);
};

exports.pdfPs4 = pdfPs4;

var pdfSwicth = function pdfSwicth(data) {
  var table = [];
  var indexColumns = ['Nombre', 'Categoria', 'Estado', 'Instalado'];
  table.push(indexColumns);
  data.map(function (j) {
    var data = [];
    data.push(j.nombre);
    data.push(j.categoria);
    data.push(j.estado ? 'Terminado' : 'En juego');
    data.push(j.instalado ? 'SI' : 'NO');
    table.push(data);
  });
  var docDefinition = {
    content: [{
      text: 'Reporte Juegos SWITCH',
      style: 'header'
    }, {
      style: 'tableExample',
      table: {
        body: table,
        widths: [150, 100, 100, 100]
      }
    }],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
        alignment: 'center'
      },
      tableExample: {
        margin: [20, 20, 100, 100],
        alignment: 'center'
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: 'black'
      }
    },
    defaultStyle: {
      alignment: 'justify'
    }
  };

  var filePath = _path.default.join(_routes.staticFolderPath, _routes.uploadPath, '/temp', 'Reporte Juegos SWITCH.pdf');

  return createPDF(docDefinition, filePath);
};

exports.pdfSwicth = pdfSwicth;