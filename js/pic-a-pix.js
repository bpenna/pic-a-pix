// Habilitar apenas pare teste
var versao_teste = false;
var versao_teste_file = false;

// Token para acessar meu Dropbox App (pic-a-pix)
var ACCESS_TOKEN_RESULTS = "Idr40ognCAgAAAAAAAAAAeZQKKOTAf6wTgzIg8EihCCHqNrBIPGtzA4fB9eKk3yE";

// Token para acessar meu Dropbox App (bpennaJS)
var ACCESS_TOKEN_PLAYERS = "-JrFmjt8E6cAAAAAAAAAAauOzm7vOJuxNZIjR3abaOPMzOf5oHLI7xkHMc66gorH";

// Informações para Dropbox
var FILENAME = null;
var USER_IP = null;
var USER_NAME = null;

// Parâmetros para apresentação do enigma
var proporcao_linhas = 0.8; //proporcao de linhas apresentadas (0 a 1)
var proporcao_colunas = 0.5; //proporcao de colunas apresentadas (0 a 1)

// Informações sobre o enigma
var dimensao = 0;
var elementosRestantes = 0;
var minJogo = 0;
var segJogo = 0;
var ptsJogo = 100;
var tempoEspera = 4000;
let tabela_completa = [];
let tabela_inicial = [];
let tabela_erros = [];
let cont_linhas = [];
let con_colunas = [];

document.addEventListener('DOMContentLoaded', function() {
    atualizaNome();
}, false);

function botoesJogo(statusJogo) {
  
  // Se troca de nomes estiver em andamento, volta ao nome atual
  atualizaNome();
  
  // Tratando informações de jogador (desabilitando por poucos segundos)
  document.getElementById("alterar").setAttribute('class', 'a_OFF');
  
  // Tratando botões do jogo (desabilitando por poucos segundos)
  document.getElementById("btnCria").disabled = true;
  document.getElementById("valor").disabled = true;
  document.getElementById("btnReset").disabled = true; 
  document.getElementById("btnReset").innerText = '........';  
   
  if (statusJogo == "iniciou") {
    
    // Utiliza DropboxApp para armazenar informações de cada jogador
    atualizaInfo("start");
    
    // Aplica botões corretos após atualizações
    setTimeout(function(){
      // Tratando informações de jogador (desabilitando durante o jogo)
      document.getElementById("alterar").setAttribute('class', 'a_OFF');
      
      // Tratando botões do jogo (desabilitando durante o jogo)
      document.getElementById("btnCria").disabled = true;
      document.getElementById("valor").disabled = true;
      document.getElementById("btnReset").disabled = false;
      document.getElementById("btnReset").innerText = 'VOLTA'; 
    }, tempoEspera);
      
  }
  
  if (statusJogo == "completou") {
    
    // Utiliza DropboxApp para armazenar informações do jogo encerrado
    atualizaInfo("happyEnd");
    
    // Utiliza DropboxApp para armazenar nomes dos jogadores
    setTimeout(function(){ 
      //atualizaInfo("players");
      atualizaInfo("ranking");
      
      // Aplica botões corretos após atualizações
      setTimeout(function(){ 
    
        // Tratando informações de jogador (habilitando antes do jogo)
        document.getElementById("alterar").setAttribute('class', 'a_ON');
    
        // Tratando botões do jogo (habilitando antes do jogo)
        document.getElementById("btnCria").disabled = false;
        document.getElementById("valor").disabled = false;
        document.getElementById("btnReset").disabled = true;
        document.getElementById("btnReset").innerText = 'DIFICULDADE:';
        
        // Reinicia os pontos do jogador quando vencer o jogo
        ptsJogo = 100;
      }, tempoEspera);
    }, tempoEspera);
  
  }
  
  if (statusJogo == "saiu") {
    
    // Utiliza DropboxApp para armazenar informações do jogo encerrado
    atualizaInfo("sadEnd");
    
    // Aplica botões corretos após atualizações
    setTimeout(function(){
      // Tratando informações de jogador (habilitando antes do jogo)
      document.getElementById("alterar").setAttribute('class', 'a_ON');
    
      // Tratando botões do jogo (habilitando antes do jogo)
      document.getElementById("btnCria").disabled = false;
      document.getElementById("valor").disabled = false;
      document.getElementById("btnReset").disabled = true;
      document.getElementById("btnReset").innerText = 'DIFICULDADE:';
      
      // Reinicia os pontos do jogador quando vencer o jogo
      ptsJogo = 100;
    }, tempoEspera);

  }
}

