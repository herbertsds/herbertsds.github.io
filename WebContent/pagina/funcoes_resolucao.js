var negadaIndice;
var vet_Entrada = [];
var selecionadas = 0;
var linhasGab = 0;
var idPergNegada;
var camposMarcados;
var erro = 0;
var vet_verificar = [];
var verificar = 0;
function f_Transformar() {

	// VERIFICAR OBRIGATORIEDADE DA SEQUENCIA

	switch ($('#btn_TransformarRegra').text()) {

	case 'Negar Pergunta':
		f_CkSelecionados();
		if (selecionadas != 1 || camposMarcados[0] != pergunta) {
			alert("Atenção!\nSelecione apenas a Pergunta para ser negada.");
		} else {

			// NEGAR A PERGUNTA
			f_Negar();
		}
		break;

	case 'Passar para FNC':

		if (perguntaNegada == false) {
			alert("Atenção! Deve-se negar a pergunta como primeiro passo!");

		} else {

			f_CkSelecionados();
			if (selecionadas == 0) {
				alert("Selecione pelo menos uma fórmula!");

			} else {
				f_FNC();

			}
		}

		break;

	default:
		break;
	}
}

// abrir a formula para fnc
function f_FNC() {
	selecionadas = 0;

	vet_Entrada = [];
	camposMarcados = new Array();

	$("input[type=checkbox][name='ck_Formulas']:checked").each(function() {
		camposMarcados.push($(this).val());
		$(this).prop("disabled", true);
		$(this).prop("checked", false);

		selecionadas++;
	});

	vet_Entrada[0] = "FNC";
	vet_Entrada[1] = selecionadas;
	vet_Entrada[2] = camposMarcados;

	var myData = {
		'operacao' : vet_Entrada[0],
		'qtd_formulasSelecionadas' : vet_Entrada[1],
		'formulas' : vet_Entrada[2]

	};
	console.log('envio FNC');
	console.log(myData);
	console.log("-------");
	$
			.ajax({

				url : urlWebService+'api/resolucao/stepByStep',
				type : 'GET',
				callback : '?',
				data : myData,
				datatype : 'application/json',

				success : function(retorno) {
					console.log('retorno:');
					console.log(retorno);
					console.log("-------");

					for (var i = 0; i < selecionadas; i++) {
						regras--;
						cont++;
						numLinha++;
						linhasGab++;
						$('#r_divNovasFormulas')
								.append(
										"<input disabled type='checkbox' class='form-check-input' data-color = 'purple' name='ck_novasFormulas' id='"
												+ cont
												+ "' value='"
												+ retorno[i]
												+ "'> "
												+ numLinha
												+ ": " + retorno[i] + "</br>");

						vet_verificar[verificar] = retorno[i];
						verificar++;
						vet_regras[cont] = retorno[i];
						console.log(vet_verificar);
					}

					formulaId = "";
					if (regras == 0) {

						$('#btn_Verificar').show();
						$('#btn_SepararE').show();
						$('#btn_SepararOU').show();
						$('#btn_TransformarRegra').hide();
						$('#btn_PassarNot').show();
						$('#btn_Notnot').show();
						$("#r_divFormulas").unbind();

						$('#r_passo2').append(" &#10004;");
						$("#r_divNovasFormulas :checkbox").prop("disabled",
								false);

					}

				},

				error : function() {
					console.log('ERRO: Função f_FNC!');
				},
			});

}

