// ==========================================
// 1. ESTRUCTURA: LISTA ENLAZADA (LinkedList)
// ==========================================
class Nodo {
    constructor(codigo, nombre, tramite, numeroTurno) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.tramite = tramite;
        this.numeroTurno = numeroTurno;
        this.estado = "En Espera"; // "En Espera" o "Atendido"
        this.siguiente = null;
    }
}

class ListaEnlazada {
    constructor() {
        this.cabeza = null;
        this.tamano = 0;
    }

    // Agregar nuevo turno al final de la lista
    agregar(codigo, nombre, tramite, numeroTurno) {
        const nuevoNodo = new Nodo(codigo, nombre, tramite, numeroTurno);
        if (!this.cabeza) {
            this.cabeza = nuevoNodo;
        } else {
            let actual = this.cabeza;
            while (actual.siguiente !== null) {
                actual = actual.siguiente;
            }
            actual.siguiente = nuevoNodo;
        }
        this.tamano++;
        return nuevoNodo;
    }

    // Convertir la lista a un arreglo para facilitar su renderizado en HTML
    obtenerTodos() {
        const elementos = [];
        let actual = this.cabeza;
        while (actual !== null) {
            elementos.push(actual);
            actual = actual.siguiente;
        }
        return elementos;
    }
}

// ==========================================
// 2. ESTRUCTURA: PILA (Stack)
// ==========================================
class PilaHistorial {
    constructor() {
        this.items = [];
    }

    // Push: Guardar el último turno atendido
    push(turno) {
        this.items.push(turno);
    }

    // Pop: Revertir / obtener el último turno atendido
    pop() {
        if (this.estaVacia()) return null;
        return this.items.pop();
    }

    estaVacia() {
        return this.items.length === 0;
    }

    obtenerHistorial() {
        return [...this.items].reverse(); // Devolver del más reciente al más antiguo
    }
}

// ==========================================
// 3. BÚSQUEDA LINEAL
// ==========================================
function buscarEstudiantePorCodigo(lista, codigoBuscado) {
    let actual = lista.cabeza;
    while (actual !== null) {
        if (actual.codigo.toLowerCase() === codigoBuscado.toLowerCase()) {
            return actual; // Retorna el nodo encontrado
        }
        actual = actual.siguiente;
    }
    return null; // No encontrado
}

// ==========================================
// LÓGICA DE CONTROL DEL SISTEMA
// ==========================================

const listaRegistros = new ListaEnlazada();
const pilaAtendidos = new PilaHistorial();
let contadorTurnos = 1;

// Referencias a elementos del DOM (HTML)
const formRegistro = document.getElementById('formRegistro');
const btnAtender = document.getElementById('btnAtender');
const btnDeshacer = document.getElementById('btnDeshacer');
const btnBuscar = document.getElementById('btnBuscar');

// Formulario: Registrar nuevo turno
formRegistro.addEventListener('submit', (e) => {
    e.preventDefault();
    const codigo = document.getElementById('codigo').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const tramite = document.getElementById('tramite').value;

    const nuevoTurno = listaRegistros.agregar(codigo, nombre, tramite, contadorTurnos++);
    
    // Limpiar formulario y actualizar vista
    formRegistro.reset();
    actualizarVista();
});

// Botón: Atender turno
btnAtender.addEventListener('click', () => {
    // Buscar el primer estudiante con estado "En Espera"
    let actual = listaRegistros.cabeza;
    let siguienteEnEspera = null;

    while (actual !== null) {
        if (actual.estado === "En Espera") {
            siguienteEnEspera = actual;
            break;
        }
        actual = actual.siguiente;
    }

    if (siguienteEnEspera) {
        siguienteEnEspera.estado = "Atendido";
        pilaAtendidos.push(siguienteEnEspera); // Se guarda en la Pila
        document.getElementById('turnoActual').innerHTML = 
            `<strong>Atendiendo ahora:</strong> Turno #${siguienteEnEspera.numeroTurno} - ${siguienteEnEspera.nombre} (${siguienteEnEspera.tramite})`;
    } else {
        alert("No hay turnos pendientes en la lista.");
    }

    actualizarVista();
});

// Botón: Revertir / Deshacer última atención (Pila)
btnDeshacer.addEventListener('click', () => {
    const ultimoAtendido = pilaAtendidos.pop(); // Pop de la Pila

    if (ultimoAtendido) {
        ultimoAtendido.estado = "En Espera"; // Regresa su estado
        document.getElementById('turnoActual').innerHTML = 
            `<strong>Atención Revertida:</strong> Se devolvió el Turno #${ultimoAtendido.numeroTurno} (${ultimoAtendido.nombre}) a 'En Espera'`;
    } else {
        alert("El historial de atención está vacío. No hay nada que deshacer.");
    }

    actualizarVista();
});

// Botón: Buscar por Código / DNI
btnBuscar.addEventListener('click', () => {
    const codigoBuscado = document.getElementById('inputBuscar').value.trim();
    const resultadoDiv = document.getElementById('resultadoBusqueda');

    if (!codigoBuscado) {
        resultadoDiv.innerHTML = "Por favor ingrese un código o DNI.";
        return;
    }

    const estudiante = buscarEstudiantePorCodigo(listaRegistros, codigoBuscado);

    if (estudiante) {
        resultadoDiv.innerHTML = `
            <strong>Resultado:</strong> Encontrado<br>
            Turno #${estudiante.numeroTurno} | Nombre: ${estudiante.nombre} | Trámite: ${estudiante.tramite} | Estado: <b>${estudiante.estado}</b>
        `;
    } else {
        resultadoDiv.innerHTML = `<span style="color: red;">Estudiante con código "${codigoBuscado}" no encontrado.</span>`;
    }
});

// Función para renderizar y actualizar el HTML
function actualizarVista() {
    // 1. Renderizar Lista Enlazada General
    const ulListaGeneral = document.getElementById('listaGeneral');
    ulListaGeneral.innerHTML = '';
    const todos = listaRegistros.obtenerTodos();

    todos.forEach(turno => {
        const li = document.createElement('li');
        li.textContent = `Turno #${turno.numeroTurno} - ${turno.nombre} [${turno.codigo}] - ${turno.tramite} (${turno.estado})`;
        ulListaGeneral.appendChild(li);
    });

    // 2. Renderizar Pila de Atendidos
    const ulHistorialPila = document.getElementById('historialPila');
    ulHistorialPila.innerHTML = '';
    const historial = pilaAtendidos.obtenerHistorial();

    historial.forEach(turno => {
        const li = document.createElement('li');
        li.textContent = `Turno #${turno.numeroTurno} - ${turno.nombre} (${turno.tramite})`;
        ulHistorialPila.appendChild(li);
    });
}