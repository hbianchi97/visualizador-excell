# Spreadsheet Visualizer 📊

> **"Transformando planilhas complexas em oportunidades claras."**

Este projeto nasceu de uma necessidade real: ajudar minha mãe a navegar pelas complexas e densas listas de imóveis de leilão da Caixa Econômica Federal. O que antes era uma planilha de Excel interminável e difícil de ler, agora é uma interface visual, limpa e intuitiva.

## 🎯 O Problema
As planilhas de leilão (especialmente da Caixa) contêm milhares de linhas, dados desformatados e colunas misturadas. Para quem busca um imóvel, filtrar por **Cidade**, **Bairro** ou **Preço** nessas listas é uma tarefa exaustiva e propensa a erros.

## 💡 A Solução
O **Spreadsheet Visualizer** é uma aplicação web moderna que aceita o arquivo original (`.xlsx`, `.xls` ou `.csv`) e o transforma instantaneamente em um catálogo de cartões interativos.

### Funcionalidades Principais:
- **Filtragem Inteligente**:
  - Selecione a **Cidade**, e o sistema automaticamente:
    - Filtra a lista de imóveis.
    - Libera apenas os **Bairros** existentes naquela cidade.
    - Ajusta os **Sliders de Preço** para o mínimo e máximo da região (nada de filtrar de R$0 a R$10 milhões se os imóveis da cidade custam entre R$150k e R$300k).
- **Leitura Robusta**: Lógica avançada para ignorar linhas de cabeçalho inúteis (metadados) e focar apenas nos dados reais.
- **Visualização Clara**:
  - Preços formatados em Real (R$ 150.000,00).
  - Descontos destacados em vermelho (ex: **40% OFF**).
  - Preview de imagens e link direto para o edital.
- **Layout Responsivo**: Design limpo que não quebra mesmo com nomes de cidades gigantescos.

## 🚀 Como Usar (Testes e Validação)

### Pré-requisitos
- Node.js instalado.

### Passo a Passo
1.  **Instalação**:
    ```bash
    npm install
    ```
2.  **Rodar o Projeto**:
    ```bash
    npm run dev
    ```
3.  **Acessar**:
    Abra `http://localhost:3000` no seu navegador.
4.  **Carregar Arquivo**:
    Arraste sua planilha (ex: `Lista_imoveis_RJ.csv`) para a área de upload.

## 🛠️ Tecnologias Utilizadas
- **Next.js 14**: Framework React para performance e renderização.
- **XLSX / SheetJS**: Para processamento robusto de arquivos Excel e CSV.
- **CSS Modules**: Estilização modular e segura.
- **Lucide React**: Ícones leves e consistentes.

## ❤️ Dedicatória
Projeto desenvolvido com carinho para simplificar a vida de quem investe tempo buscando o imóvel dos sonhos em meio a dados brutos.

---
*Desenvolvido em 2025.*