// Criação do enigma
function criaJogo() {

  // Obtém dimensões da tabela
  dimensao = parseInt(document.getElementById("valor").value);
  var num_1 = parseInt(Math.ceil(dimensao/2));
  var num_0 = parseInt(Math.floor(dimensao/2));
   
  // Desabilita botão de criação e salva informações
  botoesJogo("iniciou");
        
  // Cria o enigma inicial
  inicializaEnigma(num_1, num_0);
  
  // Inicializa o tempo
  mostraTempo(0);
  
  // Preenche HTML com a tabela inicial
  imprimeEnigma(true);
  
}

function atualizaInfo(tipo) {
  
  // Configurações iniciais
  var indexFile = false;
  var rankFile = false;
  var novaLinha = false;
  var atual = "";
  var ACCESS_TOKEN = "";
  
  if (tipo == "players") {
    indexFile = true;
    novaLinha = true;
    atual = "NOME: " + USER_NAME + " ACESSO: " + atualDataHora() + " (" + USER_IP + ")";
    ACCESS_TOKEN = ACCESS_TOKEN_PLAYERS;
    
    if (versao_teste_file) {
      console.log(">> ACCESS TOKEN PLAYERS");
    }
  }
  
    if (tipo == "ranking") {
      rankFile = true;
      novaLinha = true;
      atual = "<" + corrigeTempo() + "> <" + pad(minJogo) + ":" + pad(segJogo) + "> <" + pad3(ptsJogo) + "> <" + atualData() + "> " + USER_NAME;
      ACCESS_TOKEN = ACCESS_TOKEN_PLAYERS;
    
    if (versao_teste_file) {
      console.log(">> ACCESS TOKEN PLAYERS (RANKING)");
    }
  }
  
  if (tipo == "start") {
    novaLinha = true;
    atual = atualDataHora() + " @ " + USER_IP + " = [SIZE: " + pad(dimensao) + "]";
    ACCESS_TOKEN = ACCESS_TOKEN_RESULTS;
    
    if (versao_teste_file) {
      console.log(">> ACCESS TOKEN RESULTS");
    }
  }
       
  if (tipo == "happyEnd") {
    atual = " [TIME: " + pad(minJogo) + ":" + pad(segJogo) + "] [PTS: " + pad3(ptsJogo) + "] STATUS = OK!";
    ACCESS_TOKEN = ACCESS_TOKEN_RESULTS;
     
    if (versao_teste_file) {
      console.log(">> ACCESS TOKEN RESULTS");
    }
  }
          
  if (tipo == "sadEnd") {
    atual = " [TIME: " + pad(minJogo) + ":" + pad(segJogo) + "] [PTS: " + pad3(ptsJogo) + "] STATUS = END";
    ACCESS_TOKEN = ACCESS_TOKEN_RESULTS;
     
    if (versao_teste_file) {
      console.log(">> ACCESS TOKEN RESULTS");
    }
  }
    
  // Se não houver nome do jogador, não cria nem altera arquivo com nomes
  if (indexFile | rankFile) {
    if (USER_NAME == null) {
      if (versao_teste_file) {
        console.log(">> SEM NOME!!!");
      }
      return;
    }
  }
  
  if (versao_teste_file) {
    console.log(">> " + atual);
  }
  
  // INÍCIO TEMPORIZADOR
  if (versao_teste_file) {
    var antes = Date.now(); 
    document.getElementById('teste').innerHTML = "Carregando...";Date.now() - antes;
  }
    
  // Define o nome do arquivo a ser salvo
  // #nomes.txt = nomes de todos os jogadores
  // n.txt = tempo corrigido dos jogadores para cada nível de dificuldade (n)
  // 0.txt = resultados dos jogos de jogadores sem nome (não entram no ranking)
  // x.txt = resultados dos jogos de jogadores com nome (entram no ranking)
  if (indexFile) {
    FILENAME = "#nomes.txt";
  } else {
    if (rankFile) {
      FILENAME = dimensao + ".txt";
    } else {
      if (USER_NAME != null) {
        FILENAME = USER_NAME + ".txt";  
      } else {
        FILENAME = "0.txt";  
      }
    }
  }
  
  // DEBUG
  if (versao_teste_file) {
    console.log("FILENAME: " + FILENAME);  
  }
  
  // Utiliza DropboxApp para armazenar informações dos jogadores
  var dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN });
  
  // Procura atual arquivo e pega seu id, caso exista
  var FILE_ID = "";
  let FILE_INFO = [];
    
  // PROCURAR arquivo (passo 1)
  dbx.filesListFolder({path: ''})
  .then(function(response) {
    for (var i = 0; i < response.result.entries.length; i++) {
      if (response.result.entries[i].name == FILENAME){
        FILE_ID = response.result.entries[i].id;
      }
    }  
   
    // DEBUG
    if (versao_teste_file) {
      console.log("FILE_ID: " + FILE_ID); 
      console.log("LENGTH: " + FILE_ID.length); 
    }
    
    // Quando o arquivo procurado já existe
    if (FILE_ID.length > 0) {
      // DEBUG
      if (versao_teste_file) {
        console.log("1 de 4) Achou FILENAME ("+ FILE_ID +")"); 
      }
        
      // CARREGAR conteúdo do arquivo (passo 2)
      dbx.filesDownload({path: FILE_ID})
      .then(function(response) {
        const reader = new FileReader();
        const fileContentAsText = reader.readAsText(response.result.fileBlob);
        reader.onload = (e) => {
          var texto = "";     
          for (var i = 0; i < reader.result.length; i++) {
            //console.log(reader.result[i]);
            if (reader.result[i] == '\n'){
              //console.log(i + " = " + texto);
              FILE_INFO.push(texto.toString());
              texto = "";
            } else {
              texto += reader.result[i];
              //console.log(i + " = " + texto);
            }
          }
          FILE_INFO.push(texto.toString());
        }  
        
        // DEBUG
        if (versao_teste) {
          console.log("ATUALIZA: " + atual.toString());
          console.log(FILE_INFO);
        }
        if (versao_teste_file) {
          console.log("2 de 4) Carregou FILENAME (" + FILENAME + ")");
        }
                      
        // REMOVER atual arquivo (passo 3)
        dbx.filesDeleteV2({path: FILE_ID})
        .then(function(response) {
              
          // DEBUG
          if (versao_teste_file) {
            console.log("3 de 4) Removeu FILENAME (" + FILENAME + ")");
          }
            
          // variável com o conteúdo a ser salvo no arquivo
          var NEW_FILE_INFO = "";
          
          // Arquivo geral
          if (indexFile) {
              
            // Para verificar se é jogador novo
            var novoJogador = true;
            
            // Ajusta informações dos jogadores para serem escritas no novo arquivo
            for (var i = 0; i < FILE_INFO.length; i++) {
              
              if (FILE_INFO[i].indexOf('NOME:') < 0) {
                // Cabeçalho do arquivo geral
                for (var j = 0; j < FILE_INFO[i].length; j++) {            
                  NEW_FILE_INFO += FILE_INFO[i][j];
                }
                
              } else {
                
                // Procura pelo nome do jogador
                var inicio = FILE_INFO[i].indexOf('NOME:') + 6;
                var fim = FILE_INFO[i].indexOf('ACESSO:') - 1;
                var jogador = FILE_INFO[i].slice(inicio, fim);
               
                // DEBUG
                if (versao_teste_file) {
                  console.log(i + ")Jogador " + jogador);
                }
                  
                if (jogador == USER_NAME) {
                                    
                  // Indica que jogador atual foi encontrado
                  novoJogador = false;
                    
                  // Atualiza informações do jogador atual
                  for (var j = 0; j < atual.length; j++) {            
                    NEW_FILE_INFO += atual[j];
                  }
                    
                  // DEBUG
                  if (versao_teste_file) {
                    console.log("Atualizado: " + jogador + ".");
                  }
                    
                } else {
                  // Mantém informações dos outros jogadores
                  for (var j = 0; j < FILE_INFO[i].length; j++) {            
                    NEW_FILE_INFO += FILE_INFO[i][j];
                  }
                }
              }
              if (i < FILE_INFO.length - 1) {
                NEW_FILE_INFO += '\r\n';
              }
            }
            // Se for novo jogador, inclui as informações na última linha
            if (novoJogador) {
              NEW_FILE_INFO += '\r\n';
              for (var j = 0; j < atual.length; j++) {            
                NEW_FILE_INFO += atual[j];
              }
            }
          } else {
            
            // Arquivo individual do jogador  
            if (novaLinha == true) {
              // Informações sobre INÍCIO do jogo em nova linha
              FILE_INFO.push(atual.toString());
            }
             
            // Ajusta informações para serem escritas no novo arquivo
            for (var i = 0; i < FILE_INFO.length; i++) {
              
              for (var j = 0; j < FILE_INFO[i].length; j++) {            
                NEW_FILE_INFO += FILE_INFO[i][j];
              }
              if (i < FILE_INFO.length - 1) {
                NEW_FILE_INFO += '\r\n';
              }
            }
              
            if (novaLinha == false) {
              // Informações sobre FIM do jogo na mesma linha
              NEW_FILE_INFO += ' ' + atual.toString();
            }
          }
  
          console.log(">>>>>>>>>" + NEW_FILE_INFO);
          
          // Cria novo arquivo (seja geral ou sobre cada jogador)
          var file = new File([NEW_FILE_INFO], FILENAME);
              
          // DEBUG
          if (versao_teste) {
            console.log(NEW_FILE_INFO);
          }
                 
          // SALVAR novo arquivo (passo 4)
          dbx.filesUpload({path: '/' + file.name, contents: file})
          .then(function(response) {
                          
            // DEBUG
            if (versao_teste_file) {
              if (indexFile) {
                console.log("4 de 4) Salvou FILENAME NOVO (" + FILENAME + ") -> NOMES");
              } else {
                if (novaLinha) {
                  console.log("4 de 4) Salvou FILENAME NOVO (" + FILENAME + ") -> INÍCIO JOGO");
                } else {
                  console.log("4 de 4) Salvou FILENAME NOVO (" + FILENAME + ") -> FIM JOGO");
                }
              }
            }
                
            // FIM TEMPORIZADOR (sucesso nos 4 passos) 
            if (versao_teste_file) {
              var depois = (Date.now() - antes)/1000;
              document.getElementById('teste').innerHTML = "Carregando...pronto! (" + depois + ")";
            }
          })
          .catch(function(error) {
            console.error("dbx.filesUpload()");
            console.error(error);
               
            // FIM TEMPORIZADOR (erro no passo 4: UPLOAD)  
            if (versao_teste_file) {
              var depois = (Date.now() - antes)/1000;
              document.getElementById('teste').innerHTML = "Carregando...deu ruim no UPLOAD :-( (" + depois + ")";
            }         
          });
        })
        .catch(function(error) {
          console.error("dbx.fileDeleteV2()");
          console.error(error);
              
          // FIM TEMPORIZADOR (erro no passo 3: DELETE)  
          if (versao_teste_file) {
            var depois = (Date.now() - antes)/1000;
            document.getElementById('teste').innerHTML = "Carregando...deu ruim no DELETE :-( (" + depois + ")";
           }
        });
      })
      .catch(function(error) {
        console.error("dbx.fileDownload()");
        console.error(error);
          
        // FIM TEMPORIZADOR (erro no passo 2: DOWNLOAD)  
        if (versao_teste_file) {
          var depois = (Date.now() - antes)/1000;
          document.getElementById('teste').innerHTML = "Carregando...deu ruim no DOWNLOAD :-( (" + depois + ")"; 
         }
      });   
    } else { // Quando o arquivo procurado não existe
          
      let FILE_NOVO = [];
      // Só cria novo arquivo se jogo não tiver começado ainda
      if (novaLinha == true) {
        if (indexFile) {
          FILE_NOVO = ["JOGADORES (bpenna.github.io/pic-a-pix) criado em " + atualDataHora()];
        }
        else {
          if (rankFile == false) {
            FILE_NOVO = ["RESULTADOS (bpenna.github.io/pic-a-pix) criado em " + atualDataHora()];
          }
        }
          
        FILE_NOVO.push(atual.toString());
        
        // Ajusta informações para serem escritas no novo arquivo
        var NEW_FILE_NOVO = "";
        for (var i = 0; i < FILE_NOVO.length; i++) {
          for (var j = 0; j < FILE_NOVO[i].length; j++) {            
            NEW_FILE_NOVO += FILE_NOVO[i][j];
          }
          if (i < FILE_NOVO.length - 1) {
            NEW_FILE_NOVO += '\r\n';    
          }  
        }
                
        // CRIAR novo arquivo (passo 1)
        var file = new File([NEW_FILE_NOVO], FILENAME);
              
        // DEBUG
        if (versao_teste_file) {
          if (indexFile) {
            console.log("1 de 2) Criou FILENAME INICIAL (" + FILENAME + ") -> NOMES");
          } else {
            console.log("1 de 2) Criou FILENAME INICIAL (" + FILENAME + ") -> INÍCIO JOGO");
          }
        }
        if (versao_teste) {
          console.log(NEW_FILE_NOVO);
        }
              
        // SALVAR novo arquivo (passo 2)
        dbx.filesUpload({path: '/' + file.name, contents: file})
        .then(function(response) {
                
          // DEBUG
          if (versao_teste_file) {
            if (indexFile) {
              console.log("2 de 2) Salvou FILENAME INICIAL (" + FILENAME + ") -> NOMES");
            } else {
              console.log("2 de 2) Salvou FILENAME INICIAL (" + FILENAME + ") -> INÍCIO JOGO");
            }
          }
               
          // FIM TEMPORIZADOR (sucesso nos 2 passos)
          if (versao_teste_file) {
            var depois = (Date.now() - antes)/1000;
            document.getElementById('teste').innerHTML = "Carregando...novo! (" + depois + ")";
           }
        })
        .catch(function(error) {
          console.error("dbx.filesUpload() (novo)");
          console.error(error);
          
          // FIM TEMPORIZADOR (erro no passo 2: UPLOAD NOVO)  
          if (versao_teste_file) {
            var depois = (Date.now() - antes)/1000;
            document.getElementById('teste').innerHTML = "Carregando...deu ruim no UPLOAD NOVO :-( (" + depois + ")";
           }
        });  
      } else { // Se jogo já tiver começado, arquivo novo não será criado    
        
        // DEBUG
        if (versao_teste_file) {
          console.log("1 de 1) NÃO salvou FILENAME INICIAL (" + FILENAME + ") -> FIM JOGO");
        }
        
        // FIM TEMPORIZADOR (erro no passo 1: FIM do jogo sem INÍCIO do jogo)
        if (versao_teste_file) {
          var depois = (Date.now() - antes)/1000;
          document.getElementById('teste').innerHTML = "Carregando...não criado! (" + depois + ")";
        }
      }    
    }
  })
  .catch(function(error) {
    console.error("dbx.filesListFolder()");
    console.error(error);  
    
    // FIM TEMPORIZADOR (erro no passo 1: LISTFOLDER)  
    if (versao_teste_file) {
      var depois = (Date.now() - antes)/1000;
      document.getElementById('teste').innerHTML = "Carregando...deu ruim no LISTFOLDER :-( (" + depois + ")";
     }
  }); 
}
  
