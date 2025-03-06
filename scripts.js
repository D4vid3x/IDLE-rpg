let jugador = JSON.parse(sessionStorage.getItem('usuario')) || { 
    hp: 100, 
    atk: 2, 
    xp: 0, 
    xpMax: 100, 
    nivel: 1, 
    energia: 100, 
    madera: 0, 
    peces: 0, 
    tablones: 0, 
    vigas: 0, 
    pecesVerdes: 0, 
    pecesDorados: 0,
    oro: 0,
    carne: 0,
    carneSeca: 0,
    pocionVidaPequeña: 0,
    pocionVidaMediana: 0,
    pocionVidaGrande: 0, 
};
let espadas=[
    {espada: 'madera', dmg: 5, coste: 10, durabilidad: 5 },
    {espada: 'piedra', dmg: 20, coste: 30, durabilidad: 20 },
    {espada: 'plata', dmg: 35, coste: 60, durabilidad: 35 },
    {espada: 'oricalco', dmg: 500, coste: 1000, durabilidad: 100 },
];

let armaduras=[
    {espada: 'tela', dmg: 5, coste: 10, durabilidad: 5 },
    {espada: 'cuero', dmg: 20, coste: 30, durabilidad: 20 },
    {espada: 'metal', dmg: 35, coste: 60, durabilidad: 35 },
    {espada: 'oricalco', dmg: 500, coste: 1000, durabilidad: 100 },
];

let temporizadores = {};

function iniciarJuego() {
    if (sessionStorage.getItem('usuario')) {
        jugador = JSON.parse(sessionStorage.getItem('usuario'));
        actualizarHUD();
    } else {
        sessionStorage.setItem('usuario', JSON.stringify(jugador));
    }
    $('#inicio').hide();
    $('#juego').removeClass('hidden');
    $('#player-name').text(jugador.name || "Jugador");
}

function actualizarHUD() {
    $('#hp').text(jugador.hp);
    $('#atk').text(jugador.atk);
    $('#xp').text(jugador.xp);
    $('#xpMax').text(jugador.xpMax);
    $('#nivel').text(jugador.nivel);
    $('#energia').text(jugador.energia);
    $('#madera').text(jugador.madera);
    $('#peces').text(jugador.peces);
    $('#tablones').text(jugador.tablones);
    $('#vigas').text(jugador.vigas);
    $('#pecesVerdes').text(jugador.pecesVerdes);
    $('#pecesDorados').text(jugador.pecesDorados);
    $('#carne').text(jugador.carne);
    $('#carneSeca').text(jugador.carneSeca);
    $('#oro').text(jugador.oro);
    $('#pocionVidaPequeña').text(jugador.pocionVidaPequeña);
    $('#pocionVidaMediana').text(jugador.pocionVidaMediana);
    $('#pocionVidaGrande').text(jugador.pocionVidaGrande);

}

