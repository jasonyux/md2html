const globals = require("./globals");
const gen_post = require("./generate/gen_posts");
const gen_index = require("./generate/gen_index");

var args = process.argv.slice(2);
var root = args[0] == null ? "/public/" : args[0];

globals.config.root = root;
globals.config.source = "source";

function render() {
    let data = gen_post.render_posts(globals.get_config().source);
    gen_index.render_index(data);
}

render();