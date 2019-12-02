var dominios = 0;
var vet_dominio = [];
var dominioAdicionado = "";
var relacoes = 0;
var vet_relacoes=[];
var relacoesAdicionadas = "";
var vet_dominio_pt1 = [];
var vet_dominio_pt2 = [];
var dominio = [];
var relacoes2 = []
function f_GabSemantica(partes) {
	
	
	//console.log(partes);
	    exercicio= partes[0].split('=')[1];
	    //console.log(exercicio);
	    vet_dominio_pt1 = partes[1].split('=');
	     vet_dominio = vet_dominio_pt1[1].split(',');
	    //console.log(vet_dominio);
	    
	    vet_relacoes_pt1 = partes[2].split('=');
	     vet_relacoes = vet_relacoes_pt1[1].split(',');
	  //  console.log(vet_relacoes);
	    
	
	var myData = {
		'exercicio' : exercicio,
		'dominio' : vet_dominio,
		'relacoes' : vet_relacoes
	};
	//console.log(' enviando : ' + JSON.parse(myData));
	console.log(exercicio);
	console.log(vet_dominio);
	console.log(vet_relacoes);
	$
			.ajax({

				url : urlWebService+'api/semantica',
				type : 'GET',
				callback : '?',
				data : myData,
				datatype : 'application/json',
				success : function(obj) {
					console.log(obj);
					$('#iframe')
							.contents()
							.find('head')
							.append(
									'    <link rel="stylesheet" href="jquery.orgchart.css"/>');
					$('#iframe').css('height', $(window).height() + 'px');

					$('#iframe')
							.contents()
							.find('body')
							.append(
									'<div name="divArvSem" class="form-check"  id="s_divNovasFormulas"><div id="s_content"><div id="s_main"><ul id="s_organisation"></ul></div></div></div>');
					// console.log(obj[1]);
					$('#iframe').contents().find("#s_organisation").append(obj[0]);
					$('#iframe').contents().find("#s_organisation").orgChart({
						container : $('#iframe').contents().find("#s_main")
					});
					jQuery.each(obj[1],function() {
						//console.log(this);
						
						if(this['valor'] == true){
							console.log("verde");
						}
						else {console.log("vermelho");}
						
					});
				},
				error : function(retorno2) {

					console.log(retorno2);
				},
			});

}

function f_abreGabSem() {
	var win = window.open('./WebContent/pagina/gabSemantica.html?exercicioBuscado=' + numExercicio+'&vet_dominio='+vet_dominio+'&vet_relacoes='+vet_relacoes);

}

function f_AddDominio(){
	dominios++;
	var str = $('#s_Dominio').val().replace(/\s/gi, '');
	vet_dominio.push(str.replace(',',';'));
	dominioAdicionado = $('#s_Dominio').val().replace(/\s/gi, '');

	$('#dominioAdicionado').append(
			"<br/>" + dominios + ": " + dominioAdicionado);
	$('#s_Dominio').val("");
	$("#buttonRemoverDominio").removeAttr("style");

}

function f_RemoverDominio() {
	if (dominios > 0) {
		vet_dominio.splice(-1, 1);
		dominios--;

		$('#dominioAdicionado').html(function(_, html) {
			return html.split(/<br\s*\/?>/i).slice(0, -1).join('<br>')
		});
		if (dominios == 0) {
			$("#buttonRemoverDominio").attr("style", 'display:none');

		}
	}
	f_LimpaDominio();

}

function f_LimpaDominio(){
	
	dominioAdicionado = "";
	
}


function f_AddRelacao(){
	relacoes++;

	var str = $('#s_Relacoes').val().replace(/\s/gi, '');
	vet_relacoes.push(str.replace(',',';'));
	
	relacaoAdicionada = $('#s_Relacoes').val().replace(/\s/gi, '');

	$('#relacoesAdicionadas').append(
			"<br/>" + relacoes + ": " + relacaoAdicionada);
	$('#s_Relacoes').val("");
	$("#buttonRemoverRelacao").removeAttr("style");

}

function f_RemoverRelacao(){
	if (relacoes > 0) {
		vet_relacoes.splice(-1, 1);
		relacoes--;

		$('#relacoesAdicionadas').html(function(_, html) {
			return html.split(/<br\s*\/?>/i).slice(0, -1).join('<br>')
		});
		if (relacoes == 0) {
			$("#buttonRemoverRelacao").attr("style", 'display:none');

		}
	}
	f_LimpaRelacao();
}

function f_LimpaRelacao(){
	
	relacaoAdicionada = "";
	
}


function f_LimpaSemantica() {
	$("#s_divFormulas").empty();
	relacoes = 0;
	dominio = 0;
	vet_dominio = [];
	vet_relacoes=[];
	f_LimpaRelacao();
	f_LimpaDominio();

}