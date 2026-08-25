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



formConsulta.addEventListener(

    "submit",

    async function (event) {


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



        mensagem.className =
            "alert";


        resultado.innerHTML = `


            <article class="card result-card">


                <div class="result-top">


                    <div class="result-protocol">

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
                            Retorno da Prefeitura
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


            </article>

        `;

    }

);