function f_Negar() {
	vet_Entrada = [];
	vet_Entrada[0] = "negPergunta";
	vet_Entrada[1] = exercicioBuscado.length;

	vet_Entrada[2] = exercicioBuscado;

	var myData = {
		'operacao' : vet_Entrada[0],
		'qtd_formulasSelecionadas' : vet_Entrada[1],
		'formulas' : vet_Entrada[2]

	};
	console.log('envio negar');
	console.log(myData);
	console.log("-------");
	$
			.ajax({

				url : urlWebService+'api/resolucao/stepByStep',
				type : 'GET',
				callback : '?',
				data : myData,
				datatype : 'application/json',

				success : function(retorno) {
					console.log('retorno:');
					console.log(retorno);
					console.log("-------");

					perguntaNegada = retorno[retorno.length - 1];
					numLinha++;
					linhasGab++;
					idPergNegada = cont;
					$('#r_divFormulas').append(
							"<input  type='checkbox' class='form-check-input'  name='ck_Formulas' id='"
									+ idPergNegada + "' value='"
									+ perguntaNegada + "'>" + numLinha + ": "
									+ perguntaNegada
									+ " # pergunta negada </input></br>");
					$('#r_divNovasFormulas')
							.append(
									"<article> --------------------------------------------------------- </article>");

					$("#finalVetor").prop("disabled", true);
					$("#finalVetor").prop("checked", false);

					$('#r_passo1').append(" &#10004;");

					formulaId = "";
					vet_regras[cont] = retorno;
					negadaIndice == cont;
					regras++;
					perguntaNegada = true;

					$('#btn_TransformarRegra').text("Passar para FNC");

				},

				error : function(erro) {
					console.log('ERRO: função  f_Negar!');
					return 1;
				},
			});

}

// bater duas fórmulas diferentes para gerar uma nova
function f_PassarNotPraDentro() {
	vet_Entrada = [];
	selecionadas = 0;
	camposMarcados = new Array();
	$("input[type=checkbox][name='ck_novasFormulas']:checked").each(function() {
		camposMarcados.push($(this).val());
		selecionadas++;
	});

	if (selecionadas == 0) {
		alert("Número inválido de fórmulas selecionadas!");
	}

	else {
		vet_Entrada[0] = "PassarNotParaDentro";
		vet_Entrada[1] = selecionadas;
		vet_Entrada[2] = camposMarcados;

		// mostra a saída
		console.log("Selecionados:" + camposMarcados);
		var myData = {
			'operacao' : vet_Entrada[0],
			'qtd_formulasSelecionadas' : selecionadas,
			'formulas' : vet_Entrada[2]

		};
		$
				.ajax({

					url : urlWebService+'api/resolucao/stepByStep',
					type : 'GET',
					callback : '?',
					data : myData,
					datatype : 'application/json',

					success : function(retorno) {
						console.log("retorno:" + retorno);
						if (retorno[0].length == 0) {
							console.log(vet_regras.indexOf(retorno[0][i]));
							var counts = [];
							for (j = 0; j < vet_regras.length; j++) {
								if (vet_regras[j] === retorno[0][i]) {
									counts.push(j);

								}
							}
							console.log(counts);
							alert("Formula " + retorno[0][i]
									+ " não pode ser separada!");
							$('input[id=' + counts[counts.length - 1] + ']')
									.prop("disabled", false);
							$('input[id=' + counts[counts.length - 1] + ']')
									.prop("checked", false);
						}

						else {
							for (var i = 0; i < retorno[0].length; i++) {
								if (camposMarcados.indexOf(retorno[0][i]) < 0) {
									cont++;
									numLinha++;
									linhasGab++;
									$('#r_divNovasFormulas')
											.append(
													"<input  type='checkbox' class='form-check-input' data-color = 'purple' name='ck_novasFormulas' id='"
															+ cont
															+ "' value='"
															+ retorno[0][i]
															+ "'> "
															+ numLinha
															+ ": "
															+ retorno[0][i]
															+ "</br>");
									vet_regras[cont] = retorno[0][i];
									vet_verificar[verificar] = retorno[0][i];
									verificar++;

								} else {
									// reabilitar o que repete
									var counts = [];
									for (j = 0; j < vet_regras.length; j++) {
										if (vet_regras[j] === retorno[0][i]) {
											counts.push(j);

										}
									}
									alert("Formula " + retorno[0][i]
											+ " não pode ser separada!");
									$(
											'input[id='
													+ counts[counts.length - 1]
													+ ']').prop("disabled",
											false);
									$(
											'input[id='
													+ counts[counts.length - 1]
													+ ']').prop("checked",
											false);
								}
							}
						}
					},

					error : function() {
						console.log('ERRO: função  f_PassarNotPraDentro!');
						return 1;
					},
				});
	}
}

