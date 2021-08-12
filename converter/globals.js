const path = require("path");

const config = {
    project_root: __dirname.split(path.sep).slice(0, -1).join(path.sep),
    root: "/public/",
    source: "source"
};

function get_config() {
    return config;
}

module.exports = { get_config, config }