function inicializaEnigma(num_1, num_0) {
  
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

function atualDataHora() {
  var data = new Date();
  var dia = data.getDate();
  var mes = data.getMonth() + 1; // 0 é janeiro
  var ano = data.getFullYear();
  var hora = data.getHours(); // obtém horas do horário local
  var min = data.getUTCMinutes(); // obtém minutos do horário universal

  return pad(dia) + "-" + pad(mes) + "-" + ano + " (" + pad(hora) + "h" + pad(min) + "min)";
}

function atualData() {
  var data = new Date();
  var dia = data.getDate();
  var mes = data.getMonth() + 1; // 0 é janeiro
  var ano = data.getFullYear();
  
  return pad(dia) + "-" + pad(mes) + "-" + ano;
}

// Apresenta número com dois dígitos
function pad(s) {
  return (s < 10) ? '0' + s : s;
}

// Apresenta número com três dígitos
function pad3(s) {
  return (s < 100) ? '0' + pad(s) : pad(s);
}

// Marca célula no HTML
function marcaAqui(linha, coluna) {
  
  if (tabela_completa[linha][coluna] == 1) {
    // Marca acerto na tabela inicial
    tabela_inicial[linha][coluna] = 1;
  } else {
    // Jogador perde pontos quando erra
    ptsJogo--;
    
    // Marca erro na tabela de erros
    tabela_erros[linha][coluna] = 1;   
  }
  // Reapresenta a tabela após marcar acerto ou erro
  imprimeEnigma(false);
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
  ptsJogo = 100;
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
    
    //console.log(soma1 + " e " + soma2);
    
    if (soma1 == soma2){
      resultado.push(1);
    } else {
      resultado.push(0);
    }
  }
  return resultado;
}

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
  // Modo mais simples de fazer shuffle (resultado pior)
  // o = o.sort(() => Math.random() - 0.5);
  
  // Modo mais complexo de fazer shuffle (resultado melhor)
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