function f_Notnot() {
	vet_Entrada = [];
	selecionadas = 0;
	camposMarcados = new Array();
	$("input[type=checkbox][name='ck_novasFormulas']:checked").each(function() {
		camposMarcados.push($(this).val());
		selecionadas++;
	});

	if (selecionadas == 0) {
		alert("Número inválido de fórmulas selecionadas!");
	}

	else {
		vet_Entrada[0] = "notnot";
		vet_Entrada[1] = selecionadas;
		vet_Entrada[2] = camposMarcados;

		// mostra a saída
		console.log("Selecionados:" + camposMarcados);
		var myData = {
			'operacao' : vet_Entrada[0],
			'qtd_formulasSelecionadas' : selecionadas,
			'formulas' : vet_Entrada[2]

		};
		$
				.ajax({

					url : urlWebService+'api/resolucao/stepByStep',
					type : 'GET',
					callback : '?',
					data : myData,
					datatype : 'application/json',

					success : function(retorno) {
						console.log("retorno:" + retorno);
						for (var i = 0; i < retorno[0].length; i++) {
							if (camposMarcados.indexOf(retorno[0][i]) < 0) {
								cont++;
								numLinha++;
								linhasGab++;
								$('#r_divNovasFormulas')
										.append(
												"<input  type='checkbox' class='form-check-input' data-color = 'purple' name='ck_novasFormulas' id='"
														+ cont
														+ "' value='"
														+ retorno[0][i]
														+ "'> "
														+ numLinha
														+ ": "
														+ retorno[0][i]
														+ "</br>");
								vet_regras[cont] = retorno[0][i];
								vet_verificar[verificar] = retorno[0][i];
								verificar++;

							} else {
								// reabilitar o que repete
								var counts = [];
								for (j = 0; j < vet_regras.length; j++) {
									if (vet_regras[j] === retorno[0][i]) {
										counts.push(j);

									}
								}
								alert("Formula " + retorno[0][i]
										+ " não pode ser separada!");
								$('input[id=' + counts[counts.length - 1] + ']')
										.prop("disabled", false);
								$('input[id=' + counts[counts.length - 1] + ']')
										.prop("checked", false);
							}
						}
					},

					error : function() {
						console.log('ERRO: função  f_Notnot!');
						return 1;
					},
				});
	}
}

