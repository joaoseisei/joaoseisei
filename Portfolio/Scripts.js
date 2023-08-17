import * as THREE from "https://unpkg.com/three@0.155.0/build/three.module.js";
import {GLTFLoader} from "https://unpkg.com/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";
import {OrbitControls} from "https://unpkg.com/three@0.155.0/examples/jsm/controls/OrbitControls.js";
import {FirstPersonControls} from "https://unpkg.com/three@0.155.0/examples/jsm/controls/FirstPersonControls.js";
import {PointerLockControls} from "https://unpkg.com/three@0.155.0/examples/jsm/controls/PointerLockControls.js";

console.log("Scripts.js ok");
document.body.style.cssText = 'overflow: hidden; margin: 0; padding: 0';

//--------------------------------CENA---------------------------------
const GLTF = new GLTFLoader();

const cena = new THREE.Scene();

const renderizador = new THREE.WebGLRenderer();
renderizador.shadowMap.enabled = true;
renderizador.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderizador.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);

const controle = new PointerLockControls(camera, renderizador.domElement);
cena.add(controle.getObject());
document.body.addEventListener('click', () => controle.lock());
document.addEventListener('keypress', (event)=> {
    if(identificadorTeclas[event.code] !== undefined) identificadorTeclas[event.code]();
});


let velocidade = 0.1;

const identificadorTeclas = {
     KeyW(){
         console.log("teste");
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
     }
}











//--------------------------------LUZ---------------------------------
const luz = new THREE.PointLight(0xB0C4DE, 35, 100 );
luz.position.set(5, 5 , 0);
luz.castShadow = true;
cena.add(luz);
const luz2 = new THREE.PointLight(0xB0C4DE, 35, 100 );
luz2.position.set(-5, 5 , 0);
luz2.castShadow = true;
cena.add(luz2);
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


let larguraTela;
let alturaTela;
let razaoTela;
/**
 * Atualiza as proporções da tela.
 */
function atualizarProporcao(){
    larguraTela= window.innerWidth;
    alturaTela = window.innerHeight
    camera.aspect = razaoTela = larguraTela/alturaTela;
    camera.updateProjectionMatrix();
    renderizador.setSize(larguraTela, alturaTela);
}atualizarProporcao();
window.addEventListener("resize", atualizarProporcao);

/**
 * Anima a tela.
 */
function animate(){
    requestAnimationFrame(animate);
    renderizador.render(cena, camera);
}animate();