let chamados = [];

let atual = null;



const labels = {

    aberto: "Aberto",

    em_analise: "Em análise",

    encaminhado: "Encaminhado",

    concluido: "Concluído",

    nao_executado: "Não executado"

};



const proximoStatus = {

    aberto: [
        "em_analise"
    ],

    em_analise: [
        "encaminhado"
    ],

    encaminhado: [
        "concluido",
        "nao_executado"
    ],

    concluido: [],

    nao_executado: []

};



const respostasStatus = {

    em_analise:
        "Sua solicitação foi recebida e está em análise pela equipe responsável.",

    encaminhado:
        "Sua solicitação foi analisada e encaminhada para a equipe responsável pela execução do serviço."

};



const respostasExecutadas = {

    substituicao:
        "Serviço executado. Luminária substituída e funcionamento da iluminação pública restabelecido.",

    reparo:
        "Serviço executado. Reparo realizado e funcionamento da iluminação pública restabelecido.",

    normalizado:
        "Serviço executado. O funcionamento da iluminação pública foi normalizado.",

    conexao:
        "Serviço executado. Conexões elétricas revisadas e funcionamento restabelecido.",

    outro:
        ""

};



const respostasNaoExecutadas = {

    nao_localizado:
        "Serviço não executado. O ponto informado na solicitação não foi localizado pela equipe responsável.",

    sem_defeito:
        "Serviço não executado. Após vistoria no local, não foi constatado defeito na iluminação pública.",

    sem_acesso:
        "Serviço não executado devido à impossibilidade de acesso ao local.",

    fora_escopo:
        "Serviço não executado. A ocorrência informada não pertence ao serviço de iluminação pública.",

    material:
        "Serviço não executado devido à necessidade de material específico para realização do atendimento.",

    outro:
        ""

};



// ==================================================
// ELEMENTOS
// ==================================================

const loginCard =
    document.getElementById("loginCard");

const painel =
    document.getElementById("painel");

const btnSair =
    document.getElementById("btnSair");

const formLogin =
    document.getElementById("formLogin");

const loginEmail =
    document.getElementById("loginEmail");

const loginSenha =
    document.getElementById("loginSenha");

const loginMsg =
    document.getElementById("loginMsg");


const filtro =
    document.getElementById("filtro");

const filtroStatus =
    document.getElementById("filtroStatus");

const btnAtualizar =
    document.getElementById("btnAtualizar");

const tabela =
    document.getElementById("tabela");


const detalhes =
    document.getElementById("detalhes");

const dados =
    document.getElementById("dados");

const historicoAdmin =
    document.getElementById("historicoAdmin");


const campoStatus =
    document.getElementById("status");

const campoEquipeContainer =
    document.getElementById("campoEquipe");

const campoEquipe =
    document.getElementById("equipe");


const campoResultado =
    document.getElementById("campoResultado");

const tipoResultado =
    document.getElementById("tipoResultado");


const campoOutro =
    document.getElementById("campoOutro");

const outroRetorno =
    document.getElementById("outroRetorno");


const campoRetorno =
    document.getElementById("retorno");


const avisoBloqueado =
    document.getElementById("avisoBloqueado");


const btnSalvar =
    document.getElementById("salvar");


const contadorAberto =
    document.getElementById("a");

const contadorAnalise =
    document.getElementById("b");

const contadorEncaminhado =
    document.getElementById("c");

const contadorConcluido =
    document.getElementById("d");

const contadorNaoExecutado =
    document.getElementById("e");



// ==================================================
// SESSÃO
// ==================================================

async function verificarSessao() {

    const {
        data: {
            session
        }
    } =
        await supabaseClient
            .auth
            .getSession();


    const logado =
        !!session;


    loginCard.style.display =
        logado
            ? "none"
            : "block";


    painel.style.display =
        logado
            ? "block"
            : "none";


    btnSair.style.display =
        logado
            ? "inline-block"
            : "none";


    if (logado) {

        await carregarChamados();

    }

}



verificarSessao();



// ==================================================
// LOGIN
// ==================================================

