let chamados = [];
let atual = null;

const labels = {
    aberto: "Aberto",
    em_analise: "Em análise",
    encaminhado: "Encaminhado",
    concluido: "Concluído"
};

const ordemStatus = [
    "aberto",
    "em_analise",
    "encaminhado",
    "concluido"
];

const respostasConclusao = {

    substituicao:
        "Serviço executado. Luminária substituída e funcionamento da iluminação pública restabelecido.",

    reparo:
        "Serviço executado. Foi realizado o reparo necessário e o funcionamento da iluminação pública foi restabelecido.",

    normalizado:
        "Serviço executado. O funcionamento da iluminação pública foi normalizado.",

    nao_localizado:
        "Serviço não executado. O ponto informado na solicitação não foi localizado pela equipe responsável.",

    sem_defeito:
        "Serviço não executado. Após vistoria no local, não foi constatado defeito na iluminação pública.",

    sem_acesso:
        "Serviço não executado devido à impossibilidade de acesso ao local pela equipe responsável.",

    fora_escopo:
        "Serviço não executado. Após análise, foi identificado que a ocorrência informada não pertence ao serviço de iluminação pública."
};


// ==========================================
// ELEMENTOS DA INTERFACE
// ==========================================

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

const campoEquipe =
    document.getElementById("equipe");

const campoEquipeContainer =
    document.getElementById("campoEquipe");

const campoConclusao =
    document.getElementById("campoConclusao");

const tipoConclusao =
    document.getElementById("tipoConclusao");

const campoOutro =
    document.getElementById("campoOutro");

const outroRetorno =
    document.getElementById("outroRetorno");

const campoRetorno =
    document.getElementById("retorno");

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


// ==========================================
// SESSÃO
// ==========================================

async function verificarSessao() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    const logado = !!session;

    loginCard.style.display =
        logado ? "none" : "block";

    painel.style.display =
        logado ? "block" : "none";

    btnSair.style.display =
        logado ? "inline-block" : "none";

    if (logado) {
        carregarChamados();
    }
}


verificarSessao();


// ==========================================
// LOGIN
// ==========================================

formLogin.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        loginMsg.className = "alert";
        loginMsg.textContent = "";

        const { error } =
            await supabaseClient.auth.signInWithPassword({
                email:
                    loginEmail.value.trim(),

                password:
                    loginSenha.value
            });

        if (error) {

            loginMsg.className =
                "alert show error";

            loginMsg.textContent =
                "E-mail ou senha inválidos.";

            return;
        }

        verificarSessao();
    }
);


// ==========================================
// LOGOUT
// ==========================================

btnSair.addEventListener(
    "click",
    async function () {

        await supabaseClient.auth.signOut();

        location.reload();
    }
);


// ==========================================
// CARREGAR CHAMADOS
// ==========================================

async function carregarChamados() {

    const { data, error } =
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

    renderizarChamados();

    atualizarIndicadores();
}


// ==========================================
// INDICADORES
// ==========================================

function atualizarIndicadores() {

    contadorAberto.textContent =
        chamados.filter(
            x => x.status === "aberto"
        ).length;

    contadorAnalise.textContent =
        chamados.filter(
            x => x.status === "em_analise"
        ).length;

    contadorEncaminhado.textContent =
        chamados.filter(
            x => x.status === "encaminhado"
        ).length;

    contadorConcluido.textContent =
        chamados.filter(
            x => x.status === "concluido"
        ).length;
}


// ==========================================
// RENDERIZAR TABELA
// ==========================================

