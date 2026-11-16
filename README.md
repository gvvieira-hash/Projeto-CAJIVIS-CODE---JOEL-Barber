<div align="center">
<img width="400" height="400" alt="image" src="Logotipo_barbearia_profissional_cinza_e_vermelho-removebg-preview.png" />
</div>



<h1 align="center">  💈 Joel Barber - Sistema de Agendamento para Barbearia </h1>

## 👥 Equipe:

- Carlos Pablo
- Deivisson Rocha
- Guilherme Vieira
- Saulo Farias

## 👓 Docente:

Jessica Arnaut Prado Machado


## 💛🤍 Joel Barber

Joel Barber é o nome dado pela equipe à plataforma que irá solucionar os problemas do barbeiro Joel Posidoni. Ela recebe seu nome em homenagem ao próprio profissional que inspirou o projeto, unindo sua identidade à modernidade e praticidade do serviço de barbearia.


## 🔍 Problema e introdução:

A barbearia de Joel Posidoni, em Camaçari  sofrem com o problema de realizar seus agendamentos manualmente, o que faz o responsável pelos agendamentos perder o tempo em que poderia estar realizando uma atividade de lazer ou trabalhando em sua barbearia, ela realiza seus agendamentos por meio de um caderno físico no qual o proprietário da barbearia o utilizar para realizar a gestão dos seus agendamentos, com isso, Joel sofre com inúmeros furos na agenda e dificuldade em organizar as respectivas datas e horários dos seus clientes, contudo, a utilização do caderno não oferece o mais importante, a simplificação do processo de agendamento para os clientes e gestão desses para o dono da barbearia.

> 💡 **Nosso propósito:** Ajudar quem cuida de nós. Para a equipe, ir à barbearia é uma experiência que vai além de uma simples mudança no visual — representa renovação da autoestima e aumento na produtividade de cada indivíduo.

## 📌 Sobre o Projeto

Este é um projeto do  Trabalho de Conclusão de Curso (TCC) de estudantes de Técnico em Informática para a Internet do SENAI Bahia. O **Joel Barber** é uma plataforma web moderna desenvolvida para facilitar o agendamento de horários na barbearia de Joel Posidoni em Camaçari-BA. O projeto foi criado com foco em experiência do usuário, design profissional e navegação intuitiva. A plataforma permite que clientes escolham serviços, barbeiros, datas e horários disponíveis de forma rápida e prática.

---


## 🚀 Funcionalidades

### 👤 Área do Cliente
* ✅ **Cadastro e Autenticação:** Criação de conta, login de usuário e fluxo de recuperação de senha.
* ✅ **Agendamento em Etapas:** Fluxo guiado com escolha de múltiplos serviços, seleção do barbeiro, definição de data/horário e página de confirmação dinâmica.
* ✅ **Persistência de Etapas (`LocalStorage`):** Salvamento automático das escolhas durante a navegação entre os passos do agendamento para evitar perda de dados.
* ✅ **Catálogo de Produtos e Serviços:** Visualização dos cortes, serviços e produtos disponíveis na barbearia.
* ✅ **Negociação via WhatsApp:** Redirecionamento direto do catálogo de produtos para o WhatsApp da barbearia, facilitando o contato e o fechamento da compra.
* ✅ **Avaliação da Barbearia:** Espaço para clientes avaliarem o atendimento e a experiência.
* ✅ **Interface Responsiva:** Layout adaptado para uso fluido tanto em celulares quanto em computadores.

### 🔐 Painel Administrativo (Gestão da Barbearia)
* ✅ **Acesso Restrito:** Autenticação exclusiva para o proprietário gerenciar o sistema com segurança.
* ✅ **Controle de Agendamentos:** Visualização e gerenciamento completo da agenda de horários marcados (substituindo o controle manual em caderno).
* ✅ **Gestão de Clientes:** Consulta e acompanhamento dos clientes cadastrados na plataforma.
* ✅ **Gerenciamento de Produtos e Serviços:** Cadastro, edição e remoção de serviços oferecidos e produtos da barbearia.
* ✅ **Gestão de Barbeiros:** Controle da equipe disponível para atendimento na agenda.

  
---

## 🛠️ Tecnologias Utilizadas

### 🎨 Front-end
* **HTML5 & CSS3:** Estruturação semântica e estilização responsiva das páginas.
* **JavaScript (ES6+):** Interatividade, manipulação do DOM, consumo da API (`Fetch API`) e persistência de etapas com `LocalStorage`.
* **Google Fonts & Font Awesome:** Tipografia personalizada e biblioteca de ícones da interface.

### ⚙️ Back-end & Banco de Dados
* **Node.js:** Ambiente de execução JavaScript no lado do servidor.
* **Express:** Framework web utilizado para criação do servidor, gerenciamento de rotas, API REST e controle de arquivos estáticos (arquitetura MVC).
* **Prisma ORM & Prisma Studio:** Modelagem do banco de dados, execução de consultas (CRUD) e visualização administrativa dos registros.
* **MySQL:** Sistema de gerenciamento de banco de dados relacional.
* **CORS & Dotenv:** Liberação de comunicação entre front-end e API e gerenciamento seguro de variáveis de ambiente (credenciais do banco).
* **Bcrypt / JWT:** Criptografia de senhas e controle de autenticação/sessão para usuários e painel administrativo.

