-- =========================================================
-- Mast — 0003_verses_seed.sql
-- 30 versículos do dia (Almeida Revista e Corrigida)
-- Pode ser rodado mais de uma vez: atualiza o que já existe.
-- Exibição: position = ((diaDoAno - 1) mod N) + 1
-- =========================================================

insert into public.verses (position, reference, text, reflection, question, theme) values

(1, 'Provérbios 3:5-6',
 'Confia no SENHOR de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
 'Salomão contrapõe duas bases para a vida: o próprio entendimento e a confiança em Deus. Confiar de todo o coração não é deixar de pensar, mas reconhecer que a nossa visão é parcial. Quando Deus é reconhecido em cada caminho, inclusive nos pequenos, ele endireita o percurso que sozinhos nós entortaríamos.',
 'Em que decisão de hoje estou confiando só no meu próprio entendimento?',
 'Confiança'),

(2, 'Filipenses 4:6-7',
 'Não estejais inquietos por coisa alguma; antes, as vossas petições sejam em tudo conhecidas diante de Deus, pela oração e súplica, com ação de graças. E a paz de Deus, que excede todo o entendimento, guardará o vosso coração e os vossos sentimentos em Cristo Jesus.',
 'Paulo escreve isso preso, o que dá peso ao conselho. A alternativa à ansiedade não é fingir que nada preocupa, mas transformar cada preocupação em oração, sempre acompanhada de gratidão. A promessa não é que tudo se resolva do nosso jeito, e sim uma paz que guarda o coração antes mesmo da resposta.',
 'Qual preocupação posso entregar em oração agora, em vez de carregá-la o dia todo?',
 'Oração'),

(3, '1 Tessalonicenses 5:16-18',
 'Regozijai-vos sempre. Orai sem cessar. Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.',
 'São três ordens curtas que descrevem uma postura, não um sentimento passageiro. Paulo não diz para dar graças por tudo, mas em tudo: mesmo nos dias difíceis existe algo pelo que agradecer. A gratidão constante treina o olhar para enxergar o cuidado de Deus no meio da rotina.',
 'Quais são três coisas concretas de hoje pelas quais posso agradecer?',
 'Gratidão'),

(4, 'Miqueias 6:8',
 'Ele te declarou, ó homem, o que é bom; e que é o que o SENHOR pede de ti, senão que pratiques a justiça, e ames a beneficência, e andes humildemente com o teu Deus?',
 'O povo perguntava que grandes sacrifícios agradariam a Deus, e a resposta de Miqueias é surpreendentemente simples. Deus não pede gestos grandiosos, mas uma vida coerente: agir com justiça, amar a misericórdia e caminhar com ele sem arrogância. Andar humildemente é lembrar, a cada passo, que não caminhamos sozinhos nem por mérito próprio.',
 'Onde posso praticar justiça e bondade de forma concreta hoje?',
 'Humildade'),

(5, 'Efésios 4:32',
 'Antes, sede uns para com os outros benignos, misericordiosos, perdoando-vos uns aos outros, como também Deus vos perdoou em Cristo.',
 'A medida do perdão cristão não é a gravidade da ofensa, mas o tamanho do perdão que recebemos. Quem se lembra de quanto foi perdoado tem mais facilidade em ser benigno com os outros. Perdoar não apaga o que aconteceu, mas impede que a mágoa governe as nossas reações.',
 'Existe alguém a quem preciso estender o perdão que eu mesmo recebi?',
 'Perdão'),

(6, 'João 13:34',
 'Um novo mandamento vos dou: Que vos ameis uns aos outros; como eu vos amei a vós, que também vós uns aos outros vos ameis.',
 'Jesus diz isso na última ceia, horas antes de ser traído, logo depois de lavar os pés dos discípulos. O mandamento é novo porque a medida mudou: amar não apenas como a nós mesmos, mas como ele amou, servindo. O amor aqui é uma escolha prática, que aparece em atitudes pequenas e humildes.',
 'Que gesto concreto de serviço posso fazer por alguém hoje?',
 'Amor ao próximo'),

(7, 'Tiago 1:5',
 'E, se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente e o não lança em rosto; e ser-lhe-á dada.',
 'Tiago escreve a cristãos que passavam por provações e precisavam de direção mais do que de respostas fáceis. A promessa é clara: Deus dá sabedoria com generosidade e sem humilhar quem pede. Pedir sabedoria é admitir um limite, e é justamente aí que ela começa.',
 'Para qual situação da minha vida preciso pedir sabedoria hoje?',
 'Sabedoria'),

