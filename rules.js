// Base de dados de Limites do Livro 1.5.7 OP RPG
const opDatabase = {
    Combate: {
        1: { maxPP: 2, linha: 9, cone: 12, esfera: 3 },
        2: { maxPP: 6, linha: 15, cone: 15, esfera: 4.5 },
        3: { maxPP: 9, linha: 21, cone: 18, esfera: 6 },
        4: { maxPP: 12, linha: 27, cone: 21, esfera: 7.5 },
        5: { maxPP: 15, linha: 33, cone: 24, esfera: 9 },
        6: { maxPP: 18, linha: 39, cone: 27, esfera: 10.5 },
        7: { maxPP: 21, linha: 45, cone: 30, esfera: 12 }
    },
    Auxiliar: {
        Normal: { maxPP: 15, linha: 33, cone: 24, esfera: 9 }, // Graus 1 a 5
        Desperta: { maxPP: 21, linha: 45, cone: 30, esfera: 12 } // Graus 6 e 7
    }
};

// Listeners para atualizar automaticamente
document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', calculateOPRules);
    el.addEventListener('change', calculateOPRules);
});

function calculateOPRules() {
    // 1. Capturar Dados
    const nome = document.getElementById('nome').value || 'TÉCNICA SEM NOME';
    const grau = parseInt(document.getElementById('grau').value);
    const categoria = document.getElementById('categoria').value;
    const formatoArea = document.getElementById('formatoArea').value;
    const tipoDano = document.getElementById('tipoDano').value;
    const corTema = document.getElementById('corTema').value;
    const isAuxiliar = (categoria === 'Auxiliar');
    let ppBase = parseInt(document.getElementById('ppBase').value) || 0;
    
    // 2. Limites do Grau
    let stats = !isAuxiliar ? opDatabase.Combate[grau] : (grau >= 6 ? opDatabase.Auxiliar.Desperta : opDatabase.Auxiliar.Normal);
    let maxPPPermitido = stats.maxPP;

    if (ppBase > maxPPPermitido) {
        ppBase = maxPPPermitido;
        document.getElementById('ppBase').value = ppBase;
    }

    // 3. CÁLCULO DE CUSTOS (PP)
    let rawCost = ppBase;
    const fonteTecnica = document.getElementById('fonteTecnica').value;

    // Modificadores Positivos Simples
    document.querySelectorAll('.mod[data-type="plus"]:checked').forEach(chk => {
        // Ignorar os críticos aqui para somar manualmente depois com lógica de exclusão
        if(chk.id !== 'chkCrit19' && chk.id !== 'chkCrit18') {
             rawCost += parseInt(chk.value);
        }
    });

    // Lógica Específica de Crítico (Mutuamente Exclusiva)
    const chkCrit19 = document.getElementById('chkCrit19');
    const chkCrit18 = document.getElementById('chkCrit18');
    let crit = 20;

    if (chkCrit18 && chkCrit18.checked) {
        rawCost += 3;
        crit = 18;
    } else if (chkCrit19 && chkCrit19.checked) {
        rawCost += 1;
        crit = 19;
    }
    document.getElementById('outCrit').innerText = `${crit} / x2`;

    document.querySelectorAll('.mod-mult[data-type="plus"]').forEach(inp => {
        rawCost += (parseInt(inp.value) || 0) * parseInt(inp.getAttribute('data-cost'));
    });
    
    // --- Regras Dinâmicas (Adições) ---
    // A Forma Aperfeiçoada só cobra o PP extra se a técnica for de Akuma no Mi!
    if(document.getElementById('chkAperfeicoada').checked && fonteTecnica === 'Akuma') {
        rawCost += Math.floor(grau / 2);
    }
    
    if(document.getElementById('chkRapida').checked) rawCost += grau;
    if(document.getElementById('chkDanoContinuo').checked) rawCost += Math.ceil(grau / 2);
    if(document.getElementById('chkDanoInsistente').checked) rawCost += Math.ceil(grau / 2);
    if(document.getElementById('chkCondArea').checked) rawCost += Math.ceil(grau / 2);

    // Condições: somar PP dos dois dropdowns
    const sel1 = document.getElementById('condicao1');
    const sel2 = document.getElementById('condicao2');
    const ppCond1 = sel1 ? parseInt(sel1.value) || 0 : 0;
    const ppCond2 = sel2 ? parseInt(sel2.value) || 0 : 0;
    rawCost += ppCond1 + ppCond2;
    
    // Correção: Cura Prolongada deve custar metade do grau
    const elCura = document.getElementById('chkCuraProlongada'); 
    if(elCura && elCura.checked) {
         rawCost += Math.ceil(grau / 2);
    }

    // Regra Opcional: Alterar Tipo de Dano
    const tipoDanoPagoSelect = document.getElementById('tipoDanoPago');
    const tipoDanoPago = tipoDanoPagoSelect ? parseInt(tipoDanoPagoSelect.value) : 0;
    
    if(tipoDanoPago === 1) rawCost += 1; // Elementais Físicos
    if(tipoDanoPago === 2) rawCost += Math.max(1, Math.ceil(grau / 2)); // Energia/Psíquico (Min 1)
    if(tipoDanoPago === 3) rawCost += Math.max(1, grau); // Verdadeiro

    // Duração Prolongada (Não se aplica a cura)
    const minProlongados = parseInt(document.getElementById('duracaoProlongada').value) || 0;
    if(minProlongados > 0) rawCost += 4 + ((minProlongados - 1) * 2);

    // --- SOMA NEGATIVA (REDUÇÕES) ---
    let reducoes = 0;
    
    // Modificadores Negativos (Reduções)
    document.querySelectorAll('.mod[data-type="minus"]:checked').forEach(chk => reducoes += parseInt(chk.value));
    
    // IMPORTANTE: Previne que inputs vazios quebrem o cálculo (NaN)
    document.querySelectorAll('.mod-mult[data-type="minus"]').forEach(inp => {
        let val = parseInt(inp.value) || 0;
        let cost = parseInt(inp.getAttribute('data-cost')) || 0;
        reducoes += val * cost;
    });
    
    if(document.getElementById('chkIndomavel').checked) reducoes += grau;
    if(document.getElementById('chkDependente').checked) reducoes += Math.max(1, Math.floor(grau / 2));
    if(document.getElementById('chkDemorada')?.checked) reducoes += 3;
    
    if(document.getElementById('chkNaoOfensiva').checked) {
        reducoes += isAuxiliar ? 1 : 2;
    }

    // A GRANDE REGRA: A Redução Base de Categoria SÓ se aplica a Estilos de Combate!
    if (fonteTecnica === 'Estilo') {
        reducoes += isAuxiliar ? 1 : Math.max(1, Math.floor(grau / 2));
    }

    // CUSTO FINAL
    let custoFinal = rawCost - reducoes;
    
    // Regra de Ouro: O custo mínimo é 1 PP, a menos que a técnica seja truque (0 base, 0 mods)
    // Se houve algum investimento (PP > 0 ou Mods > 0), o custo final nunca pode ser menor que 1.
    const houveInvestimento = (ppBase > 0) || (rawCost > ppBase); 

    if (custoFinal < 1 && houveInvestimento) {
        custoFinal = 1;
    }
    
    // Se realmente for tudo zero
    if (rawCost <= 0) custoFinal = 0;

    // 4. ATUALIZAR UI DO CARD
    // Dados Básicos
    document.getElementById('outNome').innerText = nome;
    document.getElementById('outSub').innerText = isAuxiliar ? "Técnica Auxiliar" : "Técnica de Combate";
    document.getElementById('outGrau').innerText = `${grau}º GRAU`;
    document.getElementById('outCusto').innerText = `${custoFinal} PP`;
    document.getElementById('outOrigem').innerText = document.getElementById('origem')?.value || 'Geral';
    document.getElementById('outPrereq').innerText = document.getElementById('prereq').value || 'Nenhum';
    document.getElementById('outDesc').innerHTML = (document.getElementById('desc').value || '').replace(/\n/g, '<br>');

    // Cálculo do Dano
    let stringDano = "Variável / Nenhum";
    if (ppBase > 0 && !document.getElementById('chkNaoOfensiva').checked) {
        if (isAuxiliar) {
            stringDano = `${ppBase}d10 (Cura) / ${ppBase}d6 (Área)`;
        } else {
            let dado = "d10";
            if (tipoDano === "Unico") dado = (grau >= 6) ? "d12" : "d10";
            if (tipoDano === "UnicoSalvaNenhum") dado = "d10";
            if (tipoDano === "UnicoSalvaMetade") dado = "d8";
            if (tipoDano === "Area") dado = "d6";
            if (tipoDano === "AreaRestrita") dado = "d8";
            if (document.getElementById('chkIndomavel').checked && tipoDano === "Area") dado = "d8";
            stringDano = `${ppBase}${dado}`;
        }
    } else if (document.getElementById('chkNaoOfensiva').checked) {
        stringDano = "Não Causa Dano";
    }
    document.getElementById('outDano').innerText = stringDano;

    // --- Alcance e Ação (ATUALIZADO) ---
    let acaoReq = isAuxiliar ? "Ação Bônus / Reação" : "Ação Poderosa";
    
    // Modificadores que alteram o tempo de ação
    if (!isAuxiliar && document.getElementById('chkRapida') && document.getElementById('chkRapida').checked) {
        acaoReq = "Ação Bônus / Reação";
    }
    // Se for Auxiliar MAS tiver Técnica Demorada, volta para Ação Poderosa
    if (isAuxiliar && document.getElementById('chkDemorada') && document.getElementById('chkDemorada').checked) {
        acaoReq = "Ação Poderosa";
    }
    document.getElementById('outAcao').innerText = acaoReq;

    // Cálculo de Alcance
    let alcanceCalculado = stats ? (stats[formatoArea.toLowerCase()] || 0) : 0;
    alcanceCalculado += (parseInt(document.getElementById('aumentarAlcance').value) || 0) * 6;
    
    // Reduzir Área aplica no alcance para Linha e Cone
    const reduzirAreaVal = parseInt(document.getElementById('reduzirArea')?.value) || 0;
    if (formatoArea === 'Linha') alcanceCalculado -= reduzirAreaVal * 6;
    if (formatoArea === 'Cone') alcanceCalculado -= reduzirAreaVal * 9;
    if (alcanceCalculado < 0) alcanceCalculado = 0;
    
    let textoAlcance = alcanceCalculado === 0 && formatoArea === 'Linha' ? 'Toque' : `${alcanceCalculado}m (${formatoArea})`;
    
    // Extras de geometria
    const modEmpurrao = parseInt(document.getElementById('modEmpurrao')?.value) || 0;
    const modLargura = parseInt(document.getElementById('modLarguraLinha')?.value) || 0;
    const modArea = parseInt(document.getElementById('modAumentarArea')?.value) || 0;
    const modMovimento = parseInt(document.getElementById('modMovimento')?.value) || 0;
    const modVooExtra = parseInt(document.getElementById('modVooExtra')?.value) || 0;
    const modContencao = parseInt(document.getElementById('modContencao')?.value) || 0;
    const modAcerto = parseInt(document.getElementById('modAcerto')?.value) || 0;
    const modDanoFixo = parseInt(document.getElementById('modDanoFixo')?.value) || 0;
    const modCD = parseInt(document.getElementById('modCD')?.value) || 0;

    let extras = [];
    if(modEmpurrao > 0) extras.push(`Empurrão ${modEmpurrao * 1.5}m`);
    if(modLargura > 0) extras.push(`Largura +${modLargura * 1.5}m`);
    // Área: Cone +3m/ponto, Esfera/Cilindro +1,5m/ponto
    if(modArea > 0) {
        const areaGanho = formatoArea === 'Cone' ? modArea * 3 : modArea * 1.5;
        extras.push(`Área +${areaGanho}m`);
    }
    if(modMovimento > 0) extras.push(`Mov. +${modMovimento * 3}m`);
    if(document.getElementById('chkVooBase')?.checked) extras.push('Voo Base');
    if(modVooExtra > 0) extras.push(`Voo +${modVooExtra * 3}m`);
    if(modContencao > 0) extras.push(`Contenção ${modContencao * 2}d8`);
    if(modAcerto > 0) extras.push(`Acerto +${modAcerto}`);
    if(modDanoFixo > 0) extras.push(`Dano Fixo +${modDanoFixo}`);
    if(modCD > 0) extras.push(`CD +${modCD}`);

    if(extras.length > 0) textoAlcance += ' / ' + extras.join(' / ');
    
    document.getElementById('outAlcance').innerText = textoAlcance;

    // Validador Rigoroso de Ataque Combinado
    // Atualizar card de Condições
    const nomeCond1 = sel1 && ppCond1 > 0 ? sel1.options[sel1.selectedIndex].text.replace(/ \(.*\)/, '') : '';
    const nomeCond2 = sel2 && ppCond2 > 0 ? sel2.options[sel2.selectedIndex].text.replace(/ \(.*\)/, '') : '';
    const nomesConds = [nomeCond1, nomeCond2].filter(Boolean);
    const elConds = document.getElementById('outCondicoes');
    if (elConds) {
        elConds.innerText = nomesConds.length > 0 ? nomesConds.join(' | ') : 'Nenhuma';
        elConds.style.color = nomesConds.length > 0 ? '#f1c40f' : '';
    }

    let hasConditions = ppCond1 > 0 || ppCond2 > 0 || document.getElementById('chkCondArea').checked;
    let isNaoOfensiva = document.getElementById('chkNaoOfensiva').checked;
    
    let combinadoPossivel = false;
    if (!isAuxiliar && ppBase > 0 && !hasConditions && !isNaoOfensiva && acaoReq === "Ação Poderosa") {
        if(formatoArea !== 'Esfera') {
            combinadoPossivel = true;
        }
    }
    
    let spanCombinado = document.getElementById('outCombinado');
    spanCombinado.innerText = combinadoPossivel ? "Possível" : "Impossível";
    spanCombinado.style.color = combinadoPossivel ? "#2ecc71" : "#ff6b6b";

    // Atualizar Cores Temáticas
    document.querySelector('.tech-header').style.borderBottomColor = corTema;
    document.querySelector('.tech-grau').style.color = corTema;
    document.querySelector('.tech-stats').style.borderLeftColor = corTema;
    document.querySelectorAll('.stat-item span:first-child').forEach(el => el.style.color = corTema);

    // Validador Final de Custo
    const statusBox = document.getElementById('statusBox');
    if (custoFinal > maxPPPermitido) {
        statusBox.style.display = 'block';
        statusBox.className = 'status-msg msg-error';
        statusBox.innerText = `⚠️ Custo Excedido! Custo final (${custoFinal} PP) passou do limite do ${grau}º Grau (${maxPPPermitido} PP).`;
    } else {
        statusBox.style.display = 'block';
        statusBox.className = 'status-msg msg-ok';
        statusBox.innerHTML = `✅ Técnica Válida! Custo Base (${rawCost}) - Reduções (${reducoes}) = <b>${custoFinal} PP Final</b>.`;
    }

    // UX: Opacidade do box ofensivo se for Auxiliar
    document.getElementById('boxOfensivo').style.opacity = isAuxiliar ? "0.4" : "1";
    document.getElementById('boxOfensivo').style.pointerEvents = isAuxiliar ? "none" : "auto";

    // 5. EFEITOS COLATERAIS no Card
    const colateraisArr = [];

    const lvlExaustao = parseInt(document.getElementById('modExaustiva')?.value) || 0;
    if (lvlExaustao > 0) colateraisArr.push(`+${lvlExaustao} Nível de Exaustão`);

    const minSemPP = parseInt(document.getElementById('modDebilitante')?.value) || 0;
    if (minSemPP > 0) colateraisArr.push(`Sem PP por ${minSemPP} min`);

    const ppColateral = parseInt(document.getElementById('inputColateral')?.value) || 0;
    if (ppColateral > 0) colateraisArr.push(`${ppColateral * 5} de Dano Colateral`);

    if (document.getElementById('chkDependente')?.checked) colateraisArr.push('Dependente');
    if (document.getElementById('chkIndomavel')?.checked) colateraisArr.push('Indomável');
    if (document.getElementById('chkDevoradora')?.checked) colateraisArr.push('Devoradora');
    if (document.getElementById('chkConcentracao')?.checked) colateraisArr.push('Conc. Crucial');
    if (document.getElementById('chkDemorada')?.checked) colateraisArr.push('Demorada');

    const elColaterais = document.getElementById('outColaterais');
    if (elColaterais) {
        if (colateraisArr.length > 0) {
            elColaterais.innerText = colateraisArr.join(' | ');
            elColaterais.style.color = '#ff6b6b';
        } else {
            elColaterais.innerText = 'Nenhum';
            elColaterais.style.color = '';
        }
    }

    // === VISUAIS DINÂMICOS ===

    // 1. Pulso no card
    const card = document.getElementById('cardToExport');
    if (card) {
        card.classList.remove('card-pulse');
        void card.offsetWidth;
        card.classList.add('card-pulse');
    }

    // 2. Cor do custo conforme o valor
    const custoEl = document.getElementById('outCusto');
    if (custoEl) {
        const pp = parseInt(custoEl.innerText) || 0;
        custoEl.className = 'val ' + (pp <= 5 ? 'cost-ok' : pp <= 10 ? 'cost-mid' : pp <= 16 ? 'cost-high' : 'cost-max');
    }

    // 3. Destacar linhas de mod ativas
    document.querySelectorAll('.mod-row').forEach(row => {
        const isReduction = !!row.closest('details')?.querySelector('summary[style*="ff6b6b"]');
        const chk = row.querySelector('input[type="checkbox"]');
        const num = row.querySelector('input[type="number"]');
        const sel = row.querySelector('select.cond-select');
        const isActive = (chk && chk.checked) || (num && parseInt(num.value) > 0) || (sel && parseInt(sel.value) > 0);
        row.classList.toggle('active', isActive && !isReduction);
        row.classList.toggle('active-minus', isActive && isReduction);
    });

    // 4. Badges de contagem nas abas
    document.querySelectorAll('details').forEach(det => {
        const sumEl = det.querySelector('summary');
        let badge = sumEl.querySelector('.mod-badge');
        if (!badge) { badge = document.createElement('span'); badge.className = 'mod-badge'; sumEl.appendChild(badge); }
        let count = 0;
        det.querySelectorAll('input[type="checkbox"]:checked').forEach(() => count++);
        det.querySelectorAll('input[type="number"]').forEach(inp => { if (parseInt(inp.value) > 0) count++; });
        det.querySelectorAll('select.cond-select').forEach(sel => { if (parseInt(sel.value) > 0) count++; });
        badge.textContent = count;
        badge.classList.toggle('visible', count > 0);
    });
}

