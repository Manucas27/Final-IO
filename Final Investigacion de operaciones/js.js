let currentMethod = 'sin-probabilidad';

function setActiveMethod(method) {
    currentMethod = method;
    
    // Actualizar botones activos
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Mostrar/ocultar secciones
    document.getElementById('sin-probabilidad-section').style.display = 'none';
    document.getElementById('con-probabilidad-section').style.display = 'none';
    document.getElementById('teoria-juegos-section').style.display = 'none';
    
    document.getElementById(`${method}-section`).style.display = 'block';
    
    // Si volvemos a sin probabilidad, mostramos la tabla existente
    if (method === 'sin-probabilidad' && document.getElementById('tabla-container').innerHTML) {
        document.getElementById('btn-calcular').style.display = 'block';
    }
}

// El resto de las funciones permanecen igual (generarTabla, calcular, calcularProbabilidad, etc.)
// Solo asegúrate de que generarTabla() siga funcionando como antes

function generarTabla() {
    let estados = document.getElementById('estados').value;
    let alternativas = document.getElementById('alternativas').value;
    let container = document.getElementById('tabla-container');
    let botonCalculo = document.querySelector("button[onclick='calcular()']");
    let probabilidadContainer = document.getElementById('probabilidad-container');
    let botonCalculoProbabilidad = document.querySelector("button[onclick='calcularProbabilidad()']");
    
    if (estados > 0 && alternativas > 0) {
        let html = `<table><tr><th>Alternativas</th>`;
        for (let i = 0; i < estados; i++) {
            html += `<th>Estado ${i + 1}</th>`;
        }
        html += `</tr>`;
        
        for (let j = 0; j < alternativas; j++) {
            html += `<tr><td>Alternativa ${j + 1}</td>`;
            for (let i = 0; i < estados; i++) {
                html += `<td><input type='number' class='valores' data-alt='${j}' data-est='${i}'></td>`;
            }
            html += `</tr>`;
        }
        html += `</table>`;
        
        container.innerHTML = html;
        botonCalculo.style.display = "block";
        
        let probHtml = `<h4>Probabilidades</h4><table><tr>`;
        for (let i = 0; i < estados; i++) {
            probHtml += `<th>Estado ${i + 1}</th>`;
        }
        probHtml += `</tr><tr>`;
        for (let i = 0; i < estados; i++) {
            probHtml += `<td><input type='number' class='probabilidades' data-est='${i}' step='0.01' min='0' max='1'></td>`;
        }
        probHtml += `</tr></table>`;
        
        probabilidadContainer.innerHTML = probHtml;
        botonCalculoProbabilidad.style.display = "block";
    }
}

function calcular() {
    let valores = document.querySelectorAll('.valores');
    let matriz = {};
    valores.forEach(input => {
        let alt = input.dataset.alt;
        let est = input.dataset.est;
        if (!matriz[alt]) matriz[alt] = [];
        matriz[alt][est] = parseFloat(input.value) || 0;
    });
    
    let optimista = Object.entries(matriz).map(([alt, vals]) => [alt, Math.max(...vals)]);
    let conservador = Object.entries(matriz).map(([alt, vals]) => [alt, Math.min(...vals)]);
    
    let maximosPorEstado = [];
    for (let i = 0; i < Object.values(matriz)[0].length; i++) {
        maximosPorEstado.push(Math.max(...Object.values(matriz).map(arr => arr[i])));
    }
    
    let arrepentimiento = Object.entries(matriz).map(([alt, vals]) => {
        let arrep = vals.map((v, i) => maximosPorEstado[i] - v);
        return [alt, Math.max(...arrep)];
    });
    
    let resultadoHTML = `<h3>Resultados</h3>`;
    resultadoHTML += generarTablaResultados("Optimista", optimista);
    resultadoHTML += generarTablaResultados("Conservador", conservador);
    resultadoHTML += generarTablaResultados("Máximo Arrepentimiento", arrepentimiento);
    
    document.getElementById('resultados').innerHTML = resultadoHTML;
}

function calcularProbabilidad() {
    let valores = document.querySelectorAll('.valores');
    let probabilidades = document.querySelectorAll('.probabilidades');
    let matriz = {};
    let probs = [];
    
    probabilidades.forEach(input => {
        probs[input.dataset.est] = parseFloat(input.value) || 0;
    });
    
    valores.forEach(input => {
        let alt = input.dataset.alt;
        let est = input.dataset.est;
        if (!matriz[alt]) matriz[alt] = [];
        matriz[alt][est] = parseFloat(input.value) || 0;
    });
    
    let esperados = Object.entries(matriz).map(([alt, vals]) => {
        let valorEsperado = vals.reduce((sum, val, i) => sum + val * probs[i], 0);
        return [alt, valorEsperado];
    });
    
    let resultadoHTML = `<h3>Resultados con Probabilidad</h3>`;
    resultadoHTML += generarTablaResultados("Valor Esperado", esperados);
    document.getElementById('resultados-probabilidad').innerHTML = resultadoHTML;
}

function generarTablaResultados(tipo, datos) {
    let mejorAlternativa = datos.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    let tabla = `<h4>${tipo}</h4><table><tr><th>Alternativa</th><th>Valor</th></tr>`;
    datos.forEach(([alt, val]) => {
        let resaltar = (alt == mejorAlternativa) ? 'style="background-color: #28a745; color: white;"' : '';
        tabla += `<tr ${resaltar}><td>Alternativa ${parseInt(alt) + 1}</td><td>${val}</td></tr>`;
    });
    tabla += `</table>`;
    tabla += `<p><strong>La alternativa sugerida a escoger es: Alternativa ${parseInt(mejorAlternativa) + 1}</strong></p>`;
    return tabla;
}