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
    const corTema = document.getElementById('corTema').value;
    const isAuxiliar = (categoria === 'Auxiliar');
    const isNaoOfensiva = document.getElementById('chkNaoOfensiva').checked;
    const isCriarArma  = document.getElementById('chkCriarArma')?.checked || false;

    // --- Derivar tipoDano dos novos controles ---
    const alvoDano    = document.getElementById('alvoDano')?.value || 'Unico';
    const chkSalva    = document.getElementById('chkSalvaguarda')?.checked || false;
    const salvaEfeito = document.getElementById('selSalvaEfeito')?.value || 'Nenhum';
    const isAreaRest  = document.getElementById('chkAreaRestrita')?.checked || false;
    // Visibilidade dos sub-controles
    const rowSalvaEl = document.getElementById('rowSalvaguarda');
    const rowAREl    = document.getElementById('rowAreaRestrita');
    const selSalvaEl = document.getElementById('selSalvaEfeito');
    if (rowSalvaEl) rowSalvaEl.style.display = (alvoDano === 'Unico') ? 'flex' : 'none';
    if (rowAREl)    rowAREl.style.display    = (alvoDano === 'Area')  ? 'flex' : 'none';
    if (selSalvaEl) selSalvaEl.style.display = (alvoDano === 'Unico' && chkSalva) ? '' : 'none';
    // Valor derivado de tipoDano
    let tipoDano;
    if (alvoDano === 'Unico') {
        if (chkSalva && salvaEfeito === 'Metade') tipoDano = 'UnicoSalvaMetade';
        else if (chkSalva)                        tipoDano = 'UnicoSalvaNenhum';
        else                                      tipoDano = 'Unico';
    } else {
        tipoDano = isAreaRest ? 'AreaRestrita' : 'Area';
    }
    const dadosArma    = isCriarArma ? (parseInt(document.getElementById('selDadosArma')?.value) || 2) : 0;
    // Mostrar/ocultar seletor de dados de Criar Arma
    const rowDadosArma = document.getElementById('rowDadosArma');
    if (rowDadosArma) rowDadosArma.style.display = isCriarArma ? 'flex' : 'none';
    // 1. Capturar Dados de PP Base Híbridos
    let ppDano     = parseInt(document.getElementById('ppDano').value)     || 0;
    let ppCura     = parseInt(document.getElementById('ppCura').value)     || 0;
    let ppPVTemp   = parseInt(document.getElementById('ppPVTemp').value)   || 0;
    let ppBloqueio = parseInt(document.getElementById('ppBloqueio').value) || 0;

    // 2. Limites do Grau
    let stats = !isAuxiliar ? opDatabase.Combate[grau] : (grau >= 6 ? opDatabase.Auxiliar.Desperta : opDatabase.Auxiliar.Normal);
    let maxPPPermitido = stats.maxPP;

    // --- REGRA: LIMITES POR GRAU ---
    // 2a. Cada campo de efeito base não pode ultrapassar maxPPPermitido
    ['ppDano','ppCura','ppPVTemp','ppBloqueio'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.max = maxPPPermitido;
        if (parseInt(el.value) > maxPPPermitido) el.value = maxPPPermitido;
    });
    // Relê após clamping
    ppDano     = parseInt(document.getElementById('ppDano').value)     || 0;
    ppCura     = parseInt(document.getElementById('ppCura').value)     || 0;
    ppPVTemp   = parseInt(document.getElementById('ppPVTemp').value)   || 0;
    ppBloqueio = parseInt(document.getElementById('ppBloqueio').value) || 0;

    // Técnica Não Ofensiva / Criar Arma: zera ppDano da calculação (não causa dano direto), mas preserva o valor no campo
    if (isNaoOfensiva || isCriarArma) {
        ppDano = 0;
    }

    // 2b. Mod-mults positivos: máximo = Grau (ou limite fixo do livro, o que for menor)
    document.querySelectorAll('.mod-mult[data-type="plus"]').forEach(inp => {
        let limiteOriginal = inp.getAttribute('data-hard-max');
        if (!limiteOriginal) {
            limiteOriginal = inp.getAttribute('max') || '99';
            inp.setAttribute('data-hard-max', limiteOriginal);
        }
        const limiteFinal = Math.min(grau, parseInt(limiteOriginal));
        inp.max = limiteFinal;
        if (parseInt(inp.value) > limiteFinal) inp.value = limiteFinal;
    });

    let ppTotal = ppDano + ppCura + ppPVTemp + ppBloqueio;

    // 3. CÁLCULO DE CUSTOS (PP)
    let rawCost = ppTotal;
    const fonteTecnica = document.getElementById('fonteTecnica').value;

    // Modificadores Positivos Simples
    document.querySelectorAll('.mod[data-type="plus"]:checked').forEach(chk => {
        // Ignorar os críticos aqui para somar manualmente depois com lógica de exclusão
        if(chk.id !== 'chkCrit19' && chk.id !== 'chkCrit18') {
             rawCost += parseInt(chk.value);
        }
    });

    // Lógica de Crítico via select
    const selCrit = document.getElementById('selCrit');
    const critCost = parseInt(selCrit?.value) || 0;
    let crit = critCost === 3 ? 18 : critCost === 1 ? 19 : 20;
    rawCost += critCost;
    document.getElementById('outCrit').innerText = `${crit} / x2`;

    document.querySelectorAll('.mod-mult[data-type="plus"]').forEach(inp => {
        rawCost += (parseInt(inp.value) || 0) * parseInt(inp.getAttribute('data-cost'));
    });
    
    // --- Regras Dinâmicas (Adições) ---
    // A Forma Aperfeiçoada / Adaptada custa + Metade do Grau em PP
    if(document.getElementById('chkAperfeicoada').checked) {
        rawCost += Math.floor(grau / 2);
    }
    
    if(document.getElementById('chkRapida').checked) rawCost += grau;
    // Criar Arma: 6 PP base (2d8) + 2 PP por d8 adicional (máx. 4d8). Força Concentração sem conceder desconto.
    if (isCriarArma) {
        rawCost += 6 + (dadosArma - 2) * 2;
        const elConc = document.getElementById('chkConcentracao');
        if (elConc) elConc.checked = true;
    }
    if(document.getElementById('chkDanoContinuo').checked) rawCost += Math.ceil(grau / 2);
    if(document.getElementById('chkDanoInsistente').checked) rawCost += Math.ceil(grau / 2);
    // --- Cálculo Rigoroso de Condição em Área ---
    let grauCondicao = grau; // pode ser sobrescrito abaixo
    if (document.getElementById('chkCondArea') && document.getElementById('chkCondArea').checked) {

        // Verifica se a área ou alcance foi modificado
        const areaModificada = (parseInt(document.getElementById('modAumentarArea')?.value) || 0) > 0 || 
                               (parseInt(document.getElementById('reduzirArea')?.value) || 0) > 0 ||
                               (parseInt(document.getElementById('aumentarAlcance')?.value) || 0) > 0;

        if (isAuxiliar || areaModificada) {
            const alcanceReferencia = stats[formatoArea.toLowerCase()] || 0;
            let alcanceFinal = alcanceReferencia;
            
            if (formatoArea === 'Linha') {
                alcanceFinal += (parseInt(document.getElementById('aumentarAlcance')?.value) || 0) * 6;
                // A regra não prevê Reduzir Área para Linha
            } else if (formatoArea === 'Cone') {
                alcanceFinal += (parseInt(document.getElementById('modAumentarArea')?.value) || 0) * 3;
                alcanceFinal -= (parseInt(document.getElementById('reduzirArea')?.value) || 0) * 9;
            } else { // Esfera / Cilindro
                alcanceFinal += (parseInt(document.getElementById('modAumentarArea')?.value) || 0) * 3;
                alcanceFinal -= (parseInt(document.getElementById('reduzirArea')?.value) || 0) * 6;
            }
            if (alcanceFinal < 0) alcanceFinal = 0;

            let grauMaisProximo = 1;
            let menorDiferenca = Infinity;
            for (let g of Object.keys(opDatabase.Combate)) {
                const dif = Math.abs((opDatabase.Combate[g][formatoArea.toLowerCase()] || 0) - alcanceFinal);
                if (dif <= menorDiferenca) {
                    grauMaisProximo = parseInt(g);
                    menorDiferenca = dif;
                }
            }
            grauCondicao = grauMaisProximo;
        }

        if (grauCondicao > 1) {
            rawCost += Math.ceil(grauCondicao / 2);
        }
    }

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

    // Criar Arma: Concentração é obrigatória mas NÃO concede redução de PP
    if (isCriarArma && document.getElementById('chkConcentracao')?.checked) {
        reducoes -= 2;
    }

    // A GRANDE REGRA: A Redução Base de Categoria SÓ se aplica a Estilos de Combate!
    if (fonteTecnica === 'Estilo') {
        reducoes += isAuxiliar ? 1 : Math.max(1, Math.floor(grau / 2));
    }

    // CUSTO FINAL — mínimo sempre 1 PP, sem exceções
    let custoFinal = Math.max(1, rawCost - reducoes);

    // 4. ATUALIZAR UI DO CARD
    // Dados Básicos
    document.getElementById('outNome').innerText = nome;
    document.getElementById('outSub').innerText = isAuxiliar ? "Técnica Auxiliar" : "Técnica de Combate";

    // Mini-cards de Formas Aperfeiçoadas/Adaptadas
    {
        const formasPanel = document.getElementById('formasPanel');
        if (formasPanel) {
            const tecnicasSalvas = JSON.parse(localStorage.getItem('op_rpg_tecnicas')) || {};
            const formas = Object.entries(tecnicasSalvas).filter(([, d]) =>
                d.chkAperfeicoada && (d.nomeTecnicaOriginal || '').trim() === nome.trim()
            );
            formasPanel.innerHTML = '';
            if (formas.length > 0) {
                formasPanel.style.display = 'flex';
                formas.forEach(([formaName, fd]) => {
                    const cor = fd.corTema || '#5c85b3';
                    const grauNum = parseInt(fd.grau) || 1;
                    const div = document.createElement('div');
                    div.className = 'mini-card';
                    div.style.borderColor = cor;
                    div.title = `Carregar: ${formaName}`;
                    div.innerHTML = `<div class="mini-card-grau" style="color:${cor}">${grauNum}º GRAU &mdash; FORMA</div><div class="mini-card-nome">${formaName}</div>`;
                    div.onclick = () => carregarTecnicaPorNome(formaName);
                    formasPanel.appendChild(div);
                });
            } else {
                formasPanel.style.display = 'none';
            }
        }
    }

    const isAperfeicoada = document.getElementById('chkAperfeicoada').checked;
    const nomeOriginal = (document.getElementById('nomeTecnicaOriginal')?.value || '').trim();
    const elOriginal = document.getElementById('outOriginal');
    if (isAperfeicoada && nomeOriginal) {
        elOriginal.innerText = `↳ Forma Aperfeiçoada/Adaptada de: ${nomeOriginal}`;
        elOriginal.style.display = '';
    } else {
        elOriginal.innerText = '';
        elOriginal.style.display = 'none';
    }
    document.getElementById('outGrau').innerText = `${grau}º GRAU`;
    document.getElementById('outCusto').innerText = `${custoFinal} PP`;
    document.getElementById('outOrigem').innerText = document.getElementById('origem')?.value || 'Geral';
    const prereqVal = (document.getElementById('prereq').value || '').trim();
    const prereqVazio = !prereqVal || prereqVal.toLowerCase() === 'nenhum';
    const elPrereq = document.getElementById('outPrereq');
    if (elPrereq) {
        elPrereq.innerText = prereqVazio ? 'Nenhum' : prereqVal;
        elPrereq.parentElement.style.display = prereqVazio ? 'none' : 'flex';
    }
    document.getElementById('outDesc').innerHTML = (document.getElementById('desc').value || '').replace(/\n/g, '<br>');

    // --- Cálculo Híbrido do Efeito Base Visual ---
    let efeitosArr = [];
    const modDanoFixo = parseInt(document.getElementById('modDanoFixo')?.value) || 0;
    const stringBonusDano = modDanoFixo > 0 ? ` + ${modDanoFixo}` : '';
    let dado = "d10";
    if (tipoDano === "Unico") dado = (grau >= 6 && !isAuxiliar) ? "d12" : "d10";
    if (tipoDano === "UnicoSalvaNenhum") dado = "d10";
    if (tipoDano === "UnicoSalvaMetade") dado = "d8";
    if (tipoDano === "Area") dado = "d6";
    if (tipoDano === "AreaRestrita") dado = "d8";
    if (document.getElementById('chkIndomavel').checked && tipoDano === "Area") dado = "d8";

    // Cura e PV Temp: d10 alvo único, d6 múltiplos alvos (área)
    // Bloqueio: 2d8/ponto individual, 1d8/ponto coletivo (área)
    const isMultiplosAlvos = tipoDano === 'Area' || tipoDano === 'AreaRestrita';
    const dadoCura      = isMultiplosAlvos ? 'd6' : 'd10';
    const dadosBloqueio = isMultiplosAlvos ? `${ppBloqueio}d8` : `${ppBloqueio * 2}d8`;

    if (ppDano     > 0 && !isNaoOfensiva) efeitosArr.push(`${ppDano}${dado}${stringBonusDano} (Dano)`);
    if (ppCura     > 0)                   efeitosArr.push(`${ppCura}${dadoCura} (Cura)`);
    if (ppPVTemp   > 0)                   efeitosArr.push(`${ppPVTemp}${dadoCura} (PV Temp)`);
    if (ppBloqueio > 0)                   efeitosArr.push(`${dadosBloqueio} (Bloqueio)`);
    if (isCriarArma)                      efeitosArr.push(`${dadosArma}d8 (Arma Criada)`);

    let stringDano = "Nenhum";
    if (efeitosArr.length > 0) {
        stringDano = efeitosArr.join(' + ');
    } else if (isNaoOfensiva && !isCriarArma) {
        stringDano = "Não Causa Dano";
    }
    document.getElementById('outDano').innerText = stringDano;
    document.getElementById('lblDano').innerText = "Efeito Base:";    

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
    // Criar Arma sempre exige Ação Bônus (obrigatório pela regra)
    if (isCriarArma) acaoReq = "Ação Bônus / Reação";
    document.getElementById('outAcao').innerText = acaoReq;

    // --- Cálculo Visual de Alcance e Área ---
    const inputAumentarAlcance = parseInt(document.getElementById('aumentarAlcance')?.value) || 0;
    const inputAumentarArea   = parseInt(document.getElementById('modAumentarArea')?.value) || 0;
    const inputReduzirArea    = parseInt(document.getElementById('reduzirArea')?.value) || 0;
    const baseAlcance = stats ? (stats[formatoArea.toLowerCase()] || 0) : 0;

    let alcanceFinalVisual = baseAlcance;
    let textoAlcance = '';

    if (formatoArea === 'Pessoal') {
        textoAlcance = 'Pessoal / Toque';
    } else if (formatoArea === 'Linha') {
        alcanceFinalVisual += (inputAumentarAlcance * 6); // Regra não permite redução de comprimento na Linha
        if (alcanceFinalVisual <= 0) {
            alcanceFinalVisual = 0;
            textoAlcance = 'Pessoal / Toque';
        } else {
            textoAlcance = `${alcanceFinalVisual}m de comp. (Linha)`;
        }
    } else if (formatoArea === 'Cone') {
        alcanceFinalVisual += (inputAumentarArea * 3) - (inputReduzirArea * 9);
        if (alcanceFinalVisual <= 0) {
            alcanceFinalVisual = 0;
            textoAlcance = 'Pessoal / Toque';
        } else {
            textoAlcance = `${alcanceFinalVisual}m (Cone)`;
        }
    } else { // Esfera ou Cilindro
        alcanceFinalVisual += (inputAumentarArea * 3) - (inputReduzirArea * 6);
        if (alcanceFinalVisual <= 0) {
            alcanceFinalVisual = 0;
            textoAlcance = 'Pessoal / Toque';
        } else {
            textoAlcance = `${alcanceFinalVisual}m de raio (${formatoArea})`;
        }
    }

    // Extras de mobilidade/suporte na linha de alcance
    const modEmpurrao      = parseInt(document.getElementById('modEmpurrao')?.value) || 0;
    const modMovimento     = parseInt(document.getElementById('modMovimento')?.value) || 0;
    const modVooExtra      = parseInt(document.getElementById('modVooExtra')?.value) || 0;
    const modAcerto        = parseInt(document.getElementById('modAcerto')?.value) || 0;
    const modCDExtraVisual = parseInt(document.getElementById('modAumentarCD')?.value) || 0; // ID Corrigido!
    const minProlongadosCard = parseInt(document.getElementById('duracaoProlongada')?.value) || 0;

    let extras = [];
    if (modEmpurrao  > 0) extras.push(`Empurrão ${modEmpurrao * 1.5}m`);
    if (modMovimento > 0) extras.push(`Mov. +${modMovimento * 3}m`);
    if (document.getElementById('chkVooBase')?.checked) extras.push('Voo Base');
    if (modVooExtra  > 0) extras.push(`Voo +${modVooExtra * 3}m`);
    if (modAcerto    > 0) extras.push(`Acerto +${modAcerto}`);
    if (modCDExtraVisual > 0) extras.push(`CD +${modCDExtraVisual}`);
    const modDadosAdicionais = parseInt(document.getElementById('modDadosAdicionais')?.value) || 0;
    if (modDadosAdicionais > 0) extras.push(`+${modDadosAdicionais}d (Dano Adicional)`);
    if (document.getElementById('chkCuraProlongada')?.checked) extras.push('Cura Prolongada');
    // Obs: Dano Fixo já aparece na linha de Dano Principal (2d10 + 3)

    if (extras.length > 0) textoAlcance += ' / ' + extras.join(' / ');

    document.getElementById('outAlcance').innerText = textoAlcance;

    // Duração no card (linha própria)
    const isConcentracao = document.getElementById('chkConcentracao')?.checked || false;
    const partesDuracao = [];
    if (minProlongadosCard > 0) partesDuracao.push(`Até ${minProlongadosCard} min`);
    if (isConcentracao) partesDuracao.push('Concentração');
    document.getElementById('outDuracao').innerText = partesDuracao.length > 0 ? partesDuracao.join(', ') : 'Instantâneo';

    // --- Cálculo Oficial da CD (pág. 236) e Ocultação Inteligente ---
    const spanCD          = document.getElementById('outCD');
    const spanResistencia = document.getElementById('outResistencia');
    const spanCrit        = document.getElementById('outCrit');
    const testeResistencia = document.getElementById('resistencia')?.value || 'Nenhum';

    // Exige Salva/CD se: é área, tem “Salva” no tipo, tem condições ou Teste de Resistência selecionado
    const exigeSalva = tipoDano.includes('Salva') || tipoDano.includes('Area') ||
                       document.getElementById('chkCondArea')?.checked ||
                       ppCond1 > 0 || ppCond2 > 0 ||
                       testeResistencia !== 'Nenhum';

    if (spanCD && spanResistencia) {
        if (exigeSalva) {
            spanCD.parentElement.style.display = 'flex';
            spanResistencia.parentElement.style.display = 'flex';
            const modAtributo = parseInt(document.getElementById('modAtributo')?.value) || 0;
            const proficiencia = parseInt(document.getElementById('proficiencia')?.value) || 0;
            const modCDExtra  = parseInt(document.getElementById('modAumentarCD')?.value) || 0;
            const cdFinal = 8 + modAtributo + proficiencia + modCDExtra;
            spanCD.innerText = testeResistencia !== 'Nenhum' ? `${cdFinal} (${testeResistencia})` : `${cdFinal} (Definir TR)`;
            spanResistencia.innerText = testeResistencia !== 'Nenhum' ? testeResistencia : 'Definir TR';
        } else {
            spanCD.parentElement.style.display = 'none';
            spanResistencia.parentElement.style.display = 'none';
        }
    }

    // Crítico: só visível em Jogada de Ataque com Dano ativo
    const temDanoAtivo = ppDano > 0 && !isNaoOfensiva && !isAuxiliar;
    if (spanCrit) {
        spanCrit.parentElement.style.display = (tipoDano === 'Unico' && temDanoAtivo) ? 'flex' : 'none';
    }

    // Validador Rigoroso de Ataque Combinado
    // Atualizar card de Condições
    const nomeCond1 = sel1 && ppCond1 > 0 ? sel1.options[sel1.selectedIndex].text.replace(/ \(.*\)/, '') : '';
    const nomeCond2 = sel2 && ppCond2 > 0 ? sel2.options[sel2.selectedIndex].text.replace(/ \(.*\)/, '') : '';
    const nomesConds = [nomeCond1, nomeCond2].filter(Boolean);
    const elConds = document.getElementById('outCondicoes');
    if (elConds) {
        elConds.innerText = nomesConds.length > 0 ? nomesConds.join(' | ') : 'Nenhuma';
        elConds.style.color = nomesConds.length > 0 ? '#f1c40f' : '';
        elConds.parentElement.style.display = nomesConds.length > 0 ? 'flex' : 'none';
    }

    let hasConditions = ppCond1 > 0 || ppCond2 > 0 || document.getElementById('chkCondArea').checked;
    let combinadoPossivel = false;
    if (!isAuxiliar && ppDano > 0 && !hasConditions && !isNaoOfensiva && acaoReq === "Ação Poderosa") {
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
    document.getElementById('outSub').style.color = corTema;
    document.getElementById('cardTopBar').style.background = corTema;
    document.getElementById('outNome').style.textShadow = `0 0 18px ${corTema}99`;

    // Badge de origem
    const badgeEl = document.getElementById('outBadgeOrigem');
    const badgeLabels = { 'Akuma': '🍎 Akuma no Mi', 'Estilo': '⚔️ Estilo de Combate', 'Geral': 'Geral' };
    const badgeColors = { 'Akuma': '#9b59b6', 'Estilo': '#2980b9', 'Geral': '#27ae60' };
    badgeEl.innerText = badgeLabels[fonteTecnica] || fonteTecnica;
    badgeEl.style.background = badgeColors[fonteTecnica] || '#555';

    // Barra de progresso de PP
    const pct = maxPPPermitido > 0 ? Math.min(custoFinal / maxPPPermitido, 1) : 0;
    const barColor = pct < 0.6 ? '#2ecc71' : pct < 0.9 ? '#f1c40f' : '#e74c3c';
    document.getElementById('ppBarFill').style.width = `${pct * 100}%`;
    document.getElementById('ppBarFill').style.background = barColor;
    document.getElementById('ppBarLabel').innerText = `${custoFinal}/${maxPPPermitido}`;

    // Fonte e Fundo personalizados do Card
    const cardFonte = document.getElementById('cardFonte')?.value || 'Cinzel';
    const cardBgColor = document.getElementById('cardBgColor')?.value || '#1a1d28';
    document.getElementById('outNome').style.fontFamily = `'${cardFonte}', serif`;
    document.getElementById('outGrau').style.fontFamily = `'${cardFonte}', serif`;
    document.getElementById('cardToExport').style.background = cardBgColor;

    // --- Extrato Detalhado do Custo ---
    const _eb = [], _em = [], _er = []; // base, modificadores, reduções

    if (ppDano     > 0) _eb.push(`+${ppDano} PP \u2014 Causar Dano`);
    if (ppCura     > 0) _eb.push(`+${ppCura} PP \u2014 Restaurar PV (Cura)`);
    if (ppPVTemp   > 0) _eb.push(`+${ppPVTemp} PP \u2014 PV Tempor\u00e1rios`);
    if (ppBloqueio > 0) _eb.push(`+${ppBloqueio} PP \u2014 Dano Bloqueado`);

    document.querySelectorAll('.mod[data-type="plus"]:checked').forEach(chk => {
        const txt = chk.closest('.mod-row')?.querySelector('label')?.textContent?.trim() || chk.id;
        _em.push(`+${chk.value} PP \u2014 ${txt}`);
    });
    if (critCost > 0) _em.push(`+${critCost} PP \u2014 Margem de Cr\u00edtico (${crit}-20)`);
    document.querySelectorAll('.mod-mult[data-type="plus"]').forEach(inp => {
        const val = parseInt(inp.value) || 0;
        if (val <= 0) return;
        const cost = parseInt(inp.getAttribute('data-cost')) || 1;
        const txt = inp.closest('.mod-row')?.querySelector('label')?.textContent?.trim() || inp.id;
        _em.push(`+${val * cost} PP \u2014 ${txt}`);
    });
    if (ppCond1 > 0) _em.push(`+${ppCond1} PP \u2014 ${sel1.options[sel1.selectedIndex]?.text}`);
    if (ppCond2 > 0) _em.push(`+${ppCond2} PP \u2014 ${sel2.options[sel2.selectedIndex]?.text}`);
    if (document.getElementById('chkAperfeicoada')?.checked)                    _em.push(`+${Math.floor(grau/2)} PP \u2014 Forma Aperfei\u00e7oada/Adaptada`);
    if (document.getElementById('chkRapida')?.checked)                          _em.push(`+${grau} PP \u2014 T\u00e9cnica R\u00e1pida`);
    if (document.getElementById('chkDanoContinuo')?.checked)                    _em.push(`+${Math.ceil(grau/2)} PP \u2014 Dano Cont\u00ednuo`);
    if (document.getElementById('chkDanoInsistente')?.checked)                  _em.push(`+${Math.ceil(grau/2)} PP \u2014 Dano Insistente`);
    if (document.getElementById('chkCuraProlongada')?.checked)                  _em.push(`+${Math.ceil(grau/2)} PP \u2014 Cura Prolongada`);
    if (document.getElementById('chkCondArea')?.checked && grauCondicao > 1)    _em.push(`+${Math.ceil(grauCondicao/2)} PP \u2014 Condi\u00e7\u00e3o em \u00c1rea`);
    if (tipoDanoPago === 1) _em.push(`+1 PP \u2014 Tipo de Dano (Elemental)`);
    if (tipoDanoPago === 2) _em.push(`+${Math.max(1, Math.ceil(grau/2))} PP \u2014 Tipo de Dano (Din\u00e2mico)`);
    if (tipoDanoPago === 3) _em.push(`+${Math.max(1, grau)} PP \u2014 Tipo de Dano (Verdadeiro)`);
    if (minProlongados > 0) _em.push(`+${4 + (minProlongados-1)*2} PP \u2014 Dura\u00e7\u00e3o Prolongada (${minProlongados} min)`);
    if (isCriarArma) _em.push(`+${6 + (dadosArma-2)*2} PP \u2014 Criar Arma (${dadosArma}d8, 2PP/turno)`);

    document.querySelectorAll('.mod[data-type="minus"]:checked').forEach(chk => {
        const txt = chk.closest('.mod-row')?.querySelector('label')?.textContent?.trim() || chk.id;
        _er.push(`\u2212${chk.value} PP \u2014 ${txt}`);
    });
    document.querySelectorAll('.mod-mult[data-type="minus"]').forEach(inp => {
        const val = parseInt(inp.value) || 0;
        if (val <= 0) return;
        const cost = parseInt(inp.getAttribute('data-cost')) || 1;
        const txt = inp.closest('.mod-row')?.querySelector('label')?.textContent?.trim() || inp.id;
        _er.push(`\u2212${val * cost} PP \u2014 ${txt}`);
    });
    if (document.getElementById('chkIndomavel')?.checked)   _er.push(`\u2212${grau} PP \u2014 T\u00e9cnica Indom\u00e1vel`);
    if (document.getElementById('chkDependente')?.checked)  _er.push(`\u2212${Math.max(1,Math.floor(grau/2))} PP \u2014 T\u00e9cnica Dependente`);
    if (document.getElementById('chkDemorada')?.checked)    _er.push(`\u22123 PP \u2014 T\u00e9cnica Demorada`);
    if (document.getElementById('chkNaoOfensiva')?.checked) _er.push(`\u2212${isAuxiliar ? 1 : 2} PP \u2014 T\u00e9cnica N\u00e3o Ofensiva`);
    if (fonteTecnica === 'Estilo') _er.push(`\u2212${isAuxiliar ? 1 : Math.max(1,Math.floor(grau/2))} PP \u2014 Redu\u00e7\u00e3o de Estilo de Combate`);

    const _sec = (title, items, color) => items.length
        ? `<div style="margin-top:5px"><span style="opacity:.6;font-size:10px;text-transform:uppercase;letter-spacing:.5px">${title}</span><br>${items.map(i => `<span style="color:${color}">${i}</span>`).join('<br>')}</div>` : '';

    // Validador Final de Custo
    const statusBox = document.getElementById('statusBox');
    statusBox.style.display = 'block';
    if (custoFinal > maxPPPermitido) {
        statusBox.className = 'status-msg msg-error';
        statusBox.innerHTML = `<div>&#9888;&#65039; <b>Custo Excedido!</b> ${custoFinal} PP &gt; limite de ${maxPPPermitido} PP (${grau}\u00ba Grau)</div>`;
    } else {
        statusBox.className = 'status-msg msg-ok';
        statusBox.innerHTML = `<div>&#9989; <b>T\u00e9cnica V\u00e1lida!</b> ${custoFinal} PP / ${maxPPPermitido} PP m\u00e1x.</div>`;
    }

    // Extrato de PP no painel do card
    const extratoBox = document.getElementById('extratoBox');
    if (extratoBox) {
        extratoBox.innerHTML = _sec('Efeitos Base', _eb, '#7ec8e3')
            + _sec('Modificadores (+)', _em, '#9be09b')
            + _sec('Redu\u00e7\u00f5es (\u2212)', _er, '#ff9e9e')
            + `<div style="margin-top:6px;padding-top:5px;border-top:1px solid rgba(255,255,255,.15)"><b>Total: ${rawCost} \u2212 ${reducoes} = ${custoFinal} PP</b></div>`;
    }

    // Guarda os arrays para uso no copiar
    window._extratoData = { eb: _eb, em: _em, er: _er, rawCost, reducoes, custoFinal };

    // --- UX: Bloqueios Inteligentes de Regras ---
    const isLinha       = formatoArea === 'Linha';
    const isAtaque      = tipoDano === 'Unico';
    const isCombate     = !isAuxiliar;
    const isCuraAtiva   = document.getElementById('chkCura')?.checked || false;
    const isDanoAtivo   = document.getElementById('chkDano')?.checked || false;
    const testeResistenciaAtivo = document.getElementById('resistencia')?.value !== 'Nenhum';
    const temSalvaUX    = tipoDano.includes('Salva') || document.getElementById('chkCondArea')?.checked || testeResistenciaAtivo;

    function toggleUX(id, condicaoValida, tooltipMsg) {
        const el = document.getElementById(id);
        if (!el) return;
        el.disabled = !condicaoValida;
        if (!condicaoValida) {
            if (el.type === 'checkbox') el.checked = false;
            else if (el.type === 'number') el.value = 0;
            else if (el.tagName === 'SELECT') el.selectedIndex = 0;
        }
        const row = el.closest('.mod-row');
        if (row) {
            row.style.opacity = condicaoValida ? '1' : '0.35';
            row.style.cursor  = condicaoValida ? '' : 'not-allowed';
            // Limpa listeners antigos clonando o nó
            if (row._uxClone) { row._uxClone = false; }
            row._uxMsg = condicaoValida ? null : tooltipMsg;
            const stepper = row.querySelector('.stepper');
            if (stepper) stepper.querySelectorAll('button').forEach(btn => btn.disabled = !condicaoValida);
        }
    }

    // 1. Formato da Área (Linha vs Cone/Esfera) + Área Restrita bloqueia aumento de alcance/área
    toggleUX('reduzirArea',      !isLinha && !isAreaRest, 'Reduzir Área não se aplica a Linha; e Área Restrita já tem tamanho fixo');
    toggleUX('aumentarAlcance',   isLinha && !isAreaRest, 'Aplicável apenas ao formato de Linha (e não em Área Restrita)');
    toggleUX('modAumentarArea',  !isLinha && !isAreaRest, 'Use "Aumentar Alcance" para Linha; Área Restrita não pode ter alcance aumentado');

    // 2. Exclusivos de Técnicas de Combate (e incompatíveis com Não Ofensiva / Criar Arma)
    const naoTemDanoDireto = !isNaoOfensiva && !isCriarArma;
    toggleUX('chkDano',       isCombate && !isNaoOfensiva && !isCriarArma, 'Técnicas Auxiliares, Não Ofensivas e Criar Arma não causam dano diretamente');
    toggleUX('chkAcertoAuto', isCombate && naoTemDanoDireto, 'Técnicas Auxiliares / Não Ofensivas / Criar Arma não fazem jogadas de ataque');
    toggleUX('chkCerco',      isCombate && naoTemDanoDireto, 'Técnicas sem dano direto não causam dano a estruturas');
    toggleUX('chkMultiplos',  isCombate && naoTemDanoDireto, 'Técnicas sem dano direto não realizam ataques múltiplos');
    toggleUX('tipoDanoPago',  isCombate && naoTemDanoDireto, 'Técnicas Auxiliares / Não Ofensivas / Criar Arma não causam dano');
    toggleUX('modDanoFixo',   isCombate && naoTemDanoDireto, 'Técnicas sem dano direto não possuem Dano Fixo');
    // Criar Arma: Concentração é obrigatória e fica visualmente bloqueada (checked + cinza), sem dar desconto
    {
        const elConc = document.getElementById('chkConcentracao');
        if (elConc) {
            if (isCriarArma) {
                elConc.checked  = true;
                elConc.disabled = true;
                const row = elConc.closest('.mod-row');
                if (row) { row.style.opacity = '0.5'; row.style.cursor = 'not-allowed'; row.style.pointerEvents = 'none'; }
            } else {
                elConc.disabled = false;
                const row = elConc.closest('.mod-row');
                if (row) { row.style.opacity = ''; row.style.cursor = ''; row.style.pointerEvents = ''; }
            }
        }
    }

    // 3. Exigem Jogada de Ataque (e técnica ofensiva)
    toggleUX('modAcerto', isAtaque && isCombate && naoTemDanoDireto, 'Exige que a técnica faça uma Jogada de Ataque com Dano');
    toggleUX('selCrit',   isAtaque && isCombate && naoTemDanoDireto, 'Exige que a técnica faça uma Jogada de Ataque com Dano');

    // 4. Dependentes do Efeito Base (Cura / Dano)
    toggleUX('chkCuraProlongada', isCuraAtiva,                    'Exige que o Efeito Base "Restaurar PV (Cura)" esteja ativo');
    toggleUX('chkDanoContinuo',   isDanoAtivo && naoTemDanoDireto, 'Exige que o Efeito Base "Causar Dano" esteja ativo (e a técnica não seja Não Ofensiva/Criar Arma)');
    toggleUX('chkDanoInsistente', isDanoAtivo && naoTemDanoDireto, 'Exige que o Efeito Base "Causar Dano" esteja ativo (e a técnica não seja Não Ofensiva/Criar Arma)');

    // 5. Exigem Teste de Resistência / Salvaguarda
    toggleUX('chkCirurgico',  temSalvaUX, 'Controle Cirúrgico exige que a técnica imponha uma Salvaguarda');
    toggleUX('modAumentarCD', temSalvaUX, 'Aumentar CD exige que a técnica imponha uma Salvaguarda');

    // 6. Miscelânea
    toggleUX('chkRapida',          isCombate,   'Técnicas Auxiliares já são usadas como Ação Bônus/Reação');
    toggleUX('chkDominada',        ppTotal > 0,  'Técnica Dominada exige investimento de PP em algum Efeito Base');
    toggleUX('modDadosAdicionais', isAuxiliar,   'Dano Adicional só está disponível para Técnicas Auxiliares');

    // Sincronizar ppDano com o estado final de chkDano (pode ter sido desabilitado por toggleUX)
    {
        const chkDanoEl = document.getElementById('chkDano');
        const ppDanoEl  = document.getElementById('ppDano');
        if (chkDanoEl && ppDanoEl) {
            const danoAtivo = !chkDanoEl.disabled && chkDanoEl.checked;
            ppDanoEl.disabled = !danoAtivo;
            if (!danoAtivo) ppDanoEl.value = 0;
            const stpDano = ppDanoEl.parentElement;
            if (stpDano) {
                stpDano.style.opacity = danoAtivo ? '1' : '.4';
                stpDano.querySelectorAll('button').forEach(btn => btn.disabled = !danoAtivo);
            }
        }
    }

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
    if (isCriarArma) colateraisArr.push('2 PP/turno (Arma Criada)');

    const elColaterais = document.getElementById('outColaterais');
    if (elColaterais) {
        if (colateraisArr.length > 0) {
            elColaterais.innerText = colateraisArr.join(' | ');
            elColaterais.style.color = '#ff6b6b';
            elColaterais.parentElement.style.display = 'flex';
        } else {
            elColaterais.innerText = 'Nenhum';
            elColaterais.style.color = '';
            elColaterais.parentElement.style.display = 'none';
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
    const datalist = document.getElementById('listaTecnicasSalvas');
    select.innerHTML = '<option value="">-- Carregar Técnica Guardada --</option>';
    if (datalist) datalist.innerHTML = '';

    const tecnicas = JSON.parse(localStorage.getItem('op_rpg_tecnicas')) || {};

    // Separar técnicas base e formas alternativas (filhas)
    const baseTechs = [];
    const altTechs  = {}; // { nomePai: [nomeFilha, ...] }

    Object.keys(tecnicas).forEach(nome => {
        const dados = tecnicas[nome];

        // Datalist recebe todas as técnicas (para pesquisa livre)
        if (datalist) {
            const dOpt = document.createElement('option');
            dOpt.value = nome;
            datalist.appendChild(dOpt);
        }

        // Se for Aperfeiçoada/Adaptada E a original existir no grimório → é filha
        if (dados.chkAperfeicoada && dados.nomeTecnicaOriginal && tecnicas[dados.nomeTecnicaOriginal]) {
            if (!altTechs[dados.nomeTecnicaOriginal]) altTechs[dados.nomeTecnicaOriginal] = [];
            altTechs[dados.nomeTecnicaOriginal].push(nome);
        } else {
            baseTechs.push(nome);
        }
    });

    // Montar o select agrupado: base → suas filhas logo abaixo
    baseTechs.sort().forEach(baseName => {
        const opt = document.createElement('option');
        opt.value = baseName;
        opt.innerText = baseName;
        select.appendChild(opt);

        if (altTechs[baseName]) {
            altTechs[baseName].sort().forEach(altName => {
                const optAlt = document.createElement('option');
                optAlt.value = altName;
                optAlt.innerText = `   ↳ ${altName}`;
                select.appendChild(optAlt);
            });
        }
    });
}

function carregarTecnicaPorNome(nomeTec) {
    const tecnicas = JSON.parse(localStorage.getItem('op_rpg_tecnicas')) || {};
    const dados = tecnicas[nomeTec];
    if (!dados) return;
    Object.keys(dados).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.type === 'checkbox') el.checked = dados[id];
            else el.value = dados[id];
        }
    });
    syncEfeitosBase();
    calculateOPRules();
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
        syncEfeitosBase();
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

