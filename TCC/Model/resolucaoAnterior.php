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
$entradaTeste= $DNNquestao1;
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
print "<br>Após a formatação<br>";
print_r($entradaConvertida);
print "<br>Após o tratamento dos átomos<br>";
print_r($entradaConvertida);
//Os próximos passos precisam ser repetidos afim de extrair os arrays mais internos de fórmulas mais complexas
$contador=0;
while ($contador <= 10){
	
	//Passo 4
	$aux1['esquerdo']=NULL;
	$aux1['conectivo']=NULL;
	$aux1['direito']=NULL;
	$aux2['esquerdo']=NULL;
	$aux2['conectivo']=NULL;
	$aux2['direito']=NULL;
	if ($contador==0) {
		$arrayFormulas=array();
		foreach ($entradaConvertida as $key => $value) {
			if($value['conectivo']=='e'){
				if (!is_array($value['esquerdo'])) {
					$aux1['direito']=$value['esquerdo'];
					array_push($arrayFormulas, $aux1);
				}
				else{
					array_push($arrayFormulas, $value['esquerdo']);
				}
				if (!is_array($value['direito'])) {
					$aux2['direito']=$value['direito'];
					array_push($arrayFormulas, $aux2);
				}
				else{
					array_push($arrayFormulas, $value['direito']);
				}			
				
			}
			else{
				array_push($arrayFormulas, $value);
			}
		}
	}
	else{
		foreach ($arrayFormulas as $key => $value) {
			if($value['conectivo']=='e'){
				if (is_array($value['esquerdo'])) {
					array_push($arrayFormulas, $value['esquerdo']);
				}
				else{
					$arrayAux['esquerdo']=NULL;
					$arrayAux['conectivo']=NULL;
					$arrayAux['direito']=$value['esquerdo'];
					array_push($arrayFormulas, $arrayAux);
				}
				if (is_array($value['direito'])) {
					array_push($arrayFormulas, $value['direito']);
				}
				else{
					$arrayAux['esquerdo']=NULL;
					$arrayAux['conectivo']=NULL;
					$arrayAux['direito']=$value['direito'];
					array_push($arrayFormulas, $arrayAux);
				}
				unset($arrayFormulas[$key]);
			}
		}
	}
	
	print "<br> FÓRMULAS APÓS SEPARAÇÃO DO E<BR>";
	print_r($arrayFormulas);
	//Passo 5
	$hashResolucao=array();
	foreach ($arrayFormulas as $key => $value) {
		if (is_array($value['esquerdo']) && @$value['esquerdo']['esquerdo']==NULL && @$value['direito']==NULL) {
			//Se o atomo que está chegando casar com algum já existente, então fechamos a resolução
			if(casarAtomo($hashResolucao,$value['esquerdo']['direito'],$value['esquerdo']['conectivo'])){
				print "<br>Fechou, contradição com o átomo abaixo<br>";
				print_r($value['esquerdo']['direito']);
				print "<br>primeira condição<br>";
				goto fim;
			}
			$hashResolucao[$value['esquerdo']['direito']]=$value['esquerdo']['conectivo'] == "not" ? '0':'1';
		}
		if (is_array($value['direito']) && @$value['direito']['esquerdo']==NULL && @$value['esquerdo']==NULL) {
			if(casarAtomo($hashResolucao,$value['direito']['direito'],$value['direito']['conectivo'])){
				print "<br>Fechou, contradição com o átomo abaixo<br>";
				print_r($value['direito']['direito']);
				print "<br>Segunda condição<br>";
				goto fim;
			}
			$hashResolucao[$value['direito']['direito']]=$value['direito']['conectivo'] == "not" ? '0':'1';
		}
		if ($value['esquerdo']==NULL) {
			if(casarAtomo($hashResolucao,$value['direito'],$value['conectivo'])){
				print "<br>Fechou, contradição com o átomo abaixo<br>";
				print_r($value['direito']);
				print "<br>Terceira condição<br>";
				goto fim;
			}
			$hashResolucao[$value['direito']]=$value['conectivo'] == "not" ? '0':'1';
		}
	}
	print "HASH<BR>";
	print_r($hashResolucao);
	//Passo 6
	//
	foreach ($arrayFormulas as $key => $value) {
		//Simplificação do tipo: Se Av¬B e B então A
		foreach ($hashResolucao as $key2 => $value2) {
			if ($value['conectivo']=="ou"){
				//Se for um array atômico, ele pode ser not
				//Sendo not, se houver o mesmo átomo positivo na hash, ou seja átomo==1
				//Significa que esse membro é falso e eu posso isolar o lado direito do "ou"
				if(is_array($value['esquerdo']) && $value['esquerdo']['esquerdo']==NULL && $value['esquerdo']['conectivo']=='not'){
					//Pode acontecer de não existir o cara na hash ainda, então o @ é pra omitir este aviso desnecessário
					if(@$hashResolucao[$value['esquerdo']['direito']]=='1'){
						print "<br>Teste de if<br>";
						print "Formula completa<br>";
						print_r($value);
						print "<br>lado que fez entrar no if<br>";
						print_r($value['esquerdo']['direito']);
						print "<br>";
						//O lado direito também pode ser array, porém não importa o que ele contém. Será verdade
						if(is_array($value['direito'])){
							$arrayFormulas[$key]['esquerdo']=$arrayFormulas[$key]['direito']['esquerdo'];
							$arrayFormulas[$key]['conectivo']=$arrayFormulas[$key]['direito']['conectivo'];
							$arrayFormulas[$key]['direito']=$arrayFormulas[$key]['direito']['direito'];
							break;					
							
						}
						elseif(!is_array($value['direito'])){
							$arrayFormulas[$key]['esquerdo']=NULL;					
							$hashResolucao[$arrayFormulas[$key]['direito']]=$value['conectivo'] == "not" ? '0':'1';
							$arrayFormulas[$key]['conectivo']=NULL;
							break;
						}
					}
				}
				//Se for um array atômico, pode ser not
				//Sendo not, se houver o mesmo átomo positivo na hash, ou seja átomo==1
				//Significa que esse membro é falso e eu posso isolar o lado direito do "ou"
				if(is_array($value['direito']) && $value['direito']['esquerdo']==NULL && $value['direito']['conectivo']=='not'){								
					if(@$hashResolucao[$value['direito']['direito']]=='1'){
						print "<br>Teste de if<br>";
						print "Formula completa<br>";
						print_r($value);
						print "<br>lado que fez entrar no if<br>";
						print_r($value['direito']['direito']);
						print "<br>";
						//O lado direito também pode ser array, porém não importa o que ele contém. Será verdade
						if(is_array($value['esquerdo']) && $value['esquerdo']['conectivo']!='not'){
							$arrayFormulas[$key]['esquerdo']=$arrayFormulas[$key]['esquerdo']['esquerdo'];
							$arrayFormulas[$key]['conectivo']=$arrayFormulas[$key]['esquerdo']['conectivo'];
							$arrayFormulas[$key]['direito']=$arrayFormulas[$key]['esquerdo']['direito'];
							break;
						}
						elseif(is_array($value['esquerdo']) && $value['esquerdo']['conectivo']=='not'){
							$arrayFormulas[$key]['conectivo']=$arrayFormulas[$key]['esquerdo']['conectivo'];
							$arrayFormulas[$key]['direito']=$arrayFormulas[$key]['esquerdo']['direito'];
							$arrayFormulas[$key]['esquerdo']=NULL;
							break;
						}

						elseif(!is_array($value['esquerdo'])){
							//CHECAR CASO DÊ ERRO
							//Todo átomo deve ser mantido do lado direito
							$arrayFormulas[$key]['direito']=$value['esquerdo'];
							$arrayFormulas[$key]['esquerdo']=NULL;
							$hashResolucao[$value['direito']['direito']]=$value['conectivo'] == "not" ? '0':'1';
							$arrayFormulas[$key]['conectivo']=NULL;
							break;
						}	
						
					}
				}
				//Pode ser um array de átomo positivo
				//Neste caso, temos que verificar, se há algum correspondente na hash com valor 0
				//Se houver significa que podemos cortar esse cara do "ou"
				if((is_array($value['esquerdo']) && $value['esquerdo']['conectivo']==NULL)){
					print "<BR>ENTREI1<BR>";
					if(@$hashResolucao[$value['esquerdo']['direito']]=='0'){
						//$value['esquerdo']=NULL;
						//garantidamente se o átomo não é array ele é positivo, então recebe 1
						$hashResolucao[$value['esquerdo']['direito']]='1';
						//$value['conectivo']=NULL;
						break;
					}
				}
				if((is_array($value['direito']) && $value['direito']['conectivo']==NULL)){
					print "<BR>ENTREI2<BR>";
					//Pode acontecer de não existir o cara na hash ainda, então o @ é pra omitir este aviso desnecessário
					if(@$hashResolucao[$value['direito']['direito']]=='0'){
						//$value['esquerdo']=NULL;
						//garantidamente se o átomo não é array ele é positivo, então recebe 1
						$hashResolucao[$value['direito']['direito']]='1';
						//$value['conectivo']=NULL;
						break;
					}
				}
				//Se não for array, então com certeza é um átomo positivo
				//Neste caso, temos que verificar, se há algum correspondente na hash com valor 0
				//Se houver significa que podemos cortar esse cara do "ou"
				if(!is_array($value['esquerdo'])){

					//Pode acontecer de não existir o cara na hash ainda, então o @ é pra omitir este aviso desnecessário
					if(@$hashResolucao[$value['esquerdo']]=='0'){
						//O cara que vai sobrar do "ou" pode ser adicionado na hash caso seja átomo
						if (!is_array($value['direito'])) {
							$hashResolucao[$value['direito']]='1';
						}
						elseif(is_array($value['direito']) && $value['direito']['conectivo']=='not') {
							$hashResolucao[$value['direito']['direito']]='0';
						}
						$arrayFormulas[$key]=$value['direito'];
						break;
					}
				}
				if(!is_array($value['direito'])){
					print "<BR>ENTREI4<BR>";
					//Pode acontecer de não existir o cara na hash ainda, então o @ é pra omitir este aviso desnecessário
					if(@$hashResolucao[$value['direito']]=='0'){
						print "<br>Formula completa<br>";
						print_r($value['direito']);
						print "<br>hash<br>";
						print_r($hashResolucao);
						//O cara que vai sobrar do "ou" pode ser adicionado na hash caso seja átomo
						if (!is_array($value['esquerdo'])) {
							$hashResolucao[$value['esquerdo']]='1';
						}
						elseif(is_array($value['esquerdo']) && $value['esquerdo']['conectivo']=='not') {
							$hashResolucao[$value['esquerdo']['direito']]='0';
						}
						$arrayFormulas[$key]=$value['esquerdo'];
						break;
					}
				}
			}
		}
		
	}
	print "APÓS A SIMPLIFICAÇÃO DE 'OU' SIMPLES<BR>";
		print_r($arrayFormulas);
		print_r($hashResolucao);
	//Simplificação do tipo: Se Av¬B e AvB então A.
	foreach ($arrayFormulas as $key => $value) {
		//Para reduzir um pouco o processamento que é de ordem quadrática, só entro no segundo loop
		//após achar uma fórmula que tenha ou como conectivo externo, no melhor caso esse processamento
		//passa a ser N invés de N²
		if ($value['conectivo']=='ou') {
			//Consideremos uma fórmula do tipo alfa v beta, onde alfa e beta podem ser fórmulas ou átomos
			foreach ($arrayFormulas as $key2 => $value2) {
				//Se alfa e beta forem iguais, pode pular esse processamento
				if ($value==$value2) {
					print "Os dois lados são iguais<br><br>";
					break;
				}
				//Haverão 4 possibilidades
				//1- Os Alfas são iguais e os betas são diferentes com o not sendo a diferença
				//2- Os Alfas são iguais e os betas são totalmente diferentes
				//3- Os Betas são iguais e os alfas são diferentes com o not sendo a diferença
				//4- Os Betas são iguais e os alfas são totalmente diferentes
				if ($value2['conectivo']=='ou') {					
					if ($value['esquerdo']==$value2['esquerdo']){
						//Possibilidade 1
						//Se o not estiver no beta da primeira fórmula
						if (is_array($value['direito']) && $value['direito']['conectivo']=='not') {
							if ((is_array($value2['direito']) && $value2['direito']['conectivo']==NULL && $value['direito']['direito']==$value2['direito']['direito']) || $value['direito']==$value2['direito'] ) {
								$arrayFormulas[$key]['direito']=NULL;
								//Se o esquerdo for átomo, vou corrigir e passar pra direita
								if($value['esquerdo']) {
									$arrayFormulas[$key]['direito']=$value['esquerdo'];
									$arrayFormulas[$key]['esquerdo']=NULL;
									$arrayFormulas[$key]['conectivo']=NULL;
								}
								if ($value['esquerdo']['conectivo']=='not') {
									$arrayFormulas[$key]['direito']['conectivo']='not';
									$arrayFormulas[$key]['direito']['direito']=$value['esquerdo']['direito'];
									$arrayFormulas[$key]['esquerdo']=NULL;
								}		
							}
						}
						//Se o not estiver no beta da segunda fórmula
						if (is_array($value2['direito']) && $value2['direito']['conectivo']=='not') {
							if ((is_array($value['direito']) && $value['direito']['conectivo']==NULL && $value2['direito']['direito']==$value2['direito']['direito']) || $value['direito']==$value2['direito'] ) {
								$arrayFormulas[$key]['direito']=NULL;
								//Se o esquerdo for átomo, vou corrigir e passar pra direita
								if(!is_array($value['esquerdo'])) {
									$arrayFormulas[$key]['direito']=$value['esquerdo'];
									$arrayFormulas[$key]['esquerdo']=NULL;
									$arrayFormulas[$key]['conectivo']=NULL;
								}
								if (@$value['esquerdo']['conectivo']=='not') {
									$arrayFormulas[$key]['direito']['conectivo']='not';
									$arrayFormulas[$key]['direito']['direito']=$value['esquerdo']['direito'];
									$arrayFormulas[$key]['esquerdo']=NULL;
								}		
							}
						}
						//Possibilidade 2
						//Se os beta forem diferentes, não preciso fazer nada						
					}
					
					if ($value['direito']==$value2['direito']){
						//Possibilidade 3
						//Se o not estiver no primeiro alfa
						if (is_array($value['esquerdo']) && $value['esquerdo']['conectivo']=='not') {
							if ((is_array($value2['esquerdo']) && $value2['esquerdo']['conectivo']==NULL && $value['esquerdo']['direito']==$value2['esquerdo']['direito']) || $value['esquerdo']==$value2['esquerdo'] ) {
								$arrayFormulas[$key]['esquerdo']=NULL;			
							}
						}
						//Se o not estiver no segundo alfa
						if (is_array($value2['esquerdo']) && $value2['esquerdo']['conectivo']=='not') {
							if ((is_array($value['esquerdo']) && $value['esquerdo']['conectivo']==NULL && $value['esquerdo']['direito']==$value2['esquerdo']['direito']) || $value['esquerdo']==$value2['esquerdo'] ) {
								$arrayFormulas[$key]['esquerdo']=NULL;			
							}
						}
						//Possibilidade 4
						//Se os alfa forem diferentes, não preciso fazer nada
					}
				}
			}
		}		
	}
	print "APÓS A SIMPLIFICAÇÃO DE 'OU' COMPOSTO<BR>";
		print_r($arrayFormulas);
		print_r($hashResolucao);
	
		
	//Passo 5 - REPETIÇÃO
	foreach ($arrayFormulas as $key => $value) {
		if (@is_array($value['esquerdo']) && @$value['esquerdo']['esquerdo']==NULL && @$value['direito']==NULL) {
			//Se o atomo que está chegando casar com algum já existente, então fechamos a resolução
			if(casarAtomo($hashResolucao,$value['esquerdo']['direito'],$value['esquerdo']['conectivo'])){
				print "<br>Fechou, contradição com o átomo abaixo<br>";
				print_r($value['esquerdo']['direito']);
				goto fim;
			}
			$hashResolucao[$value['esquerdo']['direito']]=$value['esquerdo']['conectivo'] == "not" ? '0':'1';
		}
		if (@is_array($value['direito']) && @$value['direito']['esquerdo']==NULL && @$value['esquerdo']==NULL) {
			if(casarAtomo($hashResolucao,$value['direito']['direito'],$value['direito']['conectivo'])){
				print "<br>Fechou, contradição com o átomo abaixo<br>";
				print_r($value['direito']['direito']);
				goto fim;
			}
			$hashResolucao[$value['direito']['direito']]=$value['conectivo']['esquerdo'] == "not" ? '0':'1';
		}
		if (@$value['esquerdo']==NULL) {
			if(casarAtomo($hashResolucao,$value['direito'],$value['conectivo'])){
				print "<br>Fechou, contradição com o átomo abaixo<br>";
				print_r($value['direito']);
				goto fim;
			}
			$hashResolucao[$value['direito']]=$value['conectivo'] == "not" ? '0':'1';
		}
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