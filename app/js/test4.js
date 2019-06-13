window.addEventListener('load', init);
window.addEventListener('resize', onResize);


var renderer;
var scene;
var camera;
var dirLight;

var clock = new THREE.Clock();

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
    renderer.debug.checkShaderErrors = true;

    // シーン
    scene = new THREE.Scene();

    // カメラ
    camera = new THREE.PerspectiveCamera(45, width / height);
    camera.position.set(0, 1, 3);

    // cubemap
    let cubemap = LoadCubemap('textures/cubemaps/test1', '.png');
    scene.add(CreateCubeMap(cubemap, 200));
    
    // ディレクショナルライト
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, -1);
    scene.add(directionalLight);

    // ambient light
    const ambLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambLight);

    // モデル
    LoadVRMModel('models/VRM/AliciaSolid.vrm', {
        vertexShader: ReadAsText('shaders/edge/edge.vert.glsl'),
        fragmentShader: ReadAsText('shaders/edge/edge.frag.glsl'),
        uniforms: {
            edgeWidth: {type: 'f', value: 0.004},
            edgeColor: {type: 'c', value: new THREE.Color(0x000000)},
            //envMap: new THREE.Uniform(cubemap),
        },
        depthWrite: false,
        side: THREE.BackSide,
    }, function(model) {
        scene.add(model);
    });

    LoadVRMModelStandard('models/VRM/AliciaSolid.vrm', cubemap, function(model) {
        scene.add(model);
    });

    // Orbit Controls
    const controls = new THREE.OrbitControls(camera);
    controls.target.set(0, 1, 0);

    // GUI
    // var gui = new dat.GUI();

    tick();
    function tick() {
        var delta = clock.getDelta();

        controls.update();

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

function CreateCubeMap(cubemap, size) {

    let shader = THREE.ShaderLib['cube'];
    shader.uniforms['tCube'].value = cubemap;
    let cubemat = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });
    let skybox = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), cubemat);
    return skybox;
}