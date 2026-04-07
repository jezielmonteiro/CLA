# CLA - Sistema de Controle de Licenças Ambientais 🌱 (Versão Beta/Demo)

> ⚠️ **Aviso Importante:** Este repositório é uma versão **Demo/Beta** do sistema CLA. Ele funciona como meu ambiente de desenvolvimento pessoal e área de testes ("sandbox") antes que as alterações sejam enviadas para o repositório oficial da equipe. Por ser o meu ambiente de uso diário, **este repositório contém o código mais atualizado**, incluindo testes recentes, novas funcionalidades e experimentos em andamento.

O **CLA (Controle de Licenças Ambientais)** é um aplicativo móvel desenvolvido para facilitar o gerenciamento, consulta e monitoramento de licenças ambientais. O sistema oferece ferramentas para cadastro, acompanhamento de prazos, geolocalização e captura de evidências em campo.

---

## 🚀 Funcionalidades Atuais (Beta)

* **Autenticação Segura:** Login no sistema com suporte a autenticação biométrica do dispositivo.
* **Gestão de Licenças:** Cadastro, visualização de detalhes e acompanhamento do status das licenças ambientais.
* **Geolocalização (Mapa):** Visualização das licenças e pontos de interesse diretamente no mapa.
* **Captura de Evidências:** Integração com a câmera do dispositivo para anexar fotos de vistorias e documentos.
* **Dashboard e Estatísticas:** Painel para análise rápida da situação das licenças (ativas, vencidas, em análise).
* **Armazenamento Local:** Funcionalidade offline-first com armazenamento de dados essenciais no dispositivo.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando as seguintes tecnologias:

* **React Native / Expo** - Framework para desenvolvimento mobile.
* **JavaScript (ES6+)** - Linguagem principal da aplicação.
* **React Navigation** - Para gerenciamento de rotas e navegação em abas (Bottom Tab Bar).
* **Ferramentas Nativas:** Integração com Câmera, Localização (GPS) e Biometria.

---

## 📁 Estrutura do Projeto

A arquitetura do projeto foi pensada para ser escalável e separar bem as responsabilidades:

* `/assets` - Imagens, ícones da aplicação e splash screen.
* `/src/components` - Componentes visuais reutilizáveis (Header, Cards, BottomTabBar, etc).
* `/src/screens` - Telas principais do aplicativo (Login, Mapa, Formulários, Câmera, Detalhes).
* `/src/hooks` - Hooks customizados para regras de negócio (Geolocalização, Biometria, Licenças).
* `/src/services` - Integração com APIs externas, autenticação e armazenamento.
* `/src/utils` - Funções auxiliares (formatação de datas, status, constantes).

---

## ⚙️ Como rodar esta Demo localmente

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/)
* [Git](https://git-scm.com/)
* Ambiente Expo / React Native configurado.

### Passo a Passo

1. **Clone este repositório Beta**
   ```bash
   git clone [https://github.com/Luann8/CLA-Beta.git](https://github.com/Luann8/CLA-Beta.git)