function f_Verificar() {
	vet_Entrada[0] = "SeparaE";
	vet_Entrada[1] = verificar;
	vet_Entrada[2] = vet_verificar;

	var myData = {
		'operacao' : vet_Entrada[0],
		'qtd_formulasSelecionadas' : vet_Entrada[1],
		'formulas' : vet_Entrada[2]

	};
	console.log('envio Verificar:');
	console.log(myData);
	console.log("-------");
	$
			.ajax({

				url : urlWebService+'api/resolucao/stepByStep',
				type : 'GET',
				callback : '?',
				data : myData,
				datatype : 'application/json',

				success : function(retorno) {
					if (retorno[1].toUpperCase() == 'NÃO FECHADO') {
						alert("Exercício ainda não resolvido!");
					} else {
						console.log(retorno);
						cont++;
						numLinha++;
						$('#r_divNovasFormulas')
								.append(
										"<p id='"
												+ cont
												+ "'>"
												+ numLinha
												+ "<b>: &#10066; Contradição Encontrada!</b> </p>");
						$('#r_divNovasFormulas').append(
								"<article><b> Fim do Exercício</b></article>");
						$('#btn_TransformarRegra').hide();
						$('#btn_ProximoPasso').hide();
						$('#btn_ConfrontarRegra').hide();
						$('#btn_SepararE').hide();
						$('#btn_SepararOU').hide();
						$("#r_divFormulas").unbind();
						$('#btn_Verificar').hide();
						$('#btn_PassarNot').hide();
						$('#btn_Notnot').hide();

						$("input[type=checkbox]").prop("disabled", true);
						$("input[type=checkbox]").prop("checked", true);

						$('#alertResolucao').fadeOut();
						console.log("resolvido!");

						$('#r_passo3').append(" &#10004;");

					}

				},
				error : function() {
					console.log('ERRO: Função f_Verificar!');
				},
			});

}
function f_SepararE() {
	console.log('envio separaE');
	selecionadas = 0;
	vet_Entrada = [];
	camposMarcados = new Array();
	$("input[type=checkbox][name='ck_novasFormulas']:checked").each(function() {
		camposMarcados.push($(this).val());
		selecionadas++;

	});

	if (selecionadas == 0) {
		alert("Número inválido de fórmulas para separação do E!");
	}

	else {
		// mostra a saída
		vet_Entrada[0] = "SeparaE";
		vet_Entrada[1] = selecionadas;
		vet_Entrada[2] = camposMarcados;

		var myData = {
			'operacao' : vet_Entrada[0],
			'qtd_formulasSelecionadas' : vet_Entrada[1],
			'formulas' : vet_Entrada[2]

		};

		console.log(myData);
		console.log("-------");
		$
				.ajax({

					url : urlWebService+'api/resolucao/stepByStep',
					type : 'GET',
					callback : '?',
					data : myData,
					datatype : 'application/json',

					success : function(retorno) {
						console.log('retorno:');
						console.log(retorno);
						console.log("-------");
						$(
								"input[type=checkbox][name='ck_novasFormulas']:checked")
								.each(function() {

									$(this).prop("disabled", true);
									$(this).prop("checked", false);
								});
						if (retorno[0].length == 0) {

							alert("Formula " + retorno[0][i]
									+ " não pode ser separada!");
							$(
									"input[type=checkbox][name='ck_novasFormulas']:checked")
									.each(function() {

										$(this).prop("disabled", false);
										$(this).prop("checked", false);
									});
						} else {
							for (var i = 0; i < retorno[0].length; i++) {
								if (camposMarcados.indexOf(retorno[0][i]) < 0) {
									cont++;
									numLinha++;
									linhasGab++;
									$('#r_divNovasFormulas')
											.append(
													"<input  type='checkbox' class='form-check-input' data-color = 'purple' name='ck_novasFormulas' id='"
															+ cont
															+ "' value='"
															+ retorno[0][i]
															+ "'> "
															+ numLinha
															+ ": "
															+ retorno[0][i]
															+ "</br>");
									vet_regras[cont] = retorno[0][i];
									vet_verificar[verificar] = retorno[0][i];
									verificar++;

								} else {
									// reabilitar o que repete
									var counts = [];
									for (j = 0; j < vet_regras.length; j++) {
										if (vet_regras[j] === retorno[0][i]) {
											counts.push(j);

										}
									}
									alert("Formula " + retorno[0][i]
											+ " não pode ser separada!");
									$(
											'input[id='
													+ counts[counts.length - 1]
													+ ']').prop("disabled",
											false);
									$(
											'input[id='
													+ counts[counts.length - 1]
													+ ']').prop("checked",
											false);
								}

							}

						}

					},

					error : function() {
						console.log('ERRO: Função f_SeparaE!');
					},
				});
	}
}