// SISTEMA DE GRAVAÇÃO (LOCALSTORAGE)
function salvarTecnica() {
    const nome = document.getElementById('nome').value;
    if(!nome || nome === 'TÉCNICA SEM NOME') return alert("Dê um nome à técnica antes de guardar!");
    
    let tecnicas = JSON.parse(localStorage.getItem('op_rpg_tecnicas')) || {};
    
    // Guarda o estado atual de todos os inputs num objeto
    let dados = {};
    document.querySelectorAll('input, select, textarea').forEach(el => {
        if(el.id && el.id !== 'tecnicasSalvas') {
            dados[el.id] = el.type === 'checkbox' ? el.checked : el.value;
        }
    });

    tecnicas[nome] = dados;
    localStorage.setItem('op_rpg_tecnicas', JSON.stringify(tecnicas));
    atualizarDropdownTecnicas();
    alert(`Técnica "${nome}" guardada com sucesso no seu grimório!`);
}

function atualizarDropdownTecnicas() {
    const select = document.getElementById('tecnicasSalvas');
    select.innerHTML = '<option value="">-- Carregar Técnica Guardada --</option>';
    let tecnicas = JSON.parse(localStorage.getItem('op_rpg_tecnicas')) || {};
    
    Object.keys(tecnicas).forEach(nome => {
        let opt = document.createElement('option');
        opt.value = nome;
        opt.innerText = nome;
        select.appendChild(opt);
    });
}

