<?php
class Formula{
	private $esquerdo=NULL;
	private $direito;
	private $conectivo;
	private $usado=False;
	
	//Adaptação para poder usar vários tipos de construtores diferentes
	function __construct()
	{
		$a = func_get_args();
		$i = func_num_args();
		if (method_exists($this,$f='__construct'.$i)) {
			call_user_func_array(array($this,$f),$a);
		}
	} 
	
	//Construtor para fórmula que é apenas um átomo
	public function __construct1($direito){
		$this->direito=$direito;
	}
	//Construtor para f�rmula que é átomo negado
	public function __construct2($conectivo,$direito){
		$this->conectivo=$conectivo;
		$this->direito=$direito;
	}
	//Construtor para fórmula de dois termos comum
	public function __construct3($esquerdo,$conectivo,$direito){
		$this->esquerdo=$esquerdo;
		$this->conectivo=$conectivo;
		$this->direito=$direito;
	}
	//Construtor para fórmula de dois termos cujo lado direito é uma fórmula objeto
	public function __construct4($esquero,$conectivo,Formula $direito){
		$this->esquerdo=$esquerdo;
		$this->conectivo=$conectivo;
		$this->direito=$direito;
	}
	
	//Construtor para fórmula de dois termos cujo lado esquerdo é uma fórmula objeto
	public function __construct5(Formula $esquero,$conectivo,$direito){
		$this->esquerdo=$esquerdo;
		$this->conectivo=$conectivo;
		$this->direito=$direito;
	}
	//Construtor para fórmula de dois termos cujo os dois lados são uma fórmula objeto
	public function __construct6(Formula $esquero,$conectivo,Formula $direito){
		$this->esquerdo=$esquerdo;
		$this->conectivo=$conectivo;
		$this->direito=$direito;
	}
	//Construtor para fórmula que é uma fórmula negada
	public function __construct7($conectivo,Formula $direito){
		$this->conectivo=$conectivo;
		$this->direito=$direito;
	}
	
	
	public function setEsquerdo($e){
		$this->esquerdo=$e;
	}
	
	public function setDireito($d){
		$this->direito=$d;
	}
	
	public function setConectivo($c){
		$this->conectivo=$c;
	}
	
	//Se a fórmula for usada ela deve ser marcada como true
	public function usaFormula(){
		$this->usado=true;
	}
	
	public function getEsquerdo(){
		return $this->esquerdo;
	}
	
	public function getDireito(){
		return $this->direito;
	}
	
	public function getConectivo(){
		return $this->conectivo;
	}
	
	public function estadoFormula(){
		return $this->usado;
	}
	
	
}
?>