function f_SepararOU() {

	selecionadas = 0;

	vet_Entrada = [];
	camposMarcados = new Array();
	$("input[type=checkbox][name='ck_novasFormulas']:checked").each(function() {
		camposMarcados.push($(this).val());
		selecionadas = selecionadas + 1;

	});

	if (camposMarcados.length >= 2) {

		// mostra a saída
		console.log("Selecionados:" + camposMarcados);
		vet_Entrada[0] = "SeparaOU";
		vet_Entrada[1] = selecionadas;
		vet_Entrada[2] = camposMarcados;

		var myData = {
			'operacao' : vet_Entrada[0],
			'qtd_formulasSelecionadas' : vet_Entrada[1],
			'formulas' : vet_Entrada[2]

		};
		console.log('envio SeparaOu: ---');
		console.log(myData);
		console.log('------------------');
		$
				.ajax({

					url : urlWebService+'api/resolucao/stepByStep',
					type : 'GET',
					callback : '?',
					data : myData,
					datatype : 'application/json',

					success : function(retorno) {
						console.log('retorno:');
						console.log(retorno);
						console.log("-------");
						$(
								"input[type=checkbox][name='ck_novasFormulas']:checked")
								.each(function() {

									if ($(this).val().length > 4) {
										$(this).prop("disabled", true);
										$(this).prop("checked", false);
									} else {
										$(this).prop("disabled", false);
										$(this).prop("checked", false);

									}
								});
						for (var i = 0; i < retorno[0].length; i++) {

							if (camposMarcados.indexOf(retorno[0][i]) < 0) {
								cont++;
								numLinha++;
								linhasGab++;
								$('#r_divNovasFormulas')
										.append(
												"<input  type='checkbox' class='form-check-input' data-color = 'purple' name='ck_novasFormulas' id='"
														+ cont
														+ "' value='"
														+ retorno[0][i]
														+ "'> "
														+ numLinha
														+ ": "
														+ retorno[0][i]
														+ "</br>");

								vet_regras[cont] = retorno[0][i];
								vet_verificar[verificar] = retorno[0][i];
								verificar++;
							} else {
								// reabilitar o que repete
								var counts = [];
								for (j = 0; j < vet_regras.length; j++) {
									if (vet_regras[j] === retorno[0][i]) {
										counts.push(j);

									}
								}
								alert("Formula " + retorno[0][i]
										+ " não pode ser separada!");
								$('input[id=' + counts[counts.length - 1] + ']')
										.prop("disabled", false);
								$('input[id=' + counts[counts.length - 1] + ']')
										.prop("checked", false);
							}

						}
						if (retorno[1].toUpperCase() == 'NÃO FECHADO') {
						} else {
							console.log("FIM DO EXERCICIO!!");
							cont++;
							numLinha++;
							$('#r_divNovasFormulas')
									.append(
											"<p id='"
													+ cont
													+ "'>"
													+ numLinha
													+ "<b>: &#10066; Contradição Encontrada!</b> </p>");
							$('#r_divNovasFormulas')
									.append(
											"<article><b> Fim do Exercício</b></article>");
							$('#btn_TransformarRegra').hide();
							$('#btn_ProximoPasso').hide();
							$('#btn_ConfrontarRegra').hide();
							$('#btn_SepararE').hide();
							$('#btn_SepararOU').hide();
							$("#r_divFormulas").unbind();
							$('#btn_Verificar').hide();
							$('#btn_PassarNot').hide();
							$('#btn_Notnot').hide();

							$("input[type=checkbox]").prop("disabled", true);
							$("input[type=checkbox]").prop("checked", true);

							$('#alertResolucao').fadeOut();
							console.log("resolvido!");

							$('#r_passo3').append(" &#10004;");
						}

					},

					error : function() {
						alert("As fórmulas não puderam ser separadas!");

						console.log('ERRO: função f_SeparaOU!');
					},
				});
	} else {
		selecionadas = 0;
		vet_Entrada = [];
		alert("Selecione duas fórmulas para separação do OU!");
	}
}

