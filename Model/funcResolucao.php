<?php 
echo "<pre>";
//Variáveis Globais
//$listaConectivos=array("^","v","-","!");
//Recebe um array de fórmulas, verifica se a digitação está correta e 
//devolve um array com a pergunta negada.
//Se houver digitação incorreta gera uma exceção (trabalhar na exceção depois)
function negaPergunta($listaFormulas,$tamanho){
	//Nega a pergunta
	$listaFormulas[$tamanho-1]="not".$listaFormulas[$tamanho-1];
	//Tratar a entrada, verificação de digitação correta
	foreach ($listaFormulas as $key => $value) {
		verificaFormulaCorreta($listaFormulas[$key]);
		$entradaConvertida[$key]=resolveParenteses2($listaFormulas[$key]);
	}
	
	return $entradaConvertida;
}
function converteFNC(&$form){
	//Se for átomo, então sai
	if (!is_array($form)) {
		if (strlen($form)<=2) {
			return;
		}
	}
	if (is_array($form)) {
		if ($form['esquerdo']==NULL && ($form['conectivo']=='not' || $form['conectivo']==NULL)) {
			return;
		}
	}
	
	//Primeiro, remover a implicação, se houver
	
	resolveImplicacoes($form);
	//print "<br>PRIMEIRO PASSO CONCLUÍDO<br>";
	//print_r($form);

	//Segundo Passar todos os not fora de parênteses para dentro
	formataFormulas($form);
	$aux1=&$form['esquerdo'];
	$aux2=&$form['direito'];
	$c=0;

	//Se for not_e ao passar o not para dentro, vira um ou
	if($form['conectivo']=='not_e'){
		//Se os 2 lados não forem arrays, o tratamento é simples
		if (!is_array($form['direito']) && !is_array($form['direito']) ) {
			$form['direito']="!(".$form['direito'].")";
			$form['esquerdo']="!(".$form['esquerdo'].")";
		}
		//Se o lado direito for array, preciso negar apenas o conectivo
		if (is_array($form['direito'])) {
			if ($form['direito']['conectivo']=='not') {
				$form['direito']['conectivo']=NULL;
			}
			elseif ($form['direito']['conectivo']=='e') {
				$form['direito']['conectivo']='not_e';
			}
			elseif ($form['direito']['conectivo']=='not_e') {
				$form['direito']['conectivo']='e';
			}
			elseif ($form['direito']['conectivo']=='ou') {
				$form['direito']['conectivo']='not_ou';
			}
			elseif ($form['direito']['conectivo']=='not_ou') {
				$form['direito']['conectivo']='ou';
			}
			elseif ($form['direito']['conectivo']=='implica') {
				$form['direito']['conectivo']='not_implica';
			}
			elseif ($form['direito']['conectivo']=='not_implica') {
				$form['direito']['conectivo']='implica';
			}
		}
		//Caso os dois lados não sejam array, mas só direito seja, devo tratá-lo
		if (!is_array($form['direito']) && is_array($form['esquerdo'])) {
				$form['direito']="!(".$form['direito'].")";
			}
		//Se o lado esquerdo for array, preciso negar apenas o conectivo
		if (is_array($form['esquerdo'])) {
			if ($form['esquerdo']['conectivo']=='not') {
				$form['esquerdo']['conectivo']=NULL;
			}
			elseif ($form['esquerdo']['conectivo']=='e') {
				$form['esquerdo']['conectivo']='not_e';
			}
			elseif ($form['esquerdo']['conectivo']=='not_e') {
				$form['esquerdo']['conectivo']='e';
			}
			elseif ($form['esquerdo']['conectivo']=='ou') {
				$form['esquerdo']['conectivo']='not_ou';
			}
			elseif ($form['esquerdo']['conectivo']=='not_ou') {
				$form['esquerdo']['conectivo']='ou';
			}
			elseif ($form['esquerdo']['conectivo']=='implica') {
				$form['esquerdo']['conectivo']='not_implica';
			}
			elseif ($form['esquerdo']['conectivo']=='not_implica') {
				$form['esquerdo']['conectivo']='implica';
			}
		}
		//Caso os dois lados não sejam array, mas só esquerdo seja, devo tratá-lo
		if(!is_array($form['esquerdo']) && is_array($form['direito'])){
				$form['esquerdo']="!(".$form['esquerdo'].")";
			}
		$form['conectivo']='ou';
		
	}
	if($form['conectivo']=='not_ou'){
		//Se os 2 lados não forem arrays, o tratamento é simples
		if (!is_array($form['direito']) && !is_array($form['esquerdo']) ) {
			$form['direito']="!(".$form['direito'].")";
			$form['esquerdo']="!(".$form['esquerdo'].")";
		}
		//Se o lado direito for array, preciso negar apenas o conectivo
		if (is_array($form['direito'])) {
			if ($form['direito']['conectivo']=='not') {
				$form['direito']['conectivo']=NULL;
			}
			elseif ($form['direito']['conectivo']=='e') {
				$form['direito']['conectivo']='not_e';
			}
			elseif ($form['direito']['conectivo']=='not_e') {
				$form['direito']['conectivo']='e';
			}
			elseif ($form['direito']['conectivo']=='ou') {
				$form['direito']['conectivo']='not_ou';
			}
			elseif ($form['direito']['conectivo']=='not_ou') {
				$form['direito']['conectivo']='ou';
			}
			elseif ($form['direito']['conectivo']=='implica') {
				$form['direito']['conectivo']='not_implica';
			}
			elseif ($form['direito']['conectivo']=='not_implica') {
				$form['direito']['conectivo']='implica';
			}
		}
		//Caso os dois lados não sejam array, mas só direito seja, devo tratá-lo
		else{
			$form['direito']="!(".$form['direito'].")";
		}
		//Se o lado esquerdo for array, preciso negar apenas o conectivo
		if (is_array($form['esquerdo'])) {
			if ($form['esquerdo']['conectivo']=='not') {
				$form['esquerdo']['conectivo']=NULL;
			}
			elseif ($form['esquerdo']['conectivo']=='e') {
				$form['esquerdo']['conectivo']='not_e';
			}
			elseif ($form['esquerdo']['conectivo']=='not_e') {
				$form['esquerdo']['conectivo']='e';
			}
			elseif ($form['esquerdo']['conectivo']=='ou') {
				$form['esquerdo']['conectivo']='not_ou';
			}
			elseif ($form['esquerdo']['conectivo']=='not_ou') {
				$form['esquerdo']['conectivo']='ou';
			}
			elseif ($form['esquerdo']['conectivo']=='implica') {
				$form['esquerdo']['conectivo']='not_implica';
			}
			elseif ($form['esquerdo']['conectivo']=='not_implica') {
				$form['esquerdo']['conectivo']='implica';
			}
		}
		//Caso os dois lados não sejam array, mas só esquerdo seja, devo tratá-lo
		else{
			$form['esquerdo']="!(".$form['esquerdo'].")";
		}
		$form['conectivo']='e';
	}
	
	do{
		if(@$aux1['conectivo']=='not_e'){
			if (is_array($aux1['esquerdo']) && $aux1['esquerdo']['conectivo']=='not') {
				$aux1['esquerdo']=$aux1['esquerdo']['direito'];
			}
			else{
				$aux1['esquerdo']="!(".$aux1['esquerdo'].")";
			}
			if (is_array($aux1['direito']) && $aux1['direito']['conectivo']=='not') {
				$aux1['direito']=$aux1['direito']['direito'];
			}
			else{
				$aux1['direito']="!(".$aux1['direito'].")";
			$aux1['conectivo']='ou';
			}
		}
		if(@$aux1['conectivo']=='not_ou'){
			if (is_array($aux1['esquerdo']) && $aux1['esquerdo']['conectivo']=='not') {
				$aux1['esquerdo']=$aux1['esquerdo']['direito'];
			}
			else{
				$aux1['esquerdo']="!(".$aux1['esquerdo'].")";
			}
			if (is_array($aux1['direito']) && $aux1['direito']['conectivo']=='not') {
				$aux1['direito']=$aux1['direito']['direito'];
			}
			else{
				$aux1['direito']="!(".$aux1['direito'].")";
			}
			$aux1['conectivo']='e';
		}
		if(@$aux2['conectivo']=='not_e'){
			if (is_array($aux2['esquerdo']) && $aux2['esquerdo']['conectivo']=='not') {
				$aux2['esquerdo']=$aux2['esquerdo']['direito'];
			}
			else{
				$aux2['esquerdo']="!(".$aux2['esquerdo'].")";
			}
			if (is_array($aux2['direito']) && $aux2['direito']['conectivo']=='not') {
				$aux2['direito']=$aux2['direito']['direito'];
			}
			else{
				$aux2['direito']="!(".$aux2['direito'].")";
			}
			$aux2['conectivo']='ou';
		}
		
		if(@$aux2['conectivo']=='not_ou'){
			if (is_array($aux2['direito']) && $aux2['direito']['conectivo']=='not') {
				$aux2['direito']=$aux2['direito']['direito'];
			}
			else{
				$aux2['direito']="!(".$aux2['direito'].")";
			}
			
			$aux2['conectivo']='e';
			if (is_array($aux2['esquerdo']) && $aux2['esquerdo']['conectivo']=='not') {
				$aux2['esquerdo']=$aux2['esquerdo']['direito'];
			}
			else{
				$aux2['esquerdo']="!(".$aux2['esquerdo'].")";
			}
			
		}
		if(@is_array($aux1['esquerdo']) && $aux1['esquerdo']['conectivo']!='not'){
			$array1=$aux1;
			$aux1=&$aux1['esquerdo'];
		}
		//else{
		//	break;
		//}
		if(@is_array($aux2['direito']) && $aux1['esquerdo']['conectivo']!='not'){
			$array2=$aux2;
			$aux2=&$aux2['direito'];
		}
		else{
			break;
		}
		$c++;
	}while ($array1['esquerdo'] || $array1['direito'] || $array2['esquerdo'] || $array2['direito']);

	//print "<br>SEGUNDO PASSO CONCLUÍDO<BR>";
	//print_r($form);
	
	//Terceira, aplicar a distributiva, formalizar o "e" de "ou"
	if($form['conectivo']=='ou'){
		if(is_array($form['esquerdo']) && $form['esquerdo']['conectivo']=='e'){
			$aux1=&$form['esquerdo'];
			$auxilia['esquerdo']=NULL;
			$auxilia['conectivo']=NULL;
			$auxilia['direito']=NULL;
			if(!is_array($form['direito'])){
				$aux3=$aux1['direito'];
				$aux1['direito']=$form['direito'];
				$aux1['conectivo']="ou";
				$form['direito']=array('esquerdo' => $aux3 , 'conectivo' => "ou" , 'direito' => $form['direito'] );
				$form['conectivo']='e';
			}
			elseif(is_array($form['direito'])){
				$aux3=$aux1['direito'];
				$aux1['direito']=$form['direito'];
				$aux1['conectivo']="ou";
				$form['direito']=array('esquerdo' => $aux3 , 'conectivo' => "ou" , 'direito' => $form['direito'] );
				$form['conectivo']='e';
			}
		}
	
		elseif(is_array($form['direito']) && $form['direito']['conectivo']=='e'){
			$aux2=&$form['direito'];
			if(!is_array($form['esquerdo'])){
				$aux3=$aux2['esquerdo'];
				$aux2['esquerdo']=$form['esquerdo'];
				$aux2['conectivo']="ou";
				$form['esquerdo']=array('esquerdo' => $aux3 , 'conectivo' => "ou" , 'direito' => $form['esquerdo'] );
				$form['conectivo']='e';
			}
			elseif(is_array($form['esquerdo'])){
				$aux3=$aux2['esquerdo'];
				$aux2['esquerdo']=$form['esquerdo'];
				$aux2['conectivo']="ou";
				$form['esquerdo']=array('esquerdo' => $aux3 , 'conectivo' => "ou" , 'direito' => $form['esquerdo'] );
				$form['conectivo']='e';
			}
		}
	}
}
function casarAtomo($hash,$aux,$sinal){
	$aux2=$sinal == "not" ? 0:1;
	if (count($hash)<1) {
		return false;
	}
	foreach ($hash as $key => $value) {			
		//Verifico se alguma vez esse cara já foi setado na hash
		if(!is_null($hash[$key])){
			if(($hash[$key]==!$aux2) && ($aux==$key)){
				return true;
			}				
		}
	}
	return false;
}
//Talvez precise de melhorias
function checaImplica(&$form){
	$esquerdo=true;
	$direito=true;
	$aux=$form;
	while($esquerdo || $direito){
		if($esquerdo){
			if(@$aux['conectivo']=='implica' || @$aux['conectivo']=='not_implica') {
				return true;
			}
			elseif(@is_array($aux['esquerdo'])){
				$aux=$aux['esquerdo'];
			}
			else{
				$esquerdo=false;
			}
		}
		elseif($direito){
			if(@$aux['conectivo']=='implica' || @$aux['conectivo']=='not_implica') {
				return true;
			}
			elseif(@is_array($aux['direito'])){
				$aux=$aux['direito'];
			}
			else{
				$direito=false;
			}
		}
	}
}
function resolveImplicacoes(&$form){

		$flag=true;
		$form3=&$form;


		
		//VAI MUDAR PARA O CASO GERAL (IDEIA: USAR WHILE)
		//Caso de implicação dentro de um not
		implica:
		while($flag){
			//print "<br>Fórmula<br>";
			//print_r($form);
			if($form['conectivo']=="not_implica"){
			if (!is_array($form['direito'])) {
				//Se já houver um "not", remove
				if ($form['direito'][0]=='!') {
					$form['direito']=substr($form['direito'], 1);
				}


				elseif(@strlen($form['direito'])==1){
					$form['direito']="!(".$form['direito'].")";
				}
				else{
					$form['direito']="!".$form['direito'];
				}
				
				$form['conectivo']="e";

			}
			elseif(is_array($form['direito'])){
				//Se já houver um "not", remove

				if (checaAtomico($form['direito'])) {
					//Pode ser um átomo, neste caso eu devo simplesmente tratar o not
					if ($form['direito']['conectivo']=='not') {
						$form['direito']['conectivo']=NULL;
					}
					elseif($form['direito']['conectivo']==NULL) {
						$form['direito']['conectivo']='not';
					}
				}
				elseif (!checaAtomico($form['direito'])) {
					//Caso não seja átomo eu preciso negar o conectivo externo da fórmula,
					//que seria equivalente a pôr um not no exterior do parênteses
					if ($form['direito']['conectivo']=='e') {
						$form['direito']['conectivo']='not_e';
					}
					elseif ($form['direito']['conectivo']=='not_e') {
						$form['direito']['conectivo']='e';
					}
					elseif ($form['direito']['conectivo']=='ou') {
						$form['direito']['conectivo']='not_ou';
					}
					elseif ($form['direito']['conectivo']=='not_ou') {
						$form['direito']['conectivo']='ou';
					}
					elseif ($form['direito']['conectivo']=='implica') {
						$form['direito']['conectivo']='not_implica';
					}
					elseif ($form['direito']['conectivo']=='not_implica') {
						$form['direito']['conectivo']='implica';
					}
				}				
				$form['conectivo']="e";
			}
			
		}
		
		//Caso de implicação sem not
		elseif($form['conectivo']=="implica"){

			if (!is_array($form['esquerdo'])) {
				//Se já houver um "not", remove
				if ($form['esquerdo'][0]=='!') {
					$form['esquerdo']=substr($form['esquerdo'], 1);
				}
				elseif(@strlen($form['esquerdo'])==1){
					$form['esquerdo']="!(".$form['esquerdo'].")";
				}
				else{
					$form['esquerdo']="!".$form['esquerdo'];
				}
				//print "<br>Esquerdo<br>";
				//print_r($form);
				
				$form['conectivo']="ou";

			}
			elseif(is_array($form['esquerdo'])){
				//Se já houver um "not", remove
				if (checaAtomico($form['esquerdo'])) {
					//Pode ser um átomo, neste caso eu devo simplesmente tratar o not
					if ($form['esquerdo']['conectivo']=='not') {
						$form['esquerdo']['conectivo']=NULL;
					}
					elseif($form['esquerdo']['conectivo']==NULL) {
						$form['esquerdo']['conectivo']='not';
					}
				}
				elseif (!checaAtomico($form['direito'])) {
					//Caso não seja átomo eu preciso negar o conectivo externo da fórmula,
					//que seria equivalente a pôr um not no exterior do parênteses
					if ($form['esquerdo']['conectivo']=='e') {
						$form['esquerdo']['conectivo']='not_e';
					}
					elseif ($form['esquerdo']['conectivo']=='not_e') {
						$form['esquerdo']['conectivo']='e';
					}
					elseif ($form['esquerdo']['conectivo']=='ou') {
						$form['esquerdo']['conectivo']='not_ou';
					}
					elseif ($form['esquerdo']['conectivo']=='not_ou') {
						$form['esquerdo']['conectivo']='ou';
					}
					elseif ($form['esquerdo']['conectivo']=='implica') {
						$form['esquerdo']['conectivo']='not_implica';
					}
					elseif ($form['esquerdo']['conectivo']=='not_implica') {
						$form['esquerdo']['conectivo']='implica';
					}
				}
				
				$form['conectivo']="ou";
			}
		}
			formataFormulas($form);
			if (checaImplica($form['esquerdo'])) {
				$form=&$form['esquerdo'];
				break;
			}
			if (checaImplica($form['direito'])) {
				$form=&$form['direito'];
				break;
			}
			if ($form!=$form3) {
				$form=&$form3;
			}
			if ($form==$form3) {
				$flag=false;
			}
			print "<br>";

		}
		//formataFormulas($form);
		if (checaImplica($form)) {
			$flag=true;
			goto implica;
		}
	}
