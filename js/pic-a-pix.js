// Habilitar apenas pare teste
var versao_teste = false;
var versao_teste_file = false;

  // TABELA DOS JOGADORES (supabase.com)
  // ID
  // NOME
  // IP
  // LOCAL
  // NIVEL
  // INICIO
  // PONTOS
  // MINUTO
  // SEGUNDO
  // FIM
  // STATUS
  
  // TABELA DE RECORDES (supabase.com)
  // ID
  // NIVEL
  // NOME
  // AJUSTADO
  // DATA
  // MINUTO
  // SEGUNDO
  // PONTOS
  // USER_ID (da tabela dos jogadores)

// Informações para acessar o Supabase (url, key, tables)
const SUPABASE_URL = "https://cmjfjbsqtsitqvgjibxg.supabase.co";
const SUPABASE_TABLE_PLAYERS = "jogadores";
const SUPABASE_TABLE_RECORDS = "recordes";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzYzNTgzNCwiZXhwIjoxOTU5MjExODM0fQ.BAH76d8F4ypGgNSYjYLebrLZHM2qa4xxuisxc3rF7mw";

// Tempo necessário para obter informações sobre o jogador (IP e LOCAL)
var tempoEspera = 500;

// Informações do jogador
var USER_IP = null;
var USER_CITY = null;
var USER_NAME = null;
var USER_ID = null;

// Parâmetros para apresentação do enigma e do ranking
var proporcao_linhas = 0.8; //proporcao de linhas apresentadas (0 a 1)
var proporcao_colunas = 0.5; //proporcao de colunas apresentadas (0 a 1)
var numRanking = 25; //número de linhas do ranking apresentadas (qualquer)
var ptsJogo = 100; //pontuação máxima que pode ser alcançada pelo jogador

// Variáveis globais do jogo
var elementosRestantes = 0;
var dimensao = 15; // valor inicial
var minJogo = 0;
var segJogo = 0;

// Arrays globais do jogo
let tabela_completa = [];
let tabela_inicial = [];
let tabela_erros = [];
let cont_linhas = [];
let con_colunas = [];

//// FUNÇÕES PARA MONITORAMENTO DE EVENTOS DA PÁGINA (IP, NOME E NÍVEL DO JOGO)

// Obtenção do IP do jogador (por meio de API)
function getIp(callback)
{
    function response(s)
    {
        callback(window.userip);

        s.onload = s.onerror = null;
        document.body.removeChild(s);
    }

    function trigger()
    {
        window.userip = false;

        var s = document.createElement("script");
        s.async = true;
        s.onload = function() {
            response(s);
        };
        s.onerror = function() {
            response(s);
        };

        s.src = "https://l2.io/ip.js?var=userip";
        document.body.appendChild(s);
    }

    if (/^(interactive|complete)$/i.test(document.readyState)) {
        trigger();
    } else {
        document.addEventListener('DOMContentLoaded', trigger);
    }
}

getIp(function (ip) {
  USER_IP = ip;
  achaLocal(ip);
  if (versao_teste) {
    console.log("PLAYER IP:" + USER_IP);  
  }
});

// Obtenção do nome do jogador (por meio de LocalStorage)
document.addEventListener('DOMContentLoaded', function() {
  
  // Exibe nome correto do jogador ao carregar a página
  atualizaNome("ON");
  
  if (versao_teste_file) {
    console.log("PLAYER NAME: " + USER_NAME);  
  }
  
}, false);

// Obtenção do nível escolhido (por meio da barra de escolha)
window.onload = function() {

  var slider = document.getElementById("valor");
  var result = document.getElementById("escolhido");
  
  slider.oninput = function(){
    // Dimesão da tabela é obtida em tempo real
    dimensao = slider.value;
    
    if (versao_teste) {
      console.log(`DIM: ${dimensao} \n`);
    }
    // Exibe dimensão selecionada em tempo real
    result.innerHTML = slider.value ;
  }
}

//// FUNÇÕES PARA REGRAS DE NAVEGAÇÃO DA PÁGINA (BOTÕES OK, RANKING e SOBRE)
//criaJogo()
//botoesJogo()
//mostraRank()
//criaRank()
//ordenaInfo()
//mostraInfo()

// Criação do enigma ao clicar no botão OK
function criaJogo() {
 
  // Tempo necessário para obter IP e geolocalização do jogador
  setTimeout(function() {
    
    // Desabilita botão de criação e salva informações
    botoesJogo("iniciou");
     
    // Cria o enigma inicial
    inicializaEnigma();
  
    // Inicializa o tempo
    mostraTempo(0);
  
    // Preenche HTML com a tabela inicial
    imprimeEnigma(true);  
  }, tempoEspera);
  
}