function f_GabResolucao() {
	if (manual == false) {
		var myData = {
			'exercicio' : parseInt(numExercicio)
		};
		console.log(' enviando : ' + parseInt(numExercicio));
	} else {
		var myData = {
			'formulas' : exercicioBuscado
		};
		console.log(' enviando : ' + exercicioBuscado);
	}
	$
			.ajax({

				url : urlWebService+'api/resolucao/fullSteps',
				type : 'GET',
				callback : '?',
				data : myData,
				datatype : 'application/json',
				Accept: "*/*",

				success : function(retorno) {

					$('#r_divNovasFormulas').text("");
					$("p[id='" + idPergNegada + "']").text("");
					$("#r_divFormulas :checkbox").prop("disabled", true);
					$("#r_divFormulas :checkbox").prop("checked", true);

					gabaritoBuscado = JSON.parse(retorno);
					limiteGabarito = gabaritoBuscado.length;
					$('#r_divNovasFormulas')
							.append(
									"<article> --------------------------------------------------------- </article>");
					numLinha = numLinha - linhasGab;

					// traduzir para o usuário o retorno
					// apresentar o gabarito na tela
					console.log(gabaritoBuscado);
					for (var data = 0; data < limiteGabarito; data++) {
						switch (gabaritoBuscado[data]) {
						case "Negação da pergunta":
							cont++;
							numLinha++;
							$('#r_divNovasFormulas')
									.append(
											"<p id='"
													+ cont
													+ "' data-html='true'  data-trigger='click' data-toggle='popover' data-placement='right' title='Negação da pergunta' data-content='Fórmula usada:<ul><li>"
													+ gabaritoBuscado[data + 2]
													+ "</li></ul>'>" + numLinha
													+ ": "
													+ gabaritoBuscado[data + 1]
													+ "</p>");

							data = data + 2;

							break;

						case "Fórmula em FNC":
							cont++;
							numLinha++;
							$('#r_divNovasFormulas')
									.append(
											"<p id='"
													+ cont
													+ "' data-html='true'  data-trigger='click' data-toggle='popover' data-placement='right' title='Fórmula em FNC' data-content='Fórmulas usadas:\n<ul><li>"
													+ gabaritoBuscado[data + 2]
													+ "</li></ul>'>" + numLinha
													+ ": "
													+ gabaritoBuscado[data + 1]
													+ "</p>");
							data = data + 2;
							break;

						case "Separação do E":
							cont++;
							numLinha++;
							$('#r_divNovasFormulas')
									.append(
											"<p id='"
													+ cont
													+ "' data-html='true'  data-trigger='click' data-toggle='popover' data-placement='right' title='Separação do E' data-content='Fórmulas usadas:\n<ul><li>"
													+ gabaritoBuscado[data + 3]
													+ "</li></ul>'>" + numLinha
													+ ": "
													+ gabaritoBuscado[data + 1]
													+ "</p>");
							cont++;
							numLinha++;
							$('#r_divNovasFormulas')
									.append(
											"<p id='"
													+ cont
													+ "' data-html='true'  data-trigger='click' data-toggle='popover' data-placement='right' title='Separação do E' data-content='Fórmulas usadas:\n<ul><li>"
													+ gabaritoBuscado[data + 3]
													+ "</li></ul>'>" + numLinha
													+ ": "
													+ gabaritoBuscado[data + 2]
													+ "</p>");
							data = data + 3;

							break;

						case "Separação do Ou":
							cont++;
							numLinha++;
							$('#r_divNovasFormulas')
									.append(
											"<p id='"
													+ cont
													+ "' data-html='true'  data-trigger='click' data-toggle='popover' data-placement='right' title='Separação do OU' data-content='Fórmulas usadas:\n<ul><li>"
													+ gabaritoBuscado[data + 2]
													+ "</li><li>"
													+ gabaritoBuscado[data + 3]
													+ "</li></ul>'>" + numLinha
													+ ": "
													+ gabaritoBuscado[data + 1]
													+ "</p>");
							data = data + 3;

							break;

						case "Remove os notnot":
							cont++;
							numLinha++;
							$('#r_divNovasFormulas')
									.append(
											"<p id='"
													+ cont
													+ "' data-html='true'  data-trigger='click' data-toggle='popover' data-placement='right' title='Remove os notnot' data-content='Fórmulas usadas:\n<ul><li>"
													+ gabaritoBuscado[data + 2]
													+ "</li></ul>'>" + numLinha
													+ ": "
													+ gabaritoBuscado[data + 1]
													+ "</p>");
							data = data + 2;

							break;

						case "Passando Not Para Dentro":
							cont++;
							numLinha++;
							$('#r_divNovasFormulas')
									.append(
											"<p id='"
													+ cont
													+ "' data-html='true'  data-trigger='click' data-toggle='popover' data-placement='right' title='Passando Not Pra Dentro' data-content='Fórmulas usadas:\n<ul><li>"
													+ gabaritoBuscado[data + 2]
													+ "</li></ul>'>" + numLinha
													+ ": "
													+ gabaritoBuscado[data + 1]
													+ "</p>");
							data = data + 2;

							break;

						case "Fechado":
							cont++;
							numLinha++;
							$('#r_divNovasFormulas')
									.append(
											"<p id='"
													+ cont
													+ "'>"
													+ numLinha
													+ "<b>: &#10066; Contradição Encontrada!</b> </p>");
							$('#r_divNovasFormulas')
									.append(
											"<article><b> Fim do Exercício</b></article>");
							$('#btn_TransformarRegra').hide();
							$('#btn_ProximoPasso').hide();
							$('#btn_ConfrontarRegra').hide();
							$('#btn_SepararE').hide();
							$('#btn_SepararOU').hide();
							$("#r_divFormulas").unbind();
							$('#btn_PassarNot').hide();
							$('#btn_Notnot').hide();
							$('span').css({
								'color' : 'black'
							});
							$('p').css({
								'color' : 'black'
							});
							$('#alertResolucao').fadeOut();
							console.log("resolvido!");

							$('#r_passo3').append(" &#10004;");

							break;
						default:
							console.log("fim do gabarito");

							break;

						}
					}

					// DESTAQUE MOUSE SOBRE
					$('#r_divNovasFormulas').on(
							'mouseenter',
							'p',
							function(e) {

								$('[data-toggle="popover"]').popover();
								$(e.target).css({
									'cursor' : 'pointer',

									'font-weight' : 900
								});
								$('#r_divNovasFormulas').on(
										'mouseout',
										'p',
										function(e) {
											$('[data-toggle="popover"]')
													.popover('hide');

											$('p').css({
												'font-weight' : 100,
											});
											$(e.target).css({
												'cursor' : 'text'
											});
											;
										});

							});

				},
				error : function(erro) {
					console.log('ERRO: Gabarito não encontrado!');
					console.log(urlWebService);
				},
			});

}

