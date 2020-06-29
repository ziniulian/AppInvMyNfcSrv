LZR.load([
	"LZR.Node.Router.QryTmp",
	"LZR.Node.Router.ComTmp"
]);
var r = new LZR.Node.Router ({path: require.resolve("./index.js").replace("index.js", "")});
var tools = {
	utJson: LZR.getSingleton(LZR.Base.Json),
	utTim: LZR.getSingleton(LZR.Base.Time),
	clsR: LZR.Node.Srv.Result,
	conf: {},
	qryRo: new LZR.Node.Router.QryTmp({
		ro: r,
		conf: ("mongodb://192.169.0.150:27017/invTest"),
		defTnam: "nfc",
		pvs: {_id: 2,sn: 0,tim: 0,}
	}),
	tmpRo: new LZR.Node.Router.ComTmp({ro: r})
};
r.ro.use(require("cookie-session")({
	name: "ziniulian.tk",
	keys: ["lzr'sJob:inv"],
	maxAge: 3600000
}));
r.post("/push/", function (req, res, next) {
	try {var o = undefined;
	try {
		o = tools.utJson.toObj(req.body.o);
		if (o) {
			tools.qryRo.db.add(req, res, next, null, o);
		} else {
			res.json(tools.clsR.get(null, "参数错误"));
		}
	}  catch (e) {
		res.json(tools.clsR.get(null, "参数错误"));
	}} catch (e) {next();}
});
r.get("/conf/", function (req, res, next) {
	try {tools.qryRo.db.get(req, res, next, {"conf":{"$exists":true}}, {"_id":0}, true);} catch (e) {next();}
});
r.get("/conf/", function (req, res, next) {
	try {var r = LZR.fillPro(req, "qpobj.comDbSrvReturn");
	tools.conf = tools.utJson.toObj(r[0].conf);
	res.json(tools.clsR.get(tools.conf));} catch (e) {next();}
});
r.get("/qry_nfc/", function (req, res, next) {
	try {if (req.session.usr) {
		var o = LZR.fillPro(req, "qpobj.tmpo.qry");
		o.k = "tim";
		o.cond = "{\"sn\":{\"$exists\":true}}";
		o.sort = -1;
		o.size = 20;
		next();
	} else {
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {next();}
});
r.get("/qry_erp/", function (req, res, next) {
	try {if (req.session.usr) {
		for (var i = 0; i < req.session.usr.cls.length; i ++) {
			if (req.session.usr.cls[i] === 4) {
				LZR.fillPro(req, "qpobj.tmpo").usr = req.session.usr;
				var o = LZR.fillPro(req, "qpobj.tmpo.qry");
				o.k = "tim";
				o.cond = "{\"erp\":{\"$exists\":true}}";
				o.sort = -1;
				o.size = 20;
				next();
				return;
			}
		}
		res.redirect(req.baseUrl + "/hom/");
	} else {
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {next();}
});
r.get("/qry_erpInfo/", function (req, res, next) {
	try { var en = req.query.en;
	if (en && req.session.usr) {
		for (var i = 0; i < req.session.usr.cls.length; i ++) {
			if (req.session.usr.cls[i] === 4) {
				var o = LZR.fillPro(req, "qpobj.tmpo");
				o.usr = req.session.usr;
				o.en = en;
				o = LZR.fillPro(req, "qpobj.tmpo.qry");
				o.k = "tim";
				o.cond = "{\"en\":\"" + en + "\"}";
				o.sort = -1;
				o.size = 20;
				next();
				return;
			}
		}
		res.redirect(req.baseUrl + "/hom/");
	} else {
		res.redirect(req.baseUrl + "/hom/");
	}} catch (e) {next();}
});
r.get("/signIn/:u?/:p?/", function (req, res, next) {
	try {if (req.session.usr) {
		res.redirect(req.baseUrl + "/hom/");
	} else if (req.params.u && req.params.p) {
		if (tools.conf) {
			var m = tools.conf.mem[req.params.u];
			if (m && (m.pw === req.params.p)) {
				req.session.usr = {
					uid: req.params.u,
					nam: m.nam,
					cls: m.cls
				};
				res.redirect(req.baseUrl + "/hom/");
			} else {
				res.redirect(req.baseUrl + "/signIn/err/");
			}
		} else {
			res.redirect(req.baseUrl + "/signIn/err/");
		}
	} else if (req.params.u === "err") {
		LZR.fillPro(req, "qpobj.tmpo").err = true;
		next();
	} else {
		next();
	}} catch (e) {next();}
});
r.get("/signOut/", function (req, res, next) {
	try { delete req.session.usr;
	res.redirect(req.baseUrl + "/signIn/");} catch (e) {next();}
});
r.get("/hom/", function (req, res, next) {
	try { if (req.session.usr) {
		LZR.fillPro(req, "qpobj.tmpo").usr = req.session.usr;
		next();
	} else {
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {next();}
});
r.get(/^\/((out)|(lend)|(rtn))\/$/, function (req, res, next) {
	try {if (req.session.usr) {
		for (var i = 0; i < req.session.usr.cls.length; i ++) {
			if (req.session.usr.cls[i] === 4) {
				LZR.fillPro(req, "qpobj.tmpo").usr = req.session.usr;
				next();
				return;
			}
		}
		res.redirect(req.baseUrl + "/hom/");
	} else {
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {next();}
});
r.get("/qry_base/", function (req, res, next) {
	try {if (req.session.usr) {
		for (var i = 0; i < req.session.usr.cls.length; i ++) {
			if (req.session.usr.cls[i] === 2) {
				next();
				return;
			}
		}
		res.redirect(req.baseUrl + "/hom/");
	} else {
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {next();}
});
r.get("/tim/", function (req, res, next) {
	try {res.json(tools.clsR.get(tools.utTim.getDayTimestamp()));} catch (e) {next();}
});
r.get("/test/", function (req, res, next) {
	try {tools.qryRo.db.count(req, res, next, {});} catch (e) {next();}
});
tools.qryRo.init("/");
tools.tmpRo.initTmp("/", "tmp", {
	utJson: tools.utJson,
	utTim: tools.utTim
});
r.get("*", function (req, res, next) {
	res.redirect(req.baseUrl + "/hom/");
});
module.exports = r;
