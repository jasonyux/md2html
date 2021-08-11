const globals = require("./globals")
const gen_post = require("./generate/gen_posts")

var args = process.argv.slice(2);
var root = args[0] == null ? "/public/" : args[0];

globals.config.root = root;
globals.config.source = "source";
gen_post.render_posts(globals.get_config().source);