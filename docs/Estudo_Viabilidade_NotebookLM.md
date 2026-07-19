# Estudo de Viabilidade Técnica: Automação NotebookLM

**Status:** Planejado / Aceito (Para implementação futura)
**Contexto:** O objetivo é automatizar a geração de mapas mentais em massa utilizando a inteligência artificial do NotebookLM, salvando os resultados diretamente no ecossistema do Google Drive que alimenta este projeto.

## Arquitetura Definida
**Script Python Independente + Google Drive API**
A abordagem escolhida utilizará um script orquestrador em Python (via pacote `notebooklm-py`) acoplado à biblioteca `google-api-python-client`. 

### Por que não via Site/Vercel?
O plano gratuito da Vercel (onde o Markmap Viewer está hospedado) possui um limite estrito de timeout de **10 segundos**. O NotebookLM pode demorar de 15 a 30 segundos para gerar e formatar mapas mentais densos. Se o site fizesse a requisição, ela cairia por tempo limite. O script rodando localmente contorna essa limitação técnica.

## Fluxo de Operação (Alinhado ao Guia de Criação)

Para respeitar as diretrizes de hierarquia e qualidade, o script não operará de forma cega.

### 1. Fase de Planejamento (Plano de Ação Interativo)
- O orquestrador conecta-se à base de conhecimento do NotebookLM.
- Solicita a extração da estrutura do material e sugere um **Plano de Geração** contendo:
  - Assuntos a abordar.
  - Granularidade (divisão em múltiplos mapas, se necessário).
  - Nomenclatura exata (`Número - Mapa Mental - Nome do Assunto.md`).
- **Pausa:** O script exige aprovação humana (`[S/N]`) no terminal antes de gerar arquivos, evitando lixo no Drive.

### 2. Fase de Execução (Geração e Upload)
- Após a validação, o orquestrador itera sobre o plano.
- Envia prompts complexos (injetando regras de CSS/HTML e Frontmatter YAML exigidas pelo Markmap).
- Recebe o código Markdown e faz **upload direto via API** (OAuth2) para a nuvem, desvinculando-se do Google Drive para Desktop.

## Desafios Técnicos Esperados
1. **Instabilidade de Extração:** A ausência de uma API oficial REST do NotebookLM exige web scraping via bibliotecas de terceiros, sujeitas a quebras.
2. **Timeouts de Geração:** Será necessário implementar *retry logic* (tentativas com *exponential backoff*) caso a IA falhe na resposta inicial.
3. **Setup de Credenciais:** Configurar permissões de OAuth Client ID no Google Cloud Console para o script ter autorização de escrita remota no Drive.
