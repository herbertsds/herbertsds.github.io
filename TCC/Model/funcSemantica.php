<?php 
require_once("formula.php");
require_once("funcAuxiliares.php");
require_once("exerciciosListas.php");

echo "<pre>";
//Variáveis Globais
$listaConectivos=array("^","v","-","!",'@','&');

function processaEntradaSemantica($listaFormulas){
	//Tratar a entrada, verificação de digitação correta
	foreach ($listaFormulas as $key => $value) {
		verificaFormulaCorreta($listaFormulas[$key]);
		$entradaConvertida[$key]=resolveParentesesSemantica($listaFormulas[$key]);
		print '<br>Fórmula correta<br>';
		print_r($entradaConvertida[$key]);
	}
	
	return $entradaConvertida;
}

function geraArvore(&$formula,$dominio,&$nosFolha,&$contador){
	if ($contador==0) {
		aplicaRegraSemantica($formula,$dominio,$nosFolha);
		$contador++;
	}
	else{
		foreach ($nosFolha as $key => $value) {
			aplicaRegraSemantica($nosFolha[$key],$dominio,$nosFolha);
		}
	}
	
}
function aplicaRegraSemantica(&$formula,$dominio,&$nosFolha){
	$noAuxEsq=criaFormulaSemantica();
	$noAuxDir=criaFormulaSemantica();
	$noAuxEsq2=criaFormulaSemantica();
	$noAuxDir2=criaFormulaSemantica();
	
	if (@$formula['info']['esquerdo']!=null) {
		//if (!is_array($formula['info']['esquerdo'])) {

		corrigeAtomos($formula['info']['esquerdo']);
		$noAuxEsq=resolveParentesesSemantica($formula['info']['esquerdo']);
			//print_r($formula['info']['esquerdo']);
		/*}
		else{
			$noAuxEsq2=resolveParentesesSemantica($formula['info']['esquerdo']);
			$noAuxEsq=&$formula['info']['esquerdo'];
			$noAuxEsq['info']=$noAuxEsq2['info'];
		}
		*/
		//print "<br>esquerdo<br>";
		//print_r($noAuxEsq['info']);
	}
	if (@$formula['info']['direito']!=null) {
		//if (!is_array($formula['info']['direito'])) {
		corrigeAtomos($formula['info']['direito']);
			$noAuxDir=resolveParentesesSemantica($formula['info']['direito']);
		/*}
		else{
			$noAuxDir2=resolveParentesesSemantica($formula['info']['direito']);

			$noAuxDir=&$formula['info']['direito'];
			$noAuxDir['info']=$noAuxDir2['info'];
		}
		*/
		//print_r($noAuxDir['info']);
	}
	$noAuxDir['pai']=&$formula;
	$noAuxEsq['pai']=&$formula;
	//print_r($formula['info']);
	//print_r($formula['pai']['info']);
	//print "<br>filhos<br>";
	//print_r($formula['pai']['filhos']);
	removerFormula($nosFolha,$formula['info']);
	switch ($formula['info']['conectivo']['operacao']) {
		case 'e':
			print "<br>Aplicou o e<br>";
			adicionaArray($formula['filhos'], $noAuxEsq);
			adicionaArray($formula['filhos'], $noAuxDir);

			$formula['filhos'][0]['proximo']=&$formula['filhos'][1];

			adicionaArray($nosFolha, $noAuxEsq);
			adicionaArray($nosFolha, $noAuxDir);
			break;
		case 'ou':
			print "<br>Aplicou o ou<br>";
			adicionaArray($formula['filhos'], $noAuxEsq);
			adicionaArray($formula['filhos'], $noAuxDir);

			$formula['filhos'][0]['proximo']=&$formula['filhos'][1];

			adicionaArray($nosFolha, $noAuxEsq);
			adicionaArray($nosFolha, $noAuxDir);
			break;		
		case 'implica':
			print "<br>Aplicou o implica<br>";
			adicionaArray($formula['filhos'], $noAuxEsq);
			adicionaArray($formula['filhos'], $noAuxDir);

			$formula['filhos'][0]['proximo']=&$formula['filhos'][1];

			adicionaArray($nosFolha, $noAuxEsq);
			adicionaArray($nosFolha, $noAuxDir);
			break;
		case 'not_e':
			adicionaArray($formula['filhos'], $noAuxEsq);
			adicionaArray($formula['filhos'], $noAuxDir);

			$formula['filhos'][0]['proximo']=&$formula['filhos'][1];

			adicionaArray($nosFolha, $noAuxEsq);
			adicionaArray($nosFolha, $noAuxDir);
			break;
		case 'not_ou':
			adicionaArray($formula['filhos'], $noAuxEsq);
			adicionaArray($formula['filhos'], $noAuxDir);

			$formula['filhos'][0]['proximo']=&$formula['filhos'][1];

			adicionaArray($nosFolha, $noAuxEsq);
			adicionaArray($nosFolha, $noAuxDir);
			break;
		case 'not_implica':
			adicionaArray($formula['filhos'], $noAuxEsq);
			adicionaArray($formula['filhos'], $noAuxDir);

			$formula['filhos'][0]['proximo']=&$formula['filhos'][1];

			adicionaArray($nosFolha, $noAuxEsq);
			adicionaArray($nosFolha, $noAuxDir);
			break;
		case 'paraTodo':
			foreach ($dominio as $key => $value) {
				$auxString=$formula['info']['direito'];
				$noAux=criaFormulaSemantica();
				for ($i=0; $i < strlen($auxString); $i++) { 
					if ($auxString[$i]==$formula['info']['conectivo']['variavel']) {
						$auxString[$i]=$value;
					}
				}
				$noAux=resolveParentesesSemantica($auxString);
				$noAux['pai']=&$formula;
				adicionaArray($formula['filhos'],$noAux);
				if ($key>0) {
					$formula['filhos'][$key-1]['proximo']=&$formula['filhos'][$key];
				}
				
				adicionaArray($nosFolha, $noAux);
				unset($noAux);
			}
			break;
		case 'xist':
			foreach ($dominio as $key => $value) {
				$auxString=$formula['info']['direito'];
				$noAux=criaFormulaSemantica();
				for ($i=0; $i < strlen($auxString); $i++) { 
					if ($auxString[$i]==$formula['info']['conectivo']['variavel']) {
						$auxString[$i]=$value;
					}
				}
				$noAux=resolveParentesesSemantica($auxString);
				$noAux['pai']=&$formula;
				adicionaArray($formula['filhos'],$noAux);
				if ($key>0) {
					$formula['filhos'][$key-1]['proximo']=&$formula['filhos'][$key];
				}
				adicionaArray($nosFolha, $noAux);
				unset($noAux);
			}
			break;
		case 'not_paraTodo':
			foreach ($dominio as $key => $value) {
				$auxString=$formula['info']['direito'];
				$noAux=criaFormulaSemantica();
				for ($i=0; $i < strlen($auxString); $i++) { 
					if ($auxString[$i]==$formula['info']['conectivo']['variavel']) {
						$auxString[$i]=$value;
					}
				}
				$noAux=resolveParentesesSemantica($auxString);
				$noAux['pai']=&$formula;
				adicionaArray($formula['filhos'],$noAux);
				if ($key>0) {
					$formula['filhos'][$key-1]['proximo']=&$formula['filhos'][$key];
				}
				adicionaArray($nosFolha, $noAux);
				unset($noAux);
			}
			break;
		case 'not_xist':
			foreach ($dominio as $key => $value) {
				$auxString=$formula['info']['direito'];
				$noAux=criaFormulaSemantica();
				for ($i=0; $i < strlen($auxString); $i++) { 
					if ($auxString[$i]==$formula['info']['conectivo']['variavel']) {
						$auxString[$i]=$value;
					}
				}
				$noAux=resolveParentesesSemantica($auxString);
				$noAux['pai']=&$formula;
				adicionaArray($formula['filhos'],$noAux);
				if ($key>0) {
					$formula['filhos'][$key-1]['proximo']=&$formula['filhos'][$key];
				}
				adicionaArray($nosFolha, $noAux);
				unset($noAux);
			}
			break;
		
		default:
			# code...
			break;
	}
}
function criaFormulaSemantica(){
	$aux['info']=array('esquerdo' => null, 'conectivo' => array('operacao' => null, 'variavel'=> null), 'direito' =>null);
	$aux['filhos']=[];
	$aux['pai']=NULL;
	$aux['valor']=false;
	$aux['usado']=false;
	$aux['proximo']=null;
	return $aux;
}

