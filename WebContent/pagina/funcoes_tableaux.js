function f_GabTableaux(exercicio) {
	var myData = {
		'exercicio' : exercicio
	}; // parseInt(numExercicio)
	console.log(myData);

	$.ajax({

				url : urlWebService+'api/tableaux',
				type : 'GET',
				callback : '?',
				data : myData,
				datatype : 'application/json',
				success : function(resposta) {
                    obj = resposta[0];
					// obj = JSON.parse(obj);
					console.log(resposta);
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
									'<div  class="form-check"  id="s_divNovasFormulas"><div id="s_content"><div id="s_main"><ul id="s_organisation"></ul></div></div></div>');
					$('#iframe').contents().find("#s_organisation").append(obj);
					$('#iframe').contents().find("#s_organisation").orgChart({
						container : $('#iframe').contents().find("#s_main")
					});

                    
                    var cell1 = document.querySelectorAll('.verdadeiro');
                    console.log(cell1);
                    var cell2 = document.querySelectorAll('.falso');
                    for(var i=0;i<cell1.length;i++){
                        cell[i].addEventListener('mouseover',function() {
                            exibirDetalhes(cell[i]);
                        });
                    }
                    for(i=0;i<cell2.length;i++){
                        cell[i].addEventListener('mouseover',function() {
                            exibirDetalhes(cell[i]);
                        });
                    }

				},
				error : function(retorno2) {

					console.log(retorno2);
				},
			});

}
function f_abreGabTab() {
	var win = window.open('./WebContent/pagina/gabTableaux.html?exercicioBuscado=' + numExercicio);

}
function f_LimpaTableaux() {
	$("#t_divFormulas").empty();

}

function exibirDetalhes(celula){
    console.log(celula);
}