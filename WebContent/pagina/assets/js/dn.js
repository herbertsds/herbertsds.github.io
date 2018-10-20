// var perguntaBD;
var cacheOu;
var tree;
var qtdBd;

$(function(){
	
	$('#jstree_div').jstree({
		'plugins' : [ "checkbox" ],
		'checkbox' : {
			'three_state' : false
		},
		'core' : {

			'check_callback' : true
		}
	});

	$("#incE").click(function(){ incE(); });
	$("#elimE").click(function(){ elimE(); });
	$('#btnSupor').click(function(){ supor(); });
	$("#elimNot").click(function(){ elimNot(); });
	$("#excImp").click(function(){ excImp(); });
	$("#abs").click(function(){ abs(); });
	//A partir daqui, colocar os botões
	$("#incImp").click(function(){ incImp(); });
	$("#incNot").click(function(){ incNot(); });
	$('#btnOu').click(function(){ incOu(); });
	$('#excOu').click(function(){ excOu(); });
	$('#stepOu').click(function(){ stepOu(); });
	$('#elimOu').click(function(){ elimOu(); });
	$('#undo').click(function(){ undo(); });
	
	
});

function initDeducao(){
	var tree = [];
	
	var myData = {
        'formulas': vet_regras
    };

    var pergunta = {
    	'pergunta': pergunta
    }

   	$('#jstree_div').empty().jstree('destroy');

   	$('#jstree_div').jstree({
		'plugins' : [ "checkbox" ],
		'checkbox' : {
			'three_state' : false
		},
		'core' : {

			'check_callback' : true
		}
	});

	qtdBd = vet_regras.length;

	startArvore(myData,pergunta);

	
	// excOu
}

