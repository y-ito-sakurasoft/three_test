window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

var keys = {};

function onKeyDown(e) {
    keys[e.key] = true;
}

function onKeyUp(e) {
    keys[e.key] = false;
}