function renderizarChamados() {

    const pesquisa =
        filtro.value
            .trim()
            .toLowerCase();

    const statusFiltro =
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

                const correspondeTexto =
                    !pesquisa ||
                    texto.includes(
                        pesquisa
                    );

                const correspondeStatus =
                    !statusFiltro ||
                    chamado.status ===
                        statusFiltro;

                return (
                    correspondeTexto &&
                    correspondeStatus
                );
            }
        );


    if (lista.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="
                        text-align: center;
                        padding: 30px;
                        color: #6b7280;
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


// ==========================================
// FILTROS
// ==========================================

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


// ==========================================
// CONFIGURAR STATUS
// ==========================================

function configurarStatus(
    statusAtual
) {

    const indiceAtual =
        ordemStatus.indexOf(
            statusAtual
        );


    Array.from(
        campoStatus.options
    ).forEach(
        option => {

            const indiceOpcao =
                ordemStatus.indexOf(
                    option.value
                );

            option.disabled =
                indiceOpcao <
                indiceAtual;
        }
    );


    atualizarCamposPorStatus();
}


// ==========================================
// MOSTRAR / OCULTAR CAMPOS
// ==========================================

function atualizarCamposPorStatus() {

    const statusSelecionado =
        campoStatus.value;


    const indiceStatus =
        ordemStatus.indexOf(
            statusSelecionado
        );

    const indiceEncaminhado =
        ordemStatus.indexOf(
            "encaminhado"
        );


    // ------------------------------
    // EQUIPE
    // ------------------------------

    if (
        indiceStatus >=
        indiceEncaminhado
    ) {

        campoEquipeContainer
            .style
            .display = "block";

    } else {

        campoEquipeContainer
            .style
            .display = "none";

        campoEquipe.value = "";
    }


    // ------------------------------
    // CONCLUSÃO
    // ------------------------------

    if (
        statusSelecionado ===
        "concluido"
    ) {

        campoConclusao
            .style
            .display = "block";

    } else {

        campoConclusao
            .style
            .display = "none";

        campoOutro
            .style
            .display = "none";

        tipoConclusao.value = "";

        outroRetorno.value = "";
    }
}


// ==========================================
// ALTERAÇÃO DO STATUS
// ==========================================

campoStatus.addEventListener(
    "change",
    atualizarCamposPorStatus
);


// ==========================================
// RESPOSTAS AUTOMÁTICAS
// ==========================================

tipoConclusao.addEventListener(
    "change",
    function () {

        const tipo =
            tipoConclusao.value;


        // ------------------------------
        // OUTRO
        // ------------------------------

        if (
            tipo === "outro"
        ) {

            campoOutro
                .style
                .display = "block";

            campoRetorno.value = "";

            outroRetorno.focus();

            return;
        }


        campoOutro
            .style
            .display = "none";

        outroRetorno.value = "";


        campoRetorno.value =
            respostasConclusao[
                tipo
            ] || "";
    }
);


// ==========================================
// CAMPO OUTRO
// ==========================================

outroRetorno.addEventListener(
    "input",
    function () {

        if (
            tipoConclusao.value ===
            "outro"
        ) {

            campoRetorno.value =
                outroRetorno.value;
        }
    }
);


// ==========================================
// ABRIR CHAMADO
// ==========================================

window.abrirChamado =
    function (id) {

        const chamado =
            chamados.find(
                x => x.id === id
            );


        if (!chamado) {
            return;
        }


        atual =
            chamado.id;


        dados.innerHTML = `

            <div
                class="
                    admin-detail-grid
                "
            >

                <div
                    class="
                        detail-block
                    "
                >

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


                <div
                    class="
                        detail-block
                    "
                >

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
                            chamado.descricao ||
                            "Sem observações."
                        }
                    </p>


                    <p>
                        <strong>
                            Aberto em:
                        </strong>

                        ${
                            new Date(
                                chamado.criado_em
                            )
                            .toLocaleString(
                                "pt-BR"
                            )
                        }
                    </p>

                </div>

            </div>
        `;


        campoStatus.value =
            chamado.status;


        campoEquipe.value =
            chamado
                .equipe_responsavel
            || "";


        campoRetorno.value =
            chamado
                .retorno_prefeitura
            || "";


        tipoConclusao.value =
            "";


        outroRetorno.value =
            "";


        configurarStatus(
            chamado.status
        );


        detalhes.style.display =
            "block";


        detalhes.scrollIntoView({
            behavior:
                "smooth"
        });
    };


// ==========================================
// SALVAR ATENDIMENTO
// ==========================================

btnSalvar.addEventListener(
    "click",
    async function () {


        if (!atual) {

            alert(
                "Nenhum chamado selecionado."
            );

            return;
        }


        const chamadoAtual =
            chamados.find(
                x => x.id === atual
            );


        if (!chamadoAtual) {

            alert(
                "Chamado não encontrado."
            );

            return;
        }


        const novoStatus =
            campoStatus.value;


        const indiceAtual =
            ordemStatus.indexOf(
                chamadoAtual.status
            );


        const indiceNovo =
            ordemStatus.indexOf(
                novoStatus
            );


        // ==================================
        // NÃO PERMITIR RETROCESSO
        // ==================================

        if (
            indiceNovo <
            indiceAtual
        ) {

            alert(
                "Não é permitido retornar o chamado para um status anterior."
            );

            campoStatus.value =
                chamadoAtual.status;

            return;
        }


        // ==================================
        // EQUIPE OBRIGATÓRIA
        // ==================================

        if (
            (
                novoStatus ===
                "encaminhado"
                ||
                novoStatus ===
                "concluido"
            )
            &&
            !campoEquipe
                .value
                .trim()
        ) {

            alert(
                "Informe a equipe responsável pelo atendimento."
            );

            campoEquipe.focus();

            return;
        }


        // ==================================
        // RESULTADO OBRIGATÓRIO
        // ==================================

        if (
            novoStatus ===
            "concluido"
            &&
            !tipoConclusao.value
        ) {

            alert(
                "Selecione o resultado do atendimento."
            );

            tipoConclusao.focus();

            return;
        }


        // ==================================
        // OUTRO OBRIGATÓRIO
        // ==================================

        if (
            novoStatus ===
            "concluido"
            &&
            tipoConclusao.value ===
                "outro"
            &&
            !outroRetorno
                .value
                .trim()
        ) {

            alert(
                "Descreva o resultado do atendimento."
            );

            outroRetorno.focus();

            return;
        }


        // ==================================
        // RETORNO OBRIGATÓRIO
        // ==================================

        if (
            !campoRetorno
                .value
                .trim()
        ) {

            alert(
                "Informe o retorno que será apresentado ao cidadão."
            );

            campoRetorno.focus();

            return;
        }


        // ==================================
        // OBJETO DE ATUALIZAÇÃO
        // ==================================

        const dadosAtualizados = {

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
                    .trim()
                || null,

            atualizado_em:
                new Date()
                    .toISOString(),

            concluido_em:
                novoStatus ===
                "concluido"

                    ? new Date()
                        .toISOString()

                    : null
        };


        // ==================================
        // UPDATE SUPABASE
        // ==================================

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "chamados"
                )
                .update(
                    dadosAtualizados
                )
                .eq(
                    "id",
                    atual
                )
                .select();


        if (error) {

            console.error(
                "Erro ao atualizar chamado:",
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


        detalhes.style.display =
            "none";


        atual = null;


        await carregarChamados();
    }
);