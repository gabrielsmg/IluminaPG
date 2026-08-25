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



// ==============================================
// ELEMENTOS
// ==============================================


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


const campoRetornoContainer =
    document.getElementById(
        "campoRetornoContainer"
    );

const campoRetorno =
    document.getElementById("retorno");


const avisoBloqueado =
    document.getElementById(
        "avisoBloqueado"
    );


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



// ==============================================
// LOGIN
// ==============================================


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



btnSair.addEventListener(

    "click",

    async function () {

        await supabaseClient
            .auth
            .signOut();


        location.reload();

    }

);



// ==============================================
// CARREGAR
// ==============================================


async function carregarChamados() {

    const {
        data,
        error
    } =
        await supabaseClient

            .from(
                "chamados"
            )

            .select("*")

            .order(
                "criado_em",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            error
        );

        return;

    }


    chamados =
        data || [];


    atualizarIndicadores();

    renderizarChamados();

}



// ==============================================
// INDICADORES
// ==============================================


function atualizarIndicadores() {


    contadorAberto.textContent =
        chamados.filter(
            x =>
                x.status ===
                "aberto"
        ).length;


    contadorAnalise.textContent =
        chamados.filter(
            x =>
                x.status ===
                "em_analise"
        ).length;


    contadorEncaminhado.textContent =
        chamados.filter(
            x =>
                x.status ===
                "encaminhado"
        ).length;


    contadorConcluido.textContent =
        chamados.filter(
            x =>
                x.status ===
                "concluido"
        ).length;


    contadorNaoExecutado.textContent =
        chamados.filter(
            x =>
                x.status ===
                "nao_executado"
        ).length;

}



// ==============================================
// TABELA
// ==============================================


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



    if (
        lista.length === 0
    ) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-row"
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

                            ${
                                labels[
                                    chamado.status
                                ]
                            }

                        </span>

                    </td>


                    <td>

                        <button

                            type="button"

                            class="
                                btn
                                btn-light
                            "

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



// ==============================================
// FILTROS
// ==============================================


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



// ==============================================
// STATUS DISPONÍVEIS
// ==============================================


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



// ==============================================
// CAMPOS DE ACORDO COM NOVO STATUS
// ==============================================


function atualizarCampos() {


    const chamadoAtual =
        chamados.find(
            x =>
                x.id ===
                atual
        );


    if (!chamadoAtual) {
        return;
    }


    const novoStatus =
        campoStatus.value;


    const statusMudou =
        novoStatus !==
        chamadoAtual.status;



    // --------------------------------
    // Tudo bloqueado se não avançou
    // --------------------------------

    campoEquipe.disabled =
        !statusMudou;

    campoRetorno.disabled =
        !statusMudou;


    btnSalvar.disabled =
        !statusMudou;



    avisoBloqueado.style.display =
        statusMudou
            ? "none"
            : "block";



    // --------------------------------
    // Equipe
    // --------------------------------

    const mostrarEquipe =

        novoStatus ===
            "encaminhado"

        ||

        novoStatus ===
            "concluido"

        ||

        novoStatus ===
            "nao_executado";


    campoEquipeContainer.style.display =
        mostrarEquipe
            ? "block"
            : "none";



    // --------------------------------
    // Resultado
    // --------------------------------

    campoResultado.style.display =
        (
            novoStatus ===
                "concluido"

            ||

            novoStatus ===
                "nao_executado"
        )
            ? "block"
            : "none";



    campoOutro.style.display =
        "none";


    outroRetorno.value =
        "";


    if (
        novoStatus ===
        "concluido"
    ) {

        carregarResultadosExecutados();

    }


    if (
        novoStatus ===
        "nao_executado"
    ) {

        carregarResultadosNaoExecutados();

    }



    if (statusMudou) {

        campoRetorno.value =
            "";

    }

}



// ==============================================
// OPÇÕES CONCLUÍDO
// ==============================================


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



// ==============================================
// OPÇÕES NÃO EXECUTADO
// ==============================================


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



// ==============================================
// ALTERAÇÃO STATUS
// ==============================================


campoStatus.addEventListener(

    "change",

    atualizarCampos

);



// ==============================================
// RESULTADO AUTOMÁTICO
// ==============================================


tipoResultado.addEventListener(

    "change",

    function () {


        const chamadoAtual =
            chamados.find(
                x =>
                    x.id ===
                    atual
            );


        if (!chamadoAtual) {
            return;
        }


        const status =
            campoStatus.value;


        const valor =
            tipoResultado.value;



        if (
            valor ===
            "outro"
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


        if (
            status ===
            "concluido"
        ) {

            campoRetorno.value =
                respostasExecutadas[
                    valor
                ] || "";

        }


        if (
            status ===
            "nao_executado"
        ) {

            campoRetorno.value =
                respostasNaoExecutadas[
                    valor
                ] || "";

        }

    }

);



// ==============================================
// OUTRO
// ==============================================


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



// ==============================================
// ABRIR CHAMADO
// ==============================================


window.abrirChamado =
    function (id) {


        const chamado =
            chamados.find(
                x =>
                    x.id ===
                    id
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

                        ${
                            labels[
                                chamado.status
                            ]
                        }

                    </p>


                </div>


            </div>

        `;



        campoEquipe.value =
            chamado
                .equipe_responsavel
            || "";


        campoRetorno.value =
            chamado
                .retorno_prefeitura
            || "";


        tipoResultado.innerHTML = `

            <option value="">
                Selecione
            </option>

        `;


        campoOutro.style.display =
            "none";


        configurarStatus(
            chamado.status
        );


        atualizarCampos();



        // Estados finais ficam somente leitura

        if (
            chamado.status ===
                "concluido"

            ||

            chamado.status ===
                "nao_executado"
        ) {

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

            avisoBloqueado.style.display =
                "block";

        }

        else {

            campoStatus.disabled =
                false;

            tipoResultado.disabled =
                false;

            btnSalvar.style.display =
                "inline-flex";

        }



        detalhes.style.display =
            "block";


        detalhes.scrollIntoView({

            behavior:
                "smooth"

        });

    };



// ==============================================
// SALVAR
// ==============================================


btnSalvar.addEventListener(

    "click",

    async function () {


        const chamadoAtual =
            chamados.find(
                x =>
                    x.id ===
                    atual
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



        // --------------------------------
        // Equipe obrigatória
        // --------------------------------

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



        // --------------------------------
        // Resultado obrigatório
        // --------------------------------

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

            return;

        }



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



        if (
            !campoRetorno
                .value
                .trim()
        ) {

            alert(
                "Informe o retorno ao cidadão."
            );

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
                || null,


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