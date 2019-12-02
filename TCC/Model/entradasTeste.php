<?php
//Entradas de Teste para qualquer teste de controle interno ou para consulta dos métodos
//A^B
$formula = new Formula("A","e","B");

//AvB
$formula2 = new Formula("A","ou","B");

//Av¬B
$formAux = new Formula("not","B");
$formula3= new Formula("A","ou",$formAux);

//A->B
$formula4 = new Formula("A","implica","B");

//¬¬A
$formula5 = new Formula('notnot',"A");

//¬(A^B)
//$formAux2 = new Formula("A","e","B");
$formula6 = new Formula("A","not_e","B");

//¬(AvB)
$formula7 = new Formula("A","not_ou","B");

//¬(A->B)
$formula8 = new Formula("A","not_implica","B");

$formulaTesteErro = new Formula("((AeB)ouB)","not_e","C");

$formulaTesteCorreto = new Formula("((AeB)ou((AeC)implicaD))","e","A");
$novaForm = new Formula();
?>