// Gerenciamento dos botões do jogo (habilitar/desabilitar)
// Status possíveis: iniciou, completou, saiu
function botoesJogo(statusJogo) {
  
  // Se troca de nomes estiver em andamento, volta ao nome atual
  //atualizaNome("ON");
    
  if (statusJogo == "iniciou") {
    
    // Atualiza banco de dados no Supabase
    atualizaInfo("start");
    
    // Tratando informações de jogador (desabilitando durante o jogo)
    //document.getElementById("alterar").setAttribute('class', 'a_OFF');
    
    // Se troca de nomes estiver em andamento, volta ao nome atual e desabilita botão de alteração
    atualizaNome("OFF");
      
    // Tratando botões do jogo (desabilitando durante o jogo)
    document.getElementById("btnCria").disabled = true;
    document.getElementById("valor").disabled = true;
    document.getElementById("escolhido").disabled = true;
    document.getElementById("btnReset").disabled = false;
    document.getElementById("btnReset").innerText = 'VOLTA'; 
    
  } else {
      
    // Tratando informações de jogador (habilitando antes do jogo)
    //document.getElementById("alterar").setAttribute('class', 'a_ON');
    
    // Habilita botão de alteração de nome
    atualizaNome("ON");
    
    // Tratando botões do jogo (habilitando antes do jogo)
    document.getElementById("btnCria").disabled = false;
    document.getElementById("valor").disabled = false;
    document.getElementById("escolhido").disabled = false;
    document.getElementById("btnReset").disabled = true;
    document.getElementById("btnReset").innerText = 'NÍVEL';
        
    // Atualiza banco de dados no Supabase quando finaliza o jogo
    if (statusJogo == "completou") {
      // Utiliza Supabase para armazenar informações do jogador
      atualizaInfo("happyEnd");
    
      // Utiliza Supabase para armazenar informações do jogo
      atualizaInfo("ranking");
    }
   
    // Atualiza banco de dados no Supabase quando abandona o jogo
    if (statusJogo == "saiu") {
      // Utiliza Supabase para armazenar informações do jogador
      atualizaInfo("sadEnd");
    }
    
    // Reinicia os pontos do jogador
    ptsJogo = 100;
    
  }
}

// Mostrando o ranking do jogo
function mostraRank(ligado) {
    
  var infoText = "";
  
  if (ligado) {
    // Troca a função do botão
    document.getElementById("btnRank").onclick = function() {mostraRank(false)};
    
    // Ajusta tamanho do quadro para apresentar opções de níveis
    document.getElementById("gameRank").style.padding = "30px";
    
    infoText += "<button class='levelButton' onclick='mostraRank(false)' id='closeButton'>FECHAR</button>";
    
    infoText += "<h3>&nbsp&nbsp&nbsp&nbspExibir placar do nível:</h3>";
    
    for (var i = 0; i < 7; i++) {
      for (var j = 0; j < 3; j++) {
        infoText += "<button class='ranking' onclick='criaRank("+ (5 + 3*i+j) +")'>" + (5 + 3*i+j) + "</button> &nbsp &nbsp";
      }
      infoText +="<br>";
    }
    infoText +="<br><hr>";
    
    } else {
      // Troca a função do botão
      document.getElementById("btnRank").onclick = function() {mostraRank(true)};
      
      // Remove o espaço usado para as regras
      document.getElementById("gameRank").style.padding = "0px";
      
      // Apaga informações do último nível pesquisado
      document.getElementById('semPlacar').innerHTML = "";
      document.getElementById('tableRank').innerHTML = "";
    }
  
    // Campo para informar o ranking
    document.getElementById('gameRank').innerHTML = infoText; 
}

