import * as THREE from "https://unpkg.com/three@0.155.0/build/three.module.js";
import {Sky} from "https://unpkg.com/three@0.155.0/examples/jsm/objects/Sky.js";
import {Water} from "https://unpkg.com/three@0.155.0/examples/jsm/objects/Water.js";
import {GLTFLoader} from "https://unpkg.com/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";
import {PointerLockControls} from "https://unpkg.com/three@0.155.0/examples/jsm/controls/PointerLockControls.js";

console.log("Scripts.js ok");
document.body.style.cssText = 'overflow: hidden; margin: 0; padding: 0';

const GLTF = new GLTFLoader();

let dimensoesTela = {largura: null, altura: null}
let cena, camera, renderizador
let ceu, sol, agua, planoAgua;
let phoenix, esqueleto;

function init(){
    cena = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
    camera.position.set(0, 10, 0)

    renderizador = new THREE.WebGLRenderer();
    renderizador.shadowMap.enabled = true;
    renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderizador.domElement);

    updateProporcao();

    initSky();
    initWater();
    initModelos();
}init();

function initSky(){
    sol = new THREE.Vector3();
    ceu = new Sky();
    ceu.scale.setScalar(10000);
    cena.add(ceu);

    const ceuPropriedades = ceu.material.uniforms;
    ceuPropriedades.turbidity.value = 10;
    ceuPropriedades.rayleigh.value = 1;
    ceuPropriedades.mieCoefficient.value = 0.005;
    ceuPropriedades.mieDirectionalG.value = 0.9999;

    function updateSol(a, b) {
        const geradorReflexao = new THREE.PMREMGenerator(renderizador);
        const phi = THREE.MathUtils.degToRad(a);
        const theta = THREE.MathUtils.degToRad(b);

        sol.setFromSphericalCoords(1, phi, theta);
        ceu.material.uniforms.sunPosition.value.copy(sol);
        cena.environment = geradorReflexao.fromScene(ceu).texture;

    }
    function updateLuz(){
        const luz = new THREE.DirectionalLight(0xffffff, 1.5);
        luz.position.copy(sol);

        luz.castShadow = true;
        luz.shadow.mapSize.width = 1024;
        luz.shadow.mapSize.height = 1024;

        let configLuz = luz.shadow.camera;

        configLuz.near = 1;
        configLuz.far = 1000;
        configLuz.left = -500;
        configLuz.right = 500;
        configLuz.top = 500;
        configLuz.bottom = -500

        cena.add(luz);
    }

    updateSol(89, 180);
    updateLuz();
}

function initWater(){
    planoAgua = new THREE.PlaneGeometry(4000, 4000);
    agua = new Water(planoAgua, {
            textureWidth: 512,
            textureHeight: 512,
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: camera.position.y,

            waterNormals: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg',
                function (textura) {textura.wrapS = textura.wrapT = THREE.RepeatWrapping;}
            )
        }
    );

    agua.rotation.x =  THREE.MathUtils.degToRad(-90);
    cena.add(agua);
}

function initModelos(){

    GLTF.load("resources/Models/Phoenix/scene.gltf", gltf => {
        const escala = 0.001;
        phoenix = gltf.scene;
        phoenix.scale.set(escala, escala, escala);
        phoenix.position.set(0,-.5,-1.5);
        sombrearModelo(phoenix);

        esqueleto = new THREE.SkeletonHelper(phoenix);
        phoenix.add(esqueleto);

        camera.add(phoenix);
    });

}

/**
 * Atualiza a proporção da tela.
 */
