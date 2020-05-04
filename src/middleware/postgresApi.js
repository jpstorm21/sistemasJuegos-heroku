"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _postgresConnection = _interopRequireDefault(require("./postgresConnection"));

var _routes = require("../routes/routes.json");

var _user = _interopRequireDefault(require("../models/user"));

var _pdfMake = require("./pdfMake");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var functionQueries = {};

functionQueries.pdfPs4 = function (req, res) {
  _postgresConnection.default.any("SELECT j.nombrejuego as nombre,c.nombrecategoria as categoria ,uj.estado,uj.instalado\n                  FROM juegos j INNER JOIN usuariojuego uj ON j.idjuego = uj.idjuego\n                  INNER JOIN plataformajuego pj ON j.idjuego = pj.idjuego\n                  INNER JOIN plataforma p ON p.idplataforma = pj.idplataforma\n                  INNER JOIN categoria c ON c.idcategoria = j.idcategoria\n                  WHERE uj.nombreusuario = $1 AND pj.idplataforma = $2", [req.user['user_id'], 1]).then(function (data) {
    (0, _pdfMake.pdfPs4)(data).then(function (output) {
      return res.status(200).download(output);
    }).catch(function (err) {
      return res.status(500).json({
        error: err,
        message: 'Error al generar el documento',
        datos: data
      });
    });
  }).catch(function (err) {
    res.status(400).json({
      error: err,
      message: 'Error al generar el documento.'
    });
  });
};

functionQueries.pdfSwitch = function (req, res) {
  _postgresConnection.default.any("SELECT j.nombrejuego as nombre,c.nombrecategoria as categoria ,uj.estado,uj.instalado\n                  FROM juegos j INNER JOIN usuariojuego uj ON j.idjuego = uj.idjuego\n                  INNER JOIN plataformajuego pj ON j.idjuego = pj.idjuego\n                  INNER JOIN plataforma p ON p.idplataforma = pj.idplataforma\n                  INNER JOIN categoria c ON c.idcategoria = j.idcategoria\n                  WHERE uj.nombreusuario = $1 AND pj.idplataforma = $2", [req.user['user_id'], 2]).then(function (data) {
    (0, _pdfMake.pdfSwicth)(data).then(function (output) {
      return res.status(200).download(output);
    }).catch(function (err) {
      return res.status(500).json({
        error: err,
        message: 'Error al generar el documento',
        datos: data
      });
    });
  }).catch(function (err) {
    res.status(400).json({
      error: err,
      message: 'Error al generar el documento.'
    });
  });
};

functionQueries.getAuthenticatedUserData = function (req, res) {
  var user = {
    id: req.user.id,
    userId: req.user['user_id'],
    campus: req.user['campus_id'],
    name: req.user.name,
    type: req.user['user_type_id']
  };
  var data = {
    type: user.type,
    pathname: req.body.pathname || ''
  };

  _postgresConnection.default.tx(function (t) {
    var queries = [];
    var query = 'SELECT COUNT(*)\
                FROM user_permission INNER JOIN system_page ON user_permission.system_page_id = system_page.id\
                WHERE user_permission.user_type_id = ${type} AND system_page.link = ${pathname}';
    queries.push(t.one(query, data));
    query = 'SELECT menu_group.text, CASE WHEN menu_group.menu_order IS NULL THEN 0 ELSE menu_group.menu_order END AS menu_order,\
              json_agg(json_build_object(\'text\', system_page.text, \'link\', system_page.link, \'icon\', system_page.icon) ORDER BY user_permission.menu_order) AS link\
            FROM user_permission\
              INNER JOIN system_page ON user_permission.system_page_id = system_page.id\
              LEFT JOIN menu_group ON user_permission.menu_group_id = menu_group.id\
            WHERE user_type_id = ${type} AND in_menu\
            GROUP BY menu_group.menu_order, menu_group.text\
            ORDER BY menu_order';
    queries.push(t.any(query, data));
    return t.batch(queries);
  }).then(function (result) {
    var menu = [];
    result[1].map(function (row) {
      if (!row.text) row.link.map(function (menuItem) {
        return menu.push(menuItem);
      });else menu.push(row);
    });
    var permission = [_routes.client.login, _routes.client.home, '*'].indexOf(data.pathname) != -1 || result[0].count > 0;
    res.status(permission ? 200 : 403).json({
      logged: true,
      hasPermission: permission,
      user: user,
      menu: menu
    });
  }).catch(function (err) {
    console.log(err);
    res.status(500).json({
      error: err,
      message: 'Error al obtener los datos del usuario.'
    });
  });
};
/**
 * 
 */