function adicionaArray(&$array,&$valor){
	$tam=count($array);
	$soma=1;
	if ($tam!=0) {
		//Consertar o índice do array para evitar sobreposição
		while (@$array[$tam+$soma]!=null) {
			$soma++;
		}
		if (@$array[$tam+$soma-1]==null) {
			$soma--;
		}
		$array[$tam+$soma]=&$valor;
	}
	else{
		$array[0]=&$valor;
	}
}
function checaAtomico($form){
	//@ colocado para previnir que fórmulas não instanciadas deem warning
	if (@$form['esquerdo']==NULL && (@$form['conectivo']==NULL || @$form['conectivo']='not')) {
		return true;
	}
	if (!is_array($form)) {
		return true;
	}
	else{
		return false;
	}	
}
function checaAtomicoSemantica($form){
	//@ colocado para previnir que fórmulas não instanciadas deem warning
	if (@$form['info']['esquerdo']==NULL && (@$form['info']['conectivo']['operacao']==NULL || @$form['info']['conectivo']['operacao']='not')) {
		return true;
	}
	if (!is_array($form)) {
		return true;
	}
	else{
		return false;
	}	
}
function removerFormula(&$listaFormulas,$form){
	foreach ($listaFormulas as $key => $value) {
		if ($value['info']==$form) {
			unset($listaFormulas[$key]);
			return;
		}
	}
}

