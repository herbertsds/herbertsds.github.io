<?php 
//Aqui será um "banco de dados" com todos os exercícios de todas as listas
//Como muitos métodos utilizam os mesmos exercícios, fica fácil chamá-los a partir daqui

//O formato será um array padronizado, qualquer método pode chamar a questão diretamente como entrada

//-------------------------------------------------ENTRADAS--------------------------------------------------------------------
//
//A entrada inicial vai ser um array de formulas do tipo STRING, a sequência deve ser
//[banco_de_dados,pergunta], permitindo que eu saiba que a pergunta é a última facilita
//na hora de inicializar o processamento do tableaux

//Cada fórmula deve seguir o formato (Átomo conectivo Átomo), exemplos
//(Aimplica(BouC)), not((AeB)ou(CeD)),  (AouB), ((AeB)implica(not(CouD))

//------------------------------------------------------------------------------------------------------------------------------

//Lista de DN sem Negação
$DNSquestao1 = array ("(AouB)","(Bimplica(notnot(C)))","((AimplicaC)implicaC)");
$DNSquestao2 = array ("(AimplicaB)","(BimplicaC)","(Aimplica(BeC))");
$DNSquestao3 = array ("(AimplicaB)","(BimplicaC)","(A)","(C)");
$DNSquestao4 = array ("(AimplicaB)","(BimplicaC)","(AimplicaC)");
$DNSquestao5 = array ("((PouQ)implicaR)","(Pimplica(QimplicaR))");
$DNSquestao6 = array ("((PeQ)implicaR)","(Pimplica(QimplicaR))");
$DNSquestao7 = array ("(Pimplica(QimplicaR))","((PeQ)implicaR)");
$DNSquestao8 = array ("(Bimplica(CeA))","(AimplicaD)","(BeC)","(D)");
$DNSquestao9 = array ("((AouB)implicaC)","(Cimplica(DeE))","(A)","(EouF)");
$DNSquestao10 = array ("((AouB)implicaC)","(DimplicaA)","(DimplicaC)");
$DNSquestao11 = array ("((AouB)implicaC)","(CimplicaD)","((AeB)implica(DeC))");
$DNSquestao12 = array ("(AouB)","((AouC)implicaD)","(Bimplica(DeC))","(D)");
$DNSquestao13 = array ("(Aimplica(BeC))","((BimplicaC)implicaD)","(Aimplica(BeD))");
$DNSquestao14 = array ("(Aimplica(BouC))","(BimplicaD)","(Fimplica(DeE))","(AouF)","((CeA)implicaD)","(D)");
$DNSquestao15 = array ("(Aimplica(BeC))","((DouF)implicaA)","(Dimplica(BouF))");
$DNSquestao16 = array ("((AeB)implicaC)","((CouD)implicaE)","((AeB)implica(EouF))");
$DNSquestao17 = array ("(AouB)","(D)","(BimplicaA)","((AeD)implicaC)","((AeD)implicaE)","(CimplicaE)","(E)");
$DNSquestao18 = array ("(BeC)","((AeB)implica(CimplicaD))","(Aimplica(DouE))");
$DNSquestao19 = array ("(BimplicaA)","(CimplicaB)","(BouC)","((CimplicaA)implicaE)","((DeB)implicaE)","(Eimplica(FeG))","(DimplicaF)");
$DNSquestao20 = array ("(B)","((RouS)implicaA)","(RouS)","((AeR)implicaC)","((BeS)implicaC)","(C)");
$DNSquestao21 = array ("(B)","((AeB)implica(CouD))","((AeC)implicaE)","(Dimplica(EeF))","(AimplicaE)");