function carregarTecnica() {
    const nomeSelecionado = document.getElementById('tecnicasSalvas').value;
    if(!nomeSelecionado) return;
    
    let tecnicas = JSON.parse(localStorage.getItem('op_rpg_tecnicas')) || {};
    let dados = tecnicas[nomeSelecionado];
    
    if(dados) {
        Object.keys(dados).forEach(id => {
            let el = document.getElementById(id);
            if(el) {
                if(el.type === 'checkbox') el.checked = dados[id];
                else el.value = dados[id];
            }
        });
        calculateOPRules(); // Recalcula a interface
    }
}

function apagarTecnica() {
    const nomeSelecionado = document.getElementById('tecnicasSalvas').value;
    if(!nomeSelecionado) return;
    
    if(confirm(`Tem a certeza que deseja apagar a técnica "${nomeSelecionado}"?`)) {
        let tecnicas = JSON.parse(localStorage.getItem('op_rpg_tecnicas')) || {};
        delete tecnicas[nomeSelecionado];
        localStorage.setItem('op_rpg_tecnicas', JSON.stringify(tecnicas));
        atualizarDropdownTecnicas();
    }
}

// Exportar Imagem
function exportImage() {
    const card = document.getElementById('cardToExport');
    html2canvas(card, { backgroundColor: '#121214', scale: 3, borderRadius: 8 }).then(canvas => {
        const link = document.createElement('a');
        let nomeArquivo = document.getElementById('nome').value.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'tecnica';
        link.download = `${nomeArquivo}_oprpg.png`; link.href = canvas.toDataURL('image/png'); link.click();
    });
}