// Obtém informações do arquivo para gerar o ranking solicitado
function criaRank(dificuldade) { 
    
  // Apaga informações do último nível pesquisado
  document.getElementById('semPlacar').innerHTML = "";
  document.getElementById('tableRank').innerHTML = "";
  
  // Inicializa cliente do Supabase
  const _supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Função para acessar banco de dados (leitura)
  async function getData() {
    const { data, error } = await _supa.from(SUPABASE_TABLE_RECORDS)
      .select('*')
      .eq('NIVEL', new String(dificuldade)) 
    return data;
  }
  
  getData().then((data) => { 
    
    if (versao_teste_file) {
      console.log("BUSCA RETORNOU " + data.length + " LINHAS DA TABELA " + SUPABASE_TABLE_RECORDS);  
      console.log("LINHAS: " + data.length);
      for (var i = 0; i < data.length; i++) {
        console.log(data[i]);  
      }
    }
    
    if (data.length == 0) {
      // Apaga tabela com ranking anterior
      document.getElementById('tableRank').innerHTML = "";
      
      // Campo para informar que não tem ranking disponível
      document.getElementById('semPlacar').innerHTML = "<h3 style='color:red;margin-left:20px;'>Ranking para o nível " + dificuldade + " ainda não disponível.</h3>";
    } else {
        
      let RANK_FILE_INFO = [];
      for (var i = 0; i < data.length; i++) {
        RANK_FILE_INFO[i] = "<" + data[i].AJUSTADO +"> <" + data[i].MINUTO + ":" + data[i].SEGUNDO + "> <" + data[i].PONTOS + "> <" + data[i].DATA + "> " + data[i].NOME + "";
      }  
    
      // Ordena ranking para apresentar na tabela (parse com string para manter o código antigo)
      let SORTED_RANK_FILE_INFO = ordenaInfo(RANK_FILE_INFO);
 
      // Imprime informações do ranking na tabela
      var infoText = "";
      
      infoText += "<h3>Placar do nível " + dificuldade + ":</h3>";
      infoText += "<table>";
        
      // DEBUG
      if (versao_teste) {
        console.log(SORTED_RANK_FILE_INFO);
      }
          
      infoText += "<tr><th>Nº</th><th>Nome</th><th>Tempo ajustado</th><th>Data</th><th>Tempo</th><th>Pontos</th></tr>";
          
      var maxRanking = numRanking;
      if (RANK_FILE_INFO.length < numRanking) {
        maxRanking = RANK_FILE_INFO.length;
      }
          
      for (var i = 0; i < maxRanking; i++) {
        infoText += "<tr><td>" + (i+1) +"º</td><td>" + SORTED_RANK_FILE_INFO[i].substr(35) + "</td><td>" + SORTED_RANK_FILE_INFO[i].substr(1,5) + "</td><td>" + SORTED_RANK_FILE_INFO[i].substr(23,10) + "</td><td>" + SORTED_RANK_FILE_INFO[i].substr(9,5) + "</td><td>" + SORTED_RANK_FILE_INFO[i].substr(17,3) + "</td></tr>";
      }
      infoText += "</table><br><hr>";
    
      // Campo para informar o ranking
      document.getElementById('tableRank').innerHTML = infoText;
    }
  })     
  
  /*
  // Modo alternativo para acessar banco de dados pela URL (leitura)
  var request = new XMLHttpRequest();
  request.open('GET', SUPABASE_URL + "/rest/v1/" + SUPABASE_TABLE_PLAYERS);
  request.setRequestHeader('apikey', SUPABASE_ANON_KEY);
  request.responseType = 'json';
  request.send();
  request.onload = function() {
    var resposta = request.response;
    console.log(resposta.filter(x => x.NOME == "Bernardo"));
    console.log([...new Set(resposta.map(x => x.NOME))]);
  }  
  */
}

// Ordena informações de pontos em função dos tempos corrigidos
function ordenaInfo(lista) {
  
  // Cria vetor com tempos corrigidos para realizar a ordenação
  let vetor = []; 
  for (var i = 0; i < lista.length; i++) {
    vetor[i] = Math.floor(lista[i].substr(1,2) * 60 + lista[i].substr(4,2));
  }
  if (versao_teste) {
    console.log("Vetor original:");
    console.log(vetor);
    console.log("Lista original:");
    console.log(lista);
  }
  
  // Executa a ordenação com base no vetor de tempos corrigidos
  for (var i = 0; i < lista.length - 1; i++) {
    for (var j = 0; j < lista.length - i - 1; j++) {
      if (vetor[j] > vetor[j + 1]) {
        // Ordena valor
        let tempVetor = vetor[j];
        vetor[j] = vetor[j + 1];
        vetor[j + 1] = tempVetor;
        // Ordena lista completa 
        let tempLista = lista[j];
        lista[j] = lista[j + 1];
        lista[j + 1] = tempLista;
      }
    }
  }
  
  if (versao_teste) {
    console.log("Vetor ordenado:");
    console.log(vetor);
    console.log("Lista ordenada:");
    console.log(lista);
  }  
  return lista;
}

