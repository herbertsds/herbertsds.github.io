<?php 
require_once("funcAuxiliares.php");
require_once("exerciciosListas.php");
require_once("funcTableaux.php");
echo "<pre>";
//-------------------------------------VARIÁVEIS--GLOBAIS-------------------------------------------
//

$hashInicial = array();
$fork = false;
$listaConectivos=array("^","v","-","!");
$listaFormulasNaoUsadas = array();
$listaFormulasDisponiveis = array();
$nivelG=0;
$numRamoGlobal=1;
//-------------------------------------VARIÁVEIS--GLOBAIS--------------------------------------------

//Inicialização das fórmulas, aqui recebo os dados para resolver o tableaux
//Vai sofrer mudanças, ao invés de inicializar diretamente eu receberei arrays e formulas prontas
//Mas no momento está assim para os testes iniciais


//Estrutura de dados
/*
As fórmulas agora possuem os seguintes campos
$form = array ('info' => array ('esquerdo' => , 'conectivo' => , 'direito' =>), '')
*/
//
/* -----Algoritmo Base-----
1. Ler as fórmulas e armazenar numa lista
2. Negar a pergunta
3. Inicializa uma raiz com as fórmulas  e a lista de fórmulas disponíveis
4. Adicione átomos na hash se houverem (verifica o fechamento)
5. Para cada fórmula não usada faça:
6. 	Aplica a regra na fórmula escolhida (pode ser feito do modo eficiente, do modo arbitrário, ou da escolha direta do usuário)
7.  Faça a fórmula atual gerar filhos de acordo com a regra escolhida
8. 	Adicione átomos na hash se houverem
9	Para os ramos gerados, checar se fecham.
10.	Se todos os ramos estiverem fechados PARE.
*/


//Passo 1

//Recebe do front-end a entrada, que pode ser tanto um array novo quanto um exercício da lista de exercícios
/*
.
.
Colocar aqui como vou receber do front-end
.
.
*/


$entradaTeste=$DNNquestao4;
$tamanho=count($entradaTeste);

//Passo 2
$entradaTeste=negaPergunta($entradaTeste,$tamanho);

//Passos 3 e 4
//$raiz=array();
foreach ($entradaTeste as $key => $value) {
	//$raiz[$key]=$value;
	$listaFormulasDisponiveis[$key]=$value;
	//Checa se é átomo para adicionar na hash

	if($value['info']['esquerdo']==NULL && ($value['info']['conectivo']==NULL || $value['info']['conectivo']=='not')){
		$hashInicial[$value['info']['direito']]=$value['info']['conectivo'] == "not" ? 0:1;
	}
}

print_r($listaFormulasDisponiveis);
print_r($hashInicial);

//Passo 5
$flagFechou=false;
$contador=0;
$escolhaAleatoria=false;
$escolhaEficiente=true;
$escolhaUsuario=false;
$raiz=criaFormulaTableaux();
$historicoVariaveis=array();
$nosFolha=array();

//Inicialização do histórico de variáveis
//Neste passo qualquer nó pode ser raiz
$historicoVariaveis[0]['raiz']=criaFormulaTableaux();
$historicoVariaveis[0]['nosFolha']=null;
$historicoVariaveis[0]['listaFormulasDisponiveis']=null;
$historicoVariaveis[0]['numPasso']=0;

/*
print "<br>Modo de Usuário escolhe a fórmula<br>";
escolhaUsuario($listaFormulasDisponiveis,$hashInicial,$listaFormulasDisponiveis[0],$nosFolha);
$contador++;


//print "<br>Imprime raiz<br>";
//print_r($raiz);
escolhaUsuario($listaFormulasDisponiveis,$hashInicial,$listaFormulasDisponiveis[1],$nosFolha,$nosFolha[0]);
print "<br>Imprime raiz<br>";
print_r($raiz);
$contador++;

//escolhaUsuario($listaFormulasDisponiveis,$hashInicial,$listaFormulasDisponiveis[2],$nosFolha,$raiz,$nosFolha[0]);

//$contador++;
*/




while (!(todasFechadas($nosFolha)) && ($contador<100)) {
	//Recebe do front-end o critério para escolha de fórmula
	////////////////////////////////
	//.
	//.
	//Colocar aqui como vou receber do front-end
	//.
	//.
	//////////////////////////////////

	//Recebe do front-end o critério para escolha de fórmula
	/////////////////////////////////
	//.
	//.
	//Colocar aqui "voltar um passo"
	//.
	//.
	///////////////////////////
	
	if ($escolhaAleatoria) {
		# Chama a função de escolha aleatória
		print "<br>Não está feito ainda a função de escolha aleatória<br>";
		break;
	}
	elseif ($escolhaEficiente) {
		/////////////////////
		//.
		//.
		////Receber aqui avançar um passo se for verdade, se não for simplesmente resolve tudo
		//.
		//.
		////////////////////
		# Chama a função de escolha eficiente
		print "<br>Chamando a função de escolha eficiente<br>";
		foreach ($listaFormulasDisponiveis as $key => $value) {
			print "key ".$key."<br>";
			print_r($value['info']);
			print "<br>";
		}
		escolhaEficiente($listaFormulasDisponiveis,$hashInicial,$nosFolha,$historicoVariaveis);
		
		if (todasFechadas($nosFolha)) {
			//print "<br>Todos os ramos já estão fechados<br>";
			//print $contador."<br>";
			break;
		}
		print "<br>Contador ".$contador."<br>";
		
	}
	elseif ($escolhaUsuario) {
		# Chama a função de escolha do usuário
		print "<br>Não está feito ainda a função de escolha do usuário<br>";
		break;
	}

	$contador++;
}


if (todasFechadas($nosFolha)) {
	print "<br>Todos os ramos foram fechados com sucesso<br>";
	print $contador."<br>";
}
else{
	print "<br>Nem todos os ramos foram fechados<br>Este Tableaux não fecha<br>";
}
print "<br>Árvore a partir da raiz<br>";
imprimeArvore($raiz);

?>