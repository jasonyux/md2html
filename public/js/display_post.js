let right_containers = document.getElementsByClassName("right");
let wrapper = document.getElementById("wrapper");
let present = document.getElementById("present");
let timeline = document.getElementById("timeline");
let containers = document.getElementsByClassName("container");
let styleElem = document.head.appendChild(document.createElement("style"));

function change_alignments() {
    let cache = [];
    for (let container of right_containers) {
        container.className = "container left";
        cache.push(container);
    }
    right_containers = cache;
    return;
}

function restore_aligments() {
    for (let container of right_containers) {
        container.className = "container right";
    }
    return;
}

function __display_present() {
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "row";
    present.style.width = "180%";
    timeline.style.width = "100%";
}

function __hide_present() {
    wrapper.style.display = null;
    wrapper.style.flexDirection = null;
    present.style.width = "0%";
    timeline.style.width = null;

}

function adjust_timline() {
    // necessary since we cannot select pseudo elements
    styleElem.innerHTML = `
        .timeline::after {
            right: 10%;
            left: auto;
        }
        .container {
            width: 90%;
        }
		.container::after {
			right: -14px;
		}
        `
}

function restore_timeline() {
    styleElem.innerHTML = null;
}

function show_present() {
    console.log("clicked")
    change_alignments();
    __display_present();
    adjust_timline();
}

function hide_present() {
    restore_aligments();
    __hide_present();
    restore_timeline();
}