const fs = require("fs");
const fse = require("fs-extra");
const path = require('path');
const marked = require('marked');
const hljs = require('highlight.js');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const globals = require("../globals");

module.exports = { render_posts, print_root }

var root = globals.get_config().root;

// Set options
// `highlight` example uses https://highlightjs.org
// for themes, check out https://highlightjs.org/static/demo/
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    langPrefix: 'hljs language-',
    xhtml: false
});

function get_dom() {
    const dom = new JSDOM(`
    <html>
        <head>
        </head>
        <body>
        </body>
    </html>
    `);
    return dom;
}

function __add_css(document) {
    let head = document.querySelector("head");
    let links = [`${root}css/style.css`, `${root}css/atom-one-dark.css`];
    for (let link of links) {
        let link_element = document.createElement('link');
        link_element.href = link;
        link_element.rel = 'stylesheet';
        head.appendChild(link_element);
    }
}

function __add_wrapper_div(body_content, document) {
    let body = document.querySelector("body");
    let wrapper_div = document.createElement("div");
    wrapper_div.id = "write";
    wrapper_div.innerHTML = body_content;
    // add element to body
    body.appendChild(wrapper_div);
}

function __add_post_info(config, document) {
    if (config == null) {
        return;
    }
    let wrapper_div = document.getElementById("write");
    let title_element = document.createElement("h1");
    let date_element = document.createElement("p");
    let hr_element = document.createElement("hr");
    title_element.innerHTML = config.title;
    date_element.innerHTML = `Created Date: ${config.date}`
    date_element.style["color"] = "grey";
    // insert in the reverse order
    wrapper_div.insertBefore(hr_element, wrapper_div.firstChild);
    wrapper_div.insertBefore(date_element, wrapper_div.firstChild);
    wrapper_div.insertBefore(title_element, wrapper_div.firstChild);
}

function __wrap_post(body_content, config, dom) {
    const document = dom.window.document;
    __add_css(document);
    __add_wrapper_div(body_content, document);
    __add_post_info(config, document);
}

function __form_json_from_array(strings) {
    let json_raw = []
    for (let string of strings) {
        let kv = string.split(": ")
        let entry = [];
        for (let v of kv) {
            v = v.trim();
            if (!v) {
                entry = []
                break
            }
            entry.push(v);
        }
        if (entry.length == 0)
            continue
        entry = '"' + entry[0] + '"' + ":" + '"' + entry[1] + '"';
        json_raw.push(entry);
    }
    json_raw = json_raw.join(",");
    json_raw = "{" + json_raw + "}";
    return JSON.parse(json_raw);
}

function parse_config(raw_md) {
    const re = /---\n([^]+)---\n+/;
    raw_md = raw_md.replace(/\r\n/g, "\n");
    if (raw_md.match(re) == null) {
        return null;
    }
    let found = raw_md.match(re)[1];
    return __form_json_from_array(found.split("\n"));
}

function remove_config(raw_md) {
    const re = /(---\n[^]+---\n+)/;
    raw_md = raw_md.replace(/\r\n/g, "\n");
    return raw_md.replace(re, "");
}

function render_single_post(file_path, file) {
    const buffer = fs.readFileSync(file_path);
    let fileContent = buffer.toString();
    const config = parse_config(fileContent);
    fileContent = remove_config(fileContent);
    const html = marked(fileContent);

    const dom = get_dom();
    __wrap_post(html, config, dom);

    try {
        const data = fs.writeFileSync(
            `public/pages/${file.slice(0, -3)}.html`,
            dom.window.document.documentElement.outerHTML
        );
    } catch (err) {
        console.error(err)
    }
}

function render_posts(directory) {
    __config();
    let files = fs.readdirSync(directory);
    for (let file of files) {
        if (file.endsWith(".md")) {
            render_single_post(path.join(directory, file), file);
            fse.copySync(
                path.join(directory, `${file.slice(0, -3)}`),
                path.join("public/pages", `${file.slice(0, -3)}`), { overwrite: true }
            );
        }
    }
}

function print_root() {
    console.log(`[INFO] root configure to be: ${root}`);
}

function __config() {
    root = globals.get_config().root;
    print_root();
}