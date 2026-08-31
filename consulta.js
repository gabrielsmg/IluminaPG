const formConsulta =
    document.getElementById(
        "formConsulta"
    );


const mensagem =
    document.getElementById(
        "mensagem"
    );


const resultado =
    document.getElementById(
        "resultado"
    );



const labels = {

    aberto:
        "Aberto",

    em_analise:
        "Em análise",

    encaminhado:
        "Encaminhado para equipe",

    concluido:
        "Concluído",

    nao_executado:
        "Não executado"

};



// ==================================================
// BUSCAR HISTÓRICO
// ==================================================

async function buscarHistorico(
    protocolo
) {


    const {
        data,
        error
    } =
        await supabaseClient

            .rpc(
                "consultar_historico",
                {
                    p_protocolo:
                        protocolo
                }
            );


    if (error) {


        console.error(
            "Erro ao consultar histórico:",
            error
        );


        return [];

    }


    return data || [];

}



// ==================================================
// MONTAR HISTÓRICO
// ==================================================

function montarHistorico(
    historico
) {


    if (
        !historico ||
        historico.length === 0
    ) {


        return `

            <p class="hint">
                Histórico ainda não disponível.
            </p>

        `;

    }



    return historico.map(

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
                            ${
                                labels[
                                    item.status_novo
                                ]
                            }
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
// CONSULTA
// ==================================================

formConsulta.addEventListener(

    "submit",

    async function (
        event
    ) {


        event.preventDefault();



        resultado.innerHTML =
            "";



        mensagem.className =
            "alert show info";


        mensagem.textContent =
            "Consultando protocolo...";



        const protocolo =
            document

                .getElementById(
                    "protocolo"
                )

                .value

                .trim()

                .toUpperCase();



        const {
            data,
            error
        } =
            await supabaseClient

                .rpc(
                    "consultar_chamado",
                    {
                        p_protocolo:
                            protocolo
                    }
                );



        if (error) {


            console.error(
                error
            );


            mensagem.className =
                "alert show error";


            mensagem.textContent =
                "Não foi possível consultar o protocolo.";


            return;

        }



        const chamado =

            Array.isArray(data)

                ? data[0]

                : data;



        if (!chamado) {


            mensagem.className =
                "alert show error";


            mensagem.textContent =
                "Protocolo não encontrado.";


            return;

        }



        const historico =
            await buscarHistorico(
                protocolo
            );



        mensagem.className =
            "alert";



        resultado.innerHTML = `


            <article
                class="
                    card
                    result-card
                "
            >


                <div class="result-top">


                    <div
                        class="result-protocol"
                    >

                        ${chamado.protocolo}

                    </div>



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


                </div>



                <div class="result-grid">


                    <div class="detail-block">


                        <strong>
                            Local
                        </strong>


                        <p>

                            ${chamado.logradouro},

                            ${chamado.numero_referencia}

                            -

                            ${chamado.bairro}

                        </p>


                    </div>



                    <div class="detail-block">


                        <strong>
                            Ocorrência
                        </strong>


                        <p>
                            ${chamado.tipo_ocorrencia}
                        </p>


                    </div>



                    <div class="detail-block">


                        <strong>
                            Data da solicitação
                        </strong>


                        <p>

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



                    <div class="detail-block">


                        <strong>
                            Retorno atual
                        </strong>


                        <p>

                            ${
                                chamado.retorno_prefeitura

                                ||

                                "Ainda não há retorno registrado."
                            }

                        </p>


                    </div>


                </div>



                <section
                    class="history-section"
                >


                    <h3>
                        Histórico do atendimento
                    </h3>


                    <div class="history-list">

                        ${
                            montarHistorico(
                                historico
                            )
                        }

                    </div>


                </section>


            </article>

        `;

    }

);