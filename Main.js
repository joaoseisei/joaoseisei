import {PhoenixGame} from "./Scripts/PhoenixGame.js";

console.log("Main.js OK")

let jogo = null;

export function finalizarJogo(){
    jogo = null;
    console.log(jogo);
}

let pg = document.getElementById("PhoenixGame");
pg.addEventListener("click", () => {
    jogo = new PhoenixGame(finalizarJogo);
});

