window.addEventListener('load', init);
window.addEventListener('resize', onResize);
window.addEventListener('mousemove', onMouseMove);


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
    renderer.autoClear = false;

    // シーン
    scene = new THREE.Scene();

    // カメラ
    camera = new THREE.PerspectiveCamera(45, width / height);
    camera.position.set(0, 0, 4);

    // Composer
    let composer = new THREE.EffectComposer(renderer);
    {
        var renderPass = new THREE.RenderPass(scene, camera);
        composer.addPass(renderPass);

        var unrealBloomPass = new THREE.UnrealBloomPass(new THREE.Vector2( 256, 256 ), 1.5, 1.0, 0.3);
        composer.addPass(unrealBloomPass);
    
        //let effectBloom = new THREE.BloomPass(0.6, 25, 10.0, 512);
        //composer.addPass(effectBloom);

        //var filmPass = new THREE.FilmPass(0.8, 0.325, 256, false);
        //composer.addPass(filmPass);

        //let tone = new THREE.AdaptiveToneMappingPass(true, 256);
        //composer.addPass(tone);

        //let smaa = new THREE.SMAAPass(width, height);
        //composer.addPass(smaa);
    
        var toScreenPass = new THREE.ShaderPass(THREE.CopyShader);
        toScreenPass.renderToScreen = true;
        composer.addPass(toScreenPass);
    }

    // cubemap
    let cubemap = LoadCubemap('textures/cubemaps/test1', '.png');
    let shader = THREE.ShaderLib['cube'];
    shader.uniforms['tCube'].value = cubemap;
    let cubemat = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });
    let skybox = new THREE.Mesh(new THREE.BoxGeometry(200, 200, 200), cubemat);
    //scene.add(skybox);

    // 箱
    const geometry = new THREE.TorusGeometry(1, 0.4, 24, 64);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffaaaa,
        roughness: 0.2,
        map: new THREE.TextureLoader().load("textures/sample1.jpg"),
        //normalMap: new THREE.TextureLoader().load("textures/sample1_normal.png"),
        envMap: cubemap,
        metalness: 1,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // ディレクショナルライト
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // ambient light
    const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambLight);

    // Controls
    //var controls = new THREE.FlyControls(camera, canvas);
    //controls.autoForward = false;
    //controls.dragToLook = true;
    //controls.rollSpeed = Math.PI / 12;
    //controls.movementSpeed = 0.5;

    // Orbit Controls
    const controls = new THREE.OrbitControls(camera);
    controls.target.set(0, 0, 0);

    // GUI
    var gui = new dat.GUI();

    var ub = gui.addFolder('Unreal Bloom');
    ub.add(unrealBloomPass, 'strength', 0, 3).listen();
    ub.add(unrealBloomPass, 'radius', 0, 1).listen();
    ub.add(unrealBloomPass, 'threshold', 0, 1).listen();
    ub.open();

    tick();
    function tick() {
        var delta = clock.getDelta();

        controls.update();
        mesh.rotation.y += delta * 0.2;

        //renderer.render(scene, camera);
        renderer.clear();
        composer.render();
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