//Lista de DN com Negação
$DNNquestao1 = array ("(AimplicaB)","(BimplicaC)","(A)","(C)");
$DNNquestao2 = array ("(Pimplica(QeR))","((PeQ)implicaR)");
$DNNquestao3 = array ("(PimplicaQ)","not(Q)","not(P)");
$DNNquestao4 = array ("(AimplicaB)","(BimplicaC)","(AimplicaC)");
$DNNquestao5 = array ("((PouQ)implicaR)","(Pimplica(QimplicaR))"); //testar depois
$DNNquestao6 = array ("(Bimplica(CeA))","(AimplicaD)","(BeC)","(D)");
$DNNquestao7 = array ("((AouB)implicaC)","(DimplicaA)","(DimplicaC)");
$DNNquestao8 = array ("(AimplicaB)","(BimplicaC)","(C)","(Aimplica(BeC))");
$DNNquestao9 = array ("(PouQ)","(PimplicaR)","(QimplicaR)","(R)");
$DNNquestao10 = array ("(Aimplica(BeC))","((DeF)implicaA)","(DeF)","(BeF)");
$DNNquestao11 = array ("(AouB)","(Cimplica(not(A)))","(CeD)","(BouA)");
$DNNquestao12 = array ("((AouB)implicaC)","(Cimplica(DeF))","(A)","(FouE)");
$DNNquestao13 = array ("((AeB)implicaC)","((CouD)implicaE)","((AeB)implica(EouF))");
$DNNquestao14 = array ("(AeB)","not(C)","((AeB)implica(CouD))","(DouE)");
$DNNquestao15 = array ("(D)","(I)","((DeA)implica(not(P)))","(IimplicaM)","(MimplicaA)","not(P)");
$DNNquestao16 = array ("((AouB)implicaC)","(CimplicaD)","((AeB)implica(CeD))");
$DNNquestao17 = array ("((not(P))implicaQ)","(PouQ)");
$DNNquestao18 = array ("(AouB)","((AouC)implicaD)","(Bimplica(DeC))","(D)");
$DNNquestao19 = array ("((not(AeB))implica((not(A))ou(not(B))))");
$DNNquestao20 = array ("not(Pe(not(P)))");
$DNNquestao21 = array ("(not(PimplicaQ)implicaP)");
$DNNquestao22 = array ("(not(PimplicaQ)implica(not(Q)))");
$DNNquestao23 = array ("((Pimplica(not(P)))implica(not(P)))");
$DNNquestao24 = array ("((not(P)implicaP)implicaP)");
$DNNquestao25 = array ("((PeQ)implica(not((not(P))ou(not(Q)))))");
$DNNquestao26 = array ("(Aimplica(not(B)implica(not(A)implica(B))))");
$DNNquestao27 = array ("(Bou(BimplicaC))");
$DNNquestao28 = array ("((not(A)e(not(B)))implica(not(AouB)))");
$DNNquestao29 = array ("(Aimplica(BeC))","((BimplicaC)implicaD)","(Aimplica(BeD))");
$DNNquestao30 = array ("(Aimplica(BouC))","(BimplicaD)","(Fimplica(DeE))","(AouF)","((CimplicaD)implicaD)");
$DNNquestao31 = array ("((AouB)ouC)","(Aou(BouC))");
$DNNquestao32 = array ("(((AimplicaB)implicaA)implicaA)");
$DNNquestao33 = array ("(AouB)","(not(B)eD)","((AeD)ouC)","((AeD)implicaE)","(CimplicaE)","(E)");
$DNNquestao34 = array ("(not(A)ouB)","not(Be(not(C)))","(CimplicaD)","(not(A)ouD)");
$DNNquestao35 = array ("(B)","((RouS)implicaA)","(RouS)","((AeR)implicaC)","((BeS)implicaC)","(C)");
$DNNquestao36 = array ("(Aimplica(BouC))","(Bimplica(DeF))","((CeA)implicaD)","(AimplicaD)");
$DNNquestao37 = array ("((not(C))implica((not(A))e(not(B))))","((CouD)implicaE)","(B)","((not(E))implica(not(A)))");
$DNNquestao38 = array ("((AimplicaB)implicaB)","(AimplicaC)","(BimplicaC)","(C)");
$DNNquestao39 = array ("((CimplicaA)implicaB)", "(Cimplica(AeD))","((BeD)implica(EeF))","(FimplicaG)","(DimplicaG)");
$DNNquestao40 = array ("((PimplicaQ)implicaQ)","(QimplicaP)","(P)");
$DNNquestao41 = array ("(B)","((AeB)implica(CouD))","((CeA)implicaE)","(Dimplica(EeF))","(AimplicaE)");
$DNNquestao42 = array ("((PimplicaQ)implicaQ)","(QimplicaP)","(P)");
$DNNquestao43 = array ("(AeB)","((Cimplica(AouD))implicaE)","(EeB)");
$DNNquestao44 = "Questão insolúvel";
$DNNquestao45 = array ("((AimplicaB)implicaB)","((BimplicaA)implicaA)");
$DNNquestao46 = array ("(Aimplica(not(B)))","(BouC)","((AimplicaC)implica(not(C)))","((DeB)implicaE)","(Eimplica(FeG))","(DimplicaF)");
$DNNquestao47 = array ("(B)","(((AeB)e(not(A)))implicaD)","((CeA)implicaE)","(DimplicaE)","(DimplicaF)","(AimplicaE)");
$DNNquestao48 = array ("((not(P))implica(((PouQ)implicaQ)e(Qimplica(PouQ))))");
$DNNquestao49 = array ("(Pimplica(not(Q)))","(not(not(P)ou(not(Q)))ouR)","(Rimplica(not(AeB)ou(not(S))))","(Sou(not(CouD)))","(((not(A))ou(not(B)))implicaE)","(((not(C))e(not(D)))implicaE)","(E)");
$DNNquestao50 = array ("not(Aimplica(not(B)))","(CouD)","((CeA)implica(FouG))","(FimplicaH)","(((not(H))ou(not(I)))implica(not(G)))","(HimplicaK)","(DimplicaJ)","((JeB)implicaK)","(K)");