//Carga inicial da dedução natural
function startArvore(myData,pergunta){
    $.ajax({
        url: urlWebService+'api/deducaoNatural/novoExercicio',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        
        success: function(resposta) { 
	        tree = resposta;
	        var data = {};
			
	        for(chave in resposta){
	        	data['id'] = resposta[chave]['id'];
	        	data['text'] = data['id']+". "+resposta[chave]['text'];
	        	data['icon'] = resposta[chave]['icon'] == "" ? false:true;
	        	data['state'] = {"opened" : true};
	        	$('#jstree_div').jstree().create_node('#', data, 'last', function(){}, true);
	        }
        },
        error: function(erro) {
			console.log(erro.responseText);
			console.log(urlWebService);
		}
    });

    $.ajax({
        url: urlWebService+'api/deducaoNatural/formataPergunta',
        type: 'GET',
        callback: '?',
        data: pergunta,
        datatype: 'application/json',
        success: function(resposta) { 
        	pergunta = resposta;
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}

function supor(){
	var myData = {
		"step": "supor",
		"supor": $('#lblSupor').val().replace(/\s/gi, ''),
		"atual": tree
	};
	$('#lblSupor').val("");
	console.log(myData);
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
	        tree.push(resposta);
	        
	        var data = {};

	        data['id'] = resposta['id'];
        	data['text'] = data['id']+". "+resposta['text'];
        	data['icon'] = resposta['icon'] == "" ? false:true;
        	data['state'] = {"opened" : true};
        	$('#jstree_div').jstree().create_node(resposta['parent'], data, 'last', function(){}, true);
        	finalizaExercício(resposta['text'],resposta['id']);
        	$('#jstree_div').jstree(true).uncheck_all();
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}
function incOu(){
	var selecionados = $("#jstree_div").jstree("get_selected",true);
	var myData = {
		"step": "incOu",
		"selecionados": selecionados,
		"incluir": $('#lblOu').val().replace(/\s/gi, ''),
		"atual": tree
	};
	$('#lblOu').val("");
	console.log(myData);
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
        	if("erro" in resposta){
        		console.log(resposta);
        		alert(resposta['erro']);

        	}else{
		        tree.push(resposta);
		        
		        var data = {};

		        data['id'] = resposta['id'];
	        	data['text'] = data['id']+". "+resposta['text'];
	        	data['icon'] = resposta['icon'] == "" ? false:true;
	        	data['state'] = {"opened" : true};
	        	$('#jstree_div').jstree().create_node(resposta['parent'], data, 'last', function(){}, true);
	        	finalizaExercício(resposta['text'],resposta['id']);
	        	$('#jstree_div').jstree(true).uncheck_all();
	        }
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}

function excOu(){
	var selecionados = $("#jstree_div").jstree("get_selected",true);
	var myData = {
		"step": "excOu",
		"selecionados": selecionados,
		"atual": tree
	};
	console.log(myData);
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
        	// console.log(resposta);
        	cacheOu = resposta[1];
        	resposta = resposta[0];
        	cacheOu['idIrmao'] = resposta['id'];
        	if("erro" in resposta){
        		console.log(resposta);
        		alert(resposta['erro']);

        	}else{
		        tree.push(resposta);
		        
		        var data = {};

		        data['id'] = resposta['id'];
	        	data['text'] = data['id']+". "+resposta['text'];
	        	data['icon'] = resposta['icon'] == "" ? false:true;
	        	data['state'] = {"opened" : true};
	        	$('#jstree_div').jstree().create_node(resposta['parent'], data, 'last', function(){}, true);
	        	// finalizaExercício(resposta['text'],resposta['id']);
	        	$('#jstree_div').jstree(true).uncheck_all();
	        }
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}

function elimOu(){
	var selecionados = $("#jstree_div").jstree("get_selected",true);
	var myData = {
		"step": "elimOu",
		"selecionados": selecionados,
		"atual": tree
	};
	console.log(myData);
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
        	// console.log(resposta);
        	if("erro" in resposta){
        		console.log(resposta);
        		alert(resposta['erro']);

        	}else{
		        tree.push(resposta);
		        
		        var data = {};

		        data['id'] = resposta['id'];
	        	data['text'] = data['id']+". "+resposta['text'];
	        	data['icon'] = resposta['icon'] == "" ? false:true;
	        	data['state'] = {"opened" : true};
	        	$('#jstree_div').jstree().create_node(resposta['parent'], data, 'last', function(){}, true);
	        	finalizaExercício(resposta['text'],resposta['id']);
	        	$('#jstree_div').jstree(true).uncheck_all();
	        }
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}

function stepOu(){
	var selecionados = cacheOu;
	var myData = {
		"step": "stepOu",
		"selecionados": selecionados,
		"atual": tree
	};
	console.log(myData);
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
        	// console.log(resposta);
        	// cacheOu = resposta[1];
        	if("erro" in resposta){
        		console.log(resposta);
        		alert(resposta['erro']);

        	}else{
		        tree.push(resposta);
		        
		        var data = {};

		        data['id'] = resposta['id'];
	        	data['text'] = data['id']+". "+resposta['text'];
	        	data['icon'] = resposta['icon'] == "" ? false:true;
	        	data['state'] = {"opened" : true};
	        	$('#jstree_div').jstree().create_node(resposta['parent'], data, 'last', function(){}, true);
	        	finalizaExercício(resposta['text'],resposta['id']);
	        	$('#jstree_div').jstree(true).uncheck_all();
	        }
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}

function elimNot(){
	var selecionados = $("#jstree_div").jstree("get_selected",true);
	var myData = {
		"step": "elimNot",
		"selecionados": selecionados,
		"atual": tree
	};
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
        	console.log(resposta);
        	if("erro" in resposta){
        		// console.log(resposta['erro']);
        		alert(resposta['erro']);

        	}else{
        		tree.push(resposta);
	        
		        var data = {};

		        data['id'] = resposta['id'];
	        	data['text'] = data['id']+". "+resposta['text'];
	        	data['icon'] = resposta['icon'] == "" ? false:true;
	        	data['state'] = {"opened" : true};
	        	$('#jstree_div').jstree().create_node(resposta['parent'], data, 'last', function(){}, true);
	        	finalizaExercício(resposta['text'],resposta['id']);
	        	$('#jstree_div').jstree(true).uncheck_all();
        	}
	        
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}

function incE(){
	var selecionados = $("#jstree_div").jstree("get_selected",true);
	var myData = {
		"step": "incE",
		"selecionados": selecionados,
		"atual": tree
	};
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
        	// console.log(resposta);
        	if("erro" in resposta){
        		console.log(resposta);
        		alert(resposta['erro']);

        	}else{
        		// console.log(resposta);
        		tree.push(resposta);
	        
		        var data = {};

		        data['id'] = resposta['id'];
	        	data['text'] = data['id']+". "+resposta['text'];
	        	data['icon'] = resposta['icon'] == "" ? false:true;
	        	data['state'] = {"opened" : true};
	        	$('#jstree_div').jstree().create_node(resposta['parent'], data, 'last', function(){}, true);
	        	finalizaExercício(resposta['text'],resposta['id']);
	        	$('#jstree_div').jstree(true).uncheck_all();
	        }
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}

function incNot(){
	var selecionados = $("#jstree_div").jstree("get_selected",true);
	var myData = {
		"step": "incNot",
		"selecionados": selecionados,
		"atual": tree
	};
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
        	// console.log(resposta);
        	if("erro" in resposta){
        		console.log(resposta);
        		alert(resposta['erro']);
        	}else{
        		// console.log(resposta);
        		tree.push(resposta);
	        
		        var data = {};

		        data['id'] = resposta['id'];
	        	data['text'] = data['id']+". "+resposta['text'];
	        	data['icon'] = resposta['icon'] == "" ? false:true;
	        	data['state'] = {"opened" : true};
	        	$('#jstree_div').jstree().create_node(resposta['parent'], data, 'last', function(){}, true);
	        	finalizaExercício(resposta['text'],resposta['id']);
	        	$('#jstree_div').jstree(true).uncheck_all();
	        }
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}

function elimE(){
	var selecionados = $("#jstree_div").jstree("get_selected",true);
	var myData = {
		"step": "elimE",
		"selecionados": selecionados,
		"atual": tree
	};
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
        	if("erro" in resposta){
        		console.log(resposta);
        		alert(resposta['erro']);

        	}else{
        		// console.log(resposta);
        		
	        
		        var data = {};

		        for(chave in resposta){
		        	tree.push(resposta[chave]);
		        	console.log()
		        	data['id'] = resposta[chave]['id'];
		        	data['text'] = data['id']+". "+resposta[chave]['text'];
		        	data['icon'] = resposta[chave]['icon'] == "" ? false:true;
		        	data['state'] = {"opened" : true};
		        	$('#jstree_div').jstree().create_node(resposta[chave]["parent"], data, 'last', function(){}, true);
		        	finalizaExercício(resposta['text'],resposta['id']);
		        	$('#jstree_div').jstree(true).uncheck_all();
		        }
        	}
	        
        },
        error: function(erro) {
			console.log(erro.responseText);
//
        }
    });
}