// Mostrando as regras do jogo
function mostraInfo(ligado) {
  
  var infoText = "";
  if (ligado) {
    document.getElementById("gameInfo").style.padding = "30px";
    
    infoText += "<button class='levelButton' onclick='mostraInfo(false)' id='closeButton'>FECHAR</button><br><br>";
         
    infoText += "<u>REGRAS DO JOGO</u>:<br>";
    
    infoText += "<ol><li>O jogador deve marcar os quadrados da tabela, obedecendo aos indicadores do total de marcações exigidas para cada linha (esquerda na tabela) e para cada coluna (acima na tabela).</li><br>";
  
    infoText += "<li>Caso haja mais de um número presente no indicador, seja da linha ou da coluna, é necessário deixar ao menos um quadrado em branco entre eles, na ordem em que aparecem.</li><br>";
    
     infoText += "<li>A pontuação inicial do jogador é de 100 pontos, para qualquer nível de dificuldade do jogo. A cada erro na marcação, o respectivo quadrado torna-se vermelho e a pontuação do jogador é reduzida em 1 ponto.</li><br>";
    
    infoText += "<li>O objetivo do jogo é completar a marcação dos quadrados corretamente no menor tempo possível. A cada ponto perdido pelo jogador, em consequência de um erro na marcação, seu tempo final para elaboração do ranking será acrescido de 10 segundos.</li></ol>";
    
    infoText += "<img src='https://i.imgur.com/WSMBf83.jpg' style='width:100% ; height:100%'/><br>";
    
    infoText += "<br><u>DESENVOLVIDO POR</u>: Bernardo Penna (2022)<br><br>";
    
    infoText += "<u>CONTATO</u>: bpenna@gmail.com<br>"; 
    
    // Troca a função do botão
    document.getElementById("btnInfo").onclick = function() {mostraInfo(false)};
    
    // Linha de separação
    document.getElementById('fimInfo').innerHTML = "<br><hr>";
        
  } else {
    // Remove o espaço usado para as regras
    document.getElementById("gameInfo").style.padding = "0px";
    
    // Troca a função do botão
    document.getElementById("btnInfo").onclick = function() {mostraInfo(true)};
    
    // Linha de separação
    document.getElementById('fimInfo').innerHTML = "";
  }
  
  // Campo para informar as regras
  document.getElementById('gameInfo').innerHTML = infoText;
}

//// FUNÇÕES PARA REGRAS DE FUNCIONAMENTO DO JOGO (MARCAÇÕES DO JOGADOR)
//marcaAqui()
//zeraJogo()
//confere()
//confereParcial()

// Marca célula no HTML
function marcaAqui(linha, coluna) {
  
  if (tabela_completa[linha][coluna] == 1) {
    // Marca acerto na tabela inicial
    tabela_inicial[linha][coluna] = 1;
  } else {
    // Jogador perde pontos quando erra (mínimo de 0)
    if (ptsJogo > 0) {
      ptsJogo--;
    }
        
    // Marca erro na tabela de erros
    tabela_erros[linha][coluna] = 1;   
  }
  // Reapresenta a tabela após marcar acerto ou erro
  imprimeEnigma(false);
}

// Finaliza jogo e retorna pontuação
function zeraJogo() {
  
  // Apaga tabela e tempo
  elementosRestantes = 0;
  document.getElementById("tabEnigma").innerHTML = "</table>";
  document.getElementById("tempo").innerHTML = "";
    
  // DEBUG
  if (versao_teste) {
    console.log("ZEROU (" + dimensao + ")");
  }
  
  // Habilita botão de criação e salva informações
  botoesJogo("saiu");
    
  // Reinicia os pontos do jogador quando reiniciar o jogo
  //ptsJogo = 100;
}

// Calcula diferença entre tabela completa e tabela inicial
function confere(completa, inicial){
  var diferenca = 0 ;
  for (var i = 0; i < dimensao; i++) {
    for (var j = 0; j < dimensao; j++){
      if (completa[i][j] > inicial[i][j]) {
        diferenca++;
      }
    }
  }
  return diferenca;
}

// Verifica quais linhas ou colunas já foram preecnhidas
function confereParcial(matriz, infoCont){
  let resultado = [];
  for (var i = 0; i < dimensao; i++) {
    var soma1 = 0; 
    var soma2 = 0;
    for (var j = 0; j < dimensao; j++) {
      soma1 += matriz[i][j];
    }
    for (var j = 0; j < infoCont[i].length; j++) {
      soma2 += infoCont[i][j];
    }

    if (soma1 == soma2){
      resultado.push(1);
    } else {
      resultado.push(0);
    }
  }
  return resultado;
}

//// FUNÇÕES PARA REGRAS DE ATUALIZAÇÃO DO JOGO (REGISTROS E RANKINGS)
//atualizaInfo()

// Gerenciamento das atualizações de dados
// Tipos possíveis: ranking, players, start, happyEnd, sadEnd

