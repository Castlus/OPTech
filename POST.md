# 📢 Post — Forja de Técnicas

---

## Texto para post (versão completa)

Fiz uma ferramenta web para o **OP RPG 1.5.7** que gera fichas de técnicas de combate e auxiliares automaticamente.

🔗 **Link:** https://castlus.github.io/OPTech

---

### O que ela faz?

Você preenche os campos (nome, grau, efeitos, modificadores) e ela:

✅ **Calcula o custo em PP automaticamente** seguindo as regras do livro — incluindo todas as variações de custo dinâmico, limite por grau, custo mínimo e reduções de categoria.

✅ **Mostra um extrato detalhado do custo** — um "recibo" que explica de onde vem cada ponto. Nada de chegar em 11 PP e não saber o porquê.

✅ **Bloqueia automaticamente modificadores ilegais** — se você selecionar "Múltiplos (Área)", as opções de Crítico e Aumentar Acerto ficam acinzentadas com tooltip explicando a regra. Não dá para errar.

✅ **Geometria de área correta** — os valores de Aumentar/Reduzir Área são os do livro (+3m, −9m Cone, −6m Esfera). Se reduzir demais, o card mostra "Pessoal / Toque" automaticamente.

✅ **Card de exportação em PNG, PNG claro, TXT e Copiar** — o card tem barra de cor temática, badge de origem (🍎/⚔️), barra de progresso de PP e oculta automaticamente campos que não se aplicam à técnica (ex: "Crítico" some em técnicas de Área ou de Cura).

✅ **Grimório local** — salva suas técnicas no navegador (sem servidor, funciona offline). Formas Aperfeiçoadas aparecem agrupadas abaixo da técnica original no dropdown:
```
Gomu Gomu no Pistol
   ↳ Gomu Gomu no Red Hawk
```

✅ **Formas Aperfeiçoadas/Adaptadas** — checkbox que revela o campo de técnica original com autocompletar. Ao selecionar a original, oferece importar os atributos base para começar a evolução.

---

### Como usar

1. Acesse o link
2. Preencha os campos do lado esquerdo
3. O card da direita atualiza em tempo real
4. Salve no grimório e exporte quando quiser

Nenhum cadastro, nenhum servidor, tudo roda no navegador.

---

### Tecnologia

HTML/CSS/JS puro + GitHub Pages. Código aberto em: https://github.com/Castlus/OPTech

---

## Versão curta (para grupos/Discord)

> Fiz um gerador de fichas de técnicas para o **OP RPG 1.5.7**!
> Calcula PP automaticamente, bloqueia modificadores inválidos em tempo real, exporta em PNG/TXT e salva um grimório local com suas técnicas.
> 👉 https://castlus.github.io/OPTech
