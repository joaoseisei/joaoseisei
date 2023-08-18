import * as THREE from "https://unpkg.com/three@0.155.0/build/three.module.js";
import {GLTFLoader} from "https://unpkg.com/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";
import {PointerLockControls} from "https://unpkg.com/three@0.155.0/examples/jsm/controls/PointerLockControls.js";
import {Sky} from "https://unpkg.com/three@0.155.0/examples/jsm/objects/Sky.js";

console.log("Scripts.js ok");
document.body.style.cssText = 'overflow: hidden; margin: 0; padding: 0';

let dimensoesTela ={largura: null, altura: null}
let cena, camera, renderizador;
function init(){
    cena = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
    renderizador = new THREE.WebGLRenderer();
    renderizador.shadowMap.enabled = true;
    renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderizador.domElement);

    atualizarProporcao();
}init();

let sky = new Sky();
sky.scale.setScalar(5000);
cena.add(sky);

let sun = new THREE.Vector3();

const effectController = {
    turbidity: 20,
    rayleigh: 0.558,
    mieCoefficient: 0.009,
    mieDirectionalG: 0.999998,
    elevation: 15,
    azimuth: -45,
    exposure: renderizador.toneMappingExposure
}

const uniforms = sky.material.uniforms;
uniforms['turbidity'].value = effectController.turbidity;
uniforms['rayleigh'].value = effectController.rayleigh;
uniforms['mieCoefficient'].value = effectController.mieCoefficient;
uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
const theta = THREE.MathUtils.degToRad(effectController.azimuth);

sun.setFromSphericalCoords(1, phi, theta);
sun.set(0,0,0)
cena.add(sun);


function atualizarProporcao(){
    dimensoesTela.larguraTela = window.innerWidth;
    dimensoesTela.alturaTela = window.innerHeight;

    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", atualizarProporcao);


const sunlight = new THREE.DirectionalLight(0xffffff, 1);
sunlight.position.set(1, 1, 1);
cena.add(sunlight);


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
    requestAnimationFrame(animate);
    renderizador.render(cena, camera);
    movimentacao();
}animate();