function atualizaInfo(tipo) {
    
  // Informações do banco de dados (supabase)
  var infoTAB = {};
  var nameTAB = "";
  
  switch (tipo) {  
    case 'start':
      // preenche 5 primeiros itens da tabela de jogadores   
      infoTAB = {
        NOME: new String(USER_NAME), 
        IP: new String(USER_IP),
        LOCAL: new String(USER_CITY), 
        NIVEL: new String(dimensao), 
        INICIO: new String(atualDataHora())
      };
      nameTAB = SUPABASE_TABLE_PLAYERS;
      break;
      
    case 'happyEnd':
      // preenche 5 últimos itens da tabela de jogadores com STATUS "OK!"
      infoTAB = {
        PONTOS: new String(pad3(ptsJogo)), 
        MINUTO: new String(pad2(minJogo)), 
        SEGUNDO: new String(pad2(segJogo)), 
        FIM: new String(atualDataHora()), 
        STATUS: new String('OK!')
      };
      nameTAB = SUPABASE_TABLE_PLAYERS;  
      break;
      
    case 'sadEnd':
      // preenche 5 últimos itens da tabela de jogadores com STATUS "END"
      infoTAB = {
        PONTOS: new String(pad3(ptsJogo)), 
        MINUTO: new String(pad2(minJogo)), 
        SEGUNDO: new String(pad2(segJogo)), 
        FIM: new String(atualDataHora()), 
        STATUS: new String('END')
      };
      nameTAB = SUPABASE_TABLE_PLAYERS;  
      break;
      
    case 'ranking':
      // preenche tabela de recordes
      infoTAB = {
        NIVEL: new String(dimensao), 
        NOME: new String(USER_NAME), 
        DATA: new String(atualData()), 
        AJUSTADO: new String(corrigeTempo()), 
        MINUTO: new String(pad2(minJogo)), 
        SEGUNDO: new String(pad2(segJogo)), 
        PONTOS: new String(pad3(ptsJogo)),
        USER_ID: new String(USER_ID)
      };
      nameTAB = SUPABASE_TABLE_RECORDS;  
      break;
    
    default:
      console.log("Tipo inválido!");
    }
    
  // Inicializa cliente do Supabase
  const _supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Armazena ID da linha para atualizar tabela depois
  if (tipo == "start") {
    // Função para acessar banco de dados (escrita de novo item)
    async function newData() {
      const { data, error } = await _supa.from(nameTAB)
        .insert([infoTAB])
        .single()
        //.csv()
      return data;
    }
  
    newData().then((data) => {    
      // Armazena ID salvo
      USER_ID = Object.values(data)[0];
      if (versao_teste_file) {
        console.log(data);
        console.log("LINHA " + Object.values(data)[0] + " DE " + nameTAB + " INSERIDA COM SUCESSO!");
      }
    });
  }
  
  // Não armazena ID da linha para atualizar tabela depois
  if (tipo == "ranking") {
    // Função para acessar banco de dados (escrita de novo item)
    async function newData() {
      const { data, error } = await _supa.from(nameTAB)
        .insert([infoTAB])
        .single()
        //.csv()
      return data;
    }
  
    newData().then((data) => {    
      if (versao_teste_file) {
        console.log(data);
        console.log("LINHA " + Object.values(data)[0] + " DE " + nameTAB + " INSERIDA COM SUCESSO!");
      }
    });
  }
  
  // Atualiza tabela na mesma linha inserida anteriormente
  if (tipo == "happyEnd" || tipo == "sadEnd") {
        
    // Função para acessar banco de dados (escrita de item existente)
    async function updateData() {
      const { data, error } = await _supa.from(nameTAB)
        .update([infoTAB])
        .eq('ID', new String(USER_ID)) 
        .single()
        //.csv()

      return data;
    }
  
    updateData().then((data) => {      
      
      if (versao_teste_file) {
        console.log(data);
        if (USER_ID == Object.values(data)[0]) {
          console.log("LINHA " + USER_ID + " DE " + nameTAB + " ATUALIZADA COM SUCESSO!");
        } else {
          console.log("LINHA " + USER_ID + " DE " + nameTAB + " NÃO ATUALIZADA...");
        }
      }
    });
  }
  
  /* 
  // Modo alternativo para acessar banco de dados pela URL (escrita)
  var param = "?NOME=Eduardo?PONTOS=100";
  var request = new XMLHttpRequest();
  var bla = SUPABASE_URL + "/rest/v1/" + SUPABASE_TABLE_PLAYERS + param;
  console.log(bla);
  request.open('POST', bla);
  request.setRequestHeader('apikey', SUPABASE_ANON_KEY);
  request.setRequestHeader('Authorization', "Bearer " + SUPABASE_ANON_KEY);
  request.setRequestHeader('Content-Type', "application/json");
  request.setRequestHeader('Prefer', "return=representation");
  request.responseType = 'json';
  request.send();
  request.onload = function () {
  var resposta = request.response;
  console.log(resposta);
  };
  */
}

//// FUNÇÕES PARA CRIAÇÃO DO ENIGMA (APENAS GERAÇÃO DOS NÚMEROS)
//inicializaEnigma()
//imprimeEnigma()

