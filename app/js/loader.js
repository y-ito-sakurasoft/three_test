function ReadAsText(url) {

    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);

    if (request.status === 200) {
        return request.responseText;
    }

    return '';
}

function LoadCubemap(url, ext) {

    const urls = [
        url + '/posx' + ext,
        url + '/negx' + ext,
        url + '/posy' + ext,
        url + '/negy' + ext,
        url + '/posz' + ext,
        url + '/negz' + ext,
    ];

    return new THREE.CubeTextureLoader().load(urls);
}