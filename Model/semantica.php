<?php 
require_once("funcAuxiliares.php");
require_once("exerciciosListas.php");
require_once("funcSemantica.php");
echo "<pre>";
//-------------------------------------VARIÁVEIS--GLOBAIS-------------------------------------------
//

$listaConectivos=array("^","v","-","!",'@','&');
$nosFolha=[];
$flag=true;
$contador=0;

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
1. Ler a fórmula e o Domínio
2. Gerar uma árvore da fórmula de acordo com o domínio definido
3. Receber um conjunto contendo uma relação pra cada função
4. verificar a validade da fórmula
*/

//(paraTodoz(paraTodoy(paraTodox((P(x,y,z))e(Q(x,y,z))))))
//Passo 1
//(paraTodox(P(x)eQ(x))implica((paraTodox(P(x)))e(paraTodox(Q(x)))))
//$entrada = array ("(paraTodox(A(x)eB(x)))");
//(((paraTodox(P(x)))e(paraTodox(Q(x))))implica(paraTodox((P(x))e(Q(x)))))

$entrada = $SEMquestao1;
//$entrada = array ("(paraTodoz(paraTodoy(paraTodox((P(x,y,z))e(Q(x,y,z))))))");
//$entrada = array("((A(x)^B(x))implica(C(x)^D(x)))");
$dominio= array ('0','1');
$tamanho=count($entrada);
$entradaConvertida=processaEntradaSemantica($entrada);
print_r($entradaConvertida);

adicionaArray($nosFolha, $entradaConvertida[0]);

//Passo 2
//Gera a raiz com seus primeiros filhos
while ($nosFolha!=null) {
	geraArvore($entradaConvertida[0],$dominio,$nosFolha,$contador);
}

//Passo 3

$relacoes = array ("P(0)","Q(0)","P(1)","Q(1)");
print "<br>Relações<br>";
print_r($relacoes);

//Passo 4
print "<br>Após a aplicação de preencheProximo<br>";
preencheProximo($relacoes,$entradaConvertida[0]);
validaFormulas($relacoes,$entradaConvertida[0]);

print "<br>Imprime a arvore toda<br>";
imprimeArvore($entradaConvertida[0]);



?>