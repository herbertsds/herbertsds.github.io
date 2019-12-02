<?php

//Função recebe um ponteiro para uma String fórmula e converte
//Seus conectivos para símbolos
function converteConectivoSimbolo(&$form){
	$form=str_replace('e','^',$form);
	$form=str_replace('ou','v',$form);
	$form=str_replace('implica','-',$form);
	$form=str_replace('not','!',$form);
	$form=str_replace('paraTodo','@',$form);
	$form=str_replace('xist','&',$form);
}

//Função recebe um ponteiro para uma String fórmula e converte
//Seus conectivos de símbolos para o nome por extenso
function converteConectivoExtenso(&$form){
	$form=str_replace('^','e',$form);
	$form=str_replace('v','ou',$form);
	$form=str_replace('-','implica',$form);
	$form=str_replace('!','not',$form);
	$form=str_replace('&','xist',$form);
	$form=str_replace('@','paraTodo',$form);
}

//Função auxiliar para facilitar a extração de conectivos de fórmulas com not
//Uso desta função é bem restrito e no momento do "parsing" das fórmulas
function converteConectivoNot(&$form){
	$form=str_replace('^','not_e',$form);
	$form=str_replace('v','not_ou',$form);
	$form=str_replace('-','not_implica',$form);
	$form=str_replace('&','not_xist',$form);
	$form=str_replace('@','not_paraTodo',$form);
}


//Função para verificação da corretude das formulas com parenteses
//Use no lado direito ou esquerdo de um objeto formula
//Recebe uma STRING e retorna erro caso haja, ou Ok caso esteja correta
//OBSERVAÇÃO IMPORTANTE
//Verificar durante a etapa de fazer o WebService funcionar
//Um tratamento para fórmulas incorretas, a aplicação NÃO pode encerrar
function verificaFormulaCorreta(&$form){
    
	$contador=0;
	$contador2=0;
	$i;
	$abreFormula=false;
	$esquerdo=true;
	$subFormula=0;
	//$auxFormula[];
	for ($i=0; $i<strlen($form); $i++){
		
		//Abriu parenteses
		if($form[$i]=='('){
			$contador+=1;
			if($form[$i+1]!='('){
				$abreFormula=true;
				$subFormula++;
			}
		}
		//Fecha parenteses
		elseif($form[$i]==')'){
			$contador-=1;
			if($contador<0){
				#Criar um tratamento aqui
				//Se o usuário digitar a entrada vamos precisar usar uma rotina de correção e chamar verifica recursivamente
				print "Fórmula com digitação incorreta<br>";
				print $form;
				print "<br>";
				exit(1);
			}
			
			if($abreFormula==true){
				$abreFormula=false;
			}
			$contador2++;
		}
		
	}
	if($contador!=0){
		#Criar um tratamento aqui
		//Se o usuário digitar a entrada vamos precisar usar uma rotina de correção e chamar verifica recursivamente
		print $form;
		print "<br>";
	    print "Fórmula com digitação incorreta";
		exit(1);
	}
	print "Fórmula Ok<br>";
	
}


