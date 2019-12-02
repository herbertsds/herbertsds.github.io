 -------------------------------------------------------------
| Tutorial para utilizar o Sublime Text como uma IDE completa |
 -------------------------------------------------------------

 --------------
| Key bindings |
 --------------

 - Abrir Configurações e Menus 				Ctrl + Shift + P
 - Abrir Arquivos							Ctrl + P
 - Ir até uma função ou método				Ctrl + R
 - Função ou método de outro arquivo 		Ctrl + P > nomeArquivo@nomeDoMetodo
 - Função ou método em qualquer arquivo 	Ctrl + Shift + P
 - Criar arquivo (ver instalação)			Ctrl + Alt + N
 
 *obs: colocar caminho do arquivo, tab autocompleta igual linux
 *obs: colocando : no começo, se adiciona na pasta atual
 *obs: Ir em Preferences > Package Settings > AdvancedNewFile > Settings - Default. Lá é possível criar rótulos para caminhos que são muito utilizados na hora de criar arquivos.

- Renomear, apagar arquivo, etc				Ctrl + P > ANF

*obs: Ir em Preferences > Package Settings > AdvancedNewFile > Settings - Default, copiar a parte referente a rename_default e redefinir no User para renomear para a pasta atual (se desejar). Ou então colocar : antes do nome do arquivo para renomear para o mesmo diretório

- Abrir N janelas (uma do lado da outra)	Shift + Alt + Número

*obs: Redefinir keys do Origami

- Abrir modo vim							Esc
- Criar um painel na direita				: + cpd
- Criar um painel embaixo					: + cpb
- Destruir painel atual 					: + dp

*obs: Tentar utilizar isso sempre no modo vim

Modo Vim (esc para entrar, i para sair)
 - Andar com o cursor para cima				k
 - Andar com o cursor para baixo			j
 - Andar com o cursor para a direita		l
 - Andar com o cursor para a esquerda		h
 - Alterar 1 palavra (cursor no início)		cw
 - Alterar N palavras (cursor no início)	cNw (exemplo: c2w)
 - Alterar palavra (cursor em qq lugar)		ciw
 - Deletar palavra 							dw (todas as combinações de alterar funcionam para deletar)
 - Deletar todas as palavras entre chaves	di(

 *obs: serve para todas as combinações de teclas entre deletar e alterar (change) 	

 - Selecionar uma palavra 					ctrl+d
 - Selecionar a próxima palavra igual		ctrl+d
 - Selecionar todas as palavras iguais		alt+F3
 - Desfazer seleção							ctrl+U

 - Expandir caminho da classe				F9
 - Importar caminho da classe				F10
 - Inserir propriedade do construtor		F7

 - Criar uma nova classe					class + tab
 - Criar um novo método						met + tab
 - Criar um método privado					pmet + tab
 - Criar um construtor						_c + tab

 ------------------------------
| Instalando um tema (exemplo) |
 ------------------------------

 1 - Instalar um tema diferente (Material Theme)
 	- Pesquisar no Google por "sublime text material theme"
 	- Abrir o Sublime Text e apertar Ctrl+' (abre o console)
 	- Colar no console o código de Simple Installation que se acha no site de instalação do Material Theme e apertar enter
 	- Apertar Ctrl + Shift + P e procurar por Package Controle: Install Package
 	- Procurar por Material Theme
 	- Na tela que abriu após a instalação copiar o que está entre chaves depois de: "To activate this awesome theme, add in your current settings this code"
 	- Ir em Preferences > Settings
 	- Colar o que foi copiado no final do arquivo
 	- Salvar. Ao salvar, será atualizado
 	- Voltar ao arquivo anterior, copiar as configurações de UI recomendadas (eu preferi tirar tudo que era "bold")
 	- Se desejar, vá em View > Hide Minimap
 	- Verificar as configurações no default que deseja alterar e fazer na User

 ---------------------------------------
| Instalando Package para criar arquivo |
 ---------------------------------------

 	- Ctrl + P
 	- Package Install
 	- AdvancedNewFile

 -----------------php -------------------------------------
| Packages Recomendados (sempre olhar as key bindings) |
 ------------------------------------------------------

 	- Material Theme
 	- AdvancedNewFile
 	- Origami
 	- Php Getters and Setters
 	- PHP Companion
 	- SublimeLinter
 	- SublimeLinter-php

 ----------
| Snippets |
 ----------
 	-Tools > Developer > New Snippet

*obs: 	${N} cria um ponto de parada
		${N:defaultValor}


 ---------------
| PHP Companion |
 ---------------

 	- criar bind para F9 de "expand_fqcn"	 