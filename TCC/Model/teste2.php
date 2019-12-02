<?php
require_once("funcAuxiliares.php");
require_once("funcTableaux.php");
echo "<pre>";
$listaConectivos=array("^","v","-","!");
$form1=criaFormulaTableaux();
$form2=criaFormulaTableaux();
$form3=criaFormulaTableaux();

$form3['info']['esquerdo']='E';
$form3['info']['conectivo']='e';
$form3['info']['direito']='F';

$form2['info']['esquerdo']='C';
$form2['info']['conectivo']='e';
$form2['info']['direito']='D';
$form2['filhoCentral']=$form3;

$form1['info']['esquerdo']='A';
$form1['info']['conectivo']='e';
$form1['info']['direito']='B';
$form1['filhoDireito']=$form2;

$noFolha=$form3['info'];




print_r($form1);

deletaFilho($form1,$noFolha);
print_r($form1);

function deletaFilho(&$form,$noFolha){
	if ($form['filhoCentral']) {
		if ($noFolha==$form['filhoCentral']['info']) {
			$form['filhoCentral']=null;
			return;
		}
		deletaFilho($form['filhoCentral'],$noFolha);
	}
	if ($form['filhoEsquerdo']) {
		if ($noFolha==$form['filhoEsquerdo']['info']) {
			$form['filhoEsquerdo']=null;
			return;
		}
		deletaFilho($form['filhoEsquerdo'],$noFolha);
	}
	if ($form['filhoDireito']) {
		if ($noFolha==$form['filhoDireito']['info']) {
			$form['filhoDireito']=null;
			return;
		}
		deletaFilho($form['filhoDireito'],$noFolha);
	}

}
?>