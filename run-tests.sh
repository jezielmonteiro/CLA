#!/bin/bash

# Cores para formatação de saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem Cor

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}         INICIANDO SUÍTE DE TESTES AUTOMATIZADOS (CLA)         ${NC}"
echo -e "${BLUE}================================================================${NC}\n"

# 1. Executa os testes unitários e de componente com Jest
echo -e "${BLUE}[1/2] Executando testes unitários com Jest...${NC}"
npm run test
JEST_RESULT=$?

if [ $JEST_RESULT -eq 0 ]; then
  echo -e "\n${GREEN}✔ Todos os testes unitários do Jest passaram com sucesso!${NC}\n"
else
  echo -e "\n${RED}✘ Falha nos testes unitários do Jest. Corrija-os antes de prosseguir.${NC}\n"
  exit 1
fi

# 2. Executa os testes de interface com Maestro (se disponível)
echo -e "${BLUE}[2/2] Verificando ambiente para testes E2E com Maestro...${NC}"

# Verifica se o Maestro está instalado
if ! command -v maestro &> /dev/null; then
  echo -e "${YELLOW}⚠ Maestro CLI não está instalado no PATH do sistema.${NC}"
  echo -e "Instruções de instalação no arquivo maestro/README.md."
  echo -e "${GREEN}✔ Testes unitários Jest concluídos. Testes do Maestro pulados.${NC}"
  exit 0
fi

# Verifica se há algum emulador ou dispositivo ativo detectado
DEVICES=$(maestro devices 2>/dev/null)
if [ -z "$DEVICES" ] || echo "$DEVICES" | grep -q "No devices found"; then
  echo -e "${YELLOW}⚠ Nenhum dispositivo ou emulador ativo foi detectado pelo Maestro.${NC}"
  echo -e "Abra o emulador e inicie o app no Expo Go para rodar a suíte E2E."
  echo -e "${GREEN}✔ Testes unitários Jest concluídos. Testes do Maestro pulados.${NC}"
  exit 0
fi

echo -e "${GREEN}✔ Dispositivo ativo detectado pelo Maestro. Iniciando testes E2E...${NC}"
maestro test maestro/run_all.yaml
MAESTRO_RESULT=$?

if [ $MAESTRO_RESULT -eq 0 ]; then
  echo -e "\n${GREEN}✔ Todos os testes unitários (Jest) e de interface (Maestro) passaram com sucesso!${NC}\n"
  exit 0
else
  echo -e "\n${RED}✘ Falha em um ou mais fluxos do Maestro E2E.${NC}\n"
  exit 1
fi
