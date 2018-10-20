<?php
//Não serve pra nada, apenas testando código e funções internas para aplicar no código principal
echo "<pre>";

$listaDeNos['1']=array('info'=>'a','formulaGeradora'=>'b','fechado'=>false);

print_r($listaDeNos);
$listaDeNos['1']['formulaGeradora']='c';
print_r($listaDeNos);

?>