module.exports = async function chat(pergunta) {

        if(pergunta.text == 'Oi'){

            var retorno = {
                from:pergunta.from,
                text:'Oi',
                server: true
            }
            return retorno;

        }else if(pergunta.text == 'Ajuda'){

            var retorno = {
                from:pergunta.from,
                text:'Claro, ja vou te ajudar!',
                server: true
            }
            return retorno;

        }else{

            var retorno = {
                server: false
            }
            return retorno;
        }
}