formLogin.addEventListener(

    "submit",

    async function (event) {


        event.preventDefault();


        loginMsg.className =
            "alert";


        const {
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({

                    email:
                        loginEmail
                            .value
                            .trim(),

                    password:
                        loginSenha
                            .value

                });


        if (error) {

            loginMsg.className =
                "alert show error";

            loginMsg.textContent =
                "E-mail ou senha inválidos.";

            return;

        }


        await verificarSessao();

    }

);



// ==================================================
// LOGOUT
// ==================================================

btnSair.addEventListener(

    "click",

    async function () {


        await supabaseClient
            .auth
            .signOut();


        location.reload();

    }

);



// ==================================================
// CARREGAR CHAMADOS
// ==================================================

async function carregarChamados() {


    const {
        data,
        error
    } =
        await supabaseClient

            .from("chamados")

            .select("*")

            .order(
                "criado_em",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Erro ao carregar chamados:",
            error
        );

        return;

    }


    chamados =
        data || [];


    atualizarIndicadores();

    renderizarChamados();

}



// ==================================================
// INDICADORES
// ==================================================

function atualizarIndicadores() {


    contadorAberto.textContent =
        chamados.filter(
            x =>
                x.status === "aberto"
        ).length;


    contadorAnalise.textContent =
        chamados.filter(
            x =>
                x.status === "em_analise"
        ).length;


    contadorEncaminhado.textContent =
        chamados.filter(
            x =>
                x.status === "encaminhado"
        ).length;


    contadorConcluido.textContent =
        chamados.filter(
            x =>
                x.status === "concluido"
        ).length;


    contadorNaoExecutado.textContent =
        chamados.filter(
            x =>
                x.status === "nao_executado"
        ).length;

}



// ==================================================
// TABELA
// ==================================================