// Iniciar o sistema
window.onload = () => {
    atualizarDropdownTecnicas();
    calculateOPRules();
};

// --- FUNCIONALIDADES DE APP WEB ---

// 1. Limpar Formulário (Nova Técnica)
function novaTecnica() {
    // Fazer reset aos campos de texto e selects
    document.querySelectorAll('input[type="text"], textarea').forEach(el => el.value = '');
    document.querySelectorAll('input[type="number"]').forEach(el => el.value = el.defaultValue || 0);
    document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
    
    // Desmarcar todas as checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    
    // Repor valores por omissão importantes
    document.getElementById('nome').value = 'Nova Técnica';
    document.getElementById('ppBase').value = 2;
    document.getElementById('corTema').value = '#d93838';
    document.getElementById('prereq').value = 'Nenhum';
    document.getElementById('origem').value = 'Geral';
    
    calculateOPRules();
}

// 2. Exportar Grimório (Backup Seguro)
function exportarBackup() {
    let tecnicas = localStorage.getItem('op_rpg_tecnicas');
    if (!tecnicas || tecnicas === '{}') return alert("Não tem técnicas guardadas para exportar!");
    
    // Criar um ficheiro virtual (Blob)
    let blob = new Blob([tecnicas], {type: "application/json"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Grimorio_OP_RPG.json";
    link.click();
}

// 3. Importar Grimório (Restaurar Backup)
function importarBackup(event) {
    let file = event.target.files[0];
    if (!file) return;
    
    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            // Validar se é um JSON válido
            let jsonObj = JSON.parse(e.target.result); 
            localStorage.setItem('op_rpg_tecnicas', JSON.stringify(jsonObj));
            atualizarDropdownTecnicas();
            alert("Grimório restaurado com sucesso!");
        } catch (err) {
            alert("Erro: O ficheiro selecionado não é um backup válido.");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Limpar o input de ficheiro
}