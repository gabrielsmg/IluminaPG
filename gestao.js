let chamados = [];
let atual = null;

const labels = {
    aberto: "Aberto",
    em_analise: "Em análise",
    encaminhado: "Encaminhado",
    concluido: "Concluído"
};

const loginCard = document.getElementById("loginCard");
const painel = document.getElementById("painel");
const btnSair = document.getElementById("btnSair");

const formLogin = document.getElementById("formLogin");
const loginEmail = document.getElementById("loginEmail");
const loginSenha = document.getElementById("loginSenha");
const loginMsg = document.getElementById("loginMsg");

const filtro = document.getElementById("filtro");
const tabela = document.getElementById("tabela");

const detalhes = document.getElementById("detalhes");
const dados = document.getElementById("dados");

const campoStatus = document.getElementById("status");
const campoEquipe = document.getElementById("equipe");
const campoRetorno = document.getElementById("retorno");

const btnSalvar = document.getElementById("salvar");

const contadorAberto = document.getElementById("a");
const contadorAnalise = document.getElementById("b");
const contadorEncaminhado = document.getElementById("c");
const contadorConcluido = document.getElementById("d");


async function sessao() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    loginCard.style.display = session ? "none" : "block";
    painel.style.display = session ? "block" : "none";
    btnSair.style.display = session ? "inline-block" : "none";

    if (session) {
        carregar();
    }
}


sessao();


formLogin.addEventListener("submit", async (e) => {

    e.preventDefault();

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: loginEmail.value.trim(),
        password: loginSenha.value
    });

    if (error) {
        loginMsg.className = "alert err";
        loginMsg.textContent = "E-mail ou senha inválidos.";
        return;
    }

    loginMsg.textContent = "";

    sessao();
});


btnSair.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    location.reload();
});


async function carregar() {

    const { data, error } = await supabaseClient
        .from("chamados")
        .select("*")
        .order("criado_em", { ascending: false });

    if (error) {
        console.error("Erro ao carregar chamados:", error);
        return;
    }

    chamados = data || [];

    render();
    stats();
}


function stats() {

    contadorAberto.textContent =
        chamados.filter(x => x.status === "aberto").length;

    contadorAnalise.textContent =
        chamados.filter(x => x.status === "em_analise").length;

    contadorEncaminhado.textContent =
        chamados.filter(x => x.status === "encaminhado").length;

    contadorConcluido.textContent =
        chamados.filter(x => x.status === "concluido").length;
}


function render() {

    const q = filtro.value.toLowerCase();

    const lista = chamados.filter(x =>

        `${x.protocolo} ${x.bairro} ${x.logradouro}`
            .toLowerCase()
            .includes(q)
    );

    tabela.innerHTML = lista.map(x => `

        <tr>

            <td>${x.protocolo}</td>

            <td>${x.bairro}</td>

            <td>${x.tipo_ocorrencia}</td>

            <td>
                <span class="status ${x.status}">
                    ${labels[x.status]}
                </span>
            </td>

            <td>
                <button
                    class="btn"
                    onclick="abrir('${x.id}')">

                    Abrir

                </button>
            </td>

        </tr>

    `).join("");
}


filtro.addEventListener("input", render);


window.abrir = function(id) {

    const chamado = chamados.find(x => x.id === id);

    if (!chamado) {
        return;
    }

    atual = id;

    dados.innerHTML = `

        <p>
            <strong>Solicitante:</strong>
            ${chamado.nome}
        </p>

        <p>
            <strong>Contato:</strong>
            ${chamado.telefone} |
            ${chamado.email}
        </p>

        <p>
            <strong>Local:</strong>
            ${chamado.logradouro},
            ${chamado.numero_referencia}
            -
            ${chamado.bairro}
        </p>

        <p>
            <strong>Ocorrência:</strong>
            ${chamado.tipo_ocorrencia}
        </p>

        <p>
            <strong>Descrição:</strong>
            ${chamado.descricao || "Sem observações."}
        </p>
    `;

    campoStatus.value = chamado.status;

    campoEquipe.value =
        chamado.equipe_responsavel || "";

    campoRetorno.value =
        chamado.retorno_prefeitura || "";

    detalhes.style.display = "block";

    detalhes.scrollIntoView({
        behavior: "smooth"
    });
};


btnSalvar.addEventListener("click", async () => {

    if (!atual) {
        alert("Nenhum chamado selecionado.");
        return;
    }

    const novoStatus = campoStatus.value;

    const dadosAtualizados = {

        status: novoStatus,

        equipe_responsavel:
            campoEquipe.value.trim() || null,

        retorno_prefeitura:
            campoRetorno.value.trim() || null,

        atualizado_em:
            new Date().toISOString(),

        concluido_em:
            novoStatus === "concluido"
                ? new Date().toISOString()
                : null
    };


    console.log(
        "Atualizando chamado:",
        atual,
        dadosAtualizados
    );


    const { data, error } = await supabaseClient
        .from("chamados")
        .update(dadosAtualizados)
        .eq("id", atual)
        .select();


    if (error) {

        console.error(
            "Erro ao atualizar:",
            error
        );

        alert(
            "Erro ao salvar atendimento."
        );

        return;
    }


    console.log(
        "Chamado atualizado:",
        data
    );


    alert(
        "Atendimento atualizado com sucesso."
    );


    await carregar();

    detalhes.style.display = "none";
});