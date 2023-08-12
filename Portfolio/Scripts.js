import * as THREE from "https://unpkg.com/three/build/three.module.js";

console.log("Scripts.js ok");
document.body.style.cssText = 'overflow: hidden; margin: 0; padding: 0';

//--------------------------------CENA---------------------------------
const cena = new THREE.Scene();

const renderizador = new THREE.WebGLRenderer();
renderizador.setSize(window.innerWidth, window.innerHeight);
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
const material = new THREE.LineBasicMaterial({color: 0x000000});
const points = [];
points.push( new THREE.Vector3( - 3, 0, 0 ) );
points.push( new THREE.Vector3( 3, 0, 0 ) );
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const line = new THREE.Line(geometry, material);
line.castShadow = true;
cena.add(line);

const textureURL = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/crate.gif"
const texture = new THREE.TextureLoader().load(textureURL);
texture.colorSpace = THREE.SRGBColorSpace;
const cor = new THREE.MeshStandardMaterial({map: texture});
const geometriaCubo = new THREE.BoxGeometry(2, 2, 2)
const cubo = new THREE.Mesh(geometriaCubo, cor);
cubo.castShadow = true;
cena.add(cubo);
function onClick(){
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(cubo);
    if (intersects.length > 0) {
        console.log("caixa abrindo");
    }
};

renderizador.domElement.addEventListener("click", onClick);

const corChao = new THREE.MeshStandardMaterial({color : 0xffffff})
const chao = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), corChao);
chao.position.set(0,-2, 0);
chao.rotation.x = -Math.PI / 2;
chao.receiveShadow = true;
cena.add(chao);


function ativarLuz(){
    const helper = new THREE.CameraHelper( luz.shadow.camera );
    cena.add( helper );
}ativarLuz()

function girarOBJ(obj){
    obj.rotation.y += 0.01;
}

function animate(){
    requestAnimationFrame(animate);
    girarOBJ(line)
    girarOBJ(cubo);
    renderizador.render(cena, camera);
}
animate();

