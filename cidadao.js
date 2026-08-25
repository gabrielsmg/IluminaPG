const form = document.getElementById("formOcorrencia");
const mensagem = document.getElementById("mensagem");

function mostrarMensagem(tipo, conteudo) {
    mensagem.className = `alert show ${tipo}`;
    mensagem.innerHTML = conteudo;
}

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const tipoSelecionado = document.querySelector(
        'input[name="tipo"]:checked'
    );

    if (!tipoSelecionado) {
        mostrarMensagem(
            "error",
            "Selecione o tipo de ocorrência."
        );

        return;
    }

    const dadosChamado = {

        p_nome:
            document.getElementById("nome").value.trim(),

        p_telefone:
            document.getElementById("telefone").value.trim(),

        p_email:
            document.getElementById("email").value.trim(),

        p_bairro:
            document.getElementById("bairro").value.trim(),

        p_logradouro:
            document.getElementById("logradouro").value.trim(),

        p_numero_referencia:
            document.getElementById("numero").value.trim(),

        p_cep:
            document.getElementById("cep").value.trim() || null,

        p_tipo_ocorrencia:
            tipoSelecionado.value,

        p_descricao:
            document.getElementById("descricao").value.trim() || null
    };


    mostrarMensagem(
        "info",
        "Enviando solicitação..."
    );


    const { data, error } =
        await supabaseClient.rpc(
            "abrir_chamado",
            dadosChamado
        );


    if (error) {

        console.error(
            "Erro ao registrar chamado:",
            error
        );

        mostrarMensagem(
            "error",
            "Não foi possível registrar a solicitação."
        );

        return;
    }


    const protocolo =
        Array.isArray(data)
            ? data[0]?.protocolo
            : data?.protocolo || data;


    mostrarMensagem(
        "success",
        `
        Solicitação registrada com sucesso.

        <div class="protocol-box">
            ${protocolo}
        </div>

        <p>
            Guarde este protocolo para acompanhar o atendimento.
        </p>
        `
    );


    form.reset();
});