function exportImageClaro() {
    const card = document.getElementById('cardToExport');
    card.classList.add('card-light');
    html2canvas(card, { backgroundColor: '#f0efe9', scale: 3 }).then(canvas => {
        card.classList.remove('card-light');
        const link = document.createElement('a');
        const nomeArq = (document.getElementById('nome').value || 'tecnica').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${nomeArq}_oprpg_claro.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
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
    document.getElementById('ppDano').value     = 2;
    document.getElementById('ppCura').value     = 0;
    document.getElementById('ppPVTemp').value   = 0;
    document.getElementById('ppBloqueio').value = 0;
    // Repor estado dos efeitos base: só Dano ativo
    document.getElementById('chkDano').checked    = true;
    document.getElementById('chkCura').checked    = false;
    document.getElementById('chkPVTemp').checked  = false;
    document.getElementById('chkBloqueio').checked = false;
    syncEfeitosBase();
    document.getElementById('nomeTecnicaOriginal').value = '';
    toggleOriginalTech();
    document.getElementById('corTema').value = '#d93838';
    document.getElementById('cardBgColor').value = '#1a1d28';
    document.getElementById('cardFonte').value = 'Cinzel';
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

// Sincroniza o estado visual dos steppers dos efeitos base com os checkboxes
function syncEfeitosBase() {
    [['chkCura','ppCura','stpCura'],['chkPVTemp','ppPVTemp','stpPVTemp'],['chkBloqueio','ppBloqueio','stpBloqueio']].forEach(([chkId, inpId, stpId]) => {
        const chk = document.getElementById(chkId);
        const inp = document.getElementById(inpId);
        const stp = document.getElementById(stpId);
        if (!chk || !inp) return;
        const enabled = chk.checked;
        inp.disabled = !enabled;
        if (stp) {
            stp.style.opacity = enabled ? '1' : '.4';
            stp.querySelectorAll('button').forEach(btn => btn.disabled = !enabled);
        }
    });
}

// Efeitos Base: liga/desliga PP via checkbox
function togglePP(inputId, checkbox) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    const enabled = checkbox.checked;
    inp.disabled = !enabled;
    if (!enabled) inp.value = 0;

    // Ativa/desativa os botões e a opacidade do stepper
    const stpId = 'stp' + inputId.replace('pp', '');
    const stp = document.getElementById(stpId);
    if (stp) {
        stp.style.opacity = enabled ? '1' : '.4';
        stp.querySelectorAll('button').forEach(btn => btn.disabled = !enabled);
    }
    calculateOPRules();
}

// Stepper manual para os efeitos base (inline buttons)
function stepPP(inputId, delta) {
    const inp = document.getElementById(inputId);
    if (!inp || inp.disabled) return;
    const min = inp.min !== '' ? parseInt(inp.min) : 0;
    const max = inp.max !== '' ? parseInt(inp.max) : Infinity;
    const cur = parseInt(inp.value) || 0;
    const next = Math.min(max, Math.max(min, cur + delta));
    inp.value = next;
    inp.dispatchEvent(new Event('input', { bubbles: true }));
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

// Importar fonte via URL do Google Fonts
function importarFonte() {
    const url = document.getElementById('fontImportUrl').value.trim();
    if (!url.startsWith('http')) return;
    let existing = document.getElementById('dynamicFontLink');
    if (existing) existing.remove();
    const match = url.match(/family=([^:&]+)/);
    if (!match) return;
    const familyName = decodeURIComponent(match[1]).replace(/\+/g, ' ').split(':')[0];
    let link = document.createElement('link');
    link.id = 'dynamicFontLink';
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
    const select = document.getElementById('cardFonte');
    if (!Array.from(select.options).some(o => o.value === familyName)) {
        let opt = document.createElement('option');
        opt.value = familyName;
        opt.text = `${familyName} (Importada)`;
        select.appendChild(opt);
    }
    select.value = familyName;
    calculateOPRules();
}

// Forma Aperfeiçoada/Adaptada
function toggleOriginalTech() {
    const isChecked = document.getElementById('chkAperfeicoada').checked;
    const div = document.getElementById('divTecnicaOriginal');
    div.style.display = isChecked ? 'flex' : 'none';
    calculateOPRules();
}

// Puxar os dados da técnica original para facilitar a evolução
let _importBaseGuard = false;
function importarEstatisticasDaBase(nomeBase) {
    if (!nomeBase || _importBaseGuard) return;
    let tecnicas = JSON.parse(localStorage.getItem('op_rpg_tecnicas')) || {};
    let dados = tecnicas[nomeBase];
    if (!dados) return;
    _importBaseGuard = true;
    setTimeout(() => { _importBaseGuard = false; }, 600);
    if (confirm(`Deseja carregar os atributos base de "${nomeBase}" para começar a sua Forma Aperfeiçoada/Adaptada?\n\n(O seu Nome Atual, Grau e a marcação de Forma Aperfeiçoada não serão alterados).`)) {
        const protegidos = new Set(['nome', 'grau', 'chkAperfeicoada', 'nomeTecnicaOriginal', 'tecnicasSalvas']);
        Object.keys(dados).forEach(id => {
            if (protegidos.has(id)) return;
            let el = document.getElementById(id);
            if (el) {
                if (el.type === 'checkbox') el.checked = dados[id];
                else el.value = dados[id];
            }
        });
        syncEfeitosBase();
        calculateOPRules();
    }
}

// --- EXPORTAÇÕES ADICIONAIS ---
function _buildCardText() {
    const sep = '══════════════════════════════════';
    const nome = document.getElementById('outNome').innerText;
    const sub  = document.getElementById('outSub').innerText;
    const orig = document.getElementById('outOriginal').innerText;
    const grau = document.getElementById('outGrau').innerText;
    const _vis = id => {
        const el = document.getElementById(id);
        return el && el.parentElement.style.display !== 'none';
    };
    const stats = [
        ['Custo',          document.getElementById('outCusto').innerText],
        [document.getElementById('lblDano').innerText, document.getElementById('outDano').innerText],
        ['Requisito',      document.getElementById('outAcao').innerText],
        ['Alcance',        document.getElementById('outAlcance').innerText],
        ['Origem',         document.getElementById('outOrigem').innerText],
        ['Pré-requisito',  document.getElementById('outPrereq').innerText],
        _vis('outCrit')        ? ['Crítico',        document.getElementById('outCrit').innerText]        : null,
        ['Atq. Combinado', document.getElementById('outCombinado').innerText],
        _vis('outResistencia') ? ['Resistência',    document.getElementById('outResistencia').innerText] : null,
        _vis('outCD')          ? ['Dif. CD',        document.getElementById('outCD').innerText]          : null,
        ['Condições',      document.getElementById('outCondicoes').innerText],
        ['Colaterais',     document.getElementById('outColaterais').innerText],
    ].filter(row => row && row[1] && row[1] !== '-').map(([l, v]) => `  ${(l + ':').padEnd(16)} ${v}`);
    const desc = document.getElementById('outDesc').innerText;
    return [
        sep, `  ${nome}  ·  ${grau}`, `  ${sub}`,
        orig ? `  ${orig}` : null,
        sep, ...stats, sep, '', 'DESCRIÇÃO:', desc, '',
        sep, '[Gerado por Forja de Técnicas · OP RPG 1.5.7]'
    ].filter(l => l !== null).join('\n');
}

function exportarTXT() {
    const texto = _buildCardText();
    const blob = new Blob([texto], {type: 'text/plain;charset=utf-8'});
    const link = document.createElement('a');
    const nomeArq = (document.getElementById('nome').value || 'tecnica').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.href = URL.createObjectURL(blob);
    link.download = `${nomeArq}_oprpg.txt`;
    link.click();
}

function copiarParaClipboard() {
    const texto = _buildCardText();
    navigator.clipboard.writeText(texto).then(() => {
        const btn = document.getElementById('btnCopiar');
        const orig = btn.innerText;
        btn.innerText = '✓ Copiado!';
        btn.style.background = '#27ae60';
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 2200);
    }).catch(() => alert('Erro ao copiar. Use PNG ou TXT.'));
}

function copiarExtrato(btn) {
    const d = window._extratoData;
    if (!d) return;
    const sep = '─'.repeat(30);
    const lines = [sep, '  EXTRATO DE PP', sep];
    if (d.eb.length) { lines.push('Efeitos Base:');   d.eb.forEach(l => lines.push('  ' + l)); }
    if (d.em.length) { lines.push('Modificadores (+):'); d.em.forEach(l => lines.push('  ' + l)); }
    if (d.er.length) { lines.push('Reduções (−):');   d.er.forEach(l => lines.push('  ' + l)); }
    lines.push(sep);
    lines.push(`Total: ${d.rawCost} − ${d.reducoes} = ${d.custoFinal} PP`);
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
        const orig = btn.innerText;
        btn.innerText = '✓ Copiado!';
        btn.style.background = '#27ae60';
        btn.style.color = '#fff';
        btn.style.borderColor = '#27ae60';
        setTimeout(() => { btn.innerText = orig; btn.style.background = ''; btn.style.color = ''; btn.style.borderColor = ''; }, 2200);
    }).catch(() => alert('Erro ao copiar.'));
}

// Inicializa o estado da UI no carregamento da página
calculateOPRules();