//Recebe uma String fórmula (Não é um objeto fórmula), remove os parenteses mais externos
//e devolve um objeto Formula com os dois lados separados e o conectivo mais externo classificado
//Basicamente faz um "PARSING"
function resolveParenteses($form){
	global $listaConectivos;
	$auxForm = new Formula();
	$aux;
	$esquerdo=true;
	$abreFormula=false;
	$contador=0;
	$not=false;

	converteConectivoSimbolo($form);
	//print "<br> Teste".$form;
	//Se for um átomo positivo
	//OBS: Talvez haja uma maneira mais apropriada de tratar isto
	//Em caso de erro nos cálculos, checar esta etapa
	//Número 3 é porque há dois parênteses e o átomo SEMPRE, por exemplo: (A)

	if(strlen($form)==3){
		$form=substr($form, 1);
		$form=substr($form, 0, strlen($form)-1);
		$auxForm->setDireito($form);
		return $auxForm;
	}
	//Se for um átomo negativo
	//OBS: Talvez haja uma maneira mais apropriada de tratar isto
	//Em caso de erro nos cálculos, checar esta etapa
	//Número 4 é porque há dois parênteses e o átomo com negativo SEMPRE, por exemplo: (!A)

	if(strlen($form)==4){
		$form=substr($form, 1);		
		$form=substr($form, 1);
		$form=substr($form, 0, strlen($form)-1);
		$auxForm->setDireito($form);
		$auxForm->setConectivo("not");
		return $auxForm;
	}

	//Se não for átomo, caso mais geral
	for ($i=0; $i<strlen($form); $i++){
		//Caso notnotnot
		if($form[$i]=='!' && $form[$i+1]=='!' && $form[$i+2]=='!'){
			$form=substr($form, 4);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm->setDireito($form);
			$auxForm->setConectivo("not");
			return $auxForm;
		}
		//Caso notnot
		if($form[$i]=='!' && $form[$i+1]=='!'){
			$form=substr($form, 3);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm->setDireito($form);
			$auxForm->setConectivo("notnot");
			return $auxForm;
		}
		

		//Se achar o conectivo not no exterior de um parentese
		//Certamente há uma fórmula do tipo not para atribuir um conectivo not_algumacoisa
		//Mas preciso me certificar de que não é um átomo negativo, então verifico se o próximo elemento
		//é a abertura de um parenteses
		if($form[$i]=='!' && $form[$i+1]=='('){
			$not=true;
		}
		if($form[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($form[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($form[$i],$listaConectivos)) && ($contador==1)){
				if($not==true){
					$aux=$form[$i];
					converteConectivoNot($aux);
					$auxForm->setConectivo($aux);
					$esquerdo=false;
					$not=false;
				}
				else{
					$aux=$form[$i];
					converteConectivoExtenso($aux);
					$auxForm->setConectivo($aux);
					$esquerdo=false;
				}
				
			}
			if($esquerdo==true){
				$auxForm->setEsquerdo($auxForm->getEsquerdo().$form[$i]);
			}
			if($esquerdo==false){
				$auxForm->setDireito($auxForm->getDireito().$form[$i]);
			}
		}
	}
	$auxForm->setEsquerdo(substr($auxForm->getEsquerdo(), 1));
	$auxForm->setDireito(substr($auxForm->getDireito(), 1));
	return $auxForm;
}
//Versão que retorna um array fórmula
function resolveParenteses2($form){
	global $listaConectivos;
	$auxForm['esquerdo']=NULL;
	$auxForm['conectivo']=NULL;
	$auxForm['direito']=NULL;
	$aux;
	$esquerdo=true;
	$abreFormula=false;
	$contador=0;
	$not=false;

	converteConectivoSimbolo($form);
	//print "<br> Teste".$form;
	//Se for um átomo positivo
	//OBS: Talvez haja uma maneira mais apropriada de tratar isto
	//Em caso de erro nos cálculos, checar esta etapa
	//Número 3 é porque há dois parênteses e o átomo SEMPRE, por exemplo: (A)

	if(strlen($form)==3){
		$form=substr($form, 1);
		$form=substr($form, 0, strlen($form)-1);
		$auxForm['direito']=$form;
		return $auxForm;
	}
	//Se for um átomo negativo
	//OBS: Talvez haja uma maneira mais apropriada de tratar isto
	//Em caso de erro nos cálculos, checar esta etapa
	//Número 4 é porque há dois parênteses e o átomo com negativo SEMPRE, por exemplo: (!A)

	if(strlen($form)==4){
		$form=substr($form, 1);		
		$form=substr($form, 1);
		$form=substr($form, 0, strlen($form)-1);
		$auxForm['direito']=$form;
		$auxForm['conectivo']='not';
		return $auxForm;
	}

	//Se não for átomo, caso mais geral
	for ($i=0; $i<strlen($form); $i++){
		//Caso notnotnot
		if($form[$i]=='!' && $form[$i+1]=='!' && $form[$i+2]=='!' && ($i==0 || $i==1)){
			//Correções específicas para o caso em que notnot está entre parênteses
			if ($form[0]=='(') {
				$form=substr($form, 1);
				$form=substr($form, 0, strlen($form)-1);
			}

			if ($auxForm['esquerdo']=='(') {
				$auxForm['esquerdo']=NULL;
			}

			$form=substr($form, 4);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['direito']=$form;
			$auxForm['conectivo']='not';
			return $auxForm;
		}
		//Caso notnot
		if($form[$i]=='!' && $form[$i+1]=='!' && ($i==0 || $i==1)){
			//Correções específicas para o caso em que notnot está entre parênteses
			if ($form[0]=='(') {
				$form=substr($form, 1);
				$form=substr($form, 0, strlen($form)-1);
			}

			if ($auxForm['esquerdo']=='(') {
				//$auxForm['esquerdo']=NULL;
			}
			

			$form=substr($form, 3);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['direito']=$form;
			if ($auxForm['direito'][0]!='(') {
				$auxForm['direito']="(".$auxForm['direito'].")";
			}
			$auxForm['conectivo']='notnot';
			return $auxForm;
		}
		

		//Se achar o conectivo not no exterior de um parentese
		//Certamente há uma fórmula do tipo not para atribuir um conectivo not_algumacoisa
		//Mas preciso me certificar de que não é um átomo negativo, então verifico se o próximo elemento
		//é a abertura de um parenteses
		if($form[$i]=='!' && $form[$i+1]=='('){
			//Se for um átomo, não sinaliza a flag not
			if ($form[$i+3]==')') {
			//faça nada			
						
			}
			elseif ($abreFormula==false && $contador==0) {
				$not=true;
			}
			
		}
		if($form[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($form[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($form[$i],$listaConectivos)) && ($contador==1) && $form[$i]!='!'){
				if($not==true){
					$aux=$form[$i];
					converteConectivoNot($aux);
					$auxForm['conectivo']=$aux;
					$esquerdo=false;
					$not=false;
				}
				else{
					$aux=$form[$i];
					converteConectivoExtenso($aux);
					$auxForm['conectivo']=$aux;
					$esquerdo=false;
				}
				
			}
			if($esquerdo==true){
				$auxForm['esquerdo']=$auxForm['esquerdo'].$form[$i];
			}
			if($esquerdo==false){
				$auxForm['direito']=$auxForm['direito'].$form[$i];
			}
		}
	}
	$auxForm['esquerdo']=substr($auxForm['esquerdo'], 1);
	$auxForm['direito']=substr($auxForm['direito'], 1);
	//Correções de parênteses excedentes antes de retornar a fórmula
	//Caso 1 - Átomo positivo
	
	if (strlen($auxForm['esquerdo'])==3 && @$auxForm['esquerdo'][0]=='(' ) {
		$auxForm['esquerdo']=substr($auxForm['esquerdo'], 1);
		$auxForm['esquerdo']=substr($auxForm['esquerdo'], 0, strlen($auxForm['esquerdo'])-1);
	}
	if (strlen($auxForm['direito'])==3 && @$auxForm['direito'][0]=='(' ) {
		$auxForm['direito']=substr($auxForm['direito'], 1);
		$auxForm['direito']=substr($auxForm['direito'], 0, strlen($auxForm['direito'])-1);
	}
	//Caso 2 - Átomo negativo
	
	if (strlen($auxForm['esquerdo'])==6 && @$auxForm['esquerdo'][0]=='(' &&  @$auxForm['esquerdo'][1]=='!' ) {
		$auxForm['esquerdo']=substr($auxForm['esquerdo'], 1);
		$auxForm['esquerdo']=substr($auxForm['esquerdo'], 0, strlen($auxForm['esquerdo'])-1);
	}
	if (strlen($auxForm['direito'])==6 && @$auxForm['direito'][0]=='(' &&  @$auxForm['direito'][1]=='!') {
		$auxForm['direito']=substr($auxForm['direito'], 1);
		$auxForm['direito']=substr($auxForm['direito'], 0, strlen($auxForm['direito'])-1);
	}
	
	$auxiliar=$auxForm['esquerdo'];
	$conectivo=false;
	$contador=0;
	for ($i=0; $i<strlen($auxiliar); $i++){
		if($auxiliar[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($auxiliar[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($auxiliar[$i],$listaConectivos)) && ($contador==1) && $auxiliar[$i]!='!'){
				$conectivo=true;
				
			}
		}
	}
	if (!$conectivo) {
		if (@$auxForm['esquerdo'][0]=='(' && @$auxForm['esquerdo'][strlen($auxForm['esquerdo'])-1]==')') {
			$auxForm['esquerdo']=substr($auxForm['esquerdo'], 1);
			$auxForm['esquerdo']=substr($auxForm['esquerdo'], 0, strlen($auxForm['esquerdo'])-1);
		}
	}
	$contador=0;
	$auxiliar=$auxForm['direito'];
	$conectivo=false;
	for ($i=0; $i<strlen($auxiliar); $i++){
		if($auxiliar[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($auxiliar[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($auxiliar[$i],$listaConectivos)) && ($contador==1) && $auxiliar[$i]!='!'){
				$conectivo=true;
				
			}
		}
	}
	if (!$conectivo) {
		if (@$auxForm['direito'][0]=='(' && @$auxForm['direito'][strlen($auxForm['direito'])-1]==')') {
			$auxForm['direito']=substr($auxForm['direito'], 1);
			$auxForm['direito']=substr($auxForm['direito'], 0, strlen($auxForm['direito'])-1);
		}
	}
	
	return $auxForm;
}

function imprime_r($array){
	for ($i=0; $i < count($array) ; $i++) {
		print "Formula ".$i." - "; 
		print_r($array[$i]);
		print "<br>";
	}
}

//Função que adiciona Caracter no meio de uma string numa posição pré-definida
function addCaracter($var, $caracter, $lim){
	$saida;
	$parte1='';
	$parte2='';
	for($i=0;$i<strlen($var);$i++){
		if ($i>=$lim) {
			$parte2.=$var[$i];
		}
		else{
			$parte1.=$var[$i];
		}
				
	}
	$saida=$parte1.$caracter.$parte2;
	return $saida;
}

//Função que deleta um Carater específico de uma String
//Funciona por referência
function deletaCaracter(&$str, $indice){
	$str1=substr($str,0,$indice);
	$str2 = substr($str,$indice+1,strlen($str));
	$str=$str1.$str2;
}
//Em profundidade 
function formataFormulas(&$form){
	//Se ocorrer erro, investigar a entrada no if barra por strlen
	if(@strlen(@$form['esquerdo'])>3){
		$aux=resolveParenteses2($form['esquerdo']);
		$form['esquerdo']=$aux;
		formataFormulas($form['esquerdo']);
	}
	if(@strlen(@$form['direito'])>3){
		$aux=resolveParenteses2($form['direito']);
		$form['direito']=$aux;
		formataFormulas($form['direito']);
	}

}

function resolveParenteses3($form){
	global $listaConectivos;
	$auxForm['esquerdo']=NULL;
	$auxForm['conectivo']=NULL;
	$auxForm['direito']=NULL;
	$aux;
	$esquerdo=true;
	$abreFormula=false;
	$contador=0;
	$not=false;

	converteConectivoSimbolo($form);
	//print "<br> Teste".$form;
	//Se for um átomo positivo
	//OBS: Talvez haja uma maneira mais apropriada de tratar isto
	//Em caso de erro nos cálculos, checar esta etapa
	//Número 3 é porque há dois parênteses e o átomo SEMPRE, por exemplo: (A)

	if(strlen($form)==3){
		$form=substr($form, 1);
		$form=substr($form, 0, strlen($form)-1);
		$auxForm['direito']=$form;
		return $auxForm;
	}
	//Se for um átomo negativo
	//OBS: Talvez haja uma maneira mais apropriada de tratar isto
	//Em caso de erro nos cálculos, checar esta etapa
	//Número 4 é porque há dois parênteses e o átomo com negativo SEMPRE, por exemplo: (!A)

	if(strlen($form)==4 && $form[0]=='!'){
		$form=substr($form, 1);		
		$form=substr($form, 1);
		$form=substr($form, 0, strlen($form)-1);
		$auxForm['direito']=$form;
		$auxForm['conectivo']='not';
		return $auxForm;
	}
	//Para átomos no contexto de quantificadores universais/existenciais
	//Exemplo F(a)
	if(strlen($form)==6){
		$form=substr($form, 1);		
		$form=substr($form, 0, strlen($form)-1);
		$flag=false;
		for($i=0;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag) {
			$auxForm['direito']=$form;
			return $auxForm;
		}
	}
	if(strlen($form)==4){
		$flag=false;
		for($i=0;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag) {
			$auxForm['direito']=$form;
			return $auxForm;
		}
	}
	//Para átomos negativos no contexto de quantificadores universais/existenciais
	//Exemplo ¬F(a)
	if(strlen($form)==7){
		$aux=$form[0];
		$form=substr($form, 1);
		$form=substr($form, 1);
		$form=substr($form, 0, strlen($form)-1);		
		$flag=false;
		for($i=0;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag && $aux=='!') {
			$auxForm['conectivo']='not';
			$auxForm['direito']=$form;
			return $auxForm;
		}
	}
	if(strlen($form)==5){
		$aux=$form[0];
		$form=substr($form, 1);		
		$form=substr($form, 1);
		$form=substr($form, 0, strlen($form)-1);
		$flag=false;
		for($i=0;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag && $aux=='!') {
			$auxForm['conectivo']='not';
			$auxForm['direito']=$form;
			return $auxForm;
		}
	}
	//Se não for átomo, caso mais geral
	for ($i=0; $i<strlen($form); $i++){
		//Caso notnotnot
		if($form[$i]=='!' && $form[$i+1]=='!' && $form[$i+2]=='!' && ($i==0 || $i==1)){
			//Correções específicas para o caso em que notnot está entre parênteses
			if ($form[0]=='(') {
				$form=substr($form, 1);
				$form=substr($form, 0, strlen($form)-1);
			}

			if ($auxForm['esquerdo']=='(') {
				$auxForm['esquerdo']=NULL;
			}

			$form=substr($form, 4);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['direito']=$form;
			$auxForm['conectivo']='not';
			return $auxForm;
		}
		//Caso notnot
		if($form[$i]=='!' && $form[$i+1]=='!' && ($i==0 || $i==1)){
			//Correções específicas para o caso em que notnot está entre parênteses
			if ($form[0]=='(') {
				$form=substr($form, 1);
				$form=substr($form, 0, strlen($form)-1);
			}

			if ($auxForm['esquerdo']=='(') {
				//$auxForm['esquerdo']=NULL;
			}
			

			$form=substr($form, 3);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['direito']=$form;
			if ($auxForm['direito'][0]!='(') {
				$auxForm['direito']="(".$auxForm['direito'].")";
			}
			$auxForm['conectivo']='notnot';
			return $auxForm;
		}
		

		//Se achar o conectivo not no exterior de um parentese
		//Certamente há uma fórmula do tipo not para atribuir um conectivo not_algumacoisa
		//Mas preciso me certificar de que não é um átomo negativo, então verifico se o próximo elemento
		//é a abertura de um parenteses
		if($form[$i]=='!' && $form[$i+1]=='('){
			//Se for um átomo, não sinaliza a flag not
			if ($form[$i+3]==')') {
			//faça nada			
						
			}
			elseif ($abreFormula==false && $contador==0) {
				$not=true;
			}
			
		}
		if($form[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($form[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($form[$i],$listaConectivos)) && ($contador==1) && $form[$i]!='!'){
				if($not==true){
					$aux=$form[$i];
					if ($aux=='&' || $aux=='@') {
						converteConectivoNot($aux);
						$auxForm['conectivo']['operacao']=$aux;
						$i++;
						$auxForm['conectivo']['variavel']=$form[$i];
					}
					else{
						converteConectivoNot($aux);
						$auxForm['conectivo']=$aux;
					}
					$esquerdo=false;
					$not=false;
				}
				else{
					$aux=$form[$i];
					if ($aux=='&' || $aux=='@') {
						converteConectivoExtenso($aux);
						$auxForm['conectivo']['operacao']=$aux;
						$i++;
						$auxForm['conectivo']['variavel']=$form[$i];
					}
					else{
						converteConectivoExtenso($aux);
						$auxForm['conectivo']=$aux;
					}
					
					$esquerdo=false;
				}
				
			}
			if($esquerdo==true){
				$auxForm['esquerdo']=$auxForm['esquerdo'].$form[$i];
			}
			if($esquerdo==false){
				$auxForm['direito']=$auxForm['direito'].$form[$i];
			}
		}
	}
	$auxForm['esquerdo']=substr($auxForm['esquerdo'], 1);
	$auxForm['direito']=substr($auxForm['direito'], 1);
	//Correções de parênteses excedentes antes de retornar a fórmula
	//Caso 1 - Átomo positivo
	
	if (strlen($auxForm['esquerdo'])==3 && @$auxForm['esquerdo'][0]=='(' ) {
		$auxForm['esquerdo']=substr($auxForm['esquerdo'], 1);
		$auxForm['esquerdo']=substr($auxForm['esquerdo'], 0, strlen($auxForm['esquerdo'])-1);
	}
	if (strlen($auxForm['direito'])==3 && @$auxForm['direito'][0]=='(' ) {
		$auxForm['direito']=substr($auxForm['direito'], 1);
		$auxForm['direito']=substr($auxForm['direito'], 0, strlen($auxForm['direito'])-1);
	}
	//Caso 2 - Átomo negativo
	
	if (strlen($auxForm['esquerdo'])==6 && @$auxForm['esquerdo'][0]=='(' &&  @$auxForm['esquerdo'][1]=='!' ) {
		$auxForm['esquerdo']=substr($auxForm['esquerdo'], 1);
		$auxForm['esquerdo']=substr($auxForm['esquerdo'], 0, strlen($auxForm['esquerdo'])-1);
	}
	if (strlen($auxForm['direito'])==6 && @$auxForm['direito'][0]=='(' &&  @$auxForm['direito'][1]=='!') {
		$auxForm['direito']=substr($auxForm['direito'], 1);
		$auxForm['direito']=substr($auxForm['direito'], 0, strlen($auxForm['direito'])-1);
	}
	
	$auxiliar=$auxForm['esquerdo'];
	$conectivo=false;
	$contador=0;
	for ($i=0; $i<strlen($auxiliar); $i++){
		if($auxiliar[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($auxiliar[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($auxiliar[$i],$listaConectivos)) && ($contador==1) && $auxiliar[$i]!='!'){
				$conectivo=true;
				
			}
		}
	}
	if (!$conectivo) {
		if (@$auxForm['esquerdo'][0]=='(' && @$auxForm['esquerdo'][strlen($auxForm['esquerdo'])-1]==')') {
			$auxForm['esquerdo']=substr($auxForm['esquerdo'], 1);
			$auxForm['esquerdo']=substr($auxForm['esquerdo'], 0, strlen($auxForm['esquerdo'])-1);
		}
	}
	$contador=0;
	$auxiliar=$auxForm['direito'];
	$conectivo=false;
	for ($i=0; $i<strlen($auxiliar); $i++){
		if($auxiliar[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($auxiliar[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($auxiliar[$i],$listaConectivos)) && ($contador==1) && $auxiliar[$i]!='!'){
				$conectivo=true;
				
			}
		}
	}
	if (!$conectivo) {
		if (@$auxForm['direito'][0]=='(' && @$auxForm['direito'][strlen($auxForm['direito'])-1]==')') {
			$auxForm['direito']=substr($auxForm['direito'], 1);
			$auxForm['direito']=substr($auxForm['direito'], 0, strlen($auxForm['direito'])-1);
		}
	}
	
	return $auxForm;
}

function formataFormulas2(&$form){
	global $listaConectivos;
	$flag=false;
	$flag2=false;
	for ($i=0; $i < strlen(@$form['esquerdo']); $i++) { 
		if (@in_array($form['esquerdo'][$i], $listaConectivos)) {
			$flag=true;
		}
	}
	for ($i=0; $i < strlen(@$form['direito']); $i++) {
		if (@in_array($form['direito'][$i], $listaConectivos)) {
			$flag2=true;
		}
	}

	//Se ocorrer erro, investigar a entrada no if barra por strlen
	if(@strlen(@$form['esquerdo'])>3 && $flag ){
		$aux=resolveParenteses3($form['esquerdo']);
		$form['esquerdo']=$aux;
		formataFormulas2($form['esquerdo']);
	}
	if(@strlen(@$form['direito'])>3 && $flag2){
		
		$aux=resolveParenteses3($form['direito']);
		$form['direito']=$aux;
		formataFormulas2($form['direito']);
	}

}

function resolveParentesesSemantica($form){
	global $listaConectivos;
	$auxForm['info']=array('esquerdo' => null, 'conectivo' => array('operacao' => null, 'variavel'=> null), 'direito' =>null);
	$auxForm['filhos']=[];
	$auxForm['pai']=NULL;
	$auxForm['valor']=false;
	$auxForm['usado']=false;
	$auxForm['proximo']=NULL;
	$aux;
	$esquerdo=true;
	$abreFormula=false;
	$contador=0;
	$not=false;

	converteConectivoSimbolo($form);

	//Correção básica de parenteses
	if ($form[0]!='(' && $form[0]!='!') {
		$form="(".$form.")";
	}
	//print "<br> Teste".$form;
	//Se for um átomo positivo
	//OBS: Talvez haja uma maneira mais apropriada de tratar isto
	//Em caso de erro nos cálculos, checar esta etapa
	//Número 3 é porque há dois parênteses e o átomo SEMPRE, por exemplo: (A)

	if(strlen($form)==3){
		$form=substr($form, 1);
		$form=substr($form, 0, strlen($form)-1);
		$auxForm['info']['direito']=$form;
		return $auxForm;
	}
	//Se for um átomo negativo
	//OBS: Talvez haja uma maneira mais apropriada de tratar isto
	//Em caso de erro nos cálculos, checar esta etapa
	//Número 4 é porque há dois parênteses e o átomo com negativo SEMPRE, por exemplo: (!A)

	if(strlen($form)==4 && $form[0]=='!'){
		$form=substr($form, 1);		
		$form=substr($form, 1);
		$form=substr($form, 0, strlen($form)-1);
		$auxForm['info']['direito']=$form;
		$auxForm['info']['conectivo']['operacao']='not';
		return $auxForm;
	}
	//Para átomos no contexto de quantificadores universais/existenciais
	//Exemplo F(a)
	if(strlen($form)==6){		
		$flag=false;
		for($i=0;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag) {
			$form=substr($form, 1);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['info']['direito']=$form;
			return $auxForm;
		}
	}
	if(strlen($form)==4){
		$flag=false;
		for($i=0;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag) {
			$auxForm['info']['direito']=$form;
			return $auxForm;
		}
	}
	//Para átomos negativos no contexto de quantificadores universais/existenciais
	//Exemplo ¬F(a)
	if(strlen($form)==7){
		$aux=$form[0];			
		$flag=false;
		for($i=1;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag && $aux=='!') {
			$form=substr($form, 1);
			$form=substr($form, 1);
			$form=substr($form, 0, strlen($form)-1);	
			$auxForm['info']['conectivo']['operacao']='not';
			$auxForm['info']['direito']=$form;
			return $auxForm;
		}
	}
	if(strlen($form)==5){
		$aux=$form[0];
		$flag=false;
		for($i=1;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag && $aux=='!') {
			$form=substr($form, 1);		
			$form=substr($form, 1);
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['info']['conectivo']['operacao']='not';
			$auxForm['info']['direito']=$form;
			return $auxForm;
		}
	}
	//Se não for átomo, caso mais geral
	for ($i=0; $i<strlen($form); $i++){
		//Caso notnotnot
		if($form[$i]=='!' && $form[$i+1]=='!' && $form[$i+2]=='!' && ($i==0 || $i==1)){
			//Correções específicas para o caso em que notnot está entre parênteses
			if ($form[0]=='(') {
				$form=substr($form, 1);
				$form=substr($form, 0, strlen($form)-1);
			}

			if ($auxForm['info']['esquerdo']=='(') {
				$auxForm['info']['esquerdo']=NULL;
			}

			$form=substr($form, 4);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['info']['direito']=$form;
			$auxForm['info']['conectivo']['operacao']='not';
			return $auxForm;
		}
		//Caso notnot
		if($form[$i]=='!' && $form[$i+1]=='!' && ($i==0 || $i==1)){
			//Correções específicas para o caso em que notnot está entre parênteses
			if ($form[0]=='(') {
				$form=substr($form, 1);
				$form=substr($form, 0, strlen($form)-1);
			}

			if ($auxForm['info']['esquerdo']=='(') {
				//$auxForm['esquerdo']=NULL;
			}
			

			$form=substr($form, 3);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['info']['direito']=$form;
			if ($auxForm['info']['direito'][0]!='(') {
				$auxForm['info']['direito']="(".$auxForm['info']['direito'].")";
			}
			$auxForm['info']['conectivo']['operacao']='notnot';
			return $auxForm;
		}
		

		//Se achar o conectivo not no exterior de um parentese
		//Certamente há uma fórmula do tipo not para atribuir um conectivo not_algumacoisa
		//Mas preciso me certificar de que não é um átomo negativo, então verifico se o próximo elemento
		//é a abertura de um parenteses
		if($form[$i]=='!' && $form[$i+1]=='('){
			//Se for um átomo, não sinaliza a flag not
			if ($form[$i+3]==')') {
			//faça nada			
						
			}
			elseif ($abreFormula==false && $contador==0) {
				$not=true;
			}
			
		}
		if($form[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($form[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($form[$i],$listaConectivos)) && ($contador==1) && $form[$i]!='!'){
				if($not==true){
					$aux=$form[$i];
					if ($aux=='&' || $aux=='@') {
						converteConectivoNot($aux);
						$auxForm['info']['conectivo']['operacao']=$aux;
						$i++;
						$auxForm['info']['conectivo']['variavel']=$form[$i];
					}
					else{
						converteConectivoNot($aux);
						$auxForm['info']['conectivo']['operacao']=$aux;
					}
					$esquerdo=false;
					$not=false;
				}
				else{
					$aux=$form[$i];
					if ($aux=='&' || $aux=='@') {
						converteConectivoExtenso($aux);
						$auxForm['info']['conectivo']['operacao']=$aux;
						$i++;
						$auxForm['info']['conectivo']['variavel']=$form[$i];
					}
					else{
						converteConectivoExtenso($aux);
						$auxForm['info']['conectivo']['operacao']=$aux;
					}
					
					$esquerdo=false;
				}
				
			}
			if($esquerdo==true){
				$auxForm['info']['esquerdo']=$auxForm['info']['esquerdo'].$form[$i];
			}
			if($esquerdo==false){
				$auxForm['info']['direito']=$auxForm['info']['direito'].$form[$i];
			}
		}
	}
	$auxForm['info']['esquerdo']=substr($auxForm['info']['esquerdo'], 1);
	$auxForm['info']['direito']=substr($auxForm['info']['direito'], 1);
	//Correções de parênteses excedentes antes de retornar a fórmula
	//Caso 1 - Átomo positivo
	
	if (strlen($auxForm['info']['esquerdo'])==3 && @$auxForm['info']['esquerdo'][0]=='(' ) {
		$auxForm['info']['esquerdo']=substr($auxForm['info']['esquerdo'], 1);
		$auxForm['info']['esquerdo']=substr($auxForm['info']['esquerdo'], 0, strlen($auxForm['info']['esquerdo'])-1);
	}
	if (strlen($auxForm['info']['direito'])==3 && @$auxForm['info']['direito'][0]=='(' ) {
		$auxForm['info']['direito']=substr($auxForm['info']['direito'], 1);
		$auxForm['info']['direito']=substr($auxForm['info']['direito'], 0, strlen($auxForm['info']['direito'])-1);
	}
	//Caso 2 - Átomo negativo
	
	if (strlen($auxForm['info']['esquerdo'])==6 && @$auxForm['info']['esquerdo'][0]=='(' &&  @$auxForm['info']['esquerdo'][1]=='!' ) {
		$auxForm['info']['esquerdo']=substr($auxForm['info']['esquerdo'], 1);
		$auxForm['info']['esquerdo']=substr($auxForm['info']['esquerdo'], 0, strlen($auxForm['info']['esquerdo'])-1);
	}
	if (strlen($auxForm['info']['direito'])==6 && @$auxForm['info']['direito'][0]=='(' &&  @$auxForm['info']['direito'][1]=='!') {
		$auxForm['info']['direito']=substr($auxForm['info']['direito'], 1);
		$auxForm['info']['direito']=substr($auxForm['info']['direito'], 0, strlen($auxForm['info']['direito'])-1);
	}
	
	$auxiliar=$auxForm['info']['esquerdo'];
	$conectivo=false;
	$contador=0;
	for ($i=0; $i<strlen($auxiliar); $i++){
		if($auxiliar[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($auxiliar[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($auxiliar[$i],$listaConectivos)) && ($contador==1) && $auxiliar[$i]!='!'){
				$conectivo=true;
				
			}
		}
	}
	if (!$conectivo) {
		if (@$auxForm['info']['esquerdo'][0]=='(' && @$auxForm['info']['esquerdo'][strlen($auxForm['info']['esquerdo'])-1]==')') {
			$auxForm['info']['esquerdo']=substr($auxForm['info']['esquerdo'], 1);
			$auxForm['info']['esquerdo']=substr($auxForm['info']['esquerdo'], 0, strlen($auxForm['info']['esquerdo'])-1);
		}
	}
	$contador=0;
	$auxiliar=$auxForm['info']['direito'];
	$conectivo=false;
	for ($i=0; $i<strlen($auxiliar); $i++){
		if($auxiliar[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($auxiliar[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($auxiliar[$i],$listaConectivos)) && ($contador==1) && $auxiliar[$i]!='!'){
				$conectivo=true;
				
			}
		}
	}
	if (!$conectivo) {
		if (@$auxForm['info']['direito'][0]=='(' && @$auxForm['info']['direito'][strlen($auxForm['info']['direito'])-1]==')') {
			$auxForm['info']['direito']=substr($auxForm['info']['direito'], 1);
			$auxForm['info']['direito']=substr($auxForm['info']['direito'], 0, strlen($auxForm['info']['direito'])-1);
		}
	}
	
	return $auxForm;
}

function resolveParentesesLPO($form){
	global $listaConectivos;
	$auxForm['esquerdo']=NULL;
	$auxForm['conectivo']=array('operacao' => null, 'variavel'=> null);
	$auxForm['direito']=NULL;

	$aux;
	$esquerdo=true;
	$abreFormula=false;
	$contador=0;
	$not=false;

	converteConectivoSimbolo($form);

	//Correção básica de parenteses
	if ($form[0]!='(' && $form[0]!='!') {
		$form="(".$form.")";
	}
	//print "<br> Teste".$form;
	//Se for um átomo positivo
	//OBS: Talvez haja uma maneira mais apropriada de tratar isto
	//Em caso de erro nos cálculos, checar esta etapa
	//Número 3 é porque há dois parênteses e o átomo SEMPRE, por exemplo: (A)

	if(strlen($form)==3){
		$form=substr($form, 1);
		$form=substr($form, 0, strlen($form)-1);
		$auxForm['direito']=$form;
		return $auxForm;
	}
	//Se for um átomo negativo
	//OBS: Talvez haja uma maneira mais apropriada de tratar isto
	//Em caso de erro nos cálculos, checar esta etapa
	//Número 4 é porque há dois parênteses e o átomo com negativo SEMPRE, por exemplo: (!A)

	if(strlen($form)==4 && $form[0]=='!'){
		$form=substr($form, 1);		
		$form=substr($form, 1);
		$form=substr($form, 0, strlen($form)-1);
		$auxForm['direito']=$form;
		$auxForm['conectivo']['operacao']='not';
		return $auxForm;
	}
	//Para átomos no contexto de quantificadores universais/existenciais
	//Exemplo F(a)
	if(strlen($form)==6){		
		$flag=false;
		for($i=0;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag) {
			$form=substr($form, 1);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['direito']=$form;
			return $auxForm;
		}
	}
	if(strlen($form)==4){
		$flag=false;
		for($i=0;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag) {
			$auxForm['direito']=$form;
			return $auxForm;
		}
	}
	//Para átomos negativos no contexto de quantificadores universais/existenciais
	//Exemplo ¬F(a)
	if(strlen($form)==7){
		$aux=$form[0];			
		$flag=false;
		for($i=1;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag && $aux=='!') {
			$form=substr($form, 1);
			$form=substr($form, 1);
			$form=substr($form, 0, strlen($form)-1);	
			$auxForm['conectivo']['operacao']='not';
			$auxForm['direito']=$form;
			return $auxForm;
		}
	}
	if(strlen($form)==5){
		$aux=$form[0];
		$flag=false;
		for($i=1;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag && $aux=='!') {
			$form=substr($form, 1);		
			$form=substr($form, 1);
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['conectivo']['operacao']='not';
			$auxForm['direito']=$form;
			return $auxForm;
		}
	}
	//Para átomos de qualquer tamanho negativos
	if($form[0]=='!'){
		$aux=$form[0];			
		$flag=false;
		for($i=1;$i<strlen($form);$i++){
			if (in_array($form[$i], $listaConectivos)) {
				$flag=true;
			}
		}
		if(!$flag && $aux=='!') {
			$form=substr($form, 1);
			$form=substr($form, 1);
			$form=substr($form, 0, strlen($form)-1);	
			$auxForm['conectivo']['operacao']='not';
			$auxForm['direito']=$form;
			return $auxForm;
		}
	}
	//Se não for átomo, caso mais geral
	for ($i=0; $i<strlen($form); $i++){
		//Caso notnotnot
		if($form[$i]=='!' && $form[$i+1]=='!' && $form[$i+2]=='!' && ($i==0 || $i==1)){
			//Correções específicas para o caso em que notnot está entre parênteses
			if ($form[0]=='(') {
				$form=substr($form, 1);
				$form=substr($form, 0, strlen($form)-1);
			}

			if ($auxForm['esquerdo']=='(') {
				$auxForm['esquerdo']=NULL;
			}

			$form=substr($form, 4);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['direito']=$form;
			$auxForm['conectivo']['operacao']='not';
			return $auxForm;
		}
		//Caso notnot
		if($form[$i]=='!' && $form[$i+1]=='!' && ($i==0 || $i==1)){
			//Correções específicas para o caso em que notnot está entre parênteses
			if ($form[0]=='(') {
				$form=substr($form, 1);
				$form=substr($form, 0, strlen($form)-1);
			}

			if ($auxForm['esquerdo']=='(') {
				//$auxForm['esquerdo']=NULL;
			}
			

			$form=substr($form, 3);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['direito']=$form;
			if ($auxForm['direito'][0]!='(') {
				$auxForm['direito']="(".$auxForm['direito'].")";
			}
			$auxForm['conectivo']['operacao']='notnot';
			return $auxForm;
		}
		

		//Se achar o conectivo not no exterior de um parentese
		//Certamente há uma fórmula do tipo not para atribuir um conectivo not_algumacoisa
		//Mas preciso me certificar de que não é um átomo negativo, então verifico se o próximo elemento
		//é a abertura de um parenteses
		if($form[$i]=='!' && $form[$i+1]=='('){
			//Se for um átomo, não sinaliza a flag not
			if ($form[$i+3]==')') {
			//faça nada			
						
			}
			elseif ($abreFormula==false && $contador==0) {
				$not=true;
			}
			
		}
		if($form[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($form[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($form[$i],$listaConectivos)) && ($contador==1) && $form[$i]!='!'){
				if($not==true){
					$aux=$form[$i];
					if ($aux=='&' || $aux=='@') {
						converteConectivoNot($aux);
						$auxForm['conectivo']['operacao']=$aux;
						$i++;
						$auxForm['conectivo']['variavel']=$form[$i];
					}
					else{
						converteConectivoNot($aux);
						$auxForm['conectivo']['operacao']=$aux;
					}
					$esquerdo=false;
					$not=false;
				}
				else{
					$aux=$form[$i];
					if ($aux=='&' || $aux=='@') {
						converteConectivoExtenso($aux);
						$auxForm['conectivo']['operacao']=$aux;
						$i++;
						$auxForm['conectivo']['variavel']=$form[$i];
					}
					else{
						converteConectivoExtenso($aux);
						$auxForm['conectivo']['operacao']=$aux;
					}
					
					$esquerdo=false;
				}
				
			}
			if($esquerdo==true){
				$auxForm['esquerdo']=$auxForm['esquerdo'].$form[$i];
			}
			if($esquerdo==false){
				$auxForm['direito']=$auxForm['direito'].$form[$i];
			}
		}
	}
	$auxForm['esquerdo']=substr($auxForm['esquerdo'], 1);
	$auxForm['direito']=substr($auxForm['direito'], 1);
	//Correções de parênteses excedentes antes de retornar a fórmula
	//Caso 1 - Átomo positivo
	
	if (strlen($auxForm['esquerdo'])==3 && @$auxForm['esquerdo'][0]=='(' ) {
		$auxForm['esquerdo']=substr($auxForm['esquerdo'], 1);
		$auxForm['esquerdo']=substr($auxForm['esquerdo'], 0, strlen($auxForm['esquerdo'])-1);
	}
	if (strlen($auxForm['direito'])==3 && @$auxForm['direito'][0]=='(' ) {
		$auxForm['direito']=substr($auxForm['direito'], 1);
		$auxForm['direito']=substr($auxForm['direito'], 0, strlen($auxForm['direito'])-1);
	}
	//Caso 2 - Átomo negativo
	
	if (strlen($auxForm['esquerdo'])==6 && @$auxForm['esquerdo'][0]=='(' &&  @$auxForm['esquerdo'][1]=='!' ) {
		$auxForm['esquerdo']=substr($auxForm['esquerdo'], 1);
		$auxForm['esquerdo']=substr($auxForm['esquerdo'], 0, strlen($auxForm['esquerdo'])-1);
	}
	if (strlen($auxForm['direito'])==6 && @$auxForm['direito'][0]=='(' &&  @$auxForm['direito'][1]=='!') {
		$auxForm['direito']=substr($auxForm['direito'], 1);
		$auxForm['direito']=substr($auxForm['direito'], 0, strlen($auxForm['direito'])-1);
	}
	
	$auxiliar=$auxForm['esquerdo'];
	$conectivo=false;
	$contador=0;
	for ($i=0; $i<strlen($auxiliar); $i++){
		if($auxiliar[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($auxiliar[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($auxiliar[$i],$listaConectivos)) && ($contador==1) && $auxiliar[$i]!='!'){
				$conectivo=true;
				
			}
		}
	}
	if (!$conectivo) {
		if (@$auxForm['esquerdo'][0]=='(' && @$auxForm['esquerdo'][strlen($auxForm['esquerdo'])-1]==')') {
			$auxForm['esquerdo']=substr($auxForm['esquerdo'], 1);
			$auxForm['esquerdo']=substr($auxForm['esquerdo'], 0, strlen($auxForm['esquerdo'])-1);
		}
	}
	$contador=0;
	$auxiliar=$auxForm['direito'];
	$conectivo=false;
	for ($i=0; $i<strlen($auxiliar); $i++){
		if($auxiliar[$i]=='('){
			$abreFormula=true;
			$contador++;
			
		}
		if($auxiliar[$i]==')'){
			$contador-=1;
			if($contador==0){
				$abreFormula=False;
			}
			
		}
		if($abreFormula==true){
			if((in_array($auxiliar[$i],$listaConectivos)) && ($contador==1) && $auxiliar[$i]!='!'){
				$conectivo=true;
				
			}
		}
	}
	if (!$conectivo) {
		if (@$auxForm['direito'][0]=='(' && @$auxForm['direito'][strlen($auxForm['direito'])-1]==')') {
			$auxForm['direito']=substr($auxForm['direito'], 1);
			$auxForm['direito']=substr($auxForm['direito'], 0, strlen($auxForm['direito'])-1);
		}
	}
	
	return $auxForm;
}
function formataFormulasSemantica(&$form){
	global $listaConectivos;
	$flag=false;
	$flag2=false;
	for ($i=0; $i < strlen(@$form['esquerdo']); $i++) { 
		if (@in_array($form['esquerdo'][$i], $listaConectivos)) {
			$flag=true;
		}
	}
	for ($i=0; $i < strlen(@$form['direito']); $i++) {
		if (@in_array($form['direito'][$i], $listaConectivos)) {
			$flag2=true;
		}
	}

	//Se ocorrer erro, investigar a entrada no if barra por strlen
	if(@strlen(@$form['esquerdo'])>3 && $flag ){
		$aux=resolveParentesesSemantica($form['esquerdo']);
		$form['esquerdo']=$aux;
		formataFormulasSemantica($form['esquerdo']);
	}
	if(@strlen(@$form['direito'])>3 && $flag2){
		
		$aux=resolveParentesesSemantica($form['direito']);
		$form['direito']=$aux;
		formataFormulasSemantica($form['direito']);
	}

}

function formataFormulasLPO(&$form){
	global $listaConectivos;
	$flag=false;
	$flag2=false;
	for ($i=0; $i < strlen(@$form['esquerdo']); $i++) { 
		if (@in_array($form['esquerdo'][$i], $listaConectivos)) {
			$flag=true;
		}
	}
	for ($i=0; $i < strlen(@$form['direito']); $i++) {
		if (@in_array($form['direito'][$i], $listaConectivos)) {
			$flag2=true;
		}
	}

	//Se ocorrer erro, investigar a entrada no if barra por strlen
	if(@strlen(@$form['esquerdo'])>3 && $flag ){
		$aux=resolveParentesesLPO($form['esquerdo']);
		$form['esquerdo']=$aux;
		formataFormulasLPO($form['esquerdo']);
	}
	if(@strlen(@$form['direito'])>3 && $flag2){
		
		$aux=resolveParentesesLPO($form['direito']);
		$form['direito']=$aux;
		formataFormulasLPO($form['direito']);
	}

}

function processaEntradaLPO($listaFormulas){
	//Tratar a entrada, verificação de digitação correta
	foreach ($listaFormulas as $key => $value) {
		verificaFormulaCorreta($listaFormulas[$key]);
		$entradaConvertida[$key]=resolveParentesesLPO($listaFormulas[$key]);
	}
	
	return $entradaConvertida;
}


function negaPerguntaLPO($listaFormulas,$tamanho){
	//Nega a pergunta
	$listaFormulas[$tamanho-1]="not".$listaFormulas[$tamanho-1];
	//Tratar a entrada, verificação de digitação correta
	foreach ($listaFormulas as $key => $value) {
		verificaFormulaCorreta($listaFormulas[$key]);
		$entradaConvertida[$key]=resolveParentesesLPO($listaFormulas[$key]);
	}
	
	return $entradaConvertida;
}


?>