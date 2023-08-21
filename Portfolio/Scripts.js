import * as THREE from "https://unpkg.com/three@0.155.0/build/three.module.js";
import {Sky} from "https://unpkg.com/three@0.155.0/examples/jsm/objects/Sky.js";
import {GLTFLoader} from "https://unpkg.com/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";
import {PointerLockControls} from "https://unpkg.com/three@0.155.0/examples/jsm/controls/PointerLockControls.js";

console.log("Scripts.js ok");
document.body.style.cssText = 'overflow: hidden; margin: 0; padding: 0';

let dimensoesTela = {largura: null, altura: null}
let cena, camera, renderizador, ceu, sol;

function init(){
    cena = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
    camera.position.set(0, 30, 0);

    renderizador = new THREE.WebGLRenderer();
    renderizador.shadowMap.enabled = true;
    renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
    renderizador.shadowMap.needsUpdate = true;
    document.body.appendChild(renderizador.domElement);

    atualizarProporcao();
    initSky();
}init();

function atualizarProporcao(){
    dimensoesTela.larguraTela = window.innerWidth;
    dimensoesTela.alturaTela = window.innerHeight;

    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", atualizarProporcao);

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

    function updateSun(a, b) {
        const geradorReflexao = new THREE.PMREMGenerator(renderizador);
        const phi = THREE.MathUtils.degToRad(a);
        const theta = THREE.MathUtils.degToRad(b);

        sol.setFromSphericalCoords(1, phi, theta);
        ceu.material.uniforms.sunPosition.value.copy(sol);
        cena.environment = geradorReflexao.fromScene(ceu).texture;

        const luz = new THREE.DirectionalLight(0xffffff, 1.5);
        luz.position.copy(sol);

        luz.castShadow = true;
        luz.shadow.mapSize.width = 1024;
        luz.shadow.mapSize.height = 1024;
        luz.shadow.camera.near = 1;
        luz.shadow.camera.far = 1000;

        luz.shadow.camera.left = -500;
        luz.shadow.camera.right = 500;
        luz.shadow.camera.top = 500;
        luz.shadow.camera.bottom = -500

        cena.add(luz);
    }
    updateSun(80, 0);
}

const GLTF = new GLTFLoader();
let phoenix;
GLTF.load("resources/Models/Phoenix/scene.gltf", gltf => {
    const escala = 0.001;
    phoenix = gltf.scene;
    phoenix.scale.set(escala, escala, escala);
    phoenix.position.set(0,-.5,-1.5);
    sombrearModelo(phoenix);
    camera.add(phoenix);
});
let ilha;
GLTF.load('resources/Models/Ilha/scene.gltf', gltf =>{
    ilha = gltf.scene;
    sombrearModelo(ilha);
    cena.add(ilha);
});

const teclasPressionadas = new Set();
const controle = new PointerLockControls(camera, renderizador.domElement);
cena.add(controle.getObject());

let velocidade = 0.15;

let controlePhoenix = {
    x: -10,
    minX: -80,
    maxX: 30,

    y: 90,
    minY: 45,
    maxY: 135,

    z: 0,
    minZ: -10,
    maxZ: 10
}

let controleCamera = {
    y: 0
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
        if(controlePhoenix.y+1 <= controlePhoenix.maxY) controlePhoenix.y++
        controleCamera.y++
    },
    KeyD(){
        controle.moveRight(velocidade);
        if(controlePhoenix.y-1 >= controlePhoenix.minY) controlePhoenix.y--
        controleCamera.y--
    },
    ShiftLeft(){
        velocidade = 0.25;
    },
    KeyE(){
        controle.getObject().position.y += 0.05;
        if(controlePhoenix.x+1 <= controlePhoenix.maxX) controlePhoenix.x++
    },
    KeyQ(){
        controle.getObject().position.y -= 0.05;
        if(controlePhoenix.x-1 >= controlePhoenix.minX) controlePhoenix.x--
    }
}

document.body.addEventListener('click', () => controle.lock());
document.addEventListener('keydown', event=> teclasPressionadas.add(event.code));
document.addEventListener('keyup', event=> teclasPressionadas.delete(event.code));
document.addEventListener('keyup', event => {
    if(event.code === "ShiftLeft") velocidade = 0.15;
});

function movimentacao(){
    if(teclasPressionadas.size !== 0){
        teclasPressionadas.forEach(teclas => {
            if(identificadorTeclas[teclas] !== undefined) identificadorTeclas[teclas]();
        });
    }
    posicaoCamera();


    posicaoPhoenix();
}

function posicaoCamera(){
    camera.rotation.y = THREE.MathUtils.degToRad(controleCamera.y);
}

function posicaoPhoenix(){
    if(phoenix!==undefined){
        phoenix.rotation.x = THREE.MathUtils.degToRad(controlePhoenix.x);
        phoenix.rotation.y = THREE.MathUtils.degToRad(controlePhoenix.y);
        phoenix.rotation.z = THREE.MathUtils.degToRad(controlePhoenix.z);
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
    requestAnimationFrame(animate);
}animate();