function imprimeArvore($raiz){
	
	print "<br>Fórmula inicial<br>";
	print "<br>Valor: ";
		if ($raiz['valor']==false) {
			print "Falso<br>";
		}
		else{
			print "Verdade<br>";
		}
		print "<br>Usado: ";
		if ($raiz['usado']==false) {
			print "Falso<br>";
		}
		elseif($raiz['usado']==true){
			print "Verdade<br>";
		}
	print_r($raiz['info']);
	print "<br>Filhos no próximo nível<br>";
	foreach ($raiz['filhos'] as $key => $value) {
		print "<br>Valor: ";
		if ($value['valor']==false) {
			print "Falso<br>";
		}
		else{
			print "Verdade<br>";
		}
		print "<br>Usado: ";
		if ($value['usado']==false) {
			print "Falso<br>";
		}
		elseif($value['usado']==true){
			print "Verdade<br>";
		}
		print_r($value['info']);
		//print "<br>Próximo: <br>";
		//print_r($value['proximo']['info']);
	}
	$posicao=0;
	//$posicao2=0;
	if ($raiz['filhos'][0]!=null) {
		$lista1=$raiz['filhos'];
	}
	$lista2=[];
	retorno:
	if ($lista1[0]['filhos']!=null) {
		print "<br>Filhos no próximo nível<br>";
	}
	foreach ($lista1 as $key => $value) {
		foreach ($value['filhos'] as $key2 => $value2) {
			array_push($lista2, $value2);
			print "<br>Valor: ";
			if ($value2['valor']==false) {
				print "Falso<br>";
			}
			elseif ($value2['valor']==true) {
				print "Verdade<br>";
			}
			print "<br>Usado: ";
			if ($value2['usado']==false) {
				print "Falso<br>";
			}
			elseif($value2['usado']==true){
				print "Verdade<br>";
			}
			print_r($value2['info']);
			//print "<br>Próximo: <br>";
			//print_r($value['proximo']['info']);
		}
		//Se os filhos deste nó acabarem
		if ($key==(count($lista1)-1)) {
			//Verificar se há irmão, se houver, ele deve ser o novo aux
			//para imprimir todos os seus filhos que são do mesmo nível
			if (@$lista2!=null) {
				$lista1=$lista2;
				$lista2=[];
				goto retorno;
			}
			else{
				return;
			}
		}
	}
}
function listaFolhas($raiz){
	$listaF=[];
	if ($raiz['filhos'][0]!=null) {
		$lista1=$raiz['filhos'];
	}
	$lista2=[];
	retorno:
	foreach ($lista1 as $key => $value) {
		if ($value['filhos']==null) {
			array_push($listaF, $lista1[$key]);
		}
		foreach ($value['filhos'] as $key2 => $value2) {
			array_push($lista2, $value2);
			
		}
		//Se os filhos deste nó acabarem
		if ($key==(count($lista1)-1)) {
			//Verificar se há irmão, se houver, ele deve ser o novo lista1
			//para imprimir todos os seus filhos que são do mesmo nível
			if (@$lista2!=null) {
				$lista1=$lista2;
				$lista2=[];
				goto retorno;
			}
			else{
				return $listaF;
			}
		}
	}
}

function preencheProximo($relacoes,&$raiz){
	$flag=true;
	$lista1=[];
	$lista2=[];
	//Se for igual a null lançar uma exceção
	if ($raiz['filhos']!=null) {
		foreach ($raiz['filhos'] as $key => $value) {
			adicionaArray($lista1,$raiz['filhos'][$key]);
		}
	}
	//print "<br>Imprime Filhos<br>";
	//print_r($navega['filhos']);
	while ($flag) {
		$flag=false;
		foreach ($lista1 as $key => $value) {
			foreach ($lista1[$key]['filhos'] as $key2 => $value2) {
				adicionaArray($lista2,$lista1[$key]['filhos'][$key2]);
			}
		}
		foreach ($lista2 as $key => $value) {
			if ($lista2[$key]['proximo']==null && @$lista2[$key+1]!=null) {
				$lista2[$key]['proximo']=&$lista2[$key+1];
			}
		}
		$lista1=$lista2;
		$lista2=[];
		foreach ($lista1 as $key => $value) {
			if ($value['filhos']!=null) {
				$flag=true;
				break;
			}
		}
	}
}