(8, 'Gálatas 6:9',
 'E não nos cansemos de fazer bem, porque a seu tempo ceifaremos, se não houvermos desfalecido.',
 'Fazer o bem cansa, principalmente quando o resultado demora a aparecer. Paulo usa a imagem da colheita: entre o plantio e o fruto existe um tempo de espera que não pode ser pulado. Desistir no meio do caminho é a única forma garantida de não colher.',
 'Em que boa prática estou tentado a desistir só porque o resultado ainda não veio?',
 'Perseverança'),

(9, '1 Coríntios 9:25',
 'E todo aquele que luta de tudo se abstém; eles o fazem para alcançar uma coroa corruptível, nós, porém, uma incorruptível.',
 'Paulo usa o exemplo dos atletas dos jogos de Corinto, que treinavam por meses e abriam mão de muita coisa por uma coroa de folhas que logo murchava. Se eles se disciplinavam tanto por algo passageiro, quanto mais nós, que buscamos algo eterno. A disciplina não é um fim em si mesma, mas o caminho para aquilo que realmente importa.',
 'Do que preciso me abster hoje para correr melhor a minha carreira?',
 'Domínio próprio'),

(10, '2 Coríntios 9:7',
 'Cada um contribua segundo propôs no seu coração, não com tristeza ou por necessidade; porque Deus ama ao que dá com alegria.',
 'Paulo pede uma oferta para os cristãos pobres de Jerusalém, mas não impõe um valor. O que importa para Deus é a disposição do coração: dar por decisão própria, e não por pressão ou culpa. A generosidade alegre nasce de quem entende que tudo o que tem já foi recebido.',
 'Como posso ser generoso hoje, com dinheiro, tempo ou atenção?',
 'Generosidade'),

(11, 'Romanos 15:13',
 'Ora, o Deus de esperança vos encha de todo o gozo e paz em crença, para que abundeis em esperança pela virtude do Espírito Santo.',
 'Paulo chama Deus de Deus de esperança: a esperança cristã nasce nele, e não nas circunstâncias. Ela vem acompanhada de alegria e paz e cresce à medida que confiamos. Não é otimismo de temperamento, mas uma segurança sustentada pelo Espírito.',
 'Onde a minha esperança está apoiada em circunstâncias, e não em Deus?',
 'Esperança'),

(12, 'Lamentações 3:22-23',
 'As misericórdias do SENHOR são a causa de não sermos consumidos, porque as suas misericórdias não têm fim; novas são cada manhã; grande é a tua fidelidade.',
 'Jeremias escreve isso no meio da ruína de Jerusalém, não num momento de conforto. A esperança dele não vem das circunstâncias, mas da fidelidade de Deus, que se renova todos os dias. Um dia ruim não define o seguinte: cada manhã é um recomeço.',
 'O que de ontem eu preciso deixar para trás para começar hoje de novo?',
 'Recomeço'),

(13, 'Hebreus 11:1',
 'Ora, a fé é o firme fundamento das coisas que se esperam e a prova das coisas que se não veem.',
 'O autor de Hebreus define a fé antes de listar os que viveram por ela. Fé não é ausência de dúvida, mas firmeza sobre aquilo que ainda não se vê. Abraão, Moisés e tantos outros agiram antes de ver o resultado, e foi isso que os fez avançar.',
 'Que passo de fé posso dar hoje, mesmo sem ver o resultado ainda?',
 'Fé'),

(14, 'Mateus 6:6',
 'Mas tu, quando orares, entra no teu aposento e, fechando a tua porta, ora a teu Pai, que vê o que está oculto; e teu Pai, que vê o que está oculto, te recompensará.',
 'Jesus critica quem orava em público para ser admirado. A oração verdadeira não precisa de plateia: é um encontro pessoal com o Pai, que vê o que está oculto. O aposento é qualquer lugar onde conseguimos ficar a sós com Deus, sem pressa e sem aparência.',
 'Qual será o meu momento a sós com Deus hoje, e onde?',
 'Oração'),

(15, 'Salmos 103:2',
 'Bendize, ó minha alma, ao SENHOR, e não te esqueças de nenhum de seus benefícios.',
 'Davi fala com a própria alma, quase como um lembrete escrito para si mesmo. A tendência humana é esquecer depressa o bem recebido e lembrar por muito tempo o que faltou. Gratidão é um exercício de memória: recordar de propósito o que Deus já fez.',
 'Que benefício de Deus eu esqueci de agradecer recentemente?',
 'Gratidão'),

