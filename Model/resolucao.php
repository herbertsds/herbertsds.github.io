<?php 
require_once("formula.php");
require_once("funcAuxiliares.php");
require_once("exerciciosListas.php");
require_once("funcResolucao.php");
echo "<pre>";
//Variáveis Globais
$listaConectivos=array("^","v","-","!");
/*----Algoritmo Base------
1. Ler as fórmulas e armazenar numa lista
2. Negar a pergunta
3. Passar todas as fórmulas para FNC (conectivo e não pode estar dentro de parênteses)
4. Separar todos os "e", ou seja, cada "e" vira uma fórmula (ou linha) independente. 
5. Verificar se há átomos, havendo, confrontar átomos para ver se a resolução fecha.
Se não fechar, vá para a próxima etapa.
6. Fazer as simplificações do "ou", se possível. Se Av¬B e AvB então A. Se Av¬B e B então A
7. Verificar se há átomos, havendo, confrontar átomos para ver se a resolução fecha.
Se não fechar, o problema não é possível de resolver.
 
*/
$listaFormulasDisponiveis = array();
$tamanho=0;
//Passos 1 e 2
//Entrada

$entradaTeste= $DNNquestao43;

$tamanho=count($entradaTeste);
//Receber a entrada do Front-End
//Negação da pergunta+Validação
$entradaConvertida=negaPergunta($entradaTeste,$tamanho);
print "<br>Entrada recebida<br>";
print_r($entradaConvertida);
//Print, pré-processa os notnot
foreach ($entradaTeste as $key => $value) {
	if ($entradaConvertida[$key]['conectivo']=='notnot') {
		$entradaConvertida[$key]['conectivo']=NULL;
	}
	if (!is_array($entradaConvertida[$key]['direito']) && $entradaConvertida[$key]['direito']!=NULL && strlen($entradaConvertida[$key]['direito'])>4 ) {
				if ($entradaConvertida[$key]['direito'][0]!='(' && ($entradaConvertida[$key]['direito'][0]!='!' && $entradaConvertida[$key]['direito'][1]!='(' )) {
					$entradaConvertida[$key]['direito']="(".$entradaConvertida[$key]['direito'];
					$entradaConvertida[$key]['direito']=$entradaConvertida[$key]['direito'].")";
				}
			}

			if (!is_array($entradaConvertida[$key]['esquerdo']) && $entradaConvertida[$key]['esquerdo']!=NULL && strlen($entradaConvertida[$key]['esquerdo'])>4 ) {

				if ($entradaConvertida[$key]['esquerdo'][0]!='(' && ($entradaConvertida[$key]['esquerdo'][0]!='!' && $entradaConvertida[$key]['esquerdo'][1]!='(' )) {
					$entradaConvertida[$key]['esquerdo']="(".$entradaConvertida['esquerdo'];
					$entradaConvertida[$key]['esquerdo']=$entradaConvertida[$key]['esquerdo'].")";
				}
			}		
}
print "<br>Após o processamento dos notnot<br>";
print_r($entradaConvertida);
//Se houver digitação incorreta vai haver um aviso. Para o front-end adicionar uma flag (valor "1")
//A flag vai indicar que a fórmula está incorreta e ficar pedindo a digitação correta para o front-end
//Quando a flag voltar para o valor "0" pode passar para a próxima entrada
//Passo 3
foreach ($entradaConvertida as $key => $value) {
	converteFNC($entradaConvertida[$key]);
}
print "<br>Após FNC<br>";
print_r($entradaConvertida);
//Loop para tranfosformar em arrays as fórmulas mais internas, por exemplo
//Nesta etapa um Av(BeC) é representado como
//$form['esquerdo']=A  $form['conectivo']='ou' $form['direito']='BvC'
//Após este loop, este lado direito também estará no formato de array, dentro desse array mais externo
foreach ($entradaConvertida as $key => $value) {
	if (is_array($value['esquerdo'])) {
		formataFormulas($entradaConvertida[$key]['esquerdo']);
	}
	if (is_array($value['direito'])) {
		formataFormulas($entradaConvertida[$key]['direito']);
	}
	elseif (!(is_array($value['esquerdo'])) && !(is_array($value['direito']))) {
		formataFormulas($entradaConvertida[$key]);
	}	
}
foreach ($entradaConvertida as $key => $value) {
	formataFormulas($entradaConvertida[$key]);
}
print "<br>Após a formatação<br>";
print_r($entradaConvertida);
print "<br>Após o tratamento dos arrays<br>";
foreach ($entradaConvertida as $key => $value) {
	corrigeArrays($entradaConvertida[$key]);
}
print_r($entradaConvertida);
//Os próximos passos precisam ser repetidos afim de extrair os arrays mais internos de fórmulas mais complexas
$contador=0;
$flag=false;
while ($contador <= 10){
	if ($contador==0) {

			foreach ($entradaConvertida as $key => $value) {
				corrigeArrays($entradaConvertida[$key]);
				corrigeAtomos($entradaConvertida[$key]);	

				
			}
	}
	
	//Passo 4
	$aux1['esquerdo']=NULL;
	$aux1['conectivo']=NULL;
	$aux1['direito']=NULL;
	$aux2['esquerdo']=NULL;
	$aux2['conectivo']=NULL;
	$aux2['direito']=NULL;
	separarE($arrayFormulas,$entradaConvertida,$aux1,$aux2,$contador);
	print "<br> FÓRMULAS APÓS SEPARAÇÃO DO E<BR>";
	foreach ($arrayFormulas as $key => $value) {
		corrigeArrays($arrayFormulas[$key]);
		corrigeAtomos($arrayFormulas[$key]['esquerdo']);
		corrigeAtomos($arrayFormulas[$key]['direito']);
	}
	print_r($arrayFormulas);
	//Passo 5
	$hashResolucao=array();
	confrontaAtomos($arrayFormulas,$hashResolucao,$flag);
	if($flag){
		goto fim;
	}
	print "HASH<BR>";
	print_r($hashResolucao);
	//Passo 6
	//
	separarOU1($arrayFormulas,$hashResolucao);
	print "APÓS A SIMPLIFICAÇÃO DE 'OU' SIMPLES<BR>";
		print_r($arrayFormulas);
		print_r($hashResolucao);

	foreach ($arrayFormulas as $key => $value) {
		corrigeArrays($arrayFormulas[$key]);
	}

	//Simplificação do tipo: Se Av¬B e AvB então A.
	separarOU2($arrayFormulas);
	print "APÓS A SIMPLIFICAÇÃO DE 'OU' COMPOSTO<BR>";
		print_r($arrayFormulas);
		print_r($hashResolucao);	


	foreach ($arrayFormulas as $key => $value) {
		corrigeArrays($arrayFormulas[$key]);
		corrigeAtomos($arrayFormulas[$key]['esquerdo']);
		corrigeAtomos($arrayFormulas[$key]['direito']);
	}

	separarOU3($arrayFormulas,$hashResolucao);
	print "APÓS A SIMPLIFICAÇÃO DE 'OU' COMPLEXO 1<BR>";
		print_r($arrayFormulas);
		print_r($hashResolucao);	


	foreach ($arrayFormulas as $key => $value) {
		corrigeArrays($arrayFormulas[$key]);
		corrigeAtomos($arrayFormulas[$key]['esquerdo']);
		corrigeAtomos($arrayFormulas[$key]['direito']);
	}
	//Passo 5 - REPETIÇÃO
	confrontaAtomos($arrayFormulas,$hashResolucao,$flag);
	if($flag){
		goto fim;
	}
	if(!checaExisteArray($arrayFormulas)){
		print "<br>Não existem mais array, saindo do loop<br><br>";
		break;
	}
	else{
		print "<br>Ainda existe array, próxima iteração<br><br>";
	}
	$contador++;
}
fim:
print "<br>Encerra processamento<br>";
?>