function validaFormulas($relacoes,&$raiz){
	$flag=true;
	$lista1=[];
	$lista2=[];
	$navega;
	$navega=&$raiz;

	//print "<br>Imprime Filhos<br>";
	//print_r($navega['filhos']);

	retorno:
	while (1) {
		$usados=0;
		$total=0;
		$lista1=[];
		
		if ($navega['info']==$raiz['info']) {
			if ($navega['filhos'][0]['usado']==true) {
				validaConectivo($raiz,$relacoes);
				return;
			}
			else{
				$navega=&$raiz['filhos'][0];
				if ($raiz['filhos'][0]['usado']==true) {
					validaConectivo($raiz['filhos'][0],$relacoes);
					validaConectivo($raiz['filhos'][1],$relacoes);
				}

			}
		}
		while ($navega!=null) {
			foreach ($navega['filhos'] as $key => $value) {
				if ($navega['filhos'][$key]['usado']==false) {
					adicionaArray($lista1,$navega['filhos'][$key]);
				}
				
			}
			$navega=&$navega['proximo'];
		}
		//Se eu veriricar que todos os filhos são verdadeiros, quebro o loop
		foreach ($lista1 as $key => $elemento) {
			if ($elemento['filhos']!=null) {
				foreach ($elemento['filhos'] as $key2 => $filho) {
					$total++;
					if ($filho['usado']==true) {
						$usados++;
					}
				}
			}
		}
		if ($total==$usados && $total!=0) {
			break;
		}
		//Se todos os filhos foram null então quebro o loop
		$total=0;
		foreach ($lista1 as $key => $value) {
			if ($value['filhos']==null) {
				$total++;
			}
		}

		if (count($lista1)==$total) {
			break;
		}
		$navega=&$lista1[0];
		
	}
	foreach ($lista1 as $key => $value) {		
		validaConectivo($lista1[$key],$relacoes);
	}
	if ($raiz['usado']==false) {
		$navega=$raiz;
		$lista1=[];
		goto retorno;
	}

	return;
}
function validaConectivo(&$pai,$relacoes){
	switch ($pai['info']['conectivo']['operacao']) {
		case 'e':
			foreach ($pai['filhos'] as $key => $value) {
				if (!$value['valor']) {
					$pai['valor']=false;
					$pai['usado']=true;
					return;
				}
			}
			$pai['usado']=true;
			$pai['valor']=true;
			return;
		case 'ou':
			foreach ($pai['filhos'] as $key => $value) {
				if ($value['valor']) {
					$pai['valor']=true;
					$pai['usado']=true;
					return;
				}
			}
			$pai['usado']=false;
			$pai['valor']=true;
			return;
		case 'implica':
			if ($pai['filhos'][0]['valor']==true && $pai['filhos'][1]['valor']==false) {
				$pai['valor']=false;
				$pai['usado']=true;
				return;	
			}
			else{
				$pai['usado']=true;
				$pai['valor']=true;
				return;
			}
		case 'paraTodo':
			foreach ($pai['filhos'] as $key => $value) {
				if (!$value['valor']) {
					$pai['valor']=false;
					$pai['usado']=true;
					return;
				}
			}
			$pai['usado']=true;
			$pai['valor']=true;
			return;
		case 'xist':
			foreach ($pai['filhos'] as $key => $value) {
				if ($value['valor']) {
					$pai['valor']=true;
					$pai['usado']=true;
					return;
				}
			}
			$pai['usado']=false;
			$pai['valor']=true;
			return;
		case null:
			if (checaAtomicoSemantica($pai)) {
				if (in_array($pai['info']['direito'],$relacoes)) {
					$pai['valor']=true;
				}
				$pai['usado']=true;
			}
			else{
				//lançar uma exceção aqui
			}
		default:
			# code...
			break;
	}
}

function noArray($variavel,$array){
	foreach ($array as $key => $value) {
		if ($value['info']==$variavel['info']) {
			return true;
		}
	}
	return false;

}



function corrigeAtomos(&$form){
	if (strlen($form)==1) {
		$form="(".$form.")";
	}
	if(@$form['esquerdo']==NULL && @is_array($form['direito'])){
		if (@$form['direito']['esquerdo']==NULL) {
			$form['conectivo']=$form['direito']['conectivo'];
			$form['direito']=$form['direito']['direito'];
		}
	}
	
	if (@strlen(@$form['esquerdo'])==3 && @$form['esquerdo'][0]=='(' ) {
		$form['esquerdo']=substr($form['esquerdo'], 1);
		$form['esquerdo']=substr($form['esquerdo'], 0, strlen($form['esquerdo'])-1);
		//$form['esquerdo']=$form;
	}
	if (@strlen(@$form['direito'])==3 && @$form['direito'][0]=='(' ) {
		$form['direito']=substr($form['direito'], 1);
		$form['direito']=substr($form['direito'], 0, strlen($form['direito'])-1);
		//$form['direito']=$form['direito'];
	}
}

?>