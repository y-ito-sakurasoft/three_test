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

function LoadVRMModelStandard(url, envMap, onload) {

    var loader = new THREE.VRMLoader();
    loader.load( url, function ( vrm ) {
        vrm.scene.traverse(function (object) {
            if (object.material) {
                if (Array.isArray(object.material)) {
                    for (var i = 0, il = object.material.length; i < il; i++) {
                        var material = new THREE.MeshStandardMaterial();
                        //THREE.Material.prototype.copy.call(material, object.material[i]);
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
                    //THREE.Material.prototype.copy.call(material, object.material);
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
        onload(vrm.scene);
    });
}

function LoadVRMModel(url, params, onload) {
    var loader = new THREE.VRMLoader();
    loader.load(url, function (vrm) {
        vrm.scene.traverse(function (object) {
            if (object.material) {
                if (Array.isArray(object.material)) {
                    for (var i = 0, il = object.material.length; i < il; i++) {
                        let material = new THREE.ShaderMaterial(params);
                        material.uniforms['diffuseMap'] = new THREE.Uniform(object.material[i].map);
                        material.uniforms['color'] = new THREE.Uniform(object.material[i].color);
                        material.skinning = object.material[i].skinning;
                        material.morphTargets = object.material[i].morphTargets;
                        material.morphNormals = object.material[i].morphNormals;
                        object.material[i] = material;
                    }
                } else {
                    let material = new THREE.ShaderMaterial(params).clone();
                    material.uniforms['diffuseMap'] = {type: 't', value: object.material.map};
                    material.uniforms['color'] = {type: 'c', value: object.material.color};
                    material.skinning = object.material.skinning;
                    material.morphTargets = object.material.morphTargets;
                    material.morphNormals = object.material.morphNormals;
                    object.material = material;
                }
            }
        });
        onload(vrm.scene);
    });
}