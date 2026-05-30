# Passo a Passo: Quais Apps Abrir e O Que Fazer

## Objetivo

Este guia mostra como trabalhar no BankGuard por etapas, indicando qual aplicativo abrir e o que fazer em cada momento.

Use este roteiro quando quiser executar, testar, estudar ou preparar o projeto para o GitHub.

## Apps Que Voce Vai Usar

### 1. Explorador de Arquivos

Para abrir a pasta do projeto e visualizar arquivos.

Pasta do projeto:

```text
C:\Users\Daniel\Documents\Codex\2026-05-29\voc-um-arquiteto-de-software-s\outputs\bankguard
```

### 2. VS Code

Para ler e editar codigo, SQL e documentacao.

Use para abrir:

- `README.md`
- `docs/`
- `database/ddl/`
- `etl/`
- `app/`
- `sql/`

### 3. Docker Desktop

Para subir o PostgreSQL local.

Sem o Docker Desktop aberto, o comando `docker compose up -d` nao funciona.

### 4. Terminal PowerShell

Para executar comandos do projeto.

Use para:

- instalar dependencias;
- subir banco;
- rodar ETL;
- rodar API;
- rodar testes;
- fazer comandos Git.

### 5. Navegador

Para abrir o Swagger da API.

URL principal:

```text
http://localhost:8000/docs
```

### 6. GitHub

Para criar o repositorio online e publicar o projeto.

## Etapa 1: Abrir a Pasta do Projeto

### App

Explorador de Arquivos ou VS Code.

### O que fazer

Abra a pasta:

```text
C:\Users\Daniel\Documents\Codex\2026-05-29\voc-um-arquiteto-de-software-s\outputs\bankguard
```

### O que conferir

Voce deve ver arquivos e pastas como:

```text
README.md
docker-compose.yml
pyproject.toml
app/
data/
database/
docs/
etl/
sql/
tests/
```

### Por que essa etapa existe

Voce precisa saber onde o projeto esta antes de executar comandos ou publicar no GitHub.

## Etapa 2: Abrir o Projeto no VS Code

### App

VS Code.

### O que fazer

No VS Code:

```text
File -> Open Folder -> selecione a pasta bankguard
```

Ou pelo terminal:

```bash
code C:\Users\Daniel\Documents\Codex\2026-05-29\voc-um-arquiteto-de-software-s\outputs\bankguard
```

### O que estudar primeiro

Abra estes arquivos nesta ordem:

1. `README.md`
2. `docs/00-guia-iniciante-passo-a-passo.md`
3. `docs/03-roteiro-de-tarefas.md`
4. `docs/02-modelagem-relacional.md`
5. `docs/04-modelagem-dimensional.md`

### Por que essa etapa existe

Aqui voce entende o projeto antes de rodar tudo. Isso ajuda muito quando precisar explicar o projeto em entrevista.

## Etapa 3: Abrir o Docker Desktop

### App

Docker Desktop.

### O que fazer

Abra o Docker Desktop pelo menu iniciar do Windows.

Espere ele ficar pronto. Normalmente aparece algo como:

```text
Docker Desktop is running
```

### O que conferir

Depois de abrir o Docker Desktop, volte ao PowerShell e rode:

```bash
docker --version
```

Se aparecer a versao do Docker, tudo certo.

### Por que essa etapa existe

O BankGuard usa PostgreSQL em container. O Docker precisa estar aberto para criar esse banco local.

## Etapa 4: Abrir o Terminal na Pasta do Projeto

### App

PowerShell.

### O que fazer

Entre na pasta do projeto:

```bash
cd C:\Users\Daniel\Documents\Codex\2026-05-29\voc-um-arquiteto-de-software-s\outputs\bankguard
```

### O que conferir

Rode:

```bash
dir
```

Voce deve ver o `README.md`, `docker-compose.yml`, `app`, `etl`, `database` e outras pastas.

### Por que essa etapa existe

Todos os comandos precisam ser executados dentro da pasta correta.

## Etapa 5: Subir o PostgreSQL

### App

PowerShell com Docker Desktop aberto.

### O que fazer

Rode:

```bash
docker compose up -d
```

### O que conferir

Rode:

```bash
docker ps
```

Voce deve ver um container parecido com:

```text
bankguard-postgres
```

### Por que essa etapa existe

O PostgreSQL sera o banco onde o ETL vai criar tabelas e carregar os dados.

## Etapa 6: Criar Ambiente Python

### App

PowerShell.

### O que fazer

Rode:

```bash
python -m venv .venv
```

Depois ative o ambiente:

```bash
.venv\Scripts\activate
```

Instale as dependencias:

```bash
pip install -e ".[dev]"
```

### O que conferir

Rode:

```bash
python --version
```

E:

```bash
pip list
```

Procure bibliotecas como:

```text
fastapi
uvicorn
pandas
psycopg
pytest
ruff
```

### Por que essa etapa existe

O ambiente Python isola as bibliotecas do projeto e evita bagunca na instalacao global do computador.

## Etapa 7: Rodar o ETL

### App

PowerShell.

### O que fazer

Rode:

```bash
python -m etl.run_pipeline
```

