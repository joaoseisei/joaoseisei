import * as THREE from "https://unpkg.com/three@0.155.0/build/three.module.js";
import {GLTFLoader} from "https://unpkg.com/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";
import {PointerLockControls} from "https://unpkg.com/three@0.155.0/examples/jsm/controls/PointerLockControls.js";
import {Sky} from "https://unpkg.com/three@0.155.0/examples/jsm/objects/Sky.js";

console.log("Scripts.js ok");
document.body.style.cssText = 'overflow: hidden; margin: 0; padding: 0';

let dimensoesTela = {largura: null, altura: null}
let cena, camera, renderizador, ceu, sol;

function init(){
    cena = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
    renderizador = new THREE.WebGLRenderer();
    renderizador.shadowMap.enabled = true;
    renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
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
    }
    updateSun(80, 0);
}

const teclasPressionadas = new Set();
const controle = new PointerLockControls(camera, renderizador.domElement);
cena.add(controle.getObject());

let velocidade = 0.15;
let identificadorTeclas = {
    KeyW(){
        controle.moveForward(velocidade);
    },
    KeyS(){
        controle.moveForward(-velocidade);
    },
    KeyA(){
        controle.moveRight(-velocidade);
    },
    KeyD(){
        controle.moveRight(velocidade);
    },
    ShiftLeft(){
        velocidade = 0.25;
    },
    KeyE(){
        controle.getObject().position.y += 0.15;
    },
    KeyQ(){
        controle.getObject().position.y -= 0.15;
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
}

//-------------------------------CHAO---------------------------------
const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({color : 0xffffff})
);
chao.position.set(0,-2, 0);
chao.rotation.x = -Math.PI / 2;
chao.receiveShadow = true;
cena.add(chao);
//-------------------------------OBJETOS------------------------------
function criarCubo(base, textura){
    const texturaCubo = new THREE.TextureLoader().load(textura);
    texturaCubo.colorSpace = THREE.SRGBColorSpace;
    let cubo = new THREE.Mesh(
        new THREE.BoxGeometry(base, base, base),
        new THREE.MeshStandardMaterial({map: texturaCubo})
    );
    cubo.castShadow = true;
    return cubo;
}
let cubo = criarCubo(2, "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/crate.gif");
cubo.position.set(8,-1,-6)
cena.add(cubo);

const GLTF = new GLTFLoader();

let peixeGLTF;
GLTF.load("resources/Models/scene.gltf",(gltf)=> {
    peixeGLTF = gltf.scene;
    peixeGLTF.scale.set(0.5,0.5,0.5);
    peixeGLTF.position.set(0,-1,0);
    peixeGLTF.rotation.y = Math.PI / 2;
    sombrearModelo(peixeGLTF);
    cena.add(peixeGLTF);
});
//-------------------------------FUNÇÕES------------------------------
/**
 * Gira um objeto.
 * @param obj Objeto a ser girado.
 */
function girarOBJ(obj){
    if(obj!=null) obj.rotation.y += 0.01;
}

/**
 * Percorre todos os filhos de um obj e sombreia eles.
 * @param obj Objeto a ser sombreado.
 */
function sombrearModelo(obj){
    obj.traverse(child => {
        if(child.isMesh) child.receiveShadow = child.castShadow = true;
    });
}

/**
 * Mostra o direcionamento dos raios de luz.
 * @param objLuz Luz a ser visualizada.
 */
function ativarLuz(objLuz){
    const linhasGuia = new THREE.CameraHelper(objLuz.shadow.camera);
    cena.add(linhasGuia);
}


/**
 * Anima a tela.
 */
function animate(){
    renderizador.render(cena, camera);
    movimentacao();
    requestAnimationFrame(animate);
}animate();