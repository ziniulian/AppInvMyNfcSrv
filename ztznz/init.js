require("lzr");
LZR.load([
	"LZR.Node.Router.QryTmp",
	"LZR.Node.Router.ComTmp"
]);
var Srv = function () {};
Srv.star = function (o, p) {
	try {
		var port = 888;
		if (o && o.router && o.router.port) {
			port = o.router.port;
		}
		var srv = new LZR.Node.Srv ({
			ip: "0.0.0.0",
			port: port
		});
		LZR.Tmpt = [p, o];
		srv.ro.setStaticDir("/myLib/", LZR.curPath);
		srv.use("/NFC/", require("./test"));
		srv.ro.setStaticDir("/", "./web");
		srv.use("*", function (req, res) {
			res.status(404).send("404");
		});
		srv.so.use(function (err, req, res, next) {
			res.status(500).send("500");
		});
		srv.start();
		console.log("服务已运行 ...");
	} catch (e) {}
};
module.exports = Srv;