functionQueries.getUserById = function (req, res) {
  var query = 'SELECT user_id as rut, user_type_id as user_type, name, email, phone FROM public.user WHERE user_id = $1';

  _postgresConnection.default.oneOrNone(query, req.params.id).then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(400).json({
      error: err,
      message: 'Error al obtener los datos del usuario.'
    });
  });
};
/**
 * 
 */


functionQueries.getUserList = function (req, res) {
  var query = 'SELECT user_id AS rut, user_type_id AS user_type, name, email, phone FROM "user"';

  _postgresConnection.default.any(query).then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(500).json({
      error: err,
      message: 'Error al obtener la lista de usuarios.'
    });
  });
};
/**
 * 
 */


functionQueries.getUserTypeList = function (req, res) {
  _postgresConnection.default.any('SELECT * FROM user_type').then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(500).json({
      error: err,
      message: 'Error al obtener la lista de tipos de usuario.'
    });
  });
};

functionQueries.getGamaByUser = function (req, res) {
  _postgresConnection.default.any("SELECT j.nombrejuego,p.nombreplataforma,c.nombrecategoria,uj.estado,uj.instalado,j.idjuego\n                  FROM juegos j INNER JOIN usuariojuego uj ON j.idjuego = uj.idjuego\n                  INNER JOIN plataformajuego pj ON j.idjuego = pj.idjuego\n                  INNER JOIN plataforma p ON p.idplataforma = pj.idplataforma\n                  INNER JOIN categoria c ON c.idcategoria = j.idcategoria\n                  WHERE uj.nombreusuario = $1 AND pj.idplataforma = $2", [req.params.id, req.params.plataform]).then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(500).json({
      error: err,
      message: 'Error al obtener la lista de juegos ps4 del usuario.'
    });
  });
};

functionQueries.getCategoryList = function (req, res) {
  _postgresConnection.default.any("SELECT idcategoria,nombrecategoria FROM categoria").then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(500).json({
      error: err,
      message: 'Error al obtener la lista de categorias.'
    });
  });
};

functionQueries.getPlataformList = function (req, res) {
  _postgresConnection.default.any("SELECT idplataforma,nombreplataforma FROM plataforma").then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(500).json({
      error: err,
      message: 'Error al obtener la lista de categorias.'
    });
  });
};