function recolectar(tipo) {
    if (jugador.energia <= 0) {
        alert("¡No tienes suficiente energía!");
        return;
    }

    let btn = `#btn${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    $(btn).prop('disabled', true).addClass('btn-timer');

    // Aseguramos que existe el objeto de temporizador para este botón
    if (!temporizadores[btn]) {
        temporizadores[btn] = { lastActionTime: 0, recoveryTimer: null };
    }

    // Si tienes 100 de energía y han pasado más de 20 segundos desde la última acción
    if (jugador.energia === 100 && (Date.now() - temporizadores[btn].lastActionTime >= 20000)) {
        // No se resta energía y obtienes la cantidad máxima (por ejemplo, 5)
        let cantidadMaxima = 5; // Ajusta esta cantidad si lo deseas
        jugador[tipo] += cantidadMaxima;
        $('#' + tipo).text(jugador[tipo]);
    } else {
        // Flujo normal: se resta 15 de energía y se obtiene una cantidad aleatoria
        let cantidad = Math.floor(Math.random() * 5) + 1;
        jugador[tipo] += cantidad;
        $('#' + tipo).text(jugador[tipo]);
        jugador.energia -= 15;
        generarParticulas();
    }

    // Actualiza la última acción para este botón
    temporizadores[btn].lastActionTime = Date.now();

    // Configura el temporizador para recuperar energía si no existe
    if (!temporizadores[btn].recoveryTimer) {
        temporizadores[btn].recoveryTimer = setInterval(() => {
            if (jugador.energia < 100) {
                jugador.energia = Math.min(jugador.energia + 20, 100);
                actualizarHUD();
            }
        }, 1000); //Tiempo de recuperacion de energía 1000 = 1 seg
    }

    // Restablece el botón después de 30 segundos
    setTimeout(() => {
        $(btn).prop('disabled', false).removeClass('btn-timer');
        actualizarHUD();
    }, 30000);

    actualizarHUD();
}

function combatir() {
    $('#btnQuest').addClass('btn-timer');
    setTimeout(() => { $('#btnQuest').removeClass('btn-timer'); }, 30000);
    
    // Selección aleatoria de enemigos
    let enemigos = [
        { nombre: 'Lobo', hp: 10, dmg: 2, xp: 50, oro: 3, habilidad: 'Mordisco' },
        { nombre: 'Araña', hp: 20, dmg: 1, xp: 50, oro: 1, habilidad: 'Veneno' },
        { nombre: 'Goblin', hp: 15, dmg: 3, xp: 60,oro: 5, habilidad: 'Golpe Pesado' },
        { nombre: 'Esqueleto', hp: 25, dmg: 4, xp: 70,oro: 6, habilidad: 'Espada Mortal' },
        { nombre: 'Ogro', hp: 40, dmg: 10, xp: 130, oro: 10, habilidad: 'Bonk' }

    ];
    
    let enemigo = enemigos[Math.floor(Math.random() * enemigos.length)];
    let hpJugador = jugador.hp;
    let log = `Te enfrentas a un ${enemigo.nombre}!\n`;
    
    // Comienza el combate
    while (hpJugador > 0 && enemigo.hp > 0) {
        // Determinar si el jugador esquiva el ataque
        let esquiva = Math.random() < 0.3;  // 30% de probabilidad de esquivar
        if (esquiva) {
            log += `¡Esquivas el ataque de ${enemigo.nombre}!\n`;
        } else {
            // Si no esquiva, el jugador recibe daño
            hpJugador -= enemigo.dmg;
            log += `El ${enemigo.nombre} te golpea  - ${enemigo.dmg} hp!\n`;
        }

        // El jugador también puede usar una habilidad
        let usarHabilidad = Math.random() < 0.2; // 20% de probabilidad de usar habilidad
        if (usarHabilidad) {
            let habilidad = usarHabilidadJugador();
            log += habilidad.log;
            enemigo.hp -= habilidad.dano;
        }

        // El jugador ataca al enemigo
        if (enemigo.hp > 0) {
            enemigo.hp -= jugador.atk;
            log += `Atacas a ${enemigo.nombre}  - ${jugador.atk} hp!\n`;
        }
    }

    // Determinar el resultado del combate
    if (hpJugador > 0) {
        log += `Has vencido al ${enemigo.nombre}!\n Has ganado ${enemigo.oro} de oro`;
        jugador.xp += enemigo.xp;
        jugador.oro+=enemigo.oro;
        subirNivel();
    } else {
        log += "¡Has muerto! Reiniciando juego...";
        setTimeout(() =>{
            location.reload();
            sessionStorage.clear();
        }, 3000);
    }

    jugador.hp = hpJugador;
    actualizarHUD();
     $('#log').text(log);
     $('#modalLogCombate').removeClass('hidden').addClass('show');
    
}

function usarHabilidadJugador() {
    // 4 habilidades posibles, una para cada nivel de personaje
    let habilidades = [
        { nombre: 'Fuerza Bruta', dano: 5, log: '¡Usas Fuerza Bruta y golpeas al enemigo por 5 de daño!' },
        { nombre: 'Curar', dano: -10, log: '¡Usas Curar y recuperas 10 puntos de vida!' },
        { nombre: 'Golpe Rápido', dano: 8, log: '¡Usas Golpe Rápido y golpeas al enemigo por 8 de daño!' },
        { nombre: 'Lluvia de Flechas', dano: 10, log: '¡Usas Lluvia de Flechas y atacas al enemigo por 10 de daño!' }
    ];

    // El jugador tiene una habilidad disponible basada en su nivel
    let habilidad = habilidades[Math.floor(Math.random() * jugador.nivel)];

    // Si la habilidad es "Curar", se curan puntos de vida, no se daña al enemigo
    if (habilidad.dano < 0) {
        jugador.hp = Math.min(jugador.hp + Math.abs(habilidad.dano), 100);
    }

    return habilidad;
}

function abrirFabricacion() {
    $('#modalFabricacion').removeClass('hidden').addClass('show');
}

function cerrarFabricacion() {
    $('#modalFabricacion').removeClass('show');
    setTimeout(() => $('#modalFabricacion').addClass('hidden'), 300);
}

function fabricar(tipo) {
    if (tipo === 'tablones') {
        let madera = jugador.madera;
        if (madera >= 5) {
            jugador.madera -= 5;
            jugador[tipo] = (jugador[tipo] || 0) + 1;  // Se asegura que si no existe "tablones", se crea con valor 1
            generarParticulas();
        }else{
            $('#modalErrorFabricacion').removeClass('hidden').addClass('show');
        }

    } else if (tipo === 'vigas') {
        let tablones = jugador.tablones;
        if (tablones >= 3) {
            jugador.tablones -= 3;
            jugador[tipo] = (jugador[tipo] || 0) + 1;  // Se asegura que si no existe "vigas", se crea con valor 1
            generarParticulas();
        }else{
            $('#modalErrorFabricacion').removeClass('hidden').addClass('show');
        }
    } else if (tipo === 'pecesVerdes') {
        let peces = jugador.peces;
        if (peces >= 5) {
            jugador.peces -= 5;
            jugador[tipo] = (jugador[tipo] || 0) + 1;  // Se asegura que si no existe "pecesVerdes", se crea con valor 1
            generarParticulas();
        }else{
            $('#modalErrorFabricacion').removeClass('hidden').addClass('show');
        }

    } else if (tipo === 'pecesDorados') {
        let pecesVerdes = jugador.pecesVerdes;
        if (pecesVerdes >= 3) {
            jugador.pecesVerdes -= 3;
            jugador[tipo] = (jugador[tipo] || 0) + 1;  // Se asegura que si no existe "pecesDorados", se crea con valor 1
            generarParticulas();
        }else{
            $('#modalErrorFabricacion').removeClass('hidden').addClass('show');
        }
    } else if(tipo === 'carneSeca'){
        let carne =jugador.carne;
        if (carne >= 3) {
            jugador.carne -= 3;
            jugador[tipo] = (jugador[tipo] || 0) + 1;  // Se asegura que si no existe "carneSeca", se crea con valor 1
            generarParticulas();
        }else{
            $('#modalErrorFabricacion').removeClass('hidden').addClass('show');
        }
    }
    actualizarHUD();
}

function abrirInventario() {
    $('#modalInventario').removeClass('hidden').addClass('show');
}

function cerrarInventario() {
    $('#modalInventario').removeClass('show');
    setTimeout(() => $('#modalInventario').addClass('hidden'), 300);
}

function cerrarErrorFabricacion() {
    $('#modalErrorFabricacion').removeClass('show');
    setTimeout(() => $('#modalErrorFabricacion').addClass('hidden'), 300);
}
function generarParticulas() {
    for (let i = 0; i < 5; i++) {
        let particle = $('<div class="particle"></div>');
        $('body').append(particle);
        let x = Math.random() * window.innerWidth;
        let y = Math.random() * window.innerHeight;
        particle.css({ left: x + 'px', top: y + 'px' });
        setTimeout(() => particle.remove(), 1000);
    }
}

function subirNivel() {
    while (jugador.xp >= jugador.xpMax) {
        jugador.xp -= jugador.xpMax;
        jugador.nivel++;
        jugador.xpMax = 100 + (jugador.nivel - 1) * 50;
        jugador.hp += 5;
        jugador.atk += 2;
        $('#log').append('\n¡Subiste al nivel ' + jugador.nivel + '! +5 HP, +2 ATK\n');
    }
}

function abrirTienda() {
    $('#modalTienda').removeClass('hidden').addClass('show');
    
}

function cerrarTienda() {
    $('#modalTienda').removeClass('show');
    setTimeout(() => $('#modalTienda').addClass('hidden'), 300);
}

function comprar(tipo) {
   let oro=jugador.oro;
    if(tipo ==='pocionVidaPequeña'){
        if(oro >= 5){
            jugador.oro -=5;
            jugador[tipo] = (jugador[tipo] || 0) + 1; 
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }else if(tipo ==='pocionVidaMediana'){
        if(oro >= 15){
            jugador.oro -=15;
            jugador[tipo] = (jugador[tipo] || 0) + 1; 
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }else if(tipo === 'pocionVidaGrande'){
        if(oro >= 30){
            jugador.oro -=30;
            jugador[tipo] = (jugador[tipo] || 0) + 1; 
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }
    actualizarHUD();
}


function vender(tipo){
    
    if(tipo ==='madera'){
        if(jugador.madera >= 30){
            jugador.oro +=1;
            jugador[tipo] = (jugador[tipo] || 0) - 30; 
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }else if(tipo ==='tablones'){
        if(jugador.tablones >= 15){
            jugador.oro +=5;
            jugador[tipo] = (jugador[tipo] || 0) - 15; 
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }else if(tipo === 'vigas'){
        if(jugador.vigas >= 10){
            jugador.oro +=10;
            jugador[tipo] = (jugador[tipo] || 0) - 10; 
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }else if(tipo === 'peces'){
        if(jugador.peces >= 10){
            jugador.oro +=10;
            jugador[tipo] = (jugador[tipo] || 0) - 30; 
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }else if(tipo === 'pecesVerdes'){
        if(jugador.pecesVerdes >= 15){
            jugador.oro +=5;
            jugador[tipo] = (jugador[tipo] || 0) - 15; 
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }else if(tipo === 'pecesDorados'){
        if(jugador.pecesDorados >= 10){
            jugador.oro +=10;
            jugador[tipo] = (jugador[tipo] || 0) - 10; 
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }else if(tipo === 'carne'){
        if(jugador.carne >= 30){
            jugador.oro +=1;
            jugador[tipo] = (jugador[tipo] || 0) - 30; 
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }else if(tipo === 'carneSeca'){
        if(jugador.carneSeca >= 15){
            jugador.oro +=5;
            jugador[tipo] = (jugador[tipo] || 0) - 15; 
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }
    actualizarHUD();
}
function cerrarErrorCompra() {
    $('#modalErrorCompra').removeClass('show');
    setTimeout(() => $('#modalErrorCompra').addClass('hidden'), 300);

}

function curar(tipo){
    if(tipo ==='pocionVidaPequeña'){
        if(jugador.pocionVidaPequeña > 0){
            jugador[tipo] = (jugador[tipo] || 0) - 1; 
            jugador.hp += 20; 
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }else if(tipo ==='pocionVidaMediana'){
        if(jugador.pocionVidaMediana > 0){
            jugador[tipo] = (jugador[tipo] || 0) - 1; 
            jugador.hp += 40;
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }else if(tipo === 'pocionVidaGrande'){
        if(jugador.pocionVidaGrande > 0){
            jugador[tipo] = (jugador[tipo] || 0) - 1; 
            jugador.hp += 80;
        }else{
            $('#modalErrorCompra').removeClass('hidden').addClass('show');
        }
    }
    actualizarHUD();
}
function guardarProgreso() {
    sessionStorage.setItem('usuario', JSON.stringify(jugador));
}


function log(){
    $('#modalLogCombate').removeClass('hidden').addClass('show');
}

function cerrarLog(){
    $('#modalLogCombate').removeClass('show');
    setTimeout(() => $('#modalLogCombate').addClass('hidden'), 300);
}

setInterval(guardarProgreso, 60000); // Guardar cada minuto
