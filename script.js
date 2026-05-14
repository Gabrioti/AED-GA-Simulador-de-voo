// Captura dos elementos
const sliders = {
    x: document.getElementById('sliderX'),
    y: document.getElementById('sliderY'),
    z: document.getElementById('sliderZ')
};

const labels = {
    x: document.getElementById('valX'),
    y: document.getElementById('valY'),
    z: document.getElementById('valZ')
};

const vectorDisplay = document.getElementById('vector-display');
const modoSimulacao = document.getElementById('modoSimulacao');

// Variáveis de estado do voo
let posX = 0, posY = 0, posZ = 0;

// Função de animação contínua
function loopSimulador() {
    const axInput = parseFloat(sliders.x.value);
    const ayInput = parseFloat(sliders.y.value);
    const azInput = parseFloat(sliders.z.value);

    // Atualiza os labels numéricos da interface
    labels.x.innerText = axInput.toFixed(1);
    labels.y.innerText = ayInput.toFixed(1);
    labels.z.innerText = azInput.toFixed(1);

    // ==========================================
    // 1. NORMALIZAÇÃO DO CORPO DO AVIÃO (NOVO)
    // ==========================================
    let ax, ay, az;
    const tamanhoFuselagem = 8; // Tamanho fixo que o avião terá na tela
    const magnitudeCorpo = Math.sqrt(axInput*axInput + ayInput*ayInput + azInput*azInput);

    // Trava de segurança: se as alavancas estiverem todas em 0, aponta para o Norte
    if (magnitudeCorpo === 0) {
        ax = tamanhoFuselagem;
        ay = 0;
        az = 0;
    } else {
        // Normaliza a direção e multiplica pelo tamanho fixo desejado
        ax = (axInput / magnitudeCorpo) * tamanhoFuselagem;
        ay = (ayInput / magnitudeCorpo) * tamanhoFuselagem;
        az = (azInput / magnitudeCorpo) * tamanhoFuselagem;
    }

    // ==========================================
    // 2. LÓGICA DE MOVIMENTO
    // ==========================================
    if (modoSimulacao.value === 'voo') {
        // Como o vetor está normalizado, a velocidade será constante!
        const velocidadeVoo = 0.02; 
        posX += ax * velocidadeVoo;
        posY += ay * velocidadeVoo;
        posZ += az * velocidadeVoo;
        vectorDisplay.innerText = `Posição Atual:\n[X:${posX.toFixed(1)}, Y:${posY.toFixed(1)}, Z:${posZ.toFixed(1)}]`;
    } else {
        posX = 0; posY = 0; posZ = 0;
        // Mostramos ao usuário a direção como um vetor unitário (0 a 1)
        vectorDisplay.innerText = `Vetor Direção Unitário:\n[X:${(ax/tamanhoFuselagem).toFixed(2)}, Y:${(ay/tamanhoFuselagem).toFixed(2)}, Z:${(az/tamanhoFuselagem).toFixed(2)}]`;
    }

    // Passa o vetor já normalizado para o gráfico desenhar
    renderFlight(ax, ay, az);
    
    // Agenda o próximo frame
    requestAnimationFrame(loopSimulador);
}

function renderFlight(ax, ay, az) {
    // 1. Fuselagem do Avião (Vetor de Direção Normalizado)
    const traceCorpo = {
        type: 'scatter3d',
        mode: 'lines+markers',
        x: [posX, posX + ax], 
        y: [posY, posY + ay], 
        z: [posZ, posZ + az],
        line: { color: '#00ff41', width: 8 },
        marker: { size: 4, color: '#fff' },
        name: 'Fuselagem'
    };

    // ==========================================
    // 2. CÁLCULO DAS ASAS (Mantém a sua normalização anterior)
    // ==========================================
    let asaX = ay;
    let asaY = -ax;
    let asaZ = 0;
    
    let magnitudeAsa = Math.sqrt(asaX * asaX + asaY * asaY + asaZ * asaZ);
    const envergadura = 5; 
    
    if (magnitudeAsa === 0) {
        asaX = envergadura; 
        asaY = 0;
        asaZ = 0;
    } else {
        asaX = (asaX / magnitudeAsa) * envergadura;
        asaY = (asaY / magnitudeAsa) * envergadura;
        asaZ = (asaZ / magnitudeAsa) * envergadura;
    }

    const centroX = posX + ax / 2;
    const centroY = posY + ay / 2;
    const centroZ = posZ + az / 2;
    
    const traceAsas = {
        type: 'scatter3d',
        mode: 'lines',
        x: [centroX - asaX, centroX + asaX],
        y: [centroY - asaY, centroY + asaY],
        z: [centroZ - asaZ, centroZ + asaZ],
        line: { color: '#ff0055', width: 10 },
        name: 'Asas'
    };

    // Configuração da Câmera Seguidora e Escala
    const margem = 12;
    const layout = {
        paper_bgcolor: '#000',
        plot_bgcolor: '#000',
        showlegend: false,
        scene: {
            xaxis: { range: [posX - margem, posX + margem], color: '#4db8ff', title: 'NORTE/SUL (X)' },
            yaxis: { range: [posY - margem, posY + margem], color: '#4db8ff', title: 'LESTE/OESTE (Y)' },
            zaxis: { range: [posZ - margem, posZ + margem], color: '#4db8ff', title: 'ALTITUDE (Z)' },
            aspectmode: 'cube'
        },
        margin: { l: 0, r: 0, b: 0, t: 0 }
    };

    // Atualiza o gráfico de forma eficiente
    Plotly.react('flight-display', [traceCorpo, traceAsas], layout);
}

// Botão para resetar a posição
resetBtn.addEventListener('click', () => {
    posX = 0; posY = 0; posZ = 0;
});

// Inicia o motor do simulador
requestAnimationFrame(loopSimulador);

//function renderFlight(ax, ay, az) {