// Função para obter o IP do jogador
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

// Função para obter o IP do jogador
getIp(function (ip) {
  USER_IP = ip;
  if (versao_teste) {
    console.log("PLAYER IP:" + USER_IP);  
  }
});

// Mostrando o tempo decorrido de jogo
function mostraTempo(atual) {
  // Atualiza o tempo a cada segundo
  const myInterval = setInterval(function() {
  	if (elementosRestantes > 0){
      atual++;
      minJogo = (atual - (atual % 60)) / 60;
      segJogo = (atual < 60) ? atual : atual - (minJogo * 60);
      document.getElementById('tempo').innerHTML = "<u>TEMPO</u>: " + pad(minJogo) + ":" + pad(segJogo) + "<BR><BR>" + "<u>PONTOS</u>: " + pad3(ptsJogo);
    }	else {
      clearInterval(myInterval);
      
      // DEBUG
      if (versao_teste) {
        console.log("Tempo:" + pad(minJogo) + ":" + pad(segJogo));
        console.log("Pontos:" + pad3(ptsJogo));
      }
    }
            
  }, 1000);
}

// Retorna valor de tempo final corrigo pelos pontos
function corrigeTempo() {
  /*console.log("pts: " + ptsJogo);
  console.log("10 * (100 - ptsJogo): " + (10 * (100 - ptsJogo)));
  console.log("minJogo: " + minJogo);
  console.log("segJogo: " + segJogo);
  console.log("segJogo + 60 * minJogo: " + (segJogo + 60 * minJogo));
  console.log("10 * (100 - ptsJogo) + segJogo + 60 * minJogo: " + (10 * (100 - ptsJogo) + segJogo + 60 * minJogo));
  */
  var total = 10 * (100 - ptsJogo) + segJogo + 60 * minJogo;
  var minJogoNovo = Math.floor(total / 60);
  var segJogoNovo = total - minJogoNovo * 60;
  
  return pad(minJogoNovo) + ":" + pad(segJogoNovo);
}

