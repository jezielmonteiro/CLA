# Testes de Interface Fim-a-Fim (E2E) com Maestro

Este diretório contém a suíte de testes de interface automatizada para o aplicativo CLA. Os testes são escritos em formato YAML e executados usando a ferramenta de automação **Maestro**.

## 🚀 Pré-requisitos

1. **Instalar o Maestro CLI** (disponível para macOS e Linux):
   ```bash
   curl -FsSL https://get.maestro.mobile.dev | bash
   ```
   Certifique-se de adicionar o executável ao seu `PATH` (geralmente `export PATH="$PATH:$HOME/.maestro/bin"` no seu `.bashrc` ou `.zshrc`).

2. **Emulador ou Dispositivo Físico**:
   - Tenha um emulador Android ou simulador iOS aberto e conectado ao computador.
   - Para verificar se o Maestro reconhece o dispositivo conectado, execute:
     ```bash
     maestro devices
     ```

3. **Aplicativo em Execução**:
   - Os testes padrões estão configurados para rodar usando o **Expo Go** (ID: `host.exp.exponent`).
   - Inicialize o servidor do Expo:
     ```bash
     npm start
     ```
   - Abra o aplicativo no emulador correspondente (pressione `a` para Android ou `i` para iOS no terminal do Expo).

---

## 🛠️ Como Executar os Testes

Você pode executar o fluxo mestre que roda sequencialmente o fluxo completo de Login, Cadastro, Edição e Exclusão:

```bash
maestro test maestro/run_all.yaml
```

Ou executar fluxos individuais:

* **Login e Aceite de Termos**:
  ```bash
  maestro test maestro/login_flow.yaml
  ```
* **Adicionar Licença**:
  ```bash
  maestro test maestro/add_license_flow.yaml
  ```
* **Editar Licença**:
  ```bash
  maestro test maestro/edit_license_flow.yaml
  ```
* **Excluir Licença**:
  ```bash
  maestro test maestro/delete_license_flow.yaml
  ```

---

## ⚙️ Configuração (Build Nativo Standalone / Dev Build)

Se você preferir rodar os testes em um build de desenvolvimento nativo ou em um binário final de produção compilado (`apk`/`app`), você precisará atualizar o identificador do aplicativo.

1. Abra o arquivo [config.yaml](file:///home/luann8/GitHub/CLA-feat-api-jwt-security/maestro/config.yaml).
2. Modifique o `appId` para o package name do seu app (configurado no seu `app.json`):
   ```yaml
   appId: com.seuusuario.cla
   ```
3. Garanta que o binário esteja instalado no emulador antes de iniciar os testes.