function checaAtomico($form){
	//@ colocado para previnir que fórmulas não instanciadas deem warning
	if (@$form['esquerdo']==NULL && (@$form['conectivo']==NULL || @$form['conectivo']='not')) {
		return true;
	}
	else{
		return false;
	}	
}
function checaExisteArray($listaFormulas){
	foreach ($listaFormulas as $key => $value) {
		if (is_array($listaFormulas[$key])) {
			if ($listaFormulas[$key]['conectivo']!='not') {
				return true;
			}
		}
		if (is_array($listaFormulas[$key]['esquerdo'])) {
			if ($listaFormulas[$key]['esquerdo']['conectivo']!='not') {
				return true;
			}
		}
		if (is_array($listaFormulas[$key]['direito'])) {
			if ($listaFormulas[$key]['direito']['conectivo']!='not') {
				return true;
			}
		}
		
		if(!is_array($listaFormulas[$key]['esquerdo'])){
			if($listaFormulas[$key]['esquerdo']!=NULL) {
				return true;
			}
		}
	}
	return false;
}
function separarE(&$arrayFormulas,&$entradaConvertida,&$aux1,&$aux2,$contador){
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
}
//Faz uma checagem nos arrays e na hash para saber se há algum átomo fechando
function confrontaAtomos(&$arrayFormulas,&$hashResolucao,&$flag){
	foreach ($arrayFormulas as $key => $value) {
		if (is_array($value['esquerdo']) && @$value['esquerdo']['esquerdo']==NULL && @$value['direito']==NULL) {
			//Se o atomo que está chegando casar com algum já existente, então fechamos a resolução
			if(casarAtomo($hashResolucao,$value['esquerdo']['direito'],$value['esquerdo']['conectivo'])){
				print "<br>Fechou, contradição com o átomo abaixo<br>";
				print_r($value['esquerdo']['direito']);
				//print "<br>primeira condição<br>";
				$flag=true;
				break;
			}
			$hashResolucao[$value['esquerdo']['direito']]=$value['esquerdo']['conectivo'] == "not" ? '0':'1';
		}
		if (is_array($value['direito']) && @$value['direito']['esquerdo']==NULL && @$value['esquerdo']==NULL) {
			if(casarAtomo($hashResolucao,$value['direito']['direito'],$value['direito']['conectivo'])){
				print "<br>Fechou, contradição com o átomo abaixo<br>";
				print_r($value['direito']['direito']);
				//print "<br>Segunda condição<br>";
				$flag=true;
				break;
			}
			$hashResolucao[$value['direito']['direito']]=$value['direito']['conectivo'] == "not" ? '0':'1';
		}
		if ($value['esquerdo']==NULL) {
			if(casarAtomo($hashResolucao,$value['direito'],$value['conectivo'])){
				print "<br>Fechou, contradição com o átomo abaixo<br>";
				print_r($value['direito']);
				//print "<br>Terceira condição<br>";
				$flag=true;
				break;
			}
			$hashResolucao[$value['direito']]=$value['conectivo'] == "not" ? '0':'1';
		}
	}
}
function separarOU1(&$arrayFormulas,&$hashResolucao){
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
					if(@$hashResolucao[$value['esquerdo']['direito']]=='0'){
						//$value['esquerdo']=NULL;
						//garantidamente se o átomo não é array ele é positivo, então recebe 1
						$hashResolucao[$value['esquerdo']['direito']]='1';
						//$value['conectivo']=NULL;
						break;
					}
				}
				if((is_array($value['direito']) && $value['direito']['conectivo']==NULL)){
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
						//Correção para que o átomo se torne um array com o lado direito preenchido
						$aux['esquerdo']=NULL;
						$aux['conectivo']=NULL;
						$aux['direito']=$value['direito'];
						$arrayFormulas[$key]=$aux;
						break;
					}
				}
				if(!is_array($value['direito'])){
					//Pode acontecer de não existir o cara na hash ainda, então o @ é pra omitir este aviso desnecessário
					if(@$hashResolucao[$value['direito']]=='0'){
						//print "<br>Formula completa<br>";
						//print_r($value['direito']);
						//print "<br>hash<br>";
						//print_r($hashResolucao);
						//O cara que vai sobrar do "ou" pode ser adicionado na hash caso seja átomo
						if (!is_array($value['esquerdo'])) {
							$hashResolucao[$value['esquerdo']]='1';
						}
						elseif(is_array($value['esquerdo']) && $value['esquerdo']['conectivo']=='not') {
							$hashResolucao[$value['esquerdo']['direito']]='0';
						}
						$aux['esquerdo']=NULL;
						$aux['conectivo']=NULL;
						$aux['direito']=$value['esquerdo'];
						$arrayFormulas[$key]=$aux;
						break;
					}
				}
			}
		}
		
	}
	//Correção de átomos
	//Átomos que virarem array(array(direiro=>X)) passam a ser array(direito=>X)
	foreach ($arrayFormulas as $key => $value) {
		corrigeAtomos($arrayFormulas[$key]);
	}
}
function separarOU2(&$arrayFormulas){
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
}
function separarOU3(&$arrayFormulas,&$hashResolucao){
	//Caso complexo simplificação por partes
	//Se eu tiver um array grande de ou, vou pegar cada átomo disponível e diminuí-lo
	foreach ($arrayFormulas as $key => $value) {
		if ($arrayFormulas[$key]['conectivo']=='ou') {
			//Checar se os dois lados são arrays
			if (is_array($value['esquerdo']) && is_array($value['direito'])) {
				//Checar se esquerdo e direito são arrays compostos de 'ou'
				if ($value['esquerdo']['conectivo']=='ou' && $value['direito']['conectivo']=='ou') {
					foreach ($hashResolucao as $key2 => $value2) {
						if ($key2==$value['esquerdo']['esquerdo']) {
							//Se esquerdo esquerdo for átomo positivo, corta com o da hash
							if ($value2=='0' && !is_array($value['esquerdo']['esquerdo'])) {
								$arrayFormulas[$key]['esquerdo']['esquerdo']=null;
							}
							elseif ($value2=='1' && @$value['esquerdo']['esquerdo']['conectivo']=='not') {
								$arrayFormulas[$key]['esquerdo']['esquerdo']=null;
							}
							break;
						}

						if ($key2==$value['esquerdo']['direito']) {
							//Se esquerdo esquerdo for átomo positivo, corta com o da hash
							if ($value2=='0' && !is_array($value['esquerdo']['direito'])) {
								$arrayFormulas[$key]['esquerdo']['direito']=null;
							}
							elseif ($value2=='1' && @$value['esquerdo']['direito']['conectivo']=='not') {
								$arrayFormulas[$key]['esquerdo']['direito']=null;
							}
							break;
						}

						if ($key2==$value['direito']['esquerdo']) {
							//Se esquerdo esquerdo for átomo positivo, corta com o da hash
							if ($value2=='0' && !is_array($value['direito']['esquerdo'])) {
								$arrayFormulas[$key]['direito']['esquerdo']=null;
							}
							elseif ($value2=='1' && @$value['direito']['esquerdo']['conectivo']=='not') {
								$arrayFormulas[$key]['direito']['esquerdo']=null;
							}
							break;
						}

						if ($key2==$value['direito']['direito']) {
							//Se esquerdo esquerdo for átomo positivo, corta com o da hash
							if ($value2=='0' && !is_array($value['direito']['direito'])) {
								$arrayFormulas[$key]['direito']['direito']=null;
							}
							elseif ($value2=='1' && @$value['direito']['direito']['conectivo']=='not') {
								$arrayFormulas[$key]['direito']['direito']=null;
							}
							break;
						}
					}
				}
			}
		}

		//Correções no array
		if (@$arrayFormulas[$key]['esquerdo']['esquerdo']==null && @$arrayFormulas[$key]['esquerdo']['conectivo']=='ou') {
			$arrayFormulas[$key]['esquerdo']=$arrayFormulas[$key]['esquerdo']['direito'];
		}
		if (@$arrayFormulas[$key]['esquerdo']['direito']==null && @$arrayFormulas[$key]['esquerdo']['conectivo']=='ou') {
			$arrayFormulas[$key]['esquerdo']=$arrayFormulas[$key]['esquerdo']['esquerdo'];
		}
		if (@$arrayFormulas[$key]['direito']['esquerdo']==null && @$arrayFormulas[$key]['direito']['conectivo']=='ou') {
			$arrayFormulas[$key]['direito']=$arrayFormulas[$key]['direito']['direito'];
		}
		if (@$arrayFormulas[$key]['direito']['direito']==null && @$arrayFormulas[$key]['direito']['conectivo']=='ou') {
			$arrayFormulas[$key]['direito']=$arrayFormulas[$key]['direito']['esquerdo'];
		}
		//corrigeArrays($arrayFormulas[$key]['esquerdo']);
		//corrigeArrays($arrayFormulas[$key]['direito']);
		//corrigeAtomos($arrayFormulas[$key]['direito']);
		//corrigeAtomos($arrayFormulas[$key]['esquerdo']);
	
		if (!is_array($arrayFormulas[$key])) {
			$hashResolucao[$arrayFormulas[$key]['direito']]='1';
		}
		elseif(is_array($arrayFormulas[$key]) && $arrayFormulas[$key]['conectivo']=='not') {
			print "<br>Problema<br>";
			print_r($arrayFormulas[$key]['direito']);
			$hashResolucao[$arrayFormulas[$key]['direito']]='0';
		}
	}
}
function corrigeAtomos(&$form){
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

//Função que corrige casos em que temos um campo array do tipo fórmula dentro de outro
//array do tipo fórmula com um dos campos (esquerdo ou direito) vazio

function corrigeArrays(&$form){
	if (@$form['esquerdo']==NULL && @is_array($form['direito'])) {
		$aux1=$form['direito'];
		$form['esquerdo']=$aux1['esquerdo'];
		$form['conectivo']=$aux1['conectivo'];
		$form['direito']=$aux1['direito'];
		return;
	}
	if (@$form['direito']==NULL && @is_array($form['esquerdo'])) {
		$aux1=$form['esquerdo'];
		$form['esquerdo']=$aux1['esquerdo'];
		$form['conectivo']=$aux1['conectivo'];
		$form['direito']=$aux1['direito'];
	}
	//Correção para caso haja um átomo sendo tratado como array
	//dentro de um array, por exemplo form[esquerdo][esquerdo]==null e form[esquerdo][direito]==algumacoisa
	if (is_array(@$form['esquerdo']['esquerdo']) && @$form['esquerdo']['esquerdo']['esquerdo']==NULL && @$form['esquerdo']['esquerdo']['conectivo']==NULL) {
		$form['esquerdo']['esquerdo']=$form['esquerdo']['esquerdo']['direito'];
		return;
	}
	if (is_array(@$form['esquerdo']['direito']) && @$form['esquerdo']['direito']['esquerdo']==NULL && @$form['esquerdo']['direito']['conectivo']==NULL) {
		$form['esquerdo']['direito']=$form['esquerdo']['direito']['direito'];
		return;
	}
	if (is_array(@$form['direito']['direito']) && @$form['direito']['direito']['esquerdo']==NULL && @$form['direito']['direito']['conectivo']==NULL) {
		$form['direito']['direito']=$form['direito']['direito']['direito'];
		return;
	}
	return;
	
}
?>