function inicializaEnigma() {
  
  // Obtém dimensão da tabela
  // Atualmente a dimensão é obtida em tempo real assim que o input é alterado
  //dimensao = parseInt(document.getElementById("valor").value);
  
  // Variáveis para criação da tabela
  var num_1 = parseInt(Math.ceil(dimensao/2));
  var num_0 = parseInt(Math.floor(dimensao/2));
  
  // Cria tabela completa (= resposta do enigma)
  tabela_completa = criaTabela(num_1, num_0);
  
  // Cria tabela de erros
  tabela_erros = criaTabela(0, dimensao);

  // DEBUG
  if (versao_teste) {
    console.log(dimensao);
    console.log(num_1);
    console.log(num_0);
    console.log("Tabela completa:");
    console.log(tabela_completa);
    console.log("Tabela de erros:");
    console.log(tabela_erros);
  }

  // Obtém contadores de linhas e colunas
  cont_linhas = calcula(tabela_completa);
  cont_colunas = calcula(transpose(tabela_completa));
  
  // DEBUG
  if (versao_teste) {
    console.log("Contador de linhas:");
    console.log(cont_linhas);
    console.log("Contador de colunas:");
    console.log(cont_colunas);
  }
  
  // Parâmetros da máscara para preencher tabela inicial
  var n_linhas = Math.ceil(dimensao*proporcao_linhas);
  var n_colunas = Math.ceil(dimensao*proporcao_colunas);
  
  // Define as linhas que estarão visíveis 
  let habilita_linha = criaVetor(n_linhas, dimensao - n_linhas);
  
  // Define as colunas que estarão visíveis 
  let habilita_coluna = [];
  for (var i=0; i < n_linhas; i++) {
    let mostra_colunas = criaVetor(n_colunas, dimensao - n_colunas); 
    mostra_colunas = shuffle(mostra_colunas);  
    habilita_coluna.push(mostra_colunas);
  }
  
  //DEBUG
  if (versao_teste) {
    console.log("Linhas visíveis:");
    console.log(habilita_linha);
    console.log("Colunas visíveis:");
    console.log(habilita_coluna);
  }
  
  // Define máscara para esconder linhas e colunas
  let mascara = []
  var indice_coluna = 0
  for (var indice_linha = 0; indice_linha < dimensao; indice_linha++) { 
    if (habilita_linha[indice_linha] == 1) {
      mascara.push(habilita_coluna[indice_coluna]);
      indice_coluna++;
    } else {
      mascara.push(criaVetor(0, dimensao));
    }
  }
  
  // DEBUG
  if (versao_teste) {
    console.log("Máscara:");
    console.log(mascara);
  }
  
  // Cria tabela inicial (pré-preenchida)
  tabela_inicial = [];
  for (var i = 0; i < dimensao; i++) {
    let nova_linha = [];
    for (var j = 0; j < dimensao; j++) {
      nova_linha.push(tabela_completa[i][j] * mascara[i][j]); 
    }
    tabela_inicial.push(nova_linha);
  }
  
  // DEBUG
  if (versao_teste) {
    console.log("Tabela inicial:");
    console.log(tabela_inicial);
  }
}