(16, 'Filipenses 2:3',
 'Nada façais por contenda ou por vanglória, mas por humildade; cada um considere os outros superiores a si mesmo.',
 'Paulo escreve a uma igreja com rivalidades internas. A humildade que ele propõe não é pensar mal de si, mas pensar menos em si e mais nos outros. Logo em seguida ele aponta Cristo como exemplo de quem, sendo o maior, escolheu servir.',
 'Em que situação de hoje posso colocar o interesse de outra pessoa à frente do meu?',
 'Humildade'),

(17, 'Colossenses 3:13',
 'Suportando-vos uns aos outros e perdoando-vos uns aos outros, se algum tiver queixa contra outro; assim como Cristo vos perdoou, assim fazei vós também.',
 'Paulo parte do princípio de que os conflitos vão acontecer. A convivência exige suportar as falhas alheias e perdoar de forma ativa, sem esperar que o outro mereça primeiro. O modelo, mais uma vez, é Cristo, que perdoou antes.',
 'Que queixa estou guardando e posso escolher soltar hoje?',
 'Perdão'),

(18, '1 João 3:18',
 'Meus filhinhos, não amemos de palavra, nem de língua, mas por obra e em verdade.',
 'João, já idoso, chama seus leitores de filhinhos e vai direto ao ponto. Palavras bonitas não bastam: o amor verdadeiro se prova em ações. A pergunta não é o quanto dizemos que amamos, mas o que fazemos por quem dizemos amar.',
 'Quem eu digo que amo, mas não tenho demonstrado com atitudes?',
 'Amor ao próximo'),

(19, 'Provérbios 4:23',
 'Sobre tudo o que se deve guardar, guarda o teu coração, porque dele procedem as saídas da vida.',
 'Na Bíblia, o coração é o centro das decisões, dos desejos e dos pensamentos. Por isso precisa ser guardado com mais cuidado do que qualquer outra coisa. Aquilo que deixamos entrar, pelo que vemos, ouvimos e consumimos, acaba moldando a forma como vivemos.',
 'O que tenho deixado entrar no meu coração que não deveria estar lá?',
 'Sabedoria'),

(20, 'Hebreus 12:1-2',
 'Portanto, nós também, pois que estamos rodeados de uma tão grande nuvem de testemunhas, deixemos todo embaraço e o pecado que tão de perto nos rodeia e corramos, com paciência, a carreira que nos está proposta, olhando para Jesus, autor e consumador da fé.',
 'O autor imagina uma corrida assistida por todos os que viveram pela fé antes de nós. Para correr bem, é preciso largar o que pesa, inclusive coisas que não são erradas, mas atrasam. A paciência na carreira vem de manter os olhos em Jesus, e não no cansaço do caminho.',
 'Que peso posso largar hoje para correr mais leve?',
 'Perseverança'),

(21, 'Provérbios 16:32',
 'Melhor é o longânimo do que o valente, e o que governa o seu espírito do que o que toma uma cidade.',
 'Na época de Salomão, conquistar uma cidade era o maior símbolo de força. Mesmo assim, ele afirma que governar o próprio espírito vale mais. Controlar a raiva, os impulsos e as reações é uma vitória silenciosa, mas maior do que muitas conquistas visíveis.',
 'Em que momento de hoje vou precisar governar meu espírito em vez de reagir?',
 'Domínio próprio'),

(22, 'Atos 20:35',
 'Tenho-vos mostrado em tudo que, trabalhando assim, é necessário auxiliar os enfermos e recordar as palavras do Senhor Jesus, que disse: Mais bem-aventurada coisa é dar do que receber.',
 'Paulo se despede dos líderes de Éfeso e cita uma frase de Jesus que não aparece nos evangelhos. Ele lembra que trabalhou com as próprias mãos para poder ajudar quem precisava. A lógica de Deus inverte a nossa: quem dá não perde, é abençoado.',
 'Como posso usar o meu trabalho de hoje para servir alguém?',
 'Generosidade'),

(23, 'Isaías 40:31',
 'Mas os que esperam no SENHOR renovarão as suas forças e subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.',
 'Isaías escreve a um povo exilado e exausto, que achava que Deus tinha se esquecido dele. A promessa é que quem espera no Senhor recebe forças renovadas para voar, correr e também caminhar. Às vezes a vitória não é voar alto, mas continuar andando sem desfalecer.',
 'Em que área estou cansado e preciso esperar no Senhor para renovar as forças?',
 'Esperança'),