function abs(){
	var selecionados = $("#jstree_div").jstree("get_selected",true);
	var myData = {
		"step": "abs",
		"selecionados": selecionados,
		"atual": tree
	};
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
        	if("erro" in resposta){
        		console.log(resposta);
        		alert(resposta['erro']);

        	}else{
        		tree.push(resposta);
	        
		        var data = {};

		        data['id'] = resposta['id'];
	        	data['text'] = data['id']+". "+resposta['text'];
	        	data['icon'] = resposta['icon'] == "" ? false:true;
	        	data['state'] = {"opened" : true};
	        	data['parent'] = resposta['parent'];
	        	$('#jstree_div').jstree().create_node(resposta['parent'], data, 'last', function(){}, true);
	        	raa(data);
	        	finalizaExercício(resposta['text'],resposta['id']);
	        	$('#jstree_div').jstree(true).uncheck_all();
        	}
	        
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}

function raa(data){
	var selecionados = data;
	var myData = {
		"step": "raa",
		"selecionados": selecionados,
		"atual": tree
	};
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
        	console.log("raa");
        	console.log(resposta)
        	// if("erro" in resposta){
        	// 	console.log(resposta);
        	// }else{
        		tree.push(resposta);
	        
		        var data = {};

		        data['id'] = resposta['id'];
	        	data['text'] = data['id']+". "+resposta['text'];
	        	data['icon'] = resposta['icon'] == "" ? false:true;
	        	data['state'] = {"opened" : true};
	        	$('#jstree_div').jstree().create_node(resposta['parent'], data, 'last', function(){}, true);
	        	finalizaExercício(resposta['text'],resposta['id']);
	        	$('#jstree_div').jstree(true).uncheck_all();
        	// }
	        
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}