function renderizarChamados() {


    const pesquisa =
        filtro
            .value
            .trim()
            .toLowerCase();


    const statusSelecionado =
        filtroStatus.value;


    const lista =
        chamados.filter(

            chamado => {


                const texto =
                    `
                    ${chamado.protocolo}
                    ${chamado.bairro}
                    ${chamado.logradouro}
                    `
                        .toLowerCase();


                return (

                    (
                        !pesquisa
                        ||
                        texto.includes(
                            pesquisa
                        )
                    )

                    &&

                    (
                        !statusSelecionado
                        ||
                        chamado.status ===
                            statusSelecionado
                    )

                );

            }

        );



    if (lista.length === 0) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#6b7280;
                    "
                >
                    Nenhum chamado encontrado.
                </td>

            </tr>

        `;

        return;

    }



    tabela.innerHTML =
        lista.map(

            chamado => `

                <tr>


                    <td>
                        <strong>
                            ${chamado.protocolo}
                        </strong>
                    </td>


                    <td>
                        ${chamado.bairro}
                    </td>


                    <td>
                        ${chamado.tipo_ocorrencia}
                    </td>


                    <td>

                        <span
                            class="
                                status
                                ${chamado.status}
                            "
                        >
                            ${labels[chamado.status]}
                        </span>

                    </td>


                    <td>

                        <button
                            type="button"
                            class="btn btn-light"
                            onclick="
                                abrirChamado(
                                    '${chamado.id}'
                                )
                            "
                        >
                            Abrir
                        </button>

                    </td>


                </tr>

            `

        ).join("");

}



// ==================================================
// FILTROS
// ==================================================

filtro.addEventListener(
    "input",
    renderizarChamados
);


filtroStatus.addEventListener(
    "change",
    renderizarChamados
);


btnAtualizar.addEventListener(
    "click",
    carregarChamados
);



// ==================================================
// HISTÓRICO
// ==================================================

async function carregarHistorico(
    protocolo
) {


    historicoAdmin.innerHTML = `

        <p class="hint">
            Carregando histórico...
        </p>

    `;


    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                "historico_chamados"
            )

            .select("*")

            .eq(
                "protocolo",
                protocolo
            )

            .order(
                "criado_em",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Erro ao carregar histórico:",
            error
        );


        historicoAdmin.innerHTML = `

            <p class="hint">
                Não foi possível carregar o histórico.
            </p>

        `;

        return;

    }



    if (
        !data ||
        data.length === 0
    ) {

        historicoAdmin.innerHTML = `

            <p class="hint">
                Ainda não existem movimentações registradas.
            </p>

        `;

        return;

    }



    historicoAdmin.innerHTML =
        data.map(

            item => `

                <article
                    class="
                        history-item
                        ${item.status_novo}
                    "
                >


                    <div class="history-dot">
                    </div>



                    <div class="history-content">


                        <div class="history-header">

                            <strong>
                                ${labels[item.status_novo]}
                            </strong>


                            <span>
                                ${
                                    new Date(
                                        item.criado_em
                                    )
                                    .toLocaleString(
                                        "pt-BR"
                                    )
                                }
                            </span>

                        </div>



                        ${
                            item.equipe_responsavel

                                ? `
                                    <p>
                                        <strong>
                                            Equipe:
                                        </strong>

                                        ${item.equipe_responsavel}
                                    </p>
                                `

                                : ""
                        }



                        ${
                            item.retorno

                                ? `
                                    <p>
                                        ${item.retorno}
                                    </p>
                                `

                                : ""
                        }


                    </div>


                </article>

            `

        ).join("");

}



// ==================================================
// CONFIGURAÇÃO DE STATUS
// ==================================================

function configurarStatus(
    statusAtual
) {


    const permitidos =
        proximoStatus[
            statusAtual
        ] || [];


    Array
        .from(
            campoStatus.options
        )
        .forEach(

            option => {


                option.disabled =
                    !(
                        option.value ===
                            statusAtual

                        ||

                        permitidos.includes(
                            option.value
                        )
                    );

            }

        );


    campoStatus.value =
        statusAtual;

}



// ==================================================
// CAMPOS POR STATUS
// ==================================================

function atualizarCampos() {


    const chamadoAtual =
        chamados.find(
            x =>
                x.id === atual
        );


    if (!chamadoAtual) {

        return;

    }



    const novoStatus =
        campoStatus.value;


    const statusMudou =
        novoStatus !==
        chamadoAtual.status;



    // ==============================================
    // AVISO DE BLOQUEIO
    // Não aparece enquanto o chamado estiver ABERTO
    // ==============================================

    if (

        chamadoAtual.status !==
            "aberto"

        &&

        !statusMudou

    ) {

        avisoBloqueado.style.display =
            "block";

    }

    else {

        avisoBloqueado.style.display =
            "none";

    }



    // ==============================================
    // ESTADOS FINAIS
    // ==============================================

    const finalizado =

        chamadoAtual.status ===
            "concluido"

        ||

        chamadoAtual.status ===
            "nao_executado";


    if (finalizado) {


        campoStatus.disabled =
            true;


        campoEquipe.disabled =
            true;


        campoRetorno.disabled =
            true;


        tipoResultado.disabled =
            true;


        btnSalvar.style.display =
            "none";


        campoEquipeContainer.style.display =
            chamadoAtual.equipe_responsavel
                ? "block"
                : "none";


        campoResultado.style.display =
            "none";


        campoOutro.style.display =
            "none";


        return;

    }



    campoStatus.disabled =
        false;


    tipoResultado.disabled =
        false;


    btnSalvar.style.display =
        "inline-flex";



    // ==============================================
    // NÃO ALTEROU O STATUS
    // ==============================================

    if (!statusMudou) {


        campoEquipe.disabled =
            true;


        campoRetorno.disabled =
            true;


        btnSalvar.disabled =
            true;

    }

    else {


        campoRetorno.disabled =
            false;


        btnSalvar.disabled =
            false;

    }



    // ==============================================
    // EQUIPE
    // ==============================================

    if (
        novoStatus ===
            "encaminhado"
    ) {


        campoEquipeContainer.style.display =
            "block";


        campoEquipe.disabled =
            false;

    }

    else if (

        novoStatus ===
            "concluido"

        ||

        novoStatus ===
            "nao_executado"

    ) {


        campoEquipeContainer.style.display =
            campoEquipe.value
                ? "block"
                : "none";


        campoEquipe.disabled =
            true;

    }

    else {


        campoEquipeContainer.style.display =
            "none";

    }



    // ==============================================
    // CONCLUSÃO
    // ==============================================

    if (
        novoStatus ===
            "concluido"
    ) {


        campoResultado.style.display =
            "block";


        carregarResultadosExecutados();

    }

    else if (
        novoStatus ===
            "nao_executado"
    ) {


        campoResultado.style.display =
            "block";


        carregarResultadosNaoExecutados();

    }

    else {


        campoResultado.style.display =
            "none";


        campoOutro.style.display =
            "none";


        tipoResultado.innerHTML = `

            <option value="">
                Selecione
            </option>

        `;

    }



    // ==============================================
    // MENSAGENS AUTOMÁTICAS DOS STATUS INTERMEDIÁRIOS
    // ==============================================

    if (statusMudou) {


        if (
            novoStatus === "em_analise"
            ||
            novoStatus === "encaminhado"
        ) {


            campoRetorno.value =
                respostasStatus[
                    novoStatus
                ];

        }

        else {


            campoRetorno.value =
                "";

        }

    }

}



// ==================================================
// RESULTADOS EXECUTADOS
// ==================================================

function carregarResultadosExecutados() {


    tipoResultado.innerHTML = `

        <option value="">
            Selecione o serviço realizado
        </option>

        <option value="substituicao">
            Luminária substituída
        </option>

        <option value="reparo">
            Reparo realizado
        </option>

        <option value="normalizado">
            Funcionamento normalizado
        </option>

        <option value="conexao">
            Conexões elétricas revisadas
        </option>

        <option value="outro">
            Outro
        </option>

    `;

}



// ==================================================
// RESULTADOS NÃO EXECUTADOS
// ==================================================

function carregarResultadosNaoExecutados() {


    tipoResultado.innerHTML = `

        <option value="">
            Selecione o motivo
        </option>

        <option value="nao_localizado">
            Ponto não localizado
        </option>

        <option value="sem_defeito">
            Defeito não constatado
        </option>

        <option value="sem_acesso">
            Impossibilidade de acesso
        </option>

        <option value="fora_escopo">
            Fora do escopo da iluminação pública
        </option>

        <option value="material">
            Necessidade de material específico
        </option>

        <option value="outro">
            Outro
        </option>

    `;

}



// ==================================================
// ALTERAÇÃO DO STATUS
// ==================================================

campoStatus.addEventListener(

    "change",

    atualizarCampos

);



// ==================================================
// RESPOSTAS AUTOMÁTICAS
// ==================================================

tipoResultado.addEventListener(

    "change",

    function () {


        const valor =
            tipoResultado.value;



        if (
            valor === "outro"
        ) {


            campoOutro.style.display =
                "block";


            campoRetorno.value =
                "";


            outroRetorno.focus();


            return;

        }



        campoOutro.style.display =
            "none";


        outroRetorno.value =
            "";



        if (
            campoStatus.value ===
                "concluido"
        ) {


            campoRetorno.value =
                respostasExecutadas[
                    valor
                ] || "";

        }



        if (
            campoStatus.value ===
                "nao_executado"
        ) {


            campoRetorno.value =
                respostasNaoExecutadas[
                    valor
                ] || "";

        }

    }

);



// ==================================================
// OUTRO
// ==================================================

outroRetorno.addEventListener(

    "input",

    function () {


        if (
            tipoResultado.value ===
                "outro"
        ) {


            campoRetorno.value =
                outroRetorno.value;

        }

    }

);



// ==================================================
// ABRIR CHAMADO
// ==================================================

window.abrirChamado =
async function (
    id
) {


    const chamado =
        chamados.find(
            x =>
                x.id === id
        );


    if (!chamado) {

        return;

    }



    atual =
        chamado.id;



    dados.innerHTML = `


        <div class="admin-detail-grid">


            <div class="detail-block">


                <p>
                    <strong>
                        Protocolo:
                    </strong>

                    ${chamado.protocolo}
                </p>


                <p>
                    <strong>
                        Solicitante:
                    </strong>

                    ${chamado.nome}
                </p>


                <p>
                    <strong>
                        Telefone:
                    </strong>

                    ${chamado.telefone}
                </p>


                <p>
                    <strong>
                        E-mail:
                    </strong>

                    ${chamado.email}
                </p>


            </div>



            <div class="detail-block">


                <p>

                    <strong>
                        Local:
                    </strong>

                    ${chamado.logradouro},
                    ${chamado.numero_referencia}
                    -
                    ${chamado.bairro}

                </p>


                <p>

                    <strong>
                        Ocorrência:
                    </strong>

                    ${chamado.tipo_ocorrencia}

                </p>


                <p>

                    <strong>
                        Descrição:
                    </strong>

                    ${
                        chamado.descricao
                        ||
                        "Sem observações."
                    }

                </p>


                <p>

                    <strong>
                        Status atual:
                    </strong>

                    ${labels[chamado.status]}

                </p>


            </div>


        </div>

    `;



    campoEquipe.value =
        chamado.equipe_responsavel
        || "";


    campoRetorno.value =
        chamado.retorno_prefeitura
        || "";


    outroRetorno.value =
        "";


    campoOutro.style.display =
        "none";


    tipoResultado.innerHTML = `

        <option value="">
            Selecione
        </option>

    `;



    configurarStatus(
        chamado.status
    );


    atualizarCampos();



    detalhes.style.display =
        "block";



    await carregarHistorico(
        chamado.protocolo
    );



    detalhes.scrollIntoView({

        behavior:
            "smooth"

    });

};



// ==================================================
// SALVAR
// ==================================================

btnSalvar.addEventListener(

    "click",

    async function () {


        const chamadoAtual =
            chamados.find(
                x =>
                    x.id === atual
            );


        if (!chamadoAtual) {


            alert(
                "Chamado não encontrado."
            );


            return;

        }



        const novoStatus =
            campoStatus.value;



        if (
            novoStatus ===
            chamadoAtual.status
        ) {


            alert(
                "Selecione o próximo status do atendimento."
            );


            return;

        }



        const permitidos =
            proximoStatus[
                chamadoAtual.status
            ] || [];



        if (
            !permitidos.includes(
                novoStatus
            )
        ) {


            alert(
                "Essa alteração de status não é permitida."
            );


            return;

        }



        // =========================================
        // EQUIPE
        // =========================================

        if (

            novoStatus ===
                "encaminhado"

            &&

            !campoEquipe
                .value
                .trim()

        ) {


            alert(
                "Informe a equipe responsável."
            );


            campoEquipe.focus();


            return;

        }



        // =========================================
        // RESULTADO
        // =========================================

        if (

            (
                novoStatus ===
                    "concluido"

                ||

                novoStatus ===
                    "nao_executado"
            )

            &&

            !tipoResultado.value

        ) {


            alert(
                "Selecione o resultado do atendimento."
            );


            tipoResultado.focus();


            return;

        }



        // =========================================
        // OUTRO
        // =========================================

        if (

            tipoResultado.value ===
                "outro"

            &&

            !outroRetorno
                .value
                .trim()

        ) {


            alert(
                "Informe o resultado do atendimento."
            );


            outroRetorno.focus();


            return;

        }



        // =========================================
        // RETORNO
        // =========================================

        if (
            !campoRetorno
                .value
                .trim()
        ) {


            alert(
                "Informe o retorno ao cidadão."
            );


            campoRetorno.focus();


            return;

        }



        const terminal =

            novoStatus ===
                "concluido"

            ||

            novoStatus ===
                "nao_executado";



        const payload = {


            status:
                novoStatus,


            equipe_responsavel:

                campoEquipe
                    .value
                    .trim()

                ||

                chamadoAtual
                    .equipe_responsavel

                ||

                null,


            retorno_prefeitura:
                campoRetorno
                    .value
                    .trim(),


            atualizado_em:
                new Date()
                    .toISOString(),


            concluido_em:

                terminal

                    ? new Date()
                        .toISOString()

                    : null

        };



        const {
            error
        } =
            await supabaseClient

                .from(
                    "chamados"
                )

                .update(
                    payload
                )

                .eq(
                    "id",
                    atual
                );



        if (error) {


            console.error(
                error
            );


            alert(
                "Erro ao salvar atendimento."
            );


            return;

        }



        alert(
            "Atendimento atualizado com sucesso."
        );



        detalhes.style.display =
            "none";


        atual =
            null;


        await carregarChamados();

    }

);