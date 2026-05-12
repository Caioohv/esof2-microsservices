# UML — High-Ticket Showcase

Documentação de diagramas e arquitetura do sistema de microsserviços.

## Arquivos

| Arquivo | Tipo | Conteúdo |
|---|---|---|
| `caso-de-uso.puml` | PlantUML | Diagrama de caso de uso |
| `classes.puml` | PlantUML | Diagrama de classes |
| `sequencia-login.puml` | PlantUML | Sequência: login e refresh token |
| `sequencia-agendamento.puml` | PlantUML | Sequência: agendamento de visita |
| `sequencia-pagamento.puml` | PlantUML | Sequência: assinatura de plano (Stripe) |
| `microsservicos.md` | Markdown | Definição de cada microsserviço |
| `comunicacao.md` | Markdown | Comunicação entre serviços (REST/HTTP) |
| `pubsub.md` | Markdown | Eventos assíncronos com Redis Pub/Sub |
| `docker.md` | Markdown | Arquitetura Docker e docker-compose.yml completo |

## Como renderizar os diagramas .puml

**Opção 1 — VS Code**: instale a extensão [PlantUML](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) e pressione `Alt+D` sobre o arquivo.

**Opção 2 — Online**: acesse [https://www.plantuml.com/plantuml/uml/](https://www.plantuml.com/plantuml/uml/) e cole o conteúdo.

**Opção 3 — CLI**:
```bash
# Instalar Java + PlantUML jar
java -jar plantuml.jar uml/*.puml
```

**Opção 4 — Docker**:
```bash
docker run --rm -v $(pwd)/uml:/data plantuml/plantuml -tpng /data/*.puml
```
