# ⚒️ Forja de Técnicas — OP RPG 1.5.7

**Gerador de fichas de técnicas para o sistema One Piece RPG 1.5.7**

> Acesse em: **[castlus.github.io/OPTech](https://castlus.github.io/OPTech)**

---

## O que é

A **Forja de Técnicas** é uma ferramenta web para ajudar jogadores e mestres do OP RPG 1.5.7 a construir, calcular e exportar fichas de técnicas de combate e auxiliares. Tudo no navegador, sem cadastro, sem instalação.

---

## Funcionalidades

### ⚙️ Cálculo Automático de PP
- Calcula o custo final em Pontos de Poder com base nos **modificadores do livro** (pág. 236)
- Suporta todos os efeitos base: Dano, Cura, PV Temporários, Dano Bloqueado
- Regras de custo mínimo, limites por grau e categorias (Combate vs Auxiliar) aplicadas automaticamente
- **Extrato detalhado** colapsável que mostra cada item que compõe o custo final (Efeitos Base / Modificadores / Reduções)

### 🗂️ Grimório (Salvar & Carregar)
- Salva técnicas no `localStorage` do navegador — **sem servidores, 100% offline**
- Dropdown de carregamento com **agrupamento visual de Formas Aperfeiçoadas**: a versão evoluída aparece logo abaixo da técnica original com `↳ Nome`
- Permite criar, sobrescrever e excluir técnicas salvas

### 🔀 Formas Aperfeiçoadas / Adaptadas
- Checkbox dedicada que revela o campo "Técnica Original" com autocompletar
- Ao selecionar a original, oferece importar seus atributos como base para a evolução
- Card exibe subtítulo dourado `↳ Forma Aperfeiçoada/Adaptada de: X`

### 🃏 Card de Exportação
- Preview ao vivo da ficha formatada
- Barra de cor temática personalizável no topo
- Título com brilho dinâmico na cor do tema
- Badge de origem (🍎 Akuma no Mi · ⚔️ Estilo de Combate · Geral)
- Barra de progresso de PP (verde → amarelo → vermelho conforme o limite)
- **Ocultação inteligente**: linhas de Crítico, Resistência e CD somem automaticamente quando não se aplicam à técnica

### 📏 Geometria de Área (Regras Corretas)
- Aumentar Área: **+3m** (Cone e Esfera)
- Reduzir Área: **−9m** (Cone) / **−6m** (Esfera)
- Linha não pode ser reduzida — campo bloqueado automaticamente
- Quando a área cai a zero por redução excessiva, exibe **"Pessoal / Toque"** no card

### 🔒 Bloqueios Inteligentes de Regras (UX)
A interface bloqueia e acinzenta automaticamente modificadores inaplicáveis com tooltip explicativo:

| Condição | Modificadores bloqueados |
|---|---|
| Formato ≠ Linha | Aumentar Alcance |
| Formato = Linha | Aumentar Área, Reduzir Área |
| Alvo não é Jogada de Ataque | Aumentar Acerto, Crítico |
| Técnica Auxiliar | Causar Dano, Acerto Automático, Ataque de Cerco, Ataques Múltiplos, Tipo de Dano, Dano Fixo, Técnica Rápida |
| Cura não ativa | Cura Prolongada |
| Dano não ativo | Dano Contínuo, Dano Insistente |
| Sem Salvaguarda | Controle Cirúrgico, Aumentar CD |
| ppTotal = 0 | Técnica Dominada |

### 📤 Exportações
- **PNG escuro** — card como imagem para compartilhar
- **PNG claro** — versão fundo branco para impressão
- **TXT** — exportação em texto formatado (campos ocultos no card também são omitidos no TXT)
- **Copiar** — copia o texto para a área de transferência

---

## Stack

- HTML5 + CSS3 + JavaScript vanilla (sem frameworks)
- `localStorage` para persistência local
- `html2canvas` para exportação de imagem
- Google Fonts (Cinzel, Inter, Oswald)
- Hospedado no **GitHub Pages**

---

## Contribuição

Issues e sugestões são bem-vindas! Abra uma issue ou fork à vontade.

---

*Projeto não oficial. One Piece RPG 1.5.7 é propriedade de seus respectivos autores.*
