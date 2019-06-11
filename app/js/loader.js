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

function LoadModelStandard(url, envMap) {

    var loader = new THREE.VRMLoader();
    loader.load( url, function ( vrm ) {
        vrm.scene.traverse(function (object) {
            if (object.material) {
                if (Array.isArray(object.material)) {
                    for (var i = 0, il = object.material.length; i < il; i++) {
                        var material = new THREE.MeshStandardMaterial();
                        THREE.Material.prototype.copy.call(material, object.material[i]);
                        material.color.copy(object.material[i].color);
                        material.map = object.material[i].map;
                        material.roughness = 0.9;
                        material.envMap = envMap;
                        material.skinning = object.material[i].skinning;
                        material.morphTargets = object.material[i].morphTargets;
                        material.morphNormals = object.material[i].morphNormals;
                        object.material[i] = material;
                    }
                } else {
                    var material = new THREE.MeshStandardMaterial();
                    THREE.Material.prototype.copy.call(material, object.material);
                    material.color.copy(object.material.color);
                    material.map = object.material.map;
                    material.roughness = 0.9;
                    material.envMap = envMap;
                    material.skinning = object.material.skinning;
                    material.morphTargets = object.material.morphTargets;
                    material.morphNormals = object.material.morphNormals;
                    object.material = material;
                }
            }
        });
        return vrm.scene;
    });
}