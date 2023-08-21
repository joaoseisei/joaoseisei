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
let aviao;
GLTF.load("resources/Models/Aviao/scene.gltf", gltf => {
    aviao = gltf.scene;
    aviao.rotation.x = THREE.MathUtils.degToRad(85);
    aviao.rotation.z = THREE.MathUtils.degToRad(180);
    aviao.position.set(0,-.5,-1.5);
    sombrearModelo(aviao);
    camera.add(aviao);
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

let controleAviao = {
    x: 90,
    minX: 50,
    maxX: 110,

    y: 0,
    minY: -35,
    maxY: 35,

    z: 180,
    minZ: 150,
    maxZ: 210
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
        if(controleAviao.y+1 <= controleAviao.maxY) controleAviao.y++
        if(controleAviao.z-1 >= controleAviao.minZ) controleAviao.z--
        controleCamera.y++
    },
    KeyD(){
        controle.moveRight(velocidade);
        if(controleAviao.y-1 >= controleAviao.minY) controleAviao.y--
        if(controleAviao.z+1 <= controleAviao.maxZ) controleAviao.z++
        controleCamera.y--
    },
    ShiftLeft(){
        velocidade = 0.25;
    },
    KeyE(){
        controle.getObject().position.y += 0.05;
        if(controleAviao.x+1 <= controleAviao.maxX) controleAviao.x++
        console.log(controleCamera.y , controleAviao.z, " / ", controleCamera.y);
    },
    KeyQ(){
        controle.getObject().position.y -= 0.05;
        if(controleAviao.x-1 >= controleAviao.minX) controleAviao.x--
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

    estabilizarAviao();
    posicaoAviao();
}

function posicaoCamera(){
    camera.rotation.y = THREE.MathUtils.degToRad(controleCamera.y);
}

function posicaoAviao(){
    if(aviao!==undefined){
        aviao.rotation.set(THREE.MathUtils.degToRad(controleAviao.x),
                           THREE.MathUtils.degToRad(controleAviao.y),
                           THREE.MathUtils.degToRad(controleAviao.z));
    }
}

function estabilizarAviao(){

    if(controleAviao.x !== 90){
        if(!(teclasPressionadas.has('KeyE') || teclasPressionadas.has('KeyQ'))){
            if(controleAviao.x > 90) controleAviao.x -= 1;
            else controleAviao.x += 1;
        }
    }

    if(controleAviao.y !== 0){
        if(!(teclasPressionadas.has('KeyA') || teclasPressionadas.has('KeyD'))){
            if(controleAviao.y > 0) controleAviao.y -= 1;
            else controleAviao.y += 1;
        }
    }

    if(controleAviao.z !== 180){
        if(!(teclasPressionadas.has('KeyA') || teclasPressionadas.has('KeyD'))){
            if(controleAviao.z > 180) controleAviao.z -= 1;
            else controleAviao.z += 1;
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
    requestAnimationFrame(animate);
}animate();