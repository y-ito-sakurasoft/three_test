window.addEventListener('load', init);
window.addEventListener('resize', onResize);
window.addEventListener('mousemove', onMouseMove);


var renderer;
var scene;
var camera;
var composer;
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
    camera.position.set(0, 1, 3);

    // Composer
    composer = new THREE.EffectComposer(renderer);
    {
        var renderPass = new THREE.RenderPass(scene, camera);
        composer.addPass(renderPass);

        //var unrealBloomPass = new THREE.UnrealBloomPass(new THREE.Vector2( 256, 256 ), 1.5, 1.0, 0.3);
        //composer.addPass(unrealBloomPass);

        var ssaoPass = new THREE.SSAOPass(scene, camera, width, height);
        ssaoPass.output = THREE.SSAOPass.OUTPUT.Default;
        composer.addPass(ssaoPass);

        var effectBloom = new THREE.BloomPass(0.5, 25, 10.0, 512);
        composer.addPass(effectBloom);

        //var filmPass = new THREE.FilmPass(0.8, 0.325, 256, false);
        //composer.addPass(filmPass);

        //let tone = new THREE.AdaptiveToneMappingPass(true, 256);
        //composer.addPass(tone);

        //let smaa = new THREE.SMAAPass(width / 2, height / 2);
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
    scene.add(skybox);
    
    // ディレクショナルライト
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, -1);
    scene.add(directionalLight);

    // ambient light
    const ambLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambLight);

    // VRM model
    var loader = new THREE.VRMLoader();
    loader.load( 'models/VRM/AliciaSolid.vrm', function ( vrm ) {
        // VRMLoader doesn't support VRM Unlit extension yet so
        // converting all materials to MeshBasicMaterial here as workaround so far.
        vrm.scene.traverse(function (object) {
            if (object.material) {
                if (Array.isArray(object.material)) {
                    for (var i = 0, il = object.material.length; i < il; i++) {
                        var material = new THREE.MeshBasicMaterial();
                        THREE.Material.prototype.copy.call(material, object.material[i]);
                        material.color.copy(object.material[i].color);
                        material.map = object.material[i].map;
                        material.lights = false;
                        material.skinning = object.material[i].skinning;
                        material.morphTargets = object.material[i].morphTargets;
                        material.morphNormals = object.material[i].morphNormals;
                        object.material[i] = material;
                    }
                } else {
                    
                    var material = new THREE.MeshStandardMaterial();
                    material.color.copy(object.material.color);
                    material.map = object.material.map;
                    material.roughness = 0.9;
                    material.envMap = cubemap;
                    material.skinning = object.material.skinning;
                    material.morphTargets = object.material.morphTargets;
                    material.morphNormals = object.material.morphNormals;
                    object.material = material;
                }
            }
        });
        scene.add(vrm.scene);
    });

    // Orbit Controls
    const controls = new THREE.OrbitControls(camera);
    controls.target.set(0, 1, 0);

    // GUI
    var gui = new dat.GUI();

    var li = gui.addFolder('Directional Light Position');
    li.add(directionalLight.position, 'x', -1, 1).listen();
    li.add(directionalLight.position, 'y', -1, 1).listen();
    li.add(directionalLight.position, 'z', -1, 1).listen();

    var ssaoGui = gui.addFolder('SSAO');
    ssaoGui.add( ssaoPass, 'output', {
        'Default': THREE.SSAOPass.OUTPUT.Default,
        'SSAO Only': THREE.SSAOPass.OUTPUT.SSAO,
        'SSAO Only + Blur': THREE.SSAOPass.OUTPUT.Blur,
        'Beauty': THREE.SSAOPass.OUTPUT.Beauty,
        'Depth': THREE.SSAOPass.OUTPUT.Depth,
        'Normal': THREE.SSAOPass.OUTPUT.Normal
    } ).onChange( function ( value ) {
        ssaoPass.output = parseInt( value );
    } );
    ssaoGui.add( ssaoPass, 'kernelRadius' ).min( 0 ).max( 32 );
    ssaoGui.add( ssaoPass, 'minDistance' ).min( 0.0001 ).max( 0.02 );
    ssaoGui.add( ssaoPass, 'maxDistance' ).min( 0.001 ).max( 0.3 );

    //var ub = gui.addFolder('Unreal Bloom');
    //ub.add(unrealBloomPass, 'strength', 0, 3).listen();
    //ub.add(unrealBloomPass, 'radius', 0, 1).listen();
    //ub.add(unrealBloomPass, 'threshold', 0, 1).listen();
    //ub.open();

    tick();
    function tick() {
        var delta = clock.getDelta();

        controls.update();
        //mesh.rotation.y += delta * 0.2;

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
    composer.setSize(width, height);

    // カメラのアスペクト比を正す
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function onMouseMove(e) {

}