// Mostrando as regras do jogo
function mostraInfo(ligado) {
  
  var infoText = "";
  if (ligado) {
    document.getElementById("gameInfo").style.padding = "30px";
         
    infoText += "<u>REGRAS DO JOGO</u>:<br>";
    
    infoText += "<ol><li>O jogador deve marcar os quadrados da tabela, obedecendo aos indicadores do total de marcações exigidas para cada linha (esquerda na tabela) e para cada coluna (acima na tabela).</li><br>";
  
    infoText += "<li>Caso haja mais de um número presente no indicador, seja da linha ou da coluna, é necessário deixar ao menos um quadrado em branco entre eles, na ordem em que aparecem.</li><br>";
    
     infoText += "<li>A pontuação inicial do jogador é de 100 pontos, para qualquer nível de dificuldade do jogo. A cada erro na marcação, o respectivo quadrado torna-se vermelho e a pontuação do jogador é reduzida em 1 ponto.</li><br>";
    
    infoText += "<li>O objetivo do jogo é completar a marcação dos quadrados corretamente no menor tempo possível. A cada ponto perdido pelo jogador, em consequência de um erro na marcação, seu tempo final para elaboração do ranking será acrescido de 10 segundos.</li></ol>";
    
    infoText += "<img src='https://i.imgur.com/WSMBf83.jpg' style='width:100% ; height:100%'/><br>";
    
    infoText += "<br><u>DESENVOLVIDO POR</u>: Bernardo Penna (2021)<br><br>";
    
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

// Mostrando o ranking do jogo
function mostraRank(ligado) {
  
  var infoText = "";
  if (ligado) {
    // Troca a função do botão
    document.getElementById("btnRank").onclick = function() {mostraRank(false)};
    
    infoText += "<h3>&nbspQual a dificuldade?</h3>";
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
  }
  
  // Campo para informar o ranking
  document.getElementById('gameRank').innerHTML = infoText;
}

// Obtém informações do arquivo para gerar o ranking solicitado
function criaRank(dificuldade) {
  
  // Procura arquivo com informações para ranking da dificuldade indicada
  var RANKFILENAME = dificuldade + ".txt";
  
  // DEBUG
  if (versao_teste_file) {
    console.log("RANKFILENAME: " + RANKFILENAME); 
  }
  
  // Utiliza DropboxApp para obter informações do ranking
  var dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN_PLAYERS });
  
  // Procura atual arquivo e pega seu id, caso exista
  var RANK_FILE_ID = "";
  let RANK_FILE_INFO = [];
  let SORTED_RANK_FILE_INFO = [];
  
  // PROCURA arquivo
  dbx.filesListFolder({path: ''})
  .then(function(response) {
    for (var i = 0; i < response.result.entries.length; i++) {
      if (response.result.entries[i].name == RANKFILENAME){
        RANK_FILE_ID = response.result.entries[i].id;
      }
    }  
   
    // DEBUG
    if (versao_teste_file) {
      console.log("RANK_FILE_ID: " + RANK_FILE_ID); 
      console.log("LENGTH: " + RANK_FILE_ID.length); 
    }
    
    // Quando o arquivo procurado não existe
    if (RANK_FILE_ID.length == 0) {
      
      // Informar que não achou arquivo
      console.log("Ranking vazio (nivel " + dificuldade + ")")
      
      // Campo para informar que não tem ranking disponível
      document.getElementById('gameRank').innerHTML = "<h3>Ranking para o nível " + dificuldade + " ainda não disponível.</h3>";
      
    } else {
      // DEBUG
      if (versao_teste_file) {
        console.log("1 de 2) Achou RANKFILENAME ("+ RANK_FILE_ID +")"); 
      }
      
      // CARREGA conteúdo do arquivo
      dbx.filesDownload({path: RANK_FILE_ID})
      .then(function(response) {
        const reader = new FileReader();
        const fileContentAsText = reader.readAsText(response.result.fileBlob);
        reader.onload = (e) => {
          var texto = "";     
          for (var i = 0; i < reader.result.length; i++) {
            //console.log(reader.result[i]);
            if (reader.result[i] == '\n'){
              //console.log(i + " = " + texto);
              RANK_FILE_INFO.push(texto.toString());
              texto = "";
            } else {
              texto += reader.result[i];
              //console.log(i + " = " + texto);
            }
          }
          RANK_FILE_INFO.push(texto.toString());
          
          // Ordena ranking para apresentar na tabela
          SORTED_RANK_FILE_INFO = ordenaInfo(RANK_FILE_INFO);
          
          /*console.log(response.result);
          console.log(response.result.fileBlob);
          console.log(reader.result);
          console.log(RANK_FILE_INFO);
          console.log(SORTED_RANK_FILE_INFO);*/
          
          // DEBUG
          if (versao_teste_file) {
            console.log("2 de 2) Carregou RANKFILENAME (" + RANKFILENAME + ")");
          }
        
          // Imprime informações do ranking na tabela
          var infoText = "";
          infoText += "<h3>Dificuldade " + dificuldade + ":</h3>";
          infoText += "<table>";
  
          console.log(SORTED_RANK_FILE_INFO);

          infoText += "<tr><th>Nº</th><th>Nome</th><th>Tempo ajustado</th><th>Data</th><th>Tempo</th><th>Pontos</th></tr>";
          for (var i = 0; i < RANK_FILE_INFO.length; i++) {
            infoText += "<tr><td>" + (i+1) +"º</td><td>" + SORTED_RANK_FILE_INFO[i].substr(35) + "</td><td>" + SORTED_RANK_FILE_INFO[i].substr(1,5) + "</td><td>" + SORTED_RANK_FILE_INFO[i].substr(23,10) + "</td><td>" + SORTED_RANK_FILE_INFO[i].substr(9,5) + "</td><td>" + SORTED_RANK_FILE_INFO[i].substr(17,3) + "</td></tr>";
          }
          infoText += "</table><br><hr>";
    
          // Campo para informar o ranking
          document.getElementById('gameRank').innerHTML = infoText;
        }        
      })
      .catch(function(error) {
        console.error("dbx.fileDownload(RANK)");
        console.error(error);
      });
    }
  })
  .catch(function(error) {
    console.error("dbx.filesListFolder(RANK)");
    console.error(error);  
  });
}

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
        //let tempLista1 = lista[j];
        //let tempLista2 = lista[j + 1];
        //lista = lista.splice(j  ,1, tempLista1);
        //lista = lista.splice(j+1,1, tempLista2);
      }
    }
  }
  
  if (versao_teste) {
    console.log("Vetor ordenado:");
    console.log(vetor);
    console.log("Lista ordenada:");
    console.log(lista);
  }
  
  console.log(lista);
  
  return lista;
}

function trocaJogador() {
  document.getElementById("jogador").innerHTML = "<br><input class='changePlayerInput' id='novoNome'></input> <button class='changePlayerBtn' onclick='gravaNome()'>ok</button> , resolva o <u>PIC a PIX</u> abaixo:";
    
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
  
  atualizaNome();
}

function atualizaNome() {
  USER_NAME = localStorage.getItem("player");
    if (USER_NAME != null) {
      document.getElementById("jogador").innerHTML = "<a id='alterar' class='a_ON' href='#void' onclick='trocaJogador();'>(alterar)</a><br>" + USER_NAME + ", resolva o <u>PIC a PIX</u> abaixo:";
    } else {
      document.getElementById("jogador").innerHTML = "<a id='alterar' class='a_ON' href='#void' onclick='trocaJogador();'>(alterar)</a><br>" + "&lt Nome &gt, resolva o <u>PIC a PIX</u> abaixo:"; 
  }
  
  if (versao_teste_file) {
    console.log("PLAYER NAME:" + USER_NAME);  
  }
}
