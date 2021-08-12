/* 
<div class="container left">
	<div class="content">
		<h2>2021</h2>
		<ul>
			<li>
				<a href="pages/SpringBoot-Projects.html">
					<p>Xuezhang EDU</p>
				</a>
			</li>
		</ul>
	</div>
</div>
*/
const fs = require("fs");
const path = require("path");
const globals = require("../globals");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = { render_index };

var project_root = "";
var document = new JSDOM("").window.document;

function __get_template(file_path) {
    const buffer = fs.readFileSync(file_path);
    let fileContent = buffer.toString();
    return new JSDOM(fileContent);
}

function get_template() {
    let dom = __get_template(path.join(project_root, "templates/home.html"));
    return dom.window.document;
}

function __group_sorted_by_year(sorted_data) {
    let ret = {};
    for (let data of sorted_data) {
        let year = data.date.getFullYear();
        if (!(year in ret)) {
            ret[year] = [];
        }
        ret[year].push(data);
    }
    return ret;
}

function __create_single_li(config) {
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.href = config.link;
    let p = document.createElement("p");
    p.innerHTML = config.title;
    let svg = document.createElement("svg");
    svg.innerHTML = `
    <path d="M18.109,17.776l-3.082-3.081c-0.059-0.059-0.135-0.077-0.211-0.087c1.373-1.38,2.221-3.28,2.221-5.379c0-4.212-3.414-7.626-7.625-7.626c-4.212,0-7.626,3.414-7.626,7.626s3.414,7.627,7.626,7.627c1.918,0,3.665-0.713,5.004-1.882c0.006,0.085,0.033,0.17,0.098,0.234l3.082,3.081c0.143,0.142,0.371,0.142,0.514,0C18.25,18.148,18.25,17.918,18.109,17.776zM9.412,16.13c-3.811,0-6.9-3.089-6.9-6.9c0-3.81,3.089-6.899,6.9-6.899c3.811,0,6.901,3.09,6.901,6.899C16.312,13.041,13.223,16.13,9.412,16.13z"></path>
    `
    svg.setAttribute("height", "20");
    svg.setAttribute("width", "20");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("fill", "white");
    p.appendChild(svg);
    a.appendChild(p);
    li.appendChild(a);
    return li;
}

function __add_left(year, data_list, parent) {
    let left_container = document.createElement("div");
    left_container.className = "container left";
    parent.appendChild(left_container);
    let content = document.createElement("div");
    content.className = "content";
    left_container.appendChild(content);
    // create header
    let header = document.createElement("h2");
    header.innerHTML = year;
    content.appendChild(header);
    // create list
    let ul = document.createElement("ul");
    for (let data of data_list) {
        let li = __create_single_li(data);
        ul.appendChild(li);
    }
    content.appendChild(ul);
}

function __add_right(year, data_list, parent) {
    let right_container = document.createElement("div");
    right_container.className = "container right";
    parent.appendChild(right_container);
    let content = document.createElement("div");
    content.className = "content";
    right_container.appendChild(content);
    // create header
    let header = document.createElement("h2");
    header.innerHTML = year;
    content.appendChild(header);
    // create list
    let ul = document.createElement("ul");
    for (let data of data_list) {
        let li = __create_single_li(data);
        ul.appendChild(li);
    }
    content.appendChild(ul);
}

function add_all(grouped_data) {
    let sorted_keys = []
    for (const key in grouped_data) {
        sorted_keys.push(key);

    }
    sorted_keys.sort().reverse();
    // start with the html element
    let parent = document.getElementById("timeline");
    let add_left = true; // start with left
    for (let key of sorted_keys) {
        if (add_left) {
            __add_left(key, grouped_data[key], parent);
            add_left = false;
        } else {
            __add_right(key, grouped_data[key], parent);
            add_left = true;
        }
    }
}

function render_index(data_list) {
    __config();
    let sorted_data = [];
    for (let data of data_list) {
        const [config, title, link] = data;
        config["date"] = new Date(config["date"]);
        config["title"] = title;
        config["link"] = link;
        sorted_data.push(config);
    }
    // prepare data
    sorted_data.sort(function(a, b) {
        return a.date - b.date;
    }).reverse();
    let grouped_data = __group_sorted_by_year(sorted_data);
    add_all(grouped_data);
    try {
        const data = fs.writeFileSync(
            path.join(project_root, "public/index.html"),
            document.documentElement.outerHTML
        );
    } catch (err) {
        console.error(err);
    }
    // console.log(document.documentElement.outerHTML);
}

function __config() {
    document = get_template();
    project_root = globals.get_config().project_root;
}