// Cria HTML com o enigma
function imprimeEnigma(inicio){
  
  // Faz tempo aparecer junto com o jogo ao iniciá-lo
  if (inicio) {
    document.getElementById('tempo').innerHTML = "<u>TEMPO</u>: 00:00" + "<BR><BR>" + "<u>PONTOS</u>: 100";
  }
  // Verifica se jogo já está completo
  elementosRestantes = confere(tabela_completa,tabela_inicial);
     
  // Preenche título
  var elemento = "<tr><th class = 'titulo_tab' colspan='" + (dimensao+1) + "'>NIVEL " + dimensao + "</th>";
  
  // Preenche 1º elemento da primeira linha com nº de elementos que falta para completar o jogo
  elemento += "<tr> <th class = 'contador' style='background-color: Gray'>" + elementosRestantes + "</th>";
  
  // Preenche demais elementos da primeira linha com contadores de coluna
  for (var i = 0; i < dimensao; i++) {
    elemento += "<th id ='col"+i+"' width='20px' style='background-color: DarkGray'>";
    for (var j = 0; j < cont_colunas[i].length; j++) {
      if (j == cont_colunas[i].length - 1) {
        elemento += cont_colunas[i][j];
      } else {
        elemento += cont_colunas[i][j] + " <br> ";
      }
    }
    elemento += "</th>";
  }
  elemento += "</tr>"; 
  
  // Preenche linhas com 1º elemento (contadores de linha) e demais elementos (valores)
    for (var i = 0; i < dimensao; i++) {
    elemento += "<tr>";
    for (var j = -1; j < dimensao; j++) {
      if (j < 0) {
        var tam = 20;
        if (cont_linhas[i].length > 0){
          tam = 22 * cont_linhas[i].length;
        }
        // contador de linhas como 1º elemento
        elemento += "<th id ='row"+i+"'style='background-color: DarkGray' width='" + tam + "px'>";
        for (var k = 0; k < cont_linhas[i].length; k++) {
          if (k == cont_linhas[i].length - 1) {
            elemento += cont_linhas[i][k];
          } else {
            elemento += cont_linhas[i][k] + " &nbsp ";
          }    
        }
        elemento += "</th>";
      } else {
        // valores como demais elementos
        if (tabela_inicial[i][j] == 0) {
          if (tabela_erros[i][j] == 1) {
            elemento += "<th style='background-color: red'></th>";
          } else {
            elemento += "<th><button class='marca' onclick='marcaAqui(" + i + "," + j + ")''>x</button></th>";
          }
        } else {
          elemento += "<th width='20px' style='background-color: Black'> </th>";
        }
      }
    }
    elemento += "</tr>";
  }
  
  var tabHTML = document.getElementById("tabEnigma");
  tabHTML.innerHTML = elemento;
  
  // Destaca colunas e linhas já resolvidas
  let linhas_OK = confereParcial(tabela_inicial, cont_linhas);
  let colunas_OK = confereParcial(transpose(tabela_inicial), cont_colunas);
  
  for (var i = 0; i < dimensao; i++) {
    if (linhas_OK[i] == 1){
      document.getElementById('row'+i).style.color = "black";
    }
    if (colunas_OK[i] == 1){
      document.getElementById('col'+i).style.color = "black";
    }
  }
   
  // Exibe mensagem de parabéns e habilita botões se jogo atual estiver completo
  if (elementosRestantes == 0) {
    
    // Exibindo mensagem
    document.getElementById("sucesso").innerHTML = "PARABÉNS!!!";
         
    // DEBUG
    if (versao_teste) {
      console.log("COMPLETOU (" + dimensao + ")");
    }
    
    // Habilita botão de criação e salva informações
    botoesJogo("completou");
    
  } else {
    // Remove parabéns para não ficar sobrando
    document.getElementById("sucesso").innerHTML = "";
  }
} 

//// FUNÇÕES PARA MANIPULAÇÃO NUMÉRICA (VETORES E MATRIZES) 
//criaTabela()
//criaVetor()
//transpose()
//shuffle()
//calcula()

// Criação da tabela completa (aleatoriamente)
function criaTabela(num_1, num_0) {
  let tabela = [];
  for (var i = 0; i < (num_1 + num_0); i++) {
    tabela.push(criaVetor(num_1, num_0));   
  }
  return tabela;
}

// Criação de vetor com 1 e 0 (aleatoriamente)
function criaVetor(num_1, num_0) {
  let vetor = [];
  for (var j = 0; j < (num_1+num_0); j++) {
    if (j < num_1) {
      vetor.push(1);
    } else {
      vetor.push(0);
    } 
  }
  vetor = shuffle(vetor);
  return vetor;
}

// Matriz transposta (transposed matrix)
function transpose(matrix) {
    return Object.keys(matrix[0])
        .map(colNumber => matrix.map(rowNumber => rowNumber[colNumber]));
}