### O que esse comando faz

Ele:

- cria os schemas no PostgreSQL;
- cria as tabelas operacionais;
- cria as tabelas dimensionais;
- le os CSVs da pasta `data/raw`;
- valida CPF;
- valida transacoes;
- carrega os dados validos;
- registra dados rejeitados em auditoria;
- monta o Data Warehouse.

### O que conferir

Se o comando terminar sem erro, o banco foi carregado.

### Por que essa etapa existe

Essa e uma das partes mais importantes do projeto. Ela mostra Engenharia de Dados na pratica.

## Etapa 8: Rodar a API FastAPI

### App

PowerShell.

### O que fazer

Rode:

```bash
uvicorn app.main:app --reload
```

### O que conferir

O terminal deve mostrar algo parecido com:

```text
Uvicorn running on http://127.0.0.1:8000
```

Deixe esse terminal aberto enquanto testa a API.

### Por que essa etapa existe

A API expoe os dados carregados no banco para consulta via endpoints REST.

## Etapa 9: Abrir o Swagger

### App

Navegador.

### O que fazer

Abra:

```text
http://localhost:8000/docs
```

### O que testar

Teste estes endpoints:

```text
GET /health
GET /clientes
GET /transacoes
GET /estatisticas
GET /fraudes
```

### O que conferir

O endpoint `/health` deve retornar:

```json
{
  "status": "ok",
  "service": "BankGuard"
}
```

### Por que essa etapa existe

O Swagger mostra a API funcionando de forma visual. Isso ajuda muito para demonstrar o projeto.

## Etapa 10: Rodar Testes

### App

PowerShell.

### O que fazer

Abra outro terminal na pasta do projeto e rode:

```bash
pytest -q
```

### O que conferir

Voce deve ver algo parecido com:

```text
5 passed
```

### Por que essa etapa existe

Testes mostram que voce conhece boas praticas e nao depende apenas de testar manualmente.

## Etapa 11: Rodar Lint

### App

PowerShell.

### O que fazer

Rode:

```bash
ruff check .
```

### O que conferir

Resultado esperado:

```text
All checks passed!
```

### Por que essa etapa existe

Lint ajuda a manter o codigo padronizado e profissional.

## Etapa 12: Conferir Git Local

### App

PowerShell.

### O que fazer

Rode:

```bash
git status
```

### O que conferir

O projeto ja possui um commit inicial.

Para ver:

```bash
git log --oneline -1
```

Resultado esperado:

```text
ae33fa1 Create BankGuard MVP
```

### Por que essa etapa existe

Antes de publicar no GitHub, o projeto precisa estar versionado localmente.

## Etapa 13: Criar Repositorio no GitHub

### App

Navegador.

### O que fazer

1. Acesse `https://github.com`.
2. Clique em `New repository`.
3. Nome sugerido:

```text
bankguard
```

4. Deixe como publico, se for usar como portfolio.
5. Nao marque para criar README, `.gitignore` ou license, porque o projeto ja tem arquivos locais.
6. Clique em `Create repository`.

### O que guardar

Copie a URL do repositorio.

Exemplo:

```text
https://github.com/seu-usuario/bankguard.git
```

### Por que essa etapa existe

Essa etapa cria o lugar online onde o projeto sera publicado.

## Etapa 14: Publicar no GitHub

### App

PowerShell.

### O que fazer

Use a URL do seu repositorio:

```bash
git remote add origin https://github.com/seu-usuario/bankguard.git
git push -u origin main
```

### O que conferir

Atualize a pagina do GitHub.

Voce deve ver:

```text
README.md
app/
database/
docs/
etl/
sql/
tests/
```

### Por que essa etapa existe

Agora o projeto esta disponivel para recrutadores e entrevistas.

## Ordem Resumida Para Executar Tudo

```text
1. Abrir VS Code na pasta bankguard
2. Abrir Docker Desktop
3. Abrir PowerShell na pasta bankguard
4. Rodar docker compose up -d
5. Criar e ativar .venv
6. Rodar pip install -e ".[dev]"
7. Rodar python -m etl.run_pipeline
8. Rodar uvicorn app.main:app --reload
9. Abrir http://localhost:8000/docs
10. Rodar pytest -q
11. Rodar ruff check .
12. Criar repositorio no GitHub
13. Rodar git remote add origin ...
14. Rodar git push -u origin main
```

## Se Der Erro

### Erro no Docker

Verifique se o Docker Desktop esta aberto.

### Erro de dependencias Python

Rode novamente:

```bash
pip install -e ".[dev]"
```

### Erro ao conectar no banco

Confira se o container esta rodando:

```bash
docker ps
```

### API abre, mas endpoints de dados dao erro

Provavelmente o ETL ainda nao foi executado.

Rode:

```bash
python -m etl.run_pipeline
```

## O Que Voce Deve Saber Explicar Depois

Ao final, voce deve conseguir explicar:

- Por que abriu Docker Desktop.
- Por que usou PostgreSQL.
- O que o ETL faz.
- O que a API faz.
- O que o Swagger mostra.
- Por que existem testes.
- Por que o projeto esta no GitHub.
