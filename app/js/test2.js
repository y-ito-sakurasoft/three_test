window.addEventListener('load', init);
window.addEventListener('resize', onResize);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

var renderer;
var scene;
var camera;
var dirLight;

var clock = new THREE.Clock();

var keys = {
    w: false,
    a: false,
    s: false,
    d: false,
}

function init() {

    // サイズ
    const width = window.innerWidth;
    const height = window.innerHeight;

    const canvas = document.querySelector('#myCanvas');

    // レンダラー
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // シーン
    scene = new THREE.Scene();

    // カメラ
    camera = new THREE.PerspectiveCamera(45, width / height);
    camera.position.set(0, 0, 3);
    camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
    camera.updateProjectionMatrix();

    // レイトレ用プレーン
    const geometry = new THREE.PlaneBufferGeometry( 2.0, 2.0 );
    var material = new THREE.RawShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            modValue: { value: 2.0 },
            resolution: { value: new THREE.Vector2( canvas.width, canvas.height ) },
            cameraWorldMatrix: { value: camera.matrixWorld },
            cameraProjectionMatrixInverse: { value: new THREE.Matrix4().getInverse( camera.projectionMatrix ) }
        },
        vertexShader: ReadAsText('shaders/none.vert.glsl'),
        fragmentShader: ReadAsText('shaders/raytrace.flag.glsl'),
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    // GUI
    var property = {
        modValue: 2.0,
    };
    var gui = new dat.GUI();

    gui.add(property, 'modValue', 0, 10.0).onChange(function(){
        material.uniforms.modValue.value = property.modValue;
    });

    //var ub = gui.addFolder('Unreal Bloom');
    //ub.add(unrealBloomPass, 'strength', 0, 3).listen();
    //ub.add(unrealBloomPass, 'radius', 0, 1).listen();
    //ub.add(unrealBloomPass, 'threshold', 0, 1).listen();
    //ub.open();

    tick();
    var time = 0.0;
    function tick() {
        var delta = clock.getDelta();
        time += delta;

        material.uniforms.cameraWorldMatrix.value.set(camera.matrixWorld);
        material.uniforms.time.value = time;
        camera.position.z -= delta * 0.2;

        if (keys.w) camera.position.y += delta;
        if (keys.a) camera.position.x -= delta;
        if (keys.s) camera.position.y -= delta;
        if (keys.d) camera.position.x += delta;

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
}

function onResize() {
    // サイズを取得
    const width = window.innerWidth;
    const height = window.innerHeight;

    // レンダラーのサイズを調整する
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // カメラのアスペクト比を正す
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function onMouseMove(e) {

}

function onKeyDown(e) {

    switch(e.key) {
        case 'w':
            keys.w = true;
            break;
        case 'a':
            keys.a = true;
            break;
        case 's':
            keys.s = true;
            break;
        case 'd':
            keys.d = true;
            break;
    }
}

function onKeyUp(e) {

    switch(e.key) {
        case 'w':
            keys.w = false;
            break;
        case 'a':
            keys.a = false;
            break;
        case 's':
            keys.s = false;
            break;
        case 'd':
            keys.d = false;
            break;
    }
}