functionQueries.sumaryGames = function (req, res) {
  var query = "SELECT x.ps4Terminados, y.ps4NoTerminados,z.switchTerminados,w.switchNoTerminados,k.cantjuegosPs4,m.cantjuegosSwitch,t.cantJuegos\n               FROM \t(SELECT count(*) as ps4Terminados\n                      FROM juegos j INNER JOIN usuariojuego uj ON j.idjuego = uj.idjuego\n                      INNER JOIN plataformajuego pj ON j.idjuego = pj.idjuego\n                      WHERE uj.nombreusuario = $1 AND pj.idplataforma = 1 AND uj.estado = true) x ,\n                      \n                      (SELECT count(*) as ps4NoTerminados\n                      FROM juegos j INNER JOIN usuariojuego uj ON j.idjuego = uj.idjuego\n                      INNER JOIN plataformajuego pj ON j.idjuego = pj.idjuego\n                      WHERE uj.nombreusuario = $1 AND pj.idplataforma = 1 AND uj.estado = false) y ,\n                      \n                      (SELECT count(*) as switchTerminados\n                      FROM juegos j INNER JOIN usuariojuego uj ON j.idjuego = uj.idjuego\n                      INNER JOIN plataformajuego pj ON j.idjuego = pj.idjuego\n                      WHERE uj.nombreusuario =  $1 AND pj.idplataforma = 2 AND uj.estado = true) z ,\n                      \n                      (SELECT COUNT(*) as cantJuegos\n                      FROM usuariojuego uj\n                      WHERE uj.nombreusuario = $1) t,\n                      \n                      (SELECT count(*) as switchNoTerminados\n                      FROM juegos j INNER JOIN usuariojuego uj ON j.idjuego = uj.idjuego\n                      INNER JOIN plataformajuego pj ON j.idjuego = pj.idjuego\n                      WHERE uj.nombreusuario =  $1 AND pj.idplataforma = 2 AND uj.estado = false) w ,\n                      \n                      (SELECT COUNT(*) as cantjuegosPs4\n                      FROM juegos j INNER JOIN usuariojuego uj ON j.idjuego = uj.idjuego\n                      INNER JOIN plataformajuego pj ON j.idjuego = pj.idjuego\n                      WHERE uj.nombreusuario = $1 AND pj.idplataforma = 1) k ,\n                      \n                      (SELECT COUNT(*) as cantjuegosSwitch\n                      FROM juegos j INNER JOIN usuariojuego uj ON j.idjuego = uj.idjuego\n                      INNER JOIN plataformajuego pj ON j.idjuego = pj.idjuego\n                      WHERE uj.nombreusuario = $1 AND pj.idplataforma = 2) m";

  _postgresConnection.default.one(query, req.params.id).then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(500).json({
      error: err,
      message: 'Error al obtener los reportes de los videojuegos.'
    });
  });
};

functionQueries.getInfoGame = function (req, res) {
  var id = req.params.id;
  var user = req.params.user;

  _postgresConnection.default.one("SELECT j.nombrejuego as name, p.idplataforma as plataform, uj.estado,c.idcategoria as categoria,uj.instalado\n                  FROM juegos j INNER JOIN usuariojuego uj ON j.idjuego = uj.idjuego\n                       INNER JOIN plataformajuego pj ON pj.idjuego = uj.idjuego\n                       INNER JOIN plataforma p ON p.idplataforma = pj.idplataforma\n                       INNER JOIN categoria c ON c.idcategoria = j.idcategoria\n                  WHERE uj.idjuego = $1 AND uj.nombreusuario = $2", [id, user]).then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(500).json({
      error: err,
      message: 'Error al obtener los datos del juego seleccionado.'
    });
  });
};

functionQueries.insertUser = function (req, res) {
  _user.default.register({
    user_id: req.body.rut,
    user_type_id: req.body.userType,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  }, req.body.password, function (err) {
    if (err) {
      var error = 'No se pudo procesar el formulario.';

      if (err.message.indexOf('User already exists') !== -1) {
        error = 'El usuario ingresado ya existe.';
      }

      return res.status(400).json({
        success: false,
        message: error,
        error: err.message
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'Usuario ingresado con correctamente.'
      });
    }
  });
};

functionQueries.insertGame = function (req, res) {
  var id;

  _postgresConnection.default.tx(function (t) {
    return t.sequence(function (order, data) {
      if (order == 0) {
        var queryData = {
          nombrejuego: req.body.name,
          idcategoria: req.body.categoria
        };
        var query = 'INSERT INTO juegos (${this~}) VALUES(${nombrejuego},${idcategoria}) RETURNING idjuego';
        return t.one(query, queryData);
      }

      if (order == 1) {
        id = data.idjuego;
        var _queryData = {
          idjuego: data.idjuego,
          estado: req.body.estado,
          nombreusuario: req.body.user,
          instalado: req.body.instalado
        };
        var _query = 'INSERT INTO usuariojuego (${this~}) VALUES(${idjuego},${estado},${nombreusuario},${instalado})';
        return t.none(_query, _queryData);
      }

      if (order == 2) {
        var _queryData2 = {
          idjuego: id,
          idplataforma: req.body.plataform
        };
        var _query2 = 'INSERT INTO plataformajuego(${this~}) VALUES (${idjuego},${idplataforma})';
        return t.none(_query2, _queryData2);
      }
    });
  }).then(function () {
    res.status(200).json({
      success: true,
      message: 'Juego ingresado correctamente.'
    });
  }).catch(function (err) {
    res.status(400).json({
      error: err,
      message: 'Error al ingresar el juego.'
    });
  });
};

