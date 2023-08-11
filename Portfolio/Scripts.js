import * as THREE from "https://unpkg.com/three/build/three.module.js";

console.log("Scripts.js ok");
document.body.style.cssText = 'overflow: hidden; margin: 0; padding: 0';

const cena = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
const renderizador = new THREE.WebGLRenderer();

renderizador.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderizador.domElement);
camera.position.z = 5;

const material = new THREE.MeshBasicMaterial({color: 0x708188});
const cubo = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), material);
cena.add(cubo);

/**
 * Atualiza a tela.
 */
function animate(){
    requestAnimationFrame(animate);
    cubo.rotation.x += 0.01;
    cubo.rotation.y += 0.01;
    renderizador.render(cena, camera);
}
animate();

