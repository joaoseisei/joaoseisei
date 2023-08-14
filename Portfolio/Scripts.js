import * as THREE from "https://unpkg.com/three@0.155.0/build/three.module.js";
import {GLTFLoader} from "https://unpkg.com/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";

console.log("Scripts.js ok");
document.body.style.cssText = 'overflow: hidden; margin: 0; padding: 0';

//--------------------------------CENA---------------------------------
const GLTF = new GLTFLoader();

const cena = new THREE.Scene();

const renderizador = new THREE.WebGLRenderer();
document.body.appendChild(renderizador.domElement);
renderizador.shadowMap.enabled = true;
renderizador.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set( 0, 3, 8);
camera.lookAt(0,0,0);
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
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({color : 0xffffff})
);
chao.position.set(0,-2, 0);
chao.rotation.x = -Math.PI / 2;
chao.receiveShadow = true;
cena.add(chao);
//-------------------------------OBJETOS------------------------------
const textureURL = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/crate.gif";
const texture = new THREE.TextureLoader().load(textureURL);
texture.colorSpace = THREE.SRGBColorSpace;
const cubo = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({map: texture})
);
cubo.position.set(8,-1,-6)
cubo.castShadow = true;
cena.add(cubo);

let peixeGLTF;
GLTF.load("resources/Models/scene.gltf",(gltf)=> {
    peixeGLTF = gltf.scene;
    peixeGLTF.scale.set(0.5,0.5,0.5);
    peixeGLTF.position.set(0,-1,0)
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
 * Atualiza as proporções da tela.
 */
function atualizarProporcao(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
}atualizarProporcao();
window.addEventListener("resize", atualizarProporcao);

/**
 * Anima a tela.
 */
function animate(){
    requestAnimationFrame(animate);
    renderizador.render(cena, camera);
    girarOBJ(peixeGLTF);
}animate();