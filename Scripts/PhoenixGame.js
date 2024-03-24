import * as THREE from 'three';
import {GLTFLoader, PointerLockControls, Sky, Water} from 'three_addons';

console.log("PhoenixGame.js ok");

export class PhoenixGame{
    constructor() {
        this.loadingManager = new THREE.LoadingManager();
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.cena = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 0);
        this.renderizador = new THREE.WebGLRenderer();
        this.sol = new THREE.Vector3();
        this.ceu = new Sky();
        this.planoAgua =  new THREE.PlaneGeometry(4000, 4000);
        this.controle = new PointerLockControls(this.camera, this.renderizador.domElement);
        this.cena.add(this.controle.getObject());
        this.teclasPressionadas = new Set();
        this.velocidade = 0.15;

        this.init();
        window.addEventListener("resize", this.updateProporcao.bind(this));
        document.addEventListener('keydown', event=> this.teclasPressionadas.add(event.code));
        document.addEventListener('keyup', event=> this.teclasPressionadas.delete(event.code));
        document.addEventListener('keyup', event => {
            if(event.code === 'KeyM') this.controle.lock();
            if(event.code === "ShiftLeft") this.velocidade = 0.15;
            if (event.code === "Escape") window.location.reload();
        });
    }

    onLoading(){
        let pagPrincipal = document.getElementById('PaginaPrincipal');
        let barraProgresso = document.getElementById('barraProgresso');
        let carregamentoContainer = document.getElementById('telaCarregamentoContainer');
        if (pagPrincipal && barraProgresso && carregamentoContainer) {
            pagPrincipal.style.display = 'none';
            carregamentoContainer.style.display = 'flex';

            this.loadingManager.onProgress = (url, loaded, total) => barraProgresso.value = 100 * loaded / total;
            this.loadingManager.onLoad = () => carregamentoContainer.style.display = 'none';
            this.loadingManager.onError = error => console.error(error);
        } else {
            console.error("Um ou mais elementos não foram encontrados.");
        }
    }

    init(){
        const {renderizador} = this;
        renderizador.shadowMap.enabled = true;
        renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderizador.domElement);
        this.onLoading();
        this.updateProporcao();
        this.initSetters();
        this.initSky(89, 180);
        this.initModelos();
        this.initWater();
        this.animate();
    }

    initSky(a, b){
        const {sol , ceu, cena, renderizador} = this;
        ceu.scale.setScalar(10000);
        cena.add(ceu);
        const ceuPropriedades = ceu.material.uniforms;
        ceuPropriedades.turbidity.value = 10;
        ceuPropriedades.rayleigh.value = 1;
        ceuPropriedades.mieCoefficient.value = 0.005;
        ceuPropriedades.mieDirectionalG.value = 0.9999;
        function updateSol(a, b) {
            const geradorReflexao = new THREE.PMREMGenerator(renderizador);
            const phi = THREE.MathUtils.degToRad(a);
            const theta = THREE.MathUtils.degToRad(b);
            sol.setFromSphericalCoords(1, phi, theta);
            ceu.material.uniforms.sunPosition.value.copy(sol);
            cena.environment = geradorReflexao.fromScene(ceu).texture;
        }
        function updateLuz(){
            const luz = new THREE.DirectionalLight(0xffffff, 1.5);
            luz.position.copy(sol);
            luz.castShadow = true;
            luz.shadow.mapSize.width = 1024;
            luz.shadow.mapSize.height = 1024;
            let configLuz = luz.shadow.camera;
            configLuz.near = 1;
            configLuz.far = 1000;
            configLuz.left = -500;
            configLuz.right = 500;
            configLuz.top = 500;
            configLuz.bottom = -500
            cena.add(luz);
        }
        updateSol(a, b);
        updateLuz();
    }

    initWater(){
        const {planoAgua , camera, loadingManager, cena} = this;
        this.agua = new Water(planoAgua, {
                textureWidth: 512,
                textureHeight: 512,
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: camera.position.y,
                waterNormals: new THREE.TextureLoader(loadingManager).load(
                    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg',
                    textura => textura.wrapS = textura.wrapT = THREE.RepeatWrapping
                )
            }
        );
        this.agua.rotation.x =  THREE.MathUtils.degToRad(-90);
        cena.add(this.agua);
    }

    initModelos(){
        let modeloPhoenix;
        this.gltfLoader.load("./resources/Models/Phoenix/scene.gltf", modeloGLTF => {
            modeloPhoenix = modeloGLTF.scene;
            modeloPhoenix.scale.setScalar(0.0015);
            modeloPhoenix.position.set(0,-.5,-1.5);
            modeloPhoenix.rotateX(THREE.MathUtils.degToRad(-20));
            modeloPhoenix.rotateY(THREE.MathUtils.degToRad(-90));
            this.sombrearModelo(modeloPhoenix);
            this.camera.add(modeloPhoenix);

            const mixer = new THREE.AnimationMixer(modeloPhoenix);
            modeloGLTF.animations.forEach(function (clip) {
                let action = mixer.clipAction(clip);
                action.play();
            });
            this.modeloPhoenix = modeloPhoenix;
            this.mixer = mixer;
        });
    }

    updateModelo(){
        this.mixer?.update(0.01);
    }

    updateProporcao(){
        const { camera, renderizador } = this;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderizador.setSize(window.innerWidth, window.innerHeight);
    }

    updateDistorcao(){
        const {agua, camera} = this;
        agua.material.uniforms.time.value += 1/80;
        agua.material.uniforms.distortionScale.value = camera.position.y;
        agua.material.uniformsNeedUpdate = true;
    }


    sombrearModelo(obj){
        obj.traverse(child => {
            if(child.isMesh) child.receiveShadow = child.castShadow = true;
        });
    }

    initSetters(){
        this.setControles();
        this.setIdentificadorTeclas();
        this.setEstabilizadores();
        this.setMovimentacao();
    }

    setControles(){
        this.controles = {
            verificadorMax: (ValAtual, ValMax) => ValAtual+1 <= ValMax,
            verificadorMin: (ValAtual, ValMin) => ValAtual-1 >= ValMin,
            phoenix: {
                x: -10,
                minX: -80,
                maxX: 30,

                y: 90,
                minY: 45,
                maxY: 135,

                z: 0,
                minZ: -10,
                maxZ: 10
            },
            camera: {
                y: 0,
                minY: 0.6,
                maxY: 100,
            }
        }
    }

    setIdentificadorTeclas(){
        let {velocidade, controles, camera} = this;
        const {controle} = this;

        let gravidade = {
            velocidade: 1,
            velocidadeMax: 10,
            resetarGravidade() {
                this.velocidade = 1;
            },
            incrementarVelocidade() {
                if (this.velocidade + 1 <= this.velocidadeMax) this.velocidade += 0.01;
            },
            movimentarCamera(direcao) {
                camera.position.y += direcao * this.velocidade;
            }
        }

        this.identificadorTeclas = {
            KeyW(){
                controle.moveForward(velocidade);
            },
            KeyS(){
                controle.moveForward(-velocidade);
            },
            KeyA(){
                controle.moveRight(-velocidade);
                controles.camera.y++
                if(controles.verificadorMax(controles.phoenix.y, controles.phoenix.maxY)) {
                    controles.phoenix.y++
                }
            },
            KeyD(){
                controle.moveRight(velocidade);
                controles.camera.y--
                if(controles.verificadorMin(controles.phoenix.y, controles.phoenix.minY)) controles.phoenix.y--
            },
            ShiftLeft(){
                velocidade = 0.25;
            },
            KeyE(){
                if(camera.position.y < controles.camera.maxY){
                    gravidade?.movimentarCamera(+0.05);
                    if(controles.verificadorMax(controles.phoenix.x, controles.phoenix.maxX)) controles.phoenix.x++
                }
            },
            KeyQ(){
                if(camera.position.y >= controles.camera.minY){
                    camera.position.y > 2 ? gravidade.incrementarVelocidade() : gravidade.resetarGravidade();
                    gravidade?.movimentarCamera(-0.05);

                    if(controles.verificadorMin(controles.phoenix.x, controles.phoenix.minX)) controles.phoenix.x--
                }
            }
        }
    }

    setEstabilizadores(){
        let {controles, teclasPressionadas, camera} = this;
        this.estabilizadores = {
            estabilizar: (pontoMedio, atributo) => atributo > pontoMedio ? -1 : 1,
            isntEstavel: (obj, pontEquilibrio) => obj !== pontEquilibrio,
            isTeclaPressionada: (teclas) => !teclas.some(tecla => Array.from(teclasPressionadas).includes(tecla)),
            estabilizarPhoenixPC() {
                if(this.isntEstavel(controles.phoenix.x, -10)){
                    if(camera.position.y < controles.camera.minY || this.isTeclaPressionada(['KeyE', 'KeyQ'])){
                        controles.phoenix.x += this.estabilizar(-10, controles.phoenix.x);
                    }
                }
                if(this.isntEstavel(controles.phoenix.y, 90) && this.isTeclaPressionada(['KeyA', 'KeyD'])){
                    controles.phoenix.y += this.estabilizar(90, controles.phoenix.y);
                }
            },

        }
    }

    setMovimentacao(){
        const {teclasPressionadas, identificadorTeclas, estabilizadores} = this;
        this.movimentacao = {
            andar(){
                teclasPressionadas.forEach(tecla => identificadorTeclas[tecla]?.());
            },
            estabilizar(){
                estabilizadores.estabilizarPhoenixPC();
            },
            movimentar(){
                this.andar();
                this.estabilizar();
            }
        }
    }

    animate(){
        this.renderizador.render(this.cena, this.camera);
        this.updateModelo()
        this.updateDistorcao();
        this?.movimentacao.movimentar();

        this.camera.rotation.y = THREE.MathUtils.degToRad(this.controles.camera.y);
        this.modeloPhoenix?.rotation.set(
            THREE.MathUtils.degToRad(this.controles.phoenix.x),
            THREE.MathUtils.degToRad(this.controles.phoenix.y),
            THREE.MathUtils.degToRad(this.controles.phoenix.z)
        );

        requestAnimationFrame(this.animate.bind(this));
    }
}