### 🔧 Ferramentas & Versionamento
* **Git & GitHub:** Controle de versão, colaboração em equipe e hospedagem do código-fonte.
* **GitHub Pages:** Hospedagem e disponibilização visual do front-end.
* **VS Code:** Ambiente de desenvolvimento integrado (IDE).
* **Thunder Client:** Testes e validação das requisições e rotas da API.
* **MySQL Workbench:** Administração e modelagem visual do banco de dados.

---

## 🎨 Layout e Interface

O sistema foi projetado com foco na experiência do utilizador (UX/UI) e na identidade visual da barbearia, apresentando:

* **Identidade Visual Moderna:** Tema escuro (*Dark Mode*) elegante alinhado à estética clássica de barbearia.
* **Navegação Intuitiva:** Cards interativos e fluxo guiado por etapas, facilitando o agendamento rápido mesmo para utilizadores menos experientes.
* **Micro-interações e Responsividade:** Transições suaves e adaptação completa para dispositivos móveis e computadores.

---

# 📂 Estrutura do Projeto

```
📁 projeto-barbearia
 ┣ 📁 home
 ┣ 📁 agendamento1
 ┣ 📁 agendamento2
 ┣ 📁 agendamento3
 ┣ 📁 agendamento4
 ┣ 📁 produtos
 ┣ 📁 fila_de_espera
 ┣ 📁 servicos
 ┣ 📄 index.html
 ┣ 📄 style.css
 ┗ 📄 script.js
```

---

## ⚙️ Como Executar o Projeto Localmente

### 📋 Pré-requisitos
Antes de começar, você precisará ter instalado em sua máquina:
* [Node.js](https://nodejs.org/)
* [MySQL](https://www.mysql.com/) (MySQL Server / Workbench)
* [Git](https://git-scm.com/)

---


### 🚀 Passo a passo

1. **Baixe o zip do repositório:**
 Na página inicial do repositório, clique em "Code", em seguida, "Download ZIP". Aguarde a pasta compactada ser baixada, retire a pasta que está dentro do zip e coloque no lugar que preferir do seu explorador de arquivos..

2. **Abra a pasta no VS Code (Ambiente de Desenvolvimento)

 Na página inicial do VS Code, clique em "Open Folder" e procure a pasta em seu explorador de arquivos e abra ela no seu ambiente de desenvolvimento.

  <img width="565" height="557" alt="image" src="https://github.com/user-attachments/assets/37812333-494e-4393-97b9-0fe08c3af000" />
  
3. ** Instale as dependências do projeto:**

 No terminal do VS code, selecione a opção "Bash" e execute o comando:

   ```bash
  npm install
  ```

4. **Configure as variáveis de ambiente:**
  Crie um arquivo chamado .env na raiz do projeto (com base em seu banco MySQL local) e adicione a string de conexão:

  ```.env
  DATABASE_URL="mysql://usuario:senha@localhost:PORT/joel_barber"  // Substitua usuario, senha e o nome do banco conforme a configuração do seu MySQL
  PORT=3000 // Porta de conexão com o banco de dados, caso alterado, é necessário a alteração na URL do banco
  ```
  
5. **Configure o banco de dados com o Prisma:**

  Execute os comandos abaixo para gerar o Prisma Client e criar as tabelas no MySQL:

  ```Bash
 npx prisma generate
 npx prisma migrate dev
 ```

6. **Inicie o servidor:**
  
  Execute o seguinte comando no terminal Bash:

  ```Bash
 npm run dev
 ```

7. **Execute o index.html com a extensão LiveServer:**

  Clique com o botão direito do mouse em cima do arquivo index.html, em seguida, clique em "Open with Live Server"
---

# 📱 Responsividade

O sistema foi desenvolvido para funcionar em:

* Computadores
* Tablets
* Smartphones

---

# 💡 Futuras Melhorias

* Sistema de pagamento
* Notificações em tempo real

---

# 👨‍💻 Desenvolvedor

Projeto desenvolvido por **Deivisson, Carlos Pablo, Guilherme Vieira e Saulo Farias**.

---

# 📄 Licença

<p align="center">
  <small>© Copyright 2026  <strong>JOEL BARBER</strong> — Joel Barber. Todos os direitos reservados.</small>
</p>



## 🔐 Gestão da Barbearia (Clientes, Barbeiros e Produtos)

1. Certifique-se de que as tabelas do banco `joel_barber` estejam atualizadas (via `npx prisma migrate dev` ou executando o script `sql/05_produtos.sql` no MySQL Workbench, caso utilize carga manual).
2. No terminal do VS Code, dentro da pasta do projeto, inicie o servidor com `npm run dev` (ou `npm start`, reiniciando-o caso já esteja em execução).
3. Acesse o painel administrativo e navegue pelas abas **Clientes**, **Barbeiros** e **Produtos**.
4. Na aba **Produtos**, utilize a opção **Adicionar produto**. Todos os produtos marcados como ativos passam a ser exibidos automaticamente para os clientes na página `produtos/index-produto.html`.

> 💻​ **Nota sobre ambiente local e produção:** Por padrão, o painel consome a API em `http://localhost:3000`. Para funcionamento público via GitHub Pages, o back-end também deve estar hospedado em um servidor acessível na internet, já que `localhost` opera apenas na máquina onde o servidor Node.js está rodando.

> ⚠️​ **Segurança:** O arquivo `.env` com as credenciais do banco de dados não é versionado no repositório (listado no `.gitignore`). Mantenha seu `.env` apenas localmente e nunca o envie para o GitHub.
