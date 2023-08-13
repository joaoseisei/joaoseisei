import * as THREE from "https://unpkg.com/three/build/three.module.js";

console.log("Scripts.js ok");
document.body.style.cssText = 'overflow: hidden; margin: 0; padding: 0';

//--------------------------------CENA---------------------------------
const cena = new THREE.Scene();

const renderizador = new THREE.WebGLRenderer();
document.body.appendChild(renderizador.domElement);
renderizador.shadowMap.enabled = true;
renderizador.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set( 0, 3, 8);
camera.lookAt(0,0,0);
//--------------------------------LUZ---------------------------------
const luz = new THREE.PointLight(0xB0C4DE, 30, 100 );
luz.position.set(5, 5 , 0);
luz.castShadow = true;
cena.add(luz);
//-------------------------------OBJETOS------------------------------
const points = [];
points.push( new THREE.Vector3( - 3, 0, 0 ) );
points.push( new THREE.Vector3( 3, 0, 0 ) );
const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({color: 0x000000})
);
line.castShadow = true;
cena.add(line);

const textureURL = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/crate.gif";
const texture = new THREE.TextureLoader().load(textureURL);
texture.colorSpace = THREE.SRGBColorSpace;
const cubo = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({map: texture})
);
cubo.castShadow = true;
cena.add(cubo);


const chao = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({color : 0xffffff})
);
chao.position.set(0,-2, 0);
chao.rotation.x = -Math.PI / 2;
chao.receiveShadow = true;
cena.add(chao);

function girarOBJ(obj){
    obj.rotation.y += 0.01;
}

/**
 * Mostra o direcionamento dos raios de luz.
 * @param objLuz Luz a ser visualizada.
 */
function ativarLuz(objLuz){
    const linhasGuia = new THREE.CameraHelper(objLuz.shadow.camera);
    cena.add(linhasGuia);
}ativarLuz(luz)

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

    girarOBJ(line)
    girarOBJ(cubo);
}animate();