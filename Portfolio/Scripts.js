import * as THREE from "https://unpkg.com/three/build/three.module.js";

console.log("Scripts.js ok");
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
});

const cena = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
const renderizador = new THREE.WebGLRenderer();

renderizador.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderizador.domElement);


const material = new THREE.MeshBasicMaterial({color: 0x808080});
const cubo = new THREE.Mesh(new THREE.BoxGeometry(), material);
cena.add(cubo);

function animate(){
    requestAnimationFrame(animate);
    cubo.rotation.x += 0.01;
    cubo.rotation.y += 0.01;
    renderizador.render(cena, camera);
}
animate();

camera.position.z = 5;