function incImp(){
	var selecionados = $("#jstree_div").jstree("get_selected",true);
	var myData = {
		"step": "incImp",
		"selecionados": selecionados,
		"atual": tree
	};
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
        	if("erro" in resposta){
        		console.log(resposta);
        		alert(resposta['erro']);

        	}else{
        		tree.push(resposta);
	        
		        var data = {};

		        data['id'] = resposta['id'];
	        	data['text'] = data['id']+". "+resposta['text'];
	        	data['icon'] = resposta['icon'] == "" ? false:true;
	        	data['state'] = {"opened" : true};
	        	$('#jstree_div').jstree().create_node(resposta['parent'], data, 'last', function(){}, true);
	        	$('#jstree_div').jstree(true).uncheck_all();
	        	finalizaExercício(resposta['text'],resposta['id']);
        	}
	        
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}

function excImp(){
	var selecionados = $("#jstree_div").jstree("get_selected",true);
	var myData = {
		"step": "excImp",
		"selecionados": selecionados,
		"atual": tree
	};
	// Carga inicial da dedução natural
    $.ajax({
        url: urlWebService+'api/deducaoNatural/step',
        type: 'GET',
        callback: '?',
        data: myData,
        datatype: 'application/json',
        success: function(resposta) { 
        	if("erro" in resposta){
        		console.log(resposta);
        		alert(resposta['erro']);

        	}else{
        		console.log(resposta);
        		tree.push(resposta);
	        
		        var data = {};

		        data['id'] = resposta['id'];
	        	data['text'] = data['id']+". "+resposta['text'];
	        	data['icon'] = resposta['icon'] == "" ? false:true;
	        	data['state'] = {"opened" : true};
	        	$('#jstree_div').jstree().create_node(resposta['parent'], data, 'last', function(){}, true);
	        	$('#jstree_div').jstree(true).uncheck_all();
	        	finalizaExercício(resposta['text'],resposta['id']);
        	}
	        
        },
        error: function(erro) {
			console.log(erro.responseText);
//
		}
    });
}

function finalizaExercício(texto,id){
	var data = {};
	console.log(pergunta);
	console.log(texto);

	if(texto == pergunta && Number.isInteger(Number(id)) ){
		console.log("estou aqui");
    	data['text'] = "Exercício Finalizado";
    	data['icon'] = false;
    	data['state'] = {"opened" : true};
    	$('#jstree_div').jstree().create_node("#", data, 'last', function(){}, true);
    	$('#jstree_div').jstree(true).uncheck_all();
    	$('#jstree_div').jstree(true).disable_checkbox(
		    $('#jstree_div').jstree(true)._model.data["#"].children_d
		);
		$('#jstree_div').jstree(true).hide_checkboxes();
	}else{
		console.log("Prints");
		console.log(pergunta);
		console.log(texto);
		console.log(Number.isInteger(id));
		console.log(typeof id);
	}
}

function undo(){
	if (tree.length > qtdBd){
		var remover = tree.pop();
		// $('#jstree_div').jstree().delete_node(remover['id']);

		$('#jstree_div').jstree("delete_node","#"+remover['id']);
		console.log(remover['id']);
	}else{
		console.log("Não é possível remover o BD da DN");
		alert("Não é possível remover o BD da DN");
	}
}