functionQueries.updateGame = function (req, res) {
  _postgresConnection.default.tx(function (t) {
    return t.sequence(function (order, data) {
      if (order == 0) {
        var queryData = {
          nombrejuego: req.body.name,
          idcategoria: req.body.categoria,
          id: req.params.id
        };
        var query = 'UPDATE juegos SET nombrejuego = ${nombrejuego}, idcategoria = ${idcategoria} WHERE idjuego = ${id}';
        return t.none(query, queryData);
      }

      if (order == 1) {
        var _queryData3 = {
          idjuego: req.params.id,
          estado: req.body.estado,
          nombreusuario: req.body.user,
          instalado: req.body.instalado
        };
        var _query3 = 'UPDATE usuariojuego SET estado = ${estado}, instalado = ${instalado} WHERE idjuego = ${idjuego} AND nombreusuario = ${nombreusuario}';
        return t.none(_query3, _queryData3);
      }

      if (order == 2) {
        var _queryData4 = {
          idjuego: req.params.id,
          idplataforma: req.body.plataform
        };
        var _query4 = 'UPDATE plataformajuego SET idplataforma = ${idplataforma} WHERE idjuego = ${idjuego}';
        return t.none(_query4, _queryData4);
      }
    });
  }).then(function () {
    res.status(200).json({
      success: true,
      message: 'Juego actualizado correctamente.'
    });
  }).catch(function (err) {
    res.status(400).json({
      error: err,
      message: 'Error al actualizar el juego.'
    });
  });
};

functionQueries.updateUser = function (req, res) {
  _postgresConnection.default.tx(function (t) {
    var queryData = {
      user_id: req.params.id,
      name: req.body.name,
      user_type_id: req.body.userType,
      email: req.body.email,
      phone: req.body.phone
    };
    var query = 'UPDATE "user"\
                SET user_type_id = ${user_type_id}, name = ${name}, email = ${email}, phone = ${phone}\
                WHERE user_id = ${user_id}';
    return t.none(query, queryData);
  }).then(function (data) {
    res.status(200).json({
      data: data
    });
  }).catch(function (err) {
    res.status(400).json({
      error: err,
      message: 'Error al actualizar los datos del usuario.'
    });
  });
};

functionQueries.deleteGame = function (req, res) {
  _postgresConnection.default.tx(function (t) {
    return t.sequence(function (order, data) {
      if (order == 0) {
        var queryData = {
          idjuego: req.params.id
        };
        var query = 'DELETE FROM plataformajuego WHERE idjuego = ${idjuego}';
        return t.none(query, queryData);
      }

      if (order == 1) {
        var _queryData5 = {
          idjuego: req.params.id,
          nombreusuario: req.params.user
        };
        var _query5 = 'DELETE FROM usuariojuego WHERE idjuego = ${idjuego} AND nombreusuario = ${nombreusuario}';
        return t.none(_query5, _queryData5);
      }

      if (order == 2) {
        var _queryData6 = {
          id: req.params.id
        };
        var _query6 = 'DELETE FROM juegos WHERE idjuego = ${id}';
        return t.none(_query6, _queryData6);
      }
    });
  }).then(function () {
    res.status(200).json({
      success: true,
      message: 'Juego eliminado correctamente.'
    });
  }).catch(function (err) {
    res.status(400).json({
      error: err,
      message: 'Error al eliminar el juego.'
    });
  });
};

var _default = functionQueries;
exports.default = _default;