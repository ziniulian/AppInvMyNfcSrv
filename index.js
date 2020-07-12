require("ztznz").star({
	db: {
		defTnam: "nfc",
		pvs: {_id: 2,sn: 0,tim: 0,},
		evt: {
			get: {
				funs: {
					find: ["<0>", "<1>"],
					toArray: []
				}
			},
			add: {
				funs: {
					append: ["<0>"]
				}
			},
			count: {
				funs: {
					count: ["<0>"]
				}
			},

			set: {
				funs: {
					uptodate: ["<0>", "<1>"]
				}
			},
			del: {
				funs: {
					delete: ["<0>"]
				}
			},
			drop: {
				funs: {
					drop: []
				}
			},
			vs: {
				tnam: "vs",
				funs: {
					append: ["<0>"]
				}
			}
		}
	},
	router: {
		use: {
			NFC: {
				push: {
					mathod: "POST",
					res: {
						catch: function (e) {
							return "参数错误";
						},
						theh: function (r, next) {
							next();
						}
					}
				},
				signIn: {
					res: {
						catch: function (e) {
							e.redirect("/hom/");
						},
						then: function (r, next) {
							var m = r.conf.mem[r.req.params.u];
							if (m && (m.pw === r.req.params.p)) {
								next();
							} else {
								r.res.redirect("/signIn/err/");
							}
						}
					}
				}
			},
			"*": {
				res: "404"
			}
		},
		port: 80
	},
	dot: {
		qry: {
			nfc: function (tmp) {
				return tmp.base({
					title: "数据查询",
					mark: {"sn":1, "tim":1, "stu":1, "nam":1, "en":1},
					map: {"sn":"序列号", "tim":"时间", "stu":"操作", "nam":"操作人"}
				});
			},
			base: function (tmp) {
				return tmp.base({
					title: "数据库",
					mark: {"id":1, "tim":1},
					map: {"id":"", "tim":"时间", "mode.qryDel":"", "mode.qryAdd":""}
				});
			},
			erp:  function (tmp) {
				return tmp.base({
					title: "ERP查询",
					mark: {"erp":1, "tim":1, "total":1},
					map: {"erp":"ERP单号", "tim":"时间", "total":"发货数量"}
				});
			},
			erpInfo:  function (tmp) {
				return tmp.base({
					title: "ERP单详情",
					mark: {"sn":1, "tim":1, "nam":1},
					map: {"sn":"序列号", "tim":"时间", "nam":"操作人"}
				});
			}
		},
		signIn: function (tmp) {
			return tmp.login({});
		},
		hom: function (tmp) {
			return tmp.linearLayout({
				orientation: "vertical",
				map: tmp.user.power
			});
		},
		out: function (tmp) {
			return tmp.outLayout({
				title: "出货",
				domVisibility: {
					uidDom: false,
					namDom:false
				}
			});
		},
		lend: function (tmp) {
			return tmp.outLayout({
				title: "领料",
				domVisibility: {
					enDom: false
				}
			});
		},
		rtn: function (tmp) {
			return tmp.outLayout({
				title: "归还",
				domVisibility: {
					enDom: false,
					uidDom: false,
					namDom:false
				}
			});
		}
	},
	def: {
		meta: function (tmp) {
			return "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0\" /><meta charset=\"utf-8\" /><link rel=\"stylesheet\" href=\"/base.css\">";
		},
		qrypro: function (tmp) {
			return "<input id=\"mtDom\" type=\"hidden\" name=\"mt\" value=\"{{=mt}}\"/><input id=\"tnDom\" type=\"hidden\" name=\"tn\" value=\"{{=tn}}\"/><input id=\"sizeDom\" type=\"hidden\" name=\"size\" value=\"{{=size}}\"/><input id=\"sortDom\" type=\"hidden\" name=\"sort\" value=\"{{=sort}}\"/><input id=\"kDom\" type=\"hidden\" name=\"k\" value='{{=k}}'/><input id=\"vDom\" type=\"hidden\" name=\"v\" value=\"{{=v}}\"/><input id=\"smDom\" type=\"hidden\" name=\"sm\" value=\"{{=sm}}\"/><input id=\"totalDom\" type=\"hidden\" name=\"total\" value=\"{{=total}}\"/><input id=\"condDom\" type=\"hidden\" name=\"cond\" value='{{=cond}}'/>";
		},
		qry_js: function (tmp) {
			return tmp.mode.qryFun.body();
		}
	}
}, {
	router: {
		use: {
			NFC: {
				otherTest: {
					res: {
						then: function (r, next) {
							r.res.send("Hello World!");
						}
					}
				},
				otherTestUsr: {
					res: {
						then: function (r, next) {
							r.res.json(r.usr);
						}
					}
				},
				otherTestDb: {
					res: {
						then: function (r, next, db) {
							db.get(r.req, r.res, next, {"conf":{"$exists":true}}, {"_id":0});
						}
					}
				}
			}
		}
	}
});