//array ("(paraTodox(P(x)))","not(xistx(not(P(x))))");

//Lista de DN de primeira ordem
$LPOquestao1 = array ("(xistx(F(x)))","(F(a))");
$LPOquestao2 = array ("not(xistx(F(x)))","not(F(a))");
$LPOquestao3 = array ("(paraTodox(F(x)))","(F(a))");
$LPOquestao4 = array ("(F(a))","(xistx(F(x)))");
$LPOquestao5 = array ("(paraTodox(F(x)))","(xistx(F(x)))");
$LPOquestao6 = array ("(paraTodox(not(F(x))))","not(paraTodox(F(x)))");
$LPOquestao7 = array ("(xistx(not(F(x))))","not(paraTodox(F(x)))");
$LPOquestao8 = array ("not(paraTodox(F(x)))","(xistx(not(F(x))))");
$LPOquestao9 = array ("not(xistx(F(x)))","(paraTodox(not(F(x))))");
$LPOquestao10 = array ("(paraTodox(not(F(x))))","not(xistx(F(x)))");
$LPOquestao11 = array ("(paraTodox(A(x)))","not(paraTodox(not(F(x))))");
$LPOquestao12 = array ("not(paraTodox(not(A(x))))","(xistx(A(x)))");
$LPOquestao13 = array ("(paraTodox(P(x)))","not(xistx(not(P(x))))");
$LPOquestao14 = array ("not(xistx(not(P(x))))","(paraTodox(P(x)))");
$LPOquestao15 = array ("(xistx(F(x)))","not(paraTodox(not(P(x))))");
$LPOquestao16 = array ("not(xistx(F(x)e(not(F(x)))))");
$LPOquestao17 = array ("((xistx(F(x)))ou(xistx(not(F(x)))))");
$LPOquestao18 = array ("((xistx(F(x)))ou(paraTodox(not(F(x)))))");
$LPOquestao19 = array ("(paraTodox(not(F(x)e(not(F(x))))))");
$LPOquestao20 = array ("(paraTodox((F(x)ou(not(F(x))))))");
$LPOquestao21 = array ("(paraTodox(A(x)eB(x)))","((paraTodox(A(x)))e(paraTodox(B(x))))");
$LPOquestao22 = array ("((paraTodox(A(x)))e(paraTodox(B(x))))","(paraTodox(A(x)eB(x)))");
$LPOquestao23 = array ("(paraTodox(A(x)ouB(x)))","((paraTodox(A(x)))ou(paraTodox(B(x))))");
$LPOquestao24 = array ("((paraTodox(A(x)))ou(paraTodox(B(x))))","(paraTodox(A(x)ouB(x)))");
$LPOquestao25 = array ("(xistx(A(x)eB(x)))","((xistx(A(x)))e(xistx(B(x))))");
$LPOquestao26 = array ("((xistx(A(x)))e(xistx(B(x))))","(xistx(A(x)eB(x)))");
$LPOquestao27 = array ("(xistx(A(x)ouB(x)))","((xistx(A(x)))ou(xistx(B(x))))");
$LPOquestao28 = array ("((xistx(A(x)))ou(xistx(B(x))))","(xistx(A(x)ouB(x)))");
$LPOquestao29 = array ("(paraTodox(A(x)implicaB(x)))","((paraTodox(A(x)))implica(paraTodox(B(x))))");
$LPOquestao30 = array ("((paraTodox(A(x)))implica(paraTodox(B(x))))","(paraTodox(A(x)implicaB(x)))");
$LPOquestao31 = array ("(paraTodox(paraTodoy(P(x,y))))","(paraTodoy(paraTodox(P(x,y))))");
$LPOquestao32 = array ("(xistx(xisty(L(x,y))))","(paraTodox(paraTodoy(not(L(x,y)))))");
$LPOquestao33 = array ("(xistx(F(x)))","(xistx(xisty(F(x)eF(y))))");
$LPOquestao34 = array ("(paraTodox(not(F(x))))","(paraTodox(F(x)implicaG(x)))");
$LPOquestao35 = array ("(paraTodox(not(F(x))))","(paraTodox(F(x)implica(not(G(x)))))");
$LPOquestao36 = array ("not(xistx(paraTodoy((L(x,y)implica(not(L(x,x))))e((not(L(x,x)))implica(L(x,y))))))"); //Se e somente se convertido
$LPOquestao37 = array ("(paraTodox((F(x)implicaR)e(RimplicaF(x))))","(R)","(F(a))");
$LPOquestao38 = array ("not(F(a))","not(paraTodox(F(x)eG(x)))");
$LPOquestao39 = array ("((xistx(F(x)))e(xistx(not(F(x)))))","(P)");
$LPOquestao40 = array ("(xistx((F(x))e(not(F(x)))))","(P)");
$LPOquestao41 = array ("(xistx(xisty(L(x,y))))","(xisty(xistx(L(x,y))))");
$LPOquestao42 = array ("not(xistx(F(x)))","(paraTodox(F(x)implicaP))");
$LPOquestao43 = array ("(paraTodox(paraTodoy(F(x,y))))","(paraTodox(F(x,x)))");
$LPOquestao44 = array ("(paraTodox((Q(y))implica(P(x))))","((Q(y))implica(paraTodox(P(x))))");
$LPOquestao45 = array ("((paraTodox(A(x)))e(paraTodox(B(x))))","(paraTodox(A(x)eB(x)))");
$LPOquestao46 = array ("(paraTodox(A(x)eB(x)))","((paraTodox(A(x)))e(paraTodox(B(x))))");
$LPOquestao47 = array ("(paraTodox(A(x)ouB(x)))","((paraTodox(A(x)))ou(paraTodox(B(x))))");
$LPOquestao48 = array ("((paraTodox(A(x)))ou(paraTodox(B(x))))","(paraTodox(A(x)ouB(x)))");
$LPOquestao49 = array ("(paraTodox(F(x)implicaG(x)))","((paraTodox(not(F(x))))implica(paraTodox(not(G(x)))))");
$LPOquestao50 = array ("((xistx(A(x)))e(xistx(B(x))))","(xistx(A(x)eB(x)))");
$LPOquestao51 = array ("(xistx(A(x)eB(x)))","((xistx(A(x)))e(xistx(B(x))))");
$LPOquestao52 = array ("(paraTodox(F(x)implicaG(x)))","not(F(a))","(G(a))");
$LPOquestao53 = array ("(paraTodox((not(F(x)))e(not(G(x)))))","not(F(a)eG(a))");
$LPOquestao54 = array ("(paraTodox(F(x)))","(F(a)e(F(b)e((F(c))eF(d))))");
$LPOquestao55 = array ("(paraTodox(F(x)implicaG(x)))","((paraTodox(not(G(x))))implica(paraTodox(not(F(x)))))");
$LPOquestao56 = array ("(paraTodox(F(x)implicaG(x)))","((xistx(F(x)))implica(xistx(G(x))))");
$LPOquestao57 = array ("not(xistx(F(x)eG(x)))","(paraTodox((not(F(x)))ou(not(G(x)))))");
$LPOquestao58 = array ("not(paraTodox(F(x)eG(x)))","(xistx((not(F(x)))ou(not(G(x)))))");
$LPOquestao59 = array ("(paraTodox(F(x)))","((paraTodox(G(x)))implica(paraTodox(F(x)eG(x))))");
$LPOquestao60 = array ("(paraTodox(paraTodoy(F(x,y)implica(not(F(y,x))))))","(paraTodox(not(F(x,x))))");
$LPOquestao61 = array ("(paraTodox(paraTodoy((L(x,y))implica(L(y,x)))))","(xistx(L(a,x)))","(xistx(L(x,a)))");
$LPOquestao62 = array ("(paraTodox(paraTodoy(paraTodoz(((L(x,y))e(L(y,z)))implica(not(L(x,z)))))))","(paraTodox(not(L(x,x))))");
$LPOquestao63 = array ("(paraTodox((P(x))implica(Q(x))))","(xistx(P(x)ouR(x)))","((xistx(R(x)))implica(paraTodox(Q(x))))","(xistx(Q(x)))");
$LPOquestao64 = array ("(paraTodox((A(x))implica(B(x))))", "(xisty(A(y)eC(y)))" ,"((xistx(C(x)eB(x)))implica(D(a)))","(xistx(D(x)))");
$LPOquestao65 = array ("(paraTodox(paraTodoy((P(x,y))implica(Q(x)eR(y)))))","(paraTodox(P(a,x)))","(((xistx(Q(x)))e(paraTodox(R(x))))implica(T(b)))", "(xistx(T(x)))");
$LPOquestao66 = array ("(paraTodox(paraTodoy(P(x,y))))","(paraTodox(paraTodoy((P(x,y))implica(Q(x)eR(y)))))","(((xistx(R(x)))e(paraTodox(Q(x))))implica(xistx(S(x)eT(x))))","(xistx(T(x)))");

