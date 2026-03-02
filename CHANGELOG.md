# Changelog — OPTech RPG Technique Builder
**Sessão de desenvolvimento: 01–02 de Março de 2026**

---

## ✨ Novas Funcionalidades

### Criar Arma
- Adicionada mecânica completa de **Criar Arma** (Suporte)
- Custo: 6 PP base (2d8) + 2 PP por d8 adicional (máx. 4d8 = 10 PP)
- Concentração obrigatória e bloqueada visualmente, sem conceder o desconto de -2 PP
- Força Ação Bônus automaticamente
- Exibe dado da arma no card (`Xd8 — Arma Criada`) e custo por turno nos Colaterais

### Dano Adicional
- Nova opção em **Suporte & Lacaios**: `+1 PP / dado, máx 5`
- Disponível exclusivamente para Técnicas Auxiliares (bloqueado para Combate via tooltip)
- Exibe `+Xd (Dano Adicional)` na linha de Alcance do card

### Salvaguarda & Área Restrita como checkboxes
- Substituído o antigo select `tipoDano` (5 opções) por controles compostos:
  - Select `Alvo Único / Múltiplos (Área)`
  - Checkbox **Com Salvaguarda** com sub-select (Nenhum dano / Metade do dano)
  - Checkbox **Área Restrita** — trava modificadores de alcance e área
- Lógica de `tipoDano` derivada internamente; todo o restante do sistema permanece compatível

### Mini-cards de Formas Aperfeiçoadas/Adaptadas
- Ao visualizar uma técnica no card, qualquer técnica salva que a aponte como original aparece como **mini card clicável** logo abaixo
- Cor temática da forma, grau e nome exibidos; clicar carrega a forma no editor

### Extrato de PP no painel do card
- Extrato detalhado (Efeitos Base / Modificadores / Reduções / Total) movido do statusBox do formulário para o **painel lateral do card**
- Sempre visível, sem precisar expandir um `<details>`
- Botão **📋 Copiar** exporta o extrato em texto limpo para o clipboard

### Duração como linha própria no card
- Campo **Duração** agora aparece como stat-item dedicado no card
- Exibe `Instantâneo`, `Até X min`, `Concentração` ou combinações conforme configurado
- Removido da linha de Alcance (onde aparecia como texto extra)

---

## 🔧 Correções e Melhorias de Regras

### Técnica Não Ofensiva
- Corrigido: `ppDano` agora é zerado corretamente no cálculo quando Não Ofensiva está ativa
- "Causar Dano" fica acinzentado e bloqueado ao selecionar Não Ofensiva
- Todos os modificadores incompatíveis bloqueados por tooltip: Crítico, Acerto, Acerto Automático, Cerco, Ataques Múltiplos, Tipo de Dano Pago, Dano Fixo, Dano Contínuo, Dano Insistente

### Dados corretos por tipo de efeito e alvo
- **Cura** e **PV Temporários**: `1d10/PP` (alvo único) → `1d6/PP` (múltiplos/área)
- **Bloquear Dano (Barreira)**: `2d8/PP` (individual) → `1d8/PP` (coletivo/área)
- Bônus de Dano Fixo (`+ N`) removido das linhas de Cura, PV Temp e Bloqueio (era exclusivo de dano)

### Custo mínimo sempre 1 PP
- Custo final calculado como `Math.max(1, rawCost - reducoes)` sem exceções

### Cura Prolongada com área
- Custo de Duração Prolongada para efeitos de Cura já considera o tipo de alvo corretamente

### Contenção de Dano removida
- Removido controle redundante "Contenção de Dano (2d8)" da seção Suporte
- Funcionalidade mantida em **Bloquear Dano (Barreira)** nos Efeitos Base (controle canônico)

---

## 🎨 UX e Interface

### Bloqueios inteligentes por regra
- Sistema `toggleUX` aplicado cirurgicamente a cada modificador com tooltip explicativo
- Linha, Cone/Esfera, Área Restrita, Técnica Auxiliar, Não Ofensiva, Criar Arma — cada combinação bloqueia apenas os controles realmente incompatíveis
- Formas Aperfeiçoadas agrupadas abaixo da técnica-base no dropdown, com indentação `↳`

### Card mais limpo
- Linhas **Pré-requisito**, **Condições** e **Colaterais** ficam ocultas automaticamente quando vazias/`Nenhum`
- Removida a caixa informativa "Duração de uma Técnica" (dispensável após card ter a linha de duração)

### Crítico visível apenas quando aplicável
- Linha **Crítico** aparece só se houver Jogada de Ataque com Dano ativo

### Alcance zerado exibe "Pessoal / Toque"
- Quando Reduzir Área leva o alcance a ≤ 0, o card exibe `Pessoal / Toque` em vez de `0m`

### Tooltip global funcional em mobile e desktop
- Tooltips exibidos via `pointerdown` + posicionamento inteligente (não saem da tela)
- Funciona por toque em mobile sem interferir nos controles

### Exportação TXT e Clipboard
- Exportação de texto e cópia para clipboard respeitam a visibilidade dinâmica dos campos (Crítico, CD, Resistência ocultos quando não aplicáveis)