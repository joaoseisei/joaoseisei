import * as THREE from "https://unpkg.com/three/build/three.module.js";

console.log("Scripts.js ok");
document.body.style.cssText = 'overflow: hidden; margin: 0; padding: 0';

//--------------------------------CENA---------------------------------
const cena = new THREE.Scene();

const renderizador = new THREE.WebGLRenderer();
renderizador.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderizador.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set( 0, 0, 5 );
camera.lookAt(0,0,0);
//-------------------------------OBJETOS------------------------------
const material = new THREE.LineBasicMaterial({color: 0x708188});
const points = [];
points.push( new THREE.Vector3( - 3, 0, 0 ) );
points.push( new THREE.Vector3( 0, 3, 0 ) );
points.push( new THREE.Vector3( 3, 0, 0 ) );
points.push( new THREE.Vector3( -3, 0, 0 ) );
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(geometry, material);
cena.add(line);

const textureURL = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/crate.gif"
const texture = new THREE.TextureLoader().load(textureURL);
texture.colorSpace = THREE.SRGBColorSpace;

const cubo = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({map:texture}));
cena.add(cubo);
function girarOBJ(obj){
    obj.rotation.y  += 0.01;
}
function animate(){
    requestAnimationFrame(animate);
    girarOBJ(cubo);
    girarOBJ(line);
    renderizador.render(cena, camera);
}
animate();