(24, 'Mateus 11:28-29',
 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei. Tomai sobre vós o meu jugo, e aprendei de mim, que sou manso e humilde de coração, e encontrareis descanso para a vossa alma.',
 'Jesus faz um convite aberto a todos os cansados, sem exigir nada antes. O jugo era a peça que unia dois bois para dividir o peso do trabalho: ele não promete ausência de carga, mas carregá-la junto. O descanso verdadeiro vem de aprender com quem é manso e humilde.',
 'Que cansaço preciso levar a Jesus hoje, em vez de tentar resolver sozinho?',
 'Descanso'),

(25, 'Salmos 46:10',
 'Aquietai-vos e sabei que eu sou Deus; serei exaltado entre as nações; serei exaltado sobre a terra.',
 'Esse salmo foi escrito em meio a ameaças e caos, com montanhas tremendo e nações em guerra. No centro da agitação, Deus manda parar e reconhecer quem ele é. Aquietar-se não é passividade, mas a confiança de quem sabe que não controla tudo.',
 'Onde preciso parar de me agitar e simplesmente confiar hoje?',
 'Confiança'),

(26, 'Jeremias 33:3',
 'Clama a mim, e responder-te-ei e anunciar-te-ei coisas grandes e firmes, que não sabes.',
 'Jeremias estava preso quando recebeu essa palavra, num momento em que o futuro de Jerusalém parecia perdido. Deus o convida a clamar e promete revelar coisas que ele ainda não sabia. Orar não é só pedir, mas também ouvir e aprender com Deus.',
 'Que pergunta preciso fazer a Deus hoje, e estou disposto a ouvir a resposta?',
 'Oração'),

(27, 'Colossenses 3:17',
 'E, quanto fizerdes por palavras ou por obras, fazei tudo em nome do Senhor Jesus, dando por ele graças a Deus Pai.',
 'Paulo não divide a vida em partes sagradas e partes comuns. Tudo o que fazemos, em palavras e em obras, pode ser feito em nome de Jesus e com gratidão. Um relatório, uma aula ou uma conversa ganham outro sentido quando são feitos para Deus.',
 'Como posso transformar uma tarefa comum de hoje em um ato de gratidão a Deus?',
 'Trabalho'),

(28, 'Tiago 4:10',
 'Humilhai-vos perante o Senhor, e ele vos exaltará.',
 'Tiago escreve a pessoas que disputavam posição e reconhecimento. A promessa é paradoxal: quem se humilha diante de Deus é exaltado por ele, no tempo certo. Não é preciso lutar por lugar quando confiamos que é Deus quem honra.',
 'Em que situação busco um reconhecimento que deveria deixar nas mãos de Deus?',
 'Humildade'),

(29, 'Hebreus 12:11',
 'E, na verdade, toda correção, ao presente, não parece ser de gozo, senão de tristeza, mas depois produz um fruto pacífico de justiça nos exercitados por ela.',
 'A palavra traduzida por correção também significa disciplina e treinamento. Nenhuma disciplina é agradável enquanto acontece, e o texto não finge que seja. Mas ela produz um fruto de paz e de justiça em quem se deixa exercitar por ela.',
 'Que desconforto de hoje pode estar me formando para algo melhor?',
 'Disciplina'),

(30, 'Filipenses 3:13-14',
 'Irmãos, quanto a mim, não julgo que o haja alcançado; mas uma coisa faço, e é que, esquecendo-me das coisas que atrás ficam e avançando para as que estão diante de mim, prossigo para o alvo, pelo prêmio da soberana vocação de Deus em Cristo Jesus.',
 'Paulo, já maduro na fé, admite que ainda não chegou lá. A atitude dele tem duas partes: esquecer o que ficou para trás, tanto os fracassos quanto as conquistas, e avançar para o alvo. Ter um alvo claro é o que transforma esforço em direção.',
 'O que preciso esquecer para avançar, e qual é o meu alvo hoje?',
 'Propósito')

on conflict (position) do update set
  reference  = excluded.reference,
  text       = excluded.text,
  reflection = excluded.reflection,
  question   = excluded.question,
  theme      = excluded.theme;

-- Conferência: deve retornar 30
select count(*) as total_verses from public.verses;
