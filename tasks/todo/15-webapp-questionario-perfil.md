# 15 — Webapp: questionário de perfil de preferências

**Serviço:** webapp  
**Responsável:**  
**Data limite:**  

## Descrição

Implementar o onboarding opcional de perfil para compradores. O usuário responde perguntas sobre seus gostos e preferências (tipo de imóvel, tipo de veículo, faixa de renda, estilo de vida) para que o sistema de recomendações do store-service retorne ativos mais relevantes.

O fluxo é opcional: pode ser apresentado após o registro ou acessado no menu do usuário.

> Depende da task #04 (user-service com POST/GET /users/:id/profile) estar concluída.

## O que implementar

### 1. Página `/profile/preferences`

Criar `app/pages/profile/preferences.vue` com um questionário em etapas:

**Etapa 1: Interesses**
```
O que você busca na plataforma? (múltipla escolha)
[ ] Automóveis   [ ] Imóveis   [ ] Náutico   [ ] Aviação   [ ] Arte/Joias
```

**Etapa 2: Preferências de imóvel** (se selecionou Imóveis)
```
Número mínimo de quartos: [1] [2] [3] [4+]
Garagem?  [Sim] [Não]
```

**Etapa 3: Preferências de veículo** (se selecionou Automóveis)
```
Número de portas preferido: [2] [4]
Combustível: [Gasolina] [Diesel] [Elétrico] [Híbrido]
```

**Etapa 4: Perfil geral**
```
Estilo de vida: (múltipla escolha)
[ ] Família   [ ] Negócios   [ ] Aventura   [ ] Luxo

Faixa de investimento:
( ) Até R$ 300 mil
( ) R$ 300 mil – R$ 1 milhão
( ) Acima de R$ 1 milhão
```

### 2. Server route BFF

```
server/api/users/[id]/profile.post.ts  → POST http://user-service:3002/users/:id/profile
server/api/users/[id]/profile.get.ts   → GET  http://user-service:3002/users/:id/profile
```

### 3. Integração no questionário

```ts
const { user, token } = useAuth()

async function saveProfile() {
  await $fetch(`/api/users/${user.value.id}/profile`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token.value}` },
    body: {
      lifestyleTags: selectedTags.value,
      minBedrooms: minBedrooms.value,
      wantsGarage: wantsGarage.value,
      preferredDoors: preferredDoors.value,
      preferredFuel: preferredFuel.value,
      incomeRange: selectedIncomeRange.value,
    },
  })
  navigateTo('/')
}
```

### 4. Apresentar convite pós-registro

Após o registro bem-sucedido, apresentar um banner/modal convidando a preencher o perfil:

```vue
<!-- Em app/pages/index.vue, para usuário sem perfil -->
<div v-if="user && !userProfile" class="profile-nudge">
  <p>Personalize suas recomendações →</p>
  <OButton variant="ghost" @click="navigateTo('/profile/preferences')">
    Definir preferências
  </OButton>
</div>
```

## Acceptance criteria

- [ ] Questionário tem pelo menos 3 etapas relevantes
- [ ] Etapas de imóvel/veículo só aparecem se o usuário marcou interesse naquela categoria
- [ ] Ao salvar, o perfil é persistido no user-service
- [ ] Na homepage, usuário com perfil salvo vê seção "Recomendados para você" com produtos relevantes
- [ ] Usuário pode acessar e editar o perfil em `/profile/preferences` a qualquer momento
- [ ] Página protegida por autenticação (redireciona para login se não logado)