function updateProporcao(){
    dimensoesTela.larguraTela = window.innerWidth;
    dimensoesTela.alturaTela = window.innerHeight;

    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", updateProporcao);

/**
 * Atualiza a reflexão da água e anima a mesma.
 */
function updateDistorcao(){
    agua.material.uniforms.time.value += 1/80;
    agua.material.uniforms.distortionScale.value = camera.position.y;
    agua.material.uniformsNeedUpdate = true;
}

const controle = new PointerLockControls(camera, renderizador.domElement);
cena.add(controle.getObject());

let teclasPressionadas = new Set();
document.body.addEventListener('click', () => controle.lock());
document.addEventListener('keydown', event=> teclasPressionadas.add(event.code));
document.addEventListener('keyup', event=> teclasPressionadas.delete(event.code));
document.addEventListener('keyup', event => {
    if(event.code === "ShiftLeft") velocidade = 0.15;
    if(event.code === "KeyQ") gravidade.resetarGravidade();
});

/**
 * Movimenta a camera nos eixos XYZ e anima o obj Phoenix.
 */
function movimentacao(){
    teclasPressionadas.forEach(tecla => identificadorTeclas[tecla]?.());

    posicoes.posicaoCamera();
    posicoes.posicaoPhoenix();

    estabilizadores.estabilizarPhoenix();
}

let controles = {

    verificadorMax: (ValAtual, ValMax) => ValAtual+1 <= ValMax,

    verificadorMin: (ValAtual, ValMin) => ValAtual-1 >= ValMin,

    phoenix: {
        x: -10,
        minX: -80,
        maxX: 30,

        y: 90,
        minY: 45,
        maxY: 135,

        z: 0,
        minZ: -10,
        maxZ: 10
    },

    camera: {
        y: 0,
        minY: 0.6,
        maxY: 100,
    }

}

let velocidade = 0.15;

let gravidade = {
    velocidade: 1,
    velocidadeMax: 10,

    resetarGravidade(){
        this.velocidade = 1;
    },
    incrementarVelocidade(){
        if(this.velocidade+1 <= this.velocidadeMax) this.velocidade += 0.01;
    },
    movimentarCamera(direcao){
        camera.position.y += direcao * this.velocidade;
    }
}

let identificadorTeclas = {

    KeyW(){
        controle.moveForward(velocidade);
    },
    KeyS(){
        controle.moveForward(-velocidade);
    },
    KeyA(){
        controle.moveRight(-velocidade);
        controles.camera.y++

        if(controles.verificadorMax(controles.phoenix.y, controles.phoenix.maxY)) controles.phoenix.y++
    },
    KeyD(){
        controle.moveRight(velocidade);
        controles.camera.y--

        if(controles.verificadorMin(controles.phoenix.y, controles.phoenix.minY)) controles.phoenix.y--
    },
    ShiftLeft(){
        velocidade = 0.25;
    },
    KeyE(){
        if(camera.position.y < controles.camera.maxY){
            gravidade.movimentarCamera(+0.05);

            if(controles.verificadorMax(controles.phoenix.x, controles.phoenix.maxX)) controles.phoenix.x++
        }

    },
    KeyQ(){
        if(camera.position.y >= controles.camera.minY){
            camera.position.y > 2 ? gravidade.incrementarVelocidade() : gravidade.resetarGravidade();
            gravidade.movimentarCamera(-0.05);

            if(controles.verificadorMin(controles.phoenix.x, controles.phoenix.minX)) controles.phoenix.x--
        }
    }

}

let posicoes = {

    posicaoCamera(){
        camera.rotation.y = THREE.MathUtils.degToRad(controles.camera.y);
    },

    posicaoPhoenix(){
        phoenix?.rotation.set(
            THREE.MathUtils.degToRad(controles.phoenix.x),
            THREE.MathUtils.degToRad(controles.phoenix.y),
            THREE.MathUtils.degToRad(controles.phoenix.z)
        );
    }

}

let estabilizadores = {

    estabilizar: (pontoMedio, atributo) => atributo > pontoMedio ? -1 : 1,

    isntEstavel: (obj, pontEquilibrio) => obj !== pontEquilibrio,

    isTeclaPressionada: (teclas) => !teclas.some(tecla => Array.from(teclasPressionadas).includes(tecla)),

    estabilizarPhoenix(){
        if(this.isntEstavel(controles.phoenix.x, -10)){
            if(camera.position.y < controles.camera.minY || this.isTeclaPressionada(['KeyE', 'KeyQ'])) {
                controles.phoenix.x += this.estabilizar(-10, controles.phoenix.x);
            }
        }

        if(this.isntEstavel(controles.phoenix.y, 90) && this.isTeclaPressionada(['KeyA', 'KeyD'])){
            controles.phoenix.y += this.estabilizar(90, controles.phoenix.y);
        }
    }

}

function sombrearModelo(obj){
    obj.traverse(child => {
        if(child.isMesh) child.receiveShadow = child.castShadow = true;
    });
}

function animate(){
    renderizador.render(cena, camera);
    movimentacao();
    updateDistorcao();
    requestAnimationFrame(animate);
}
animate();