//Lista de semantica Parte 1 - Verificar se as fórmulas são válidas
$SEMquestao1 = array ("((paraTodox((P(x))e(Q(x))))implica((paraTodox(P(x)))e(paraTodox(Q(x)))))"); 
$SEMquestao2 = array ("(((paraTodox(P(x)))e(paraTodox(Q(x))))implica(paraTodox((P(x))e(Q(x)))))");
$SEMquestao3 = array ("((xistx((P(x))e(Q(x))))implica((xistx(P(x)))e(xistx(Q(x)))))");
$SEMquestao4 = array ("(((xistx(P(x)))e(xistx(Q(x))))implica(xistx((P(x))e(Q(x)))))");
$SEMquestao5 = array ("((paraTodox((P(x))ou(Q(x))))implica((paraTodox(P(x)))ou(paraTodox(Q(x)))))"); 
$SEMquestao6 = array ("(((paraTodox(P(x)))ou(paraTodox(Q(x))))implica(paraTodox((P(x))ou(Q(x)))))");
$SEMquestao7 = array ("((xistx((P(x))ou(Q(x))))implica((xistx(P(x)))ou(xistx(Q(x)))))");
$SEMquestao8 = array ("(((xistx(P(x)))ou(xistx(Q(x))))implica(xistx((P(x))ou(Q(x)))))");
$SEMquestao9 = array ("((paraTodox((P(x))implica(Q(x))))implica((paraTodox(P(x)))implica(paraTodox(Q(x)))))");
$SEMquestao10 = array ("(((paraTodox(P(x)))implica(paraTodox(Q(x))))implica(paraTodox((P(x))implica(Q(x)))))");
$SEMquestao11 = array ("((xistx((P(x))implica(Q(x))))implica((xistx(P(x)))implica(xistx(Q(x)))))");
$SEMquestao12 = array ("(((xistx(P(x)))implica(xistx(Q(x))))implica(xistx((P(x))implica(Q(x)))))");

//Lista de semantica Parte 2 - Verificar e justificar se as fórmulas podem ser verdadeiras e falsas dando relações para elas

$SEM2questao1 = array ("(paraTodox(paraTodoy((xistz(R(x,z)e(R(z,y))))implica(R(x,y)))))");
$SEM2questao2 = array ("(paraTodox(paraTodoy((R(x,y))implica(R(y,x)))))");
$SEM2questao3 = array ("(paraTodox(paraTodoy((xistz(R(z,x)e(R(z,y))))implica(R(x,y)))))");
$SEM2questao4 = array ("(paraTodox(paraTodoy((xistz(R(z,x)e(R(z,y))))implica((xistz(R(z,x)))e(xistz(Q(z,y)))))))");
$SEM2questao5 = array ("(paraTodox(paraTodoy((paraTodoz((R(x,z))e(R(x,y))))implica(xistw((R(z,w))e(Q(y,w)))))))");
?>