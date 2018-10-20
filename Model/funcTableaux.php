<?php
//Versão que retorna um array fórmula deixando os campos específicos do Tableaux "declarados"
function resolveParentesesTableaux($form){
	global $listaConectivos;
	$auxForm['info']=array('esquerdo' => null, 'conectivo'=> null, 'direito'=>null);
	$auxForm['atualEsquerdo']=false;
	$auxForm['atualDireito']=false;
	$auxForm['atualCentral']=false;
	$auxForm['filhoEsquerdo']=null;
	$auxForm['filhoCentral']=null;
	$auxForm['filhoDireito']=null;
	$auxForm['pai']=null;
	$auxForm['formDisponiveis']=array();
	$auxForm['hashAtomos']=array();
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
		$auxForm['info']['direito']=$form;
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
		$auxForm['info']['direito']=$form;
		$auxForm['info']['conectivo']='not';
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
			if ($auxForm['info']['esquerdo']=='(') {
				$auxForm['info']['esquerdo']=NULL;
			}
			$form=substr($form, 4);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['info']['direito']=$form;
			$auxForm['info']['conectivo']='not';
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
				$auxForm['info']['esquerdo']=NULL;
			}
			$form=substr($form, 3);		
			$form=substr($form, 0, strlen($form)-1);
			$auxForm['info']['direito']=$form;
			$auxForm['info']['conectivo']='notnot';
			return $auxForm;
		}
		
		//Se achar o conectivo not no exterior de um parentese
		//Certamente há uma fórmula do tipo not para atribuir um conectivo not_algumacoisa
		//Mas preciso me certificar de que não é um átomo negativo, então verifico se o próximo elemento
		//é a abertura de um parenteses
		if($form[$i]=='!' && $form[$i+1]=='(' && $abreFormula==false){
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
					$auxForm['info']['conectivo']=$aux;
					$esquerdo=false;
					$not=false;
				}
				else{
					$aux=$form[$i];
					converteConectivoExtenso($aux);
					$auxForm['info']['conectivo']=$aux;
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
function escolhaEficiente(&$listaFormulasDisponiveis,&$hashInicial,&$nosFolha,&$historicoVariaveis){
	global $contador;
	global $raiz;
	//Verificação para saber se a função foi chamada mesmo
	//que todas os ramos já estejam fechados
	if (todasFechadas($nosFolha)) {
		print "<br>Todos os ramos já estão fechados<br>";
		print $contador."<br>";
		return;
	}
	
	$conectivosEficientes=array("e","not_ou","not_implica","notnot");
	foreach ($listaFormulasDisponiveis as $key => $value) {
		formataFormulasTableaux($listaFormulasDisponiveis[$key]);
	}
	//Aplicação na raiz
	//-------------------------------------------------------------------
	//Caso 1 - Raiz é eficiente
	//Busque o primeiro nó eficiente que existir e aplique a fórmula nele
	foreach ($listaFormulasDisponiveis as $key => $value) {
		if (in_array($value['info']['conectivo'],$conectivosEficientes)){
			if ($contador==0) {
				//Correções na fórmula
				$raiz=$listaFormulasDisponiveis[$key];
				$raiz['formDisponiveis']=$listaFormulasDisponiveis;
				$raiz['hashAtomos']=$hashInicial;
				print "<br>Aplicando regra em<br>";
				print_r($raiz['info']);
				aplicaRegra($raiz,$raiz,$nosFolha);
				removerFormula($listaFormulasDisponiveis,$raiz['info']);
				armazenaHistorico($historicoVariaveis,$nosFolha,$raiz,$contador+1,$listaFormulasDisponiveis);
				return;
			}
		}
	}
	//Caso 2 - Raiz não é eficiente
	//Se não há fórmula eficiente, aplique no primeiro elemento disponível
	if ($contador==0) {
		foreach ($listaFormulasDisponiveis as $key => $value) {
			if ($value['info']['conectivo']!=null && $value['info']['conectivo']!='not'){
				$raiz=$listaFormulasDisponiveis[$key];			
			}			
		}
		
		$raiz['formDisponiveis']=$listaFormulasDisponiveis;
		$raiz['hashAtomos']=$hashInicial;
		aplicaRegra($raiz,$raiz,$nosFolha);
		print "<br>Aplicando regra em<br>";
		print_r($raiz['info']);
		removerFormula($listaFormulasDisponiveis,$raiz['info']);
		armazenaHistorico($historicoVariaveis,$nosFolha,$raiz,$contador+1,$listaFormulasDisponiveis);
		return;
	}
	//--------------------------------------------------------------------	
	
	//Aplicação geral de regras
	//Caso 1 - Existem nós eficientes para serem escolhidos
	//Devo checar todos os nós folhas em busca do primeiro não não fechado
	//Se houver fórmula eficiente na lista de fórmulas disponíveis do ramo,
	//aplico a regra, senão continuo a busca até achar ou acabarem os nós folha
	foreach ($nosFolha as $key => $noFolhaAtual) {
		//Verifica se este nó já está fechado
		if (@$noFolhaAtual['filhoCentral']=='fechado') {
			//Deixe o loop passar
		}
		else{
			//Percorre a lista de fórmulas disponíveis do nó folha atual
			foreach ($noFolhaAtual['formDisponiveis'] as $key2 => $formDispAtual) {
				//Correções na fórmula
				formataFormulasTableaux($noFolhaAtual['formDisponiveis'][$key2]);
				corrigeArrays($noFolhaAtual['formDisponiveis'][$key2]);
				//Se achar conectivo eficiente aplique a regra
				if (in_array($formDispAtual['info']['conectivo'],$conectivosEficientes)){
					print "<br>Aplicando regra em<br>";
					print_r($formDispAtual['info']);
					print "<br>Com nó pai sendo<br>";
					print_r(@$nosFolha[$key]['info']);
					aplicaRegra($formDispAtual,$nosFolha[$key],$nosFolha);
					removerFormula($listaFormulasDisponiveis,$formDispAtual['info']);
					armazenaHistorico($historicoVariaveis,$nosFolha,$raiz,$contador+1,$listaFormulasDisponiveis);
					//OTIMIZAR - NÃO PODE ACONTECER
					//Verificação para saber se a função foi chamada mesmo
					//que todas os ramos já estejam fechados
					if (todasFechadas($nosFolha)) {
						print "<br>Todos os ramos já estão fechados<br>";
						print $contador."<br>";
						return;
					}
					
					return;
				}
			}	
		}
	}
	//Caso 2 - Não existem nós eficientes para serem escolhidos
	//Devo checar todos os nós folhas em busca do primeiro não não fechado
	//Se houver fórmula eficiente na lista de fórmulas disponíveis do ramo,
	//aplico a regra, senão continuo a busca até achar ou acabarem os nós folha
	foreach ($nosFolha as $key => $noFolhaAtual) {
		//Verifica se este nó já está fechado
		if (@$noFolhaAtual['filhoCentral']=='fechado') {
			//Deixe o loop passar
		}
		else{
			//Percorre a lista de fórmulas disponíveis do nó folha atual
			foreach ($noFolhaAtual['formDisponiveis'] as $key2 => $formDispAtual) {
				//Correções na fórmula
				formataFormulasTableaux($noFolhaAtual['formDisponiveis'][$key2]);
				corrigeArrays($noFolhaAtual['formDisponiveis'][$key2]);
				print "<br>Aplicando regra em<br>";
				print_r($formDispAtual['info']);
				print "<br>Com nó pai sendo<br>";
				print_r($nosFolha[$key]['info']);
				aplicaRegra($formDispAtual,$nosFolha[$key],$nosFolha);
				removerFormula($listaFormulasDisponiveis,$formDispAtual['info']);
				armazenaHistorico($historicoVariaveis,$nosFolha,$raiz,$contador+1,$listaFormulasDisponiveis);
				//OTIMIZAR - NÃO PODE ACONTECER
				//Verificação para saber se a função foi chamada mesmo
				//que todas os ramos já estejam fechados
				if (todasFechadas($nosFolha)) {
					print "<br>Todos os ramos já estão fechados<br>";
					print $contador."<br>";
					return;
				}
				
				return;
			}
		}	
	}	
	print "<br>Erro, não houve nó para aplicar a fórmula<br>Verificar se todas as fórmulas estão fechadas<br>";	
	return;
}
function escolhaUsuario(&$listaFormulasDisponiveis,&$hashInicial,$formEscolhida,&$nosFolha,&$noFolhaEscolhido=NULL){
	global $contador;
	global $raiz;
	if ($contador==0) {
		$raiz=$formEscolhida;
		$raiz['formDisponiveis']=$listaFormulasDisponiveis;
		$raiz['hashAtomos']=$hashInicial;
		aplicaRegra($raiz,$raiz,$nosFolha);
		removerFormula($listaFormulasDisponiveis,$formEscolhida['info']);
		return;
	}
	else{
		aplicaRegra($formEscolhida,$noFolhaEscolhido,$nosFolha);
		removerFormula($listaFormulasDisponiveis,$formEscolhida['info']);
		return;
	}
}
//Serve apenas pra instânciar todos os campos do array fórmula para trabalhar evitando erros ou warnings
function criaFormulaTableaux(){
	$auxForm['info']=array('esquerdo' => null, 'conectivo'=> null, 'direito'=>null);
	$auxForm['atualEsquerdo']=false;
	$auxForm['atualDireito']=false;
	$auxForm['atualCentral']=false;
	$auxForm['filhoEsquerdo']=null;
	$auxForm['filhoCentral']=null;
	$auxForm['filhoDireito']=null;
	$auxForm['pai']=null;
	$auxForm['formDisponiveis']=array();
	$auxForm['hashAtomos']=array();
	return $auxForm;
}
function aplicaRegra(&$form,&$pai,&$nosFolha){
	global $contador;
	//Inicializando variáveis auxiliares com suas respectivas estruturas de dados
	$noAuxCen1=criaFormulaTableaux();
	$noAuxCen1['atualCentral']=true;
	$noAuxCen2=criaFormulaTableaux();
	$noAuxCen1['filhoCentral']=&$noAuxCen2;
	$noAuxCen2['pai']=&$noAuxCen1;
	$noAuxCen2['atualCentral']=true;
	$noAuxEsq=criaFormulaTableaux();
	$noAuxEsq['atualEsquerdo']=true;
	$noAuxDir=criaFormulaTableaux();
	$noAuxDir['atualDireito']=true;
	/*
	print "<br>Nos Folha<br>";
	foreach ($nosFolha as $key => $value) {
		print_r($value['info']);
	}*/
	
	
	//Verificação para o caso de haver tentativa de aplciar fórmula
	//num ramo que já foi fechado
	if ($pai['filhoCentral']=='fechado') {
		print "<br>Este ramo já foi fechado<br>O nó folha é<br>";
		print_r($pai['info']);
		return;
	}
	//Verifico o conectivo da fórmula que foi aplicada
	//NOTA:O pai não necessariamente será o mesmo cara o qual está sendo aplicada a fórmula
	switch ($form['info']['conectivo']) {
		//Regra 1
		case 'e':
			//Com exceção da raiz, todo o no que é pai neste momento, deixará de ser nó folha.
			//Relembrando, consideramos que a raiz é pai dela mesma para a aplicação inicial.
			if ($contador!=0) {
				removerFormula($nosFolha,$pai['info']);
			}
			
			$pai['filhoCentral']=&$noAuxCen1;
			$noAuxCen1['pai']=&$pai;
			//Inicialização das variáveis auxiliáres
			$noAuxCen1['info']['direito']=$form['info']['esquerdo'];
			$noAuxCen2['info']['direito']=$form['info']['direito'];
			//Inicialização dos dados que são compartilhados com o pai
			$noAuxCen1['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxCen2['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxCen1['hashAtomos']=$pai['hashAtomos'];
			$noAuxCen2['hashAtomos']=$pai['hashAtomos'];
			//Correções na estrutura de dados
			
			corrigeArrays($noAuxCen1);			
			corrigeArrays($noAuxCen2);
			
			//Se a fórmula for atômica eu adiciono átomo gerado na hash da mesma
			//Se não for átomo, então é uma fórmula e adiciono a fórmula gerada na lista de fórmulas desse elemento
			//Como noAuxCen1 e noAuxCen2 estão no mesmo ramo, estes devem compartilhar as informações
			//print "<br>noAuxCen1<br>";
			//print_r($noAuxCen1);
			if(checaAtomico($noAuxCen1['info'])){
				if (casarFormula($noAuxCen1['hashAtomos'],$noAuxCen1['info'])) {
					$noAuxCen2['filhoCentral']='fechado';
				}
				$noAuxCen1['hashAtomos'][$noAuxCen1['info']['direito']]=$noAuxCen1['info']['conectivo'] == 'not' ? '0':'1';
				$noAuxCen2['hashAtomos'][$noAuxCen1['info']['direito']]=$noAuxCen1['info']['conectivo'] == 'not' ? '0':'1';		
			}
			elseif(!checaAtomico($noAuxCen1['info'])) {
				array_push($noAuxCen1['formDisponiveis'], $noAuxCen1);
				array_push($noAuxCen2['formDisponiveis'], $noAuxCen1);
			}			
			
			if(checaAtomico($noAuxCen2['info'])){
				if (casarFormula($noAuxCen2['hashAtomos'],$noAuxCen2['info'])) {
					$noAuxCen2['filhoCentral']='fechado';
				}
				$noAuxCen2['hashAtomos'][$noAuxCen2['info']['direito']]=$noAuxCen2['info']['conectivo'] == 'not' ? '0':'1';
				$noAuxCen1['hashAtomos'][$noAuxCen2['info']['direito']]=$noAuxCen2['info']['conectivo'] == 'not' ? '0':'1';				
			}
			elseif(!checaAtomico($noAuxCen2['info'])) {
				array_push($noAuxCen1['formDisponiveis'], $noAuxCen2);
				array_push($noAuxCen2['formDisponiveis'], $noAuxCen2);
			}
			removerFormula($noAuxCen1['formDisponiveis'],$form['info']);
			removerFormula($noAuxCen2['formDisponiveis'],$form['info']);
				
			adicionaArray($nosFolha, $noAuxCen2);
			return;
		//Regra 2
		case 'ou':
			//Com exceção da raiz, todo o no que é pai neste momento, deixará de ser nó folha.
			//Relembrando, consideramos que a raiz é pai dela mesma para a aplicação inicial.
			if ($contador!=0) {
				removerFormula($nosFolha,$pai['info']);
			}
			$pai['filhoEsquerdo']=&$noAuxEsq;
			$pai['filhoDireito']=&$noAuxDir;
			$noAuxEsq['pai']=&$pai;
			$noAuxDir['pai']=&$pai;
			//Inicialização das variáveis auxiliáres
			$noAuxEsq['info']['direito']=$form['info']['esquerdo'];
			$noAuxDir['info']['direito']=$form['info']['direito'];
			//Inicialização dos dados que são compartilhados com o pai
			$noAuxEsq['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxDir['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxEsq['hashAtomos']=$pai['hashAtomos'];
			$noAuxDir['hashAtomos']=$pai['hashAtomos'];
			//Correções na estrutura de dados
			
			corrigeArrays($noAuxEsq);			
			corrigeArrays($noAuxDir);
			//Se a fórmula for atômica eu adiciono átomo gerado na hash da mesma
			//Se não for átomo, então é uma fórmula e adiciono a fórmula gerada na lista de fórmulas desse elemento
			//Como noAuxCen1 e noAuxCen2 estão no mesmo ramo, estes devem compartilhar as informações
			if(checaAtomico($noAuxEsq['info'])){
				if (casarFormula($noAuxEsq['hashAtomos'],$noAuxEsq['info'])) {
					$noAuxEsq['filhoCentral']='fechado';
				}
				$noAuxEsq['hashAtomos'][$noAuxEsq['info']['direito']]=$noAuxEsq['info']['conectivo'] == 'not' ? '0':'1';	
			}
			elseif(!checaAtomico($noAuxEsq['info'])) {
				array_push($noAuxEsq['formDisponiveis'], $noAuxEsq);
			}			
			
			if(checaAtomico($noAuxDir['info'])){
				if (casarFormula($noAuxDir['hashAtomos'],$noAuxDir['info'])) {
					$noAuxDir['filhoCentral']='fechado';
				}
				$noAuxDir['hashAtomos'][$noAuxDir['info']['direito']]=$noAuxDir['info']['conectivo'] == 'not' ? '0':'1';	
			}
			elseif(!checaAtomico($noAuxDir['info'])) {
				array_push($noAuxDir['formDisponiveis'], $noAuxDir);
			}
			removerFormula($noAuxEsq['formDisponiveis'],$form['info']);
			removerFormula($noAuxDir['formDisponiveis'],$form['info']);	
			adicionaArray($nosFolha, $noAuxEsq);
			adicionaArray($nosFolha, $noAuxDir);
			return;		
		case 'implica':
			//Com exceção da raiz, todo o no que é pai neste momento, deixará de ser nó folha.
			//Relembrando, consideramos que a raiz é pai dela mesma para a aplicação inicial.
			if ($contador!=0) {
				removerFormula($nosFolha,$pai['info']);
			}
			$pai['filhoEsquerdo']=&$noAuxEsq;
			$pai['filhoDireito']=&$noAuxDir;
			$noAuxEsq['pai']=&$pai;
			$noAuxDir['pai']=&$pai;
			//Inicialização das variáveis auxiliáres
			$noAuxEsq['info']['direito']=$form['info']['esquerdo'];
			$noAuxDir['info']['direito']=$form['info']['direito'];
			//Inicialização dos dados que são compartilhados com o pai
			$noAuxEsq['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxDir['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxEsq['hashAtomos']=$pai['hashAtomos'];
			$noAuxDir['hashAtomos']=$pai['hashAtomos'];
			//Correções na estrutura de dados
			
			corrigeArrays($noAuxEsq);			
			corrigeArrays($noAuxDir);
			
			//Manipulação específica da implicação
			//O lado esquerdo deve passar a ter um not externamente
			//Se o lado esquerdo for átomo
			if (checaAtomico($noAuxEsq['info'])) {
				if ($noAuxEsq['info']['conectivo']=='not') {
					//Equivalente a notnot
					$noAuxEsq['info']['conectivo']=null;
				}
				else{
					$noAuxEsq['info']['conectivo']='not';
				}
			}
			//Se o lado esquerdo for array
			elseif (!checaAtomico($noAuxEsq['info'])){
				negaArrayTableaux($noAuxEsq['info']);
			}
			//Se a fórmula for atômica eu adiciono átomo gerado na hash da mesma
			//Se não for átomo, então é uma fórmula e adiciono a fórmula gerada na lista de fórmulas desse elemento
			//Como noAuxCen1 e noAuxCen2 estão no mesmo ramo, estes devem compartilhar as informações
			if(checaAtomico($noAuxEsq['info'])){
				if (casarFormula($noAuxEsq['hashAtomos'],$noAuxEsq['info'])) {
					$noAuxEsq['filhoCentral']='fechado';
				}
				$noAuxEsq['hashAtomos'][$noAuxEsq['info']['direito']]=$noAuxEsq['info']['conectivo'] == 'not' ? '0':'1';	
			}
			elseif(!checaAtomico($noAuxEsq['info'])) {
				array_push($noAuxEsq['formDisponiveis'], $noAuxEsq);
			}			
			
			if(checaAtomico($noAuxDir['info'])){
				if (casarFormula($noAuxDir['hashAtomos'],$noAuxDir['info'])) {
					$noAuxDir['filhoCentral']='fechado';
				}
				$noAuxDir['hashAtomos'][$noAuxDir['info']['direito']]=$noAuxDir['info']['conectivo'] == 'not' ? '0':'1';	
			}
			elseif(!checaAtomico($noAuxDir['info'])) {
				array_push($noAuxDir['formDisponiveis'], $noAuxDir);
			}
			removerFormula($noAuxEsq['formDisponiveis'],$form['info']);
			removerFormula($noAuxDir['formDisponiveis'],$form['info']);	
			adicionaArray($nosFolha, $noAuxEsq);
			adicionaArray($nosFolha, $noAuxDir);
			return;		
		//Regra 4
		case 'notnot':
			//Com exceção da raiz, todo o no que é pai neste momento, deixará de ser nó folha.
			//Relembrando, consideramos que a raiz é pai dela mesma para a aplicação inicial.
			if ($contador!=0) {
				removerFormula($nosFolha,$pai['info']);
			}
			
			$pai['filhoCentral']=&$noAuxCen1;
			$noAuxCen1['pai']=&$pai;
			//Inicialização das variáveis auxiliares
			$noAuxCen1['info']['direito']=$form['info']['direito'];
			//Inicialização dos dados que são compartilhados com o pai
			$noAuxCen1['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxCen1['hashAtomos']=$pai['hashAtomos'];
			//Correções na estrutura de dados
			
			
			corrigeArrays($noAuxCen1);
			
			//Manipulação específica de notnot
			
			//Se a fórmula for átomo
			if (checaAtomico($noAuxEsq['info'])) {
				if ($noAuxEsq['info']['conectivo']=='notnot') {
					//Equivalente a notnot
					$noAuxEsq['info']['conectivo']=null;
				}
			}
			//ARRUMAR O CASO EM QUE NOTNOT ESTIVER EM ARRAY
			/*
			//Se o lado esquerdo for array
			elseif (!checaAtomico($noAuxEsq['info'])){
				negaArrayTableaux($noAuxEsq['info']);
			}			
			*/
			//Se a fórmula for atômica eu adiciono átomo gerado na hash da mesma
			//Se não for átomo, então é uma fórmula e adiciono a fórmula gerada na lista de fórmulas desse elemento
			//Como noAuxCen1 e noAuxCen2 estão no mesmo ramo, estes devem compartilhar as informações
			if(checaAtomico($noAuxCen1['info'])){
				if (casarFormula($noAuxCen1['hashAtomos'],$noAuxCen1['info'])) {
					$noAuxCen1['filhoCentral']='fechado';
				}
				$noAuxCen1['hashAtomos'][$noAuxCen1['info']['direito']]=$noAuxCen1['info']['conectivo'] == 'not' ? '0':'1';
			}
			elseif(!checaAtomico($noAuxCen1['info'])) {
				array_push($noAuxCen1['formDisponiveis'], $noAuxCen1);
			}		
			removerFormula($noAuxCen1['formDisponiveis'],$form['info']);
				
			adicionaArray($nosFolha, $noAuxCen1);
			return;
		
		case 'not_e':
			//Com exceção da raiz, todo o no que é pai neste momento, deixará de ser nó folha.
			//Relembrando, consideramos que a raiz é pai dela mesma para a aplicação inicial.
			if ($contador!=0) {
				removerFormula($nosFolha,$pai['info']);
			}
			$pai['filhoEsquerdo']=&$noAuxEsq;
			$pai['filhoDireito']=&$noAuxDir;
			$noAuxEsq['pai']=&$pai;
			$noAuxDir['pai']=&$pai;
			//Inicialização das variáveis auxiliáres
			$noAuxEsq['info']['direito']=$form['info']['esquerdo'];
			$noAuxDir['info']['direito']=$form['info']['direito'];
			//Inicialização dos dados que são compartilhados com o pai
			$noAuxEsq['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxDir['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxEsq['hashAtomos']=$pai['hashAtomos'];
			$noAuxDir['hashAtomos']=$pai['hashAtomos'];
			//Correções na estrutura de dados
			
			corrigeArrays($noAuxEsq);			
			corrigeArrays($noAuxDir);
			//Manipulação específica do not_e
			//Os dois lados devem passar a ter um not externamente
			//Se o lado esquerdo for átomo
			if (checaAtomico($noAuxEsq['info'])) {
				if ($noAuxEsq['info']['conectivo']=='not') {
					//Equivalente a notnot
					$noAuxEsq['info']['conectivo']=null;
				}
				else{
					$noAuxEsq['info']['conectivo']='not';
				}
			}
			//Se o lado esquerdo for array
			elseif (!checaAtomico($noAuxEsq['info'])){
				negaArrayTableaux($noAuxEsq['info']);
			}
			//Se o lado direito for átomo
			if (checaAtomico($noAuxDir['info'])) {
				if ($noAuxDir['info']['conectivo']=='not') {
					//Equivalente a notnot
					$noAuxDir['info']['conectivo']=null;
				}
				else{
					$noAuxDir['info']['conectivo']='not';
				}
			}
			//Se o lado direito for array
			elseif (!checaAtomico($noAuxDir['info'])){
				negaArrayTableaux($noAuxDir['info']);
			}
			//Se a fórmula for atômica eu adiciono átomo gerado na hash da mesma
			//Se não for átomo, então é uma fórmula e adiciono a fórmula gerada na lista de fórmulas desse elemento
			//Como noAuxCen1 e noAuxCen2 estão no mesmo ramo, estes devem compartilhar as informações
			if(checaAtomico($noAuxEsq['info'])){
				if (casarFormula($noAuxEsq['hashAtomos'],$noAuxEsq['info'])) {
					$noAuxEsq['filhoCentral']='fechado';
				}
				$noAuxEsq['hashAtomos'][$noAuxEsq['info']['direito']]=$noAuxEsq['info']['conectivo'] == 'not' ? '0':'1';	
			}
			elseif(!checaAtomico($noAuxEsq['info'])) {
				array_push($noAuxEsq['formDisponiveis'], $noAuxEsq);
			}			
			
			if(checaAtomico($noAuxDir['info'])){
				if (casarFormula($noAuxDir['hashAtomos'],$noAuxDir['info'])) {
					$noAuxDir['filhoCentral']='fechado';
				}
				$noAuxDir['hashAtomos'][$noAuxDir['info']['direito']]=$noAuxDir['info']['conectivo'] == 'not' ? '0':'1';	
			}
			elseif(!checaAtomico($noAuxDir['info'])) {
				array_push($noAuxDir['formDisponiveis'], $noAuxDir);
			}
			removerFormula($noAuxEsq['formDisponiveis'],$form['info']);
			removerFormula($noAuxDir['formDisponiveis'],$form['info']);	
			adicionaArray($nosFolha, $noAuxEsq);
			adicionaArray($nosFolha, $noAuxDir);
			return;	
		
		case 'not_ou':
			//Com exceção da raiz, todo o no que é pai neste momento, deixará de ser nó folha.
			//Relembrando, consideramos que a raiz é pai dela mesma para a aplicação inicial.
			if ($contador!=0) {
				removerFormula($nosFolha,$pai['info']);
			}
			
			$pai['filhoCentral']=&$noAuxCen1;
			$noAuxCen1['pai']=&$pai;
			//Inicialização das variáveis auxiliáres
			$noAuxCen1['info']['direito']=$form['info']['esquerdo'];
			$noAuxCen2['info']['direito']=$form['info']['direito'];
			//Inicialização dos dados que são compartilhados com o pai
			$noAuxCen1['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxCen2['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxCen1['hashAtomos']=$pai['hashAtomos'];
			$noAuxCen2['hashAtomos']=$pai['hashAtomos'];
			
			//Correções na estrutura de dados
			
			corrigeArrays($noAuxCen1);			
			corrigeArrays($noAuxCen2);
			//Manipulação específica do not_ou
			//Os dois lados devem passar a ter um not externamente
			//Se o lado esquerdo for átomo
			if (checaAtomico($noAuxCen1['info'])) {
				if ($noAuxCen1['info']['conectivo']=='not') {
					//Equivalente a notnot
					$noAuxCen1['info']['conectivo']=null;
				}
				else{
					$noAuxCen1['info']['conectivo']='not';
				}
			}
			//Se o lado esquerdo for array
			elseif (!checaAtomico($noAuxCen1['info'])){
				negaArrayTableaux($noAuxCen1['info']);
			}
			//Se o lado direito for átomo
			if (checaAtomico($noAuxCen2['info'])) {
				if ($noAuxCen2['info']['conectivo']=='not') {
					//Equivalente a notnot
					$noAuxCen2['info']['conectivo']=null;
				}
				else{
					$noAuxCen2['info']['conectivo']='not';
				}
			}
			//Se o lado direito for array
			elseif (!checaAtomico($noAuxCen2['info'])){
				negaArrayTableaux($noAuxCen2['info']);
			}
			
			//Se a fórmula for atômica eu adiciono átomo gerado na hash da mesma
			//Se não for átomo, então é uma fórmula e adiciono a fórmula gerada na lista de fórmulas desse elemento
			//Como noAuxCen1 e noAuxCen2 estão no mesmo ramo, estes devem compartilhar as informações
			if(checaAtomico($noAuxCen1['info'])){
				if (casarFormula($noAuxCen1['hashAtomos'],$noAuxCen1['info'])) {
					$noAuxCen2['filhoCentral']='fechado';
				}
				$noAuxCen1['hashAtomos'][$noAuxCen1['info']['direito']]=$noAuxCen1['info']['conectivo'] == 'not' ? '0':'1';
				$noAuxCen2['hashAtomos'][$noAuxCen1['info']['direito']]=$noAuxCen1['info']['conectivo'] == 'not' ? '0':'1';		
			}
			elseif(!checaAtomico($noAuxCen1['info'])) {
				array_push($noAuxCen1['formDisponiveis'], $noAuxCen1);
				array_push($noAuxCen2['formDisponiveis'], $noAuxCen1);
			}			
			
			if(checaAtomico($noAuxCen2['info'])){
				if (casarFormula($noAuxCen2['hashAtomos'],$noAuxCen2['info'])) {
					$noAuxCen2['filhoCentral']='fechado';
				}
				$noAuxCen2['hashAtomos'][$noAuxCen2['info']['direito']]=$noAuxCen2['info']['conectivo'] == 'not' ? '0':'1';
				$noAuxCen1['hashAtomos'][$noAuxCen2['info']['direito']]=$noAuxCen2['info']['conectivo'] == 'not' ? '0':'1';				
			}
			elseif(!checaAtomico($noAuxCen2['info'])) {
				array_push($noAuxCen1['formDisponiveis'], $noAuxCen2);
				array_push($noAuxCen2['formDisponiveis'], $noAuxCen2);
			}
			removerFormula($noAuxCen1['formDisponiveis'],$form['info']);
			removerFormula($noAuxCen2['formDisponiveis'],$form['info']);
				
			adicionaArray($nosFolha, $noAuxCen2);
			return;
		
		case 'not_implica':
			//Com exceção da raiz, todo o no que é pai neste momento, deixará de ser nó folha.
			//Relembrando, consideramos que a raiz é pai dela mesma para a aplicação inicial.
			if ($contador!=0) {
				removerFormula($nosFolha,$pai['info']);
			}
			
			$pai['filhoCentral']=&$noAuxCen1;
			$noAuxCen1['pai']=&$pai;
			//Inicialização das variáveis auxiliáres
			$noAuxCen1['info']['direito']=$form['info']['esquerdo'];
			$noAuxCen2['info']['direito']=$form['info']['direito'];
			//Inicialização dos dados que são compartilhados com o pai
			$noAuxCen1['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxCen2['formDisponiveis']=$pai['formDisponiveis'];
			$noAuxCen1['hashAtomos']=$pai['hashAtomos'];
			$noAuxCen2['hashAtomos']=$pai['hashAtomos'];
			//Correções na estrutura de dados
			
			corrigeArrays($noAuxCen1);			
			corrigeArrays($noAuxCen2);
			//Manipulação específica do not_implica
			//O lado direito deve passar a ter um not externamente
			//Se o lado direito for átomo
			if (checaAtomico($noAuxCen2['info'])) {
				if ($noAuxCen2['info']['conectivo']=='not') {
					//Equivalente a notnot
					$noAuxCen2['info']['conectivo']=null;
				}
				else{
					$noAuxCen2['info']['conectivo']='not';
				}
			}
			//Se o lado direito for array
			elseif (!checaAtomico($noAuxCen2['info'])){
				negaArrayTableaux($noAuxCen2['info']);
			}
			
			//Se a fórmula for atômica eu adiciono átomo gerado na hash da mesma
			//Se não for átomo, então é uma fórmula e adiciono a fórmula gerada na lista de fórmulas desse elemento
			//Como noAuxCen1 e noAuxCen2 estão no mesmo ramo, estes devem compartilhar as informações
			if(checaAtomico($noAuxCen1['info'])){
				if (casarFormula($noAuxCen1['hashAtomos'],$noAuxCen1['info'])) {
					$noAuxCen2['filhoCentral']='fechado';
				}
				$noAuxCen1['hashAtomos'][$noAuxCen1['info']['direito']]=$noAuxCen1['info']['conectivo'] == 'not' ? '0':'1';
				$noAuxCen2['hashAtomos'][$noAuxCen1['info']['direito']]=$noAuxCen1['info']['conectivo'] == 'not' ? '0':'1';		
			}
			elseif(!checaAtomico($noAuxCen1['info'])) {
				array_push($noAuxCen1['formDisponiveis'], $noAuxCen1);
				array_push($noAuxCen2['formDisponiveis'], $noAuxCen1);
			}			
			
			if(checaAtomico($noAuxCen2['info'])){
				if (casarFormula($noAuxCen2['hashAtomos'],$noAuxCen2['info'])) {
					$noAuxCen2['filhoCentral']='fechado';
				}
				$noAuxCen2['hashAtomos'][$noAuxCen2['info']['direito']]=$noAuxCen2['info']['conectivo'] == 'not' ? '0':'1';
				$noAuxCen1['hashAtomos'][$noAuxCen2['info']['direito']]=$noAuxCen2['info']['conectivo'] == 'not' ? '0':'1';				
			}
			elseif(!checaAtomico($noAuxCen2['info'])) {
				array_push($noAuxCen1['formDisponiveis'], $noAuxCen2);
				array_push($noAuxCen2['formDisponiveis'], $noAuxCen2);
			}
			removerFormula($noAuxCen1['formDisponiveis'],$form['info']);
			removerFormula($noAuxCen2['formDisponiveis'],$form['info']);
				
			adicionaArray($nosFolha, $noAuxCen2);
			return;
		//Caso extra
		case 'not':
			//Se for atômico devemos adicionar na hash e verificar se casa com alguma fórmula
			if(checaAtomico($pai['info'])){
				if(casarFormula($pai['hashAtomos'],$pai['info'])){
					$pai['filhoCentral']='fechado';
				}
				$pai['hashAtomos'][$pai['info']['direito']]=$pai['info']['conectivo'] == 'not' ? '0':'1';	
			}
			/*
			print "<br>Fórmulas disponíveis de C - ANTES<br>";
			foreach ($pai['formDisponiveis'] as $key => $value) {
				print_r($pai['formDisponiveis'][$key]['info']);
			}*/
			
			removerFormula($pai['formDisponiveis'],$form['info']);
			/*
			print "<br>Fórmulas disponíveis de C - DEPOIS<br>";
			foreach ($pai['formDisponiveis'] as $key => $value) {
				print_r($pai['formDisponiveis'][$key]['info']);
			}*/
			return;
		case null:
			//Se for atômico devemos adicionar na hash e verificar se casa com alguma fórmula
			if(checaAtomico($pai['info'])){
				if(casarFormula($pai['hashAtomos'],$pai['info'])){
					$pai['filhoCentral']='fechado';
				}
				$pai['hashAtomos'][$pai['info']['direito']]=$pai['info']['conectivo'] == 'not' ? '0':'1';	
			}
			
			removerFormula($pai['formDisponiveis'],$form['info']);
			
			return;
		default:
			print_r($form['hashAtomos']);
			break;
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
//Se houver digitação incorreta gera uma exceção (trabalhar na exceção depois)
function negaPergunta($listaFormulas,$tamanho){
	//Nega a pergunta
	$listaFormulas[$tamanho-1]="not".$listaFormulas[$tamanho-1];
	//Tratar a entrada, verificação de digitação correta
	foreach ($listaFormulas as $key => $value) {
		verificaFormulaCorreta($listaFormulas[$key]);
		$entradaConvertida[$key]=resolveParentesesTableaux($listaFormulas[$key]);
	}
	
	return $entradaConvertida;
}
function removerFormula(&$listaFormulas,$form){
	foreach ($listaFormulas as $key => $value) {
		if ($value['info']==$form) {
			unset($listaFormulas[$key]);
			return;
		}
	}
}
function adicionaArray(&$array,&$valor){
	$tam=count($array);
	$soma=1;
	if ($tam!=0) {
		//Consertar o índice do array para evitar sobreposição
		while (@$array[$tam+$soma]!=null) {
			$soma++;
		}
		$array[$tam+$soma]=&$valor;
	}
	else{
		$array[0]=&$valor;
	}
}
function casarFormula($hash,$form){
	$aux=$form['conectivo'] == "not" ? '0':'1';
	foreach ($hash as $key => $value) {			
		//Verifico se alguma vez esse cara já foi setado na hash
		if(!is_null($hash[$key])){
			if(($hash[$key]==!$aux) && ($form['direito']==$key)){
				return true;
			}				
		}
	}
	return false;
}
function juntarArrays(&$array1,$array2){
	$arrayAux=array();
	$igual=false;
	foreach ($array2 as $key2 => $value2) {
		$igual=false;
		foreach ($array1 as $key => $value) {
			if (@$array1[$key]['info']==@$array2[$key2]['info']) {
				$igual=true;
			}
		}
		if (!$igual) {
			array_push($arrayAux,$array2[$key2]);
		}
	}
	foreach ($arrayAux as $key => $value) {
		array_push($array1, $arrayAux[$key]);
	}
}
function todasFechadas($nosFolha){
	global $contador;
	$total=count($nosFolha);
	$total2=0;
	foreach ($nosFolha as $key => $value) {
		if ($nosFolha[$key]['filhoCentral']=='fechado') {
			$total2++;
		}
	}
	if ($total==$total2 && $contador!=0) {
		return true;
	}
	else{
		return false;
	}
}
function imprimeArvore(&$no){
	if (@$no['info']!=NULL) {
		print_r($no['info']);
		verificaStatusNo($no);
	}
	
	if(@$no['filhoCentral']!=NULL && @$no['filhoCentral']!='fechado'){
		@imprimeArvore($no['filhoCentral']);
	}
	if(@$no['filhoEsquerdo'] && @$no['filhoEsquerdo']!='fechado'){
		imprimeArvore(@$no['filhoEsquerdo']);
	}
	if(@$no['filhoDireito'] && @$no['filhoDireito']!='fechado'){
		imprimeArvore(@$no['filhoDireito']);
	}
}
//Função utilizada somente por imprimArvore para ajustaro formato da impressão
function verificaStatusNo(&$no){
	switch($no){
		case @$no['atualCentral']:
			print "  Central <br>";
			break;
		case @$no['atualEsquerdo']:
			print "  Esquerda ------ ";
			break;
		case @$no['atualDireito']:
			print "  Direita <br>";
			break;
		default:
			if(@$no['info']=="fechado"){
				break;
			}
			print "<br>Nó não categorizado<br>";
	}
}
function formataFormulasTableaux(&$form){
	//Se ocorrer erro, investigar a entrada no if barra por strlen
	if(@strlen(@$form['info']['esquerdo'])>3){
		$aux=resolveParentesesTableaux($form['info']['esquerdo']);
		$form['info']['esquerdo']=$aux;
		formataFormulasTableaux($form['info']['esquerdo']);
	}
	if(@strlen(@$form['info']['direito'])>3){
		$aux=resolveParentesesTableaux($form['info']['direito']);
		$form['info']['direito']=$aux;
		formataFormulasTableaux($form['info']['direito']);
	}
}
//Função que corrige casos em que temos um campo array do tipo fórmula dentro de outro
//array do tipo fórmula com um dos campos (esquerdo ou direito) vazio
function corrigeArrays(&$form){
	if (@$form['info']['esquerdo']==NULL && @is_array($form['info']['direito'])) {
		$aux1=$form['info']['direito'];
		$form['info']['esquerdo']=$aux1['info']['esquerdo'];
		$form['info']['conectivo']=$aux1['info']['conectivo'];
		$form['info']['direito']=$aux1['info']['direito'];
		return;
	}
	if (@$form['info']['direito']==NULL && @is_array($form['info']['esquerdo'])) {
		$aux1=$form['info']['esquerdo'];
		$form['info']['esquerdo']=$aux1['info']['esquerdo'];
		$form['info']['conectivo']=$aux1['info']['conectivo'];
		$form['info']['direito']=$aux1['info']['direito'];
	}
	return;
}
//Função que processa o equivalente a um not(array)
//Para processar not(atomo) funções não são necessárias
function negaArrayTableaux(&$form){
	if ($form['conectivo']=='e') {
		$form['conectivo']='not_e';
	}
	elseif ($form['conectivo']=='ou') {
		$form['conectivo']='not_ou';
	}
	elseif ($form['conectivo']=='implica') {
		$form['conectivo']='not_implica';
	}
	elseif ($form['conectivo']=='not_e') {
		$form['conectivo']='e';
	}
	elseif ($form['conectivo']=='not_ou') {
		$form['conectivo']='ou';
	}
	elseif ($form['conectivo']=='not_implica') {
		$form['conectivo']='implica';
	}
}
//Função para armazenar a estrutura de dados no histórico
function armazenaHistorico(&$arrayHistorico,$nosFolha,$raiz,$numPasso,$listaFormulasDisponiveis){
	$aux['nosFolha']=$nosFolha;
	$aux['raiz']=$raiz;
	$aux['numPasso']=$numPasso;
	$aux['listaFormulasDisponiveis']=$listaFormulasDisponiveis;
	array_push($arrayHistorico,$aux);
}
//Função para voltar um passo na execução do Tableaux
function voltaUmPasso(&$arrayHistorico,&$nosFolha,&$raiz,&$numPasso,&$listaFormulasDisponiveis){
	$tam=count($arrayHistorico);
	unset($arrayHistorico[$tam-1]);	
	$raiz=$arrayHistorico[$tam-2]['raiz'];
	$nosFolha=$arrayHistorico[$tam-2]['nosFolha'];
	$listaFormulasDisponiveis=$arrayHistorico[$tam-2]['listaFormulasDisponiveis'];
	$numPasso=$arrayHistorico[$tam-2]['numPasso'];
}