// Vetor com elementos misturados (shuffled vector)
function shuffle(o) {
  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

// Cálculo de elementos na linha e na coluna (contadores)
function calcula(matriz) {
  let cont = [];
  var soma = 0;
  
  for (let linha of matriz) {
    let tmp = [];
    for (let valor of linha) {  
      if (valor == 1) {
        soma += 1;
      } else {
        if (soma != 0) {
        tmp.push(soma);
        soma = 0;
        }
      }
    }  
    
    if (soma != 0) {
      tmp.push(soma);
      soma = 0;
    }
    cont.push(tmp);
    }
  return cont;
}

//// FUNÇÕES PARA TRATAMENTO DE TEMPO E DATA
//mostraTempo()
//corrigeTempo()
//atualDataHora()
//atualData()
//pad2()
//pad3()

// Mostrando o tempo decorrido de jogo
function mostraTempo(atual) {
  // Atualiza o tempo a cada segundo
  const myInterval = setInterval(function() {
  	if (elementosRestantes > 0){
      atual++;
      minJogo = (atual - (atual % 60)) / 60;
      segJogo = (atual < 60) ? atual : atual - (minJogo * 60);
      document.getElementById('tempo').innerHTML = "<u>TEMPO</u>: " + pad2(minJogo) + ":" + pad2(segJogo) + "<BR><BR>" + "<u>PONTOS</u>: " + pad3(ptsJogo);
    }	else {
      clearInterval(myInterval);
      
      // DEBUG
      if (versao_teste) {
        console.log("Tempo:" + pad2(minJogo) + ":" + pad2(segJogo));
        console.log("Pontos:" + pad3(ptsJogo));
      }
    }
            
  }, 1000);
}

// Retorna valor de tempo final corrigo pelos pontos
function corrigeTempo() {
  var total = 10 * (100 - ptsJogo) + segJogo + 60 * minJogo;
  var minJogoNovo = Math.floor(total / 60);
  var segJogoNovo = total - minJogoNovo * 60;
  
  return pad2(minJogoNovo) + ":" + pad2(segJogoNovo);
}

function atualDataHora() {
  var data = new Date();
  var dia = data.getDate();
  var mes = data.getMonth() + 1; // 0 é janeiro
  var ano = data.getFullYear();
  var hora = data.getHours(); // obtém horas do horário local
  var min = data.getUTCMinutes(); // obtém minutos do horário universal

  return pad2(dia) + "-" + pad2(mes) + "-" + ano + " (" + pad2(hora) + "h" + pad2(min) + "min)";
}

function atualData() {
  var data = new Date();
  var dia = data.getDate();
  var mes = data.getMonth() + 1; // 0 é janeiro
  var ano = data.getFullYear();
  
  return pad2(dia) + "-" + pad2(mes) + "-" + ano;
}

// Apresenta número com dois dígitos
function pad2(s) {
  return (s < 10) ? '0' + s : s;
}

// Apresenta número com três dígitos
function pad3(s) {
  return (s < 100) ? '0' + pad2(s) : pad2(s);
}

//// FUNÇÕES PARA ATUALIZAÇÃO DO NOME E LOCAL DO JOGADOR
//trocaJogador()
//gravaNome()
//atualizaNome()
//achaLocal()

function trocaJogador() {
  document.getElementById("jogador").innerHTML = "<br><input class='changePlayerInput' id='novoNome'></input> <button class='changePlayerBtn' onclick='gravaNome()'>ok</button> , escolha seu desafio:";
    
} 

function gravaNome() {

  if (document.getElementById("novoNome").value.length > 0) {
    
    // Se inserir 0 o nome é apagado
    if (document.getElementById("novoNome").value == 0){
      localStorage.removeItem("player");
    } else {
      USER_NAME = document.getElementById("novoNome").value;
      localStorage.setItem("player", USER_NAME);
    }    
    if (versao_teste_file) {
      console.log("NEW NAME:" + USER_NAME);  
    } 
  } else {
    if (versao_teste_file) {
      console.log("NEW NAME: EMPTY");  
    } 
  }
  
  atualizaNome("ON");
}

function atualizaNome(ligado) {
  USER_NAME = localStorage.getItem("player");
 
  if (ligado == "ON") {
    if (USER_NAME != null) {
      document.getElementById("jogador").innerHTML = "<a id='alterar' class='a_ON' href='#void' onclick='trocaJogador();'>(alterar)</a><br>" + USER_NAME + ", escolha o desafio:";
    } else {
      document.getElementById("jogador").innerHTML = "<a id='alterar' class='a_ON' href='#void' onclick='trocaJogador();'>(alterar)</a><br>" + "&lt sem nome &gt, escolha o desafio:"; 
    }
  } else {
    if (USER_NAME != null) {
      document.getElementById("jogador").innerHTML = "<a id='alterar' class='a_OFF' href='#void' onclick='trocaJogador();'>(alterar)</a><br>" + USER_NAME + ", resolva:";
    } else {
      document.getElementById("jogador").innerHTML = "<a id='alterar' class='a_OFF' href='#void' onclick='trocaJogador();'>(alterar)</a><br>" + "&lt sem nome &gt, resolva:"; 
    }
    
  }
  
}

function achaLocal(meuIP) {
   
  //https://geolocation-db.com/json/191.176.8.233
  //var requestURL = "https://geolocation-db.com/json/" + meuIP;
  
  //https://www.iplocate.io/api/lookup/191.176.8.233
  //var requestURL = "https://www.iplocate.io/api/lookup/" + meuIP;
     
  //https://ipapi.co/191.176.8.233/json/
  var requestURL = "https://ipapi.co/" + meuIP + "/json";
  
  var request = new XMLHttpRequest();
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();     
  
  request.onload = () => {
    var resposta = request.response;
    USER_CITY = resposta.city + " (" + resposta.country_name + ")"; 
    
    if (versao_teste_file) {
      console.log("PLAYER IP: " + USER_IP);
      console.log("PLAYER LOCAL: " + USER_CITY);
      
      console.log(resposta);
    }
  }
}
