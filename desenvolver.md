## Como desenvolver nesse repositório

### Criação de branches

Sempre que for fazer algo, acesse a master (`git checkout master && git pull`)
depois, crie sua branch com base no que vc vai fazer (`git checkout -b nome-da-branch`)
se a branch já existir, não precisa do `-b`.

O nome da branch pode seguir o padrão: `tipo/titulo-da-tarefa`, sendo tipo [feature, patch, docs,...]

para fazer um commit, siga o padrão `tipo: sua mensagem`, com tipo sendo [feat, fix, docs, refactor,...]

Ao finalizar, abra um pull request no github e me mande para revisar.

Referência:
https://medium.com/linkapi-solutions/conventional-commits-pattern-3778d1a1e657