function f_CkSelecionados() {
	camposMarcados = new Array();
	selecionadas = 0;
	$("input[type=checkbox][name='ck_Formulas']:checked").each(function() {
		camposMarcados.push($(this).val());
		formulaId = $(this).attr("id");

		selecionadas++;
	});

}

// ######################################################################################################

function f_LimpaResolucao() {
	negadaIndice = "";
	vet_Entrada = [];
	selecionadas = 0;
	linhasGab = 0;
	verificar = 0;
	idPergNegada = "";
	camposMarcados = "";
	erro = 0;
	vet_verificar = [];
	$("#r_divFormulas").empty();
	$('#r_divNovasFormulas').empty();
	$('#btn_Verificar').hide();
	$('#btn_SepararE').hide();
	$('#btn_SepararOU').hide();
	$('#btn_PassarNot').hide();
	$('#btn_Notnot').hide();
	$('#btn_TransformarRegra').text('Negar Pergunta');
	$('#btn_TransformarRegra').show();
	$('#r_passo1').text('- Negar a Pergunta');
	$('#r_passo2').text(
			'- Passar todas as fórmulas e a pergunta negada para FNC');
	$('#r_passo3')
			.text(
					'- Desenvolver o exercício até encontrar uma contradição ou não tiver mais operações disponíveis. ');

}
