document.addEventListener('DOMContentLoaded', () => {
    const loginPage = document.getElementById('loginPage');
    const app = document.getElementById('app');
    const loginForm = document.getElementById('loginForm');
    const avaliacaoForm = document.getElementById('avaliacaoForm');
    const sugestaoForm = document.getElementById('sugestaoForm');
    const nomeAluno = document.getElementById('nomeAluno');
    const mensagemAvaliacao = document.getElementById('mensagemAvaliacao');
    const mensagemSugestao = document.getElementById('mensagemSugestao');
    const contadorAvaliacoes = document.getElementById('contadorAvaliacoes');
    const adminAccessPage = document.getElementById('adminAccessPage');
    const adminApp = document.getElementById('adminApp');
    const adminLoginLink = document.getElementById('adminLoginLink');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminLoginMensagem = document.getElementById('adminLoginMensagem');
    const adminLogout = document.getElementById('adminLogout');
    const adminVoltarInicio = document.getElementById('adminVoltarInicio');
    const adminTotalAvaliacoes = document.getElementById('adminTotalAvaliacoes');
    const adminTotalSugestoes = document.getElementById('adminTotalSugestoes');
    const adminEstimativa = document.getElementById('adminEstimativa');
    const adminTableBody = document.getElementById('adminTableBody');

    const STORAGE_KEY = 'merendaConsciente_respostas';
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'merenda2026';

    let totalAvaliacoes = 0;

    function carregarRespostas() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (error) {
            return [];
        }
    }

    function salvarRespostas(respostas) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(respostas));
    }

    function registrarResposta(tipo, dados) {
        const respostas = carregarRespostas();
        respostas.push({
            tipo,
            ...dados,
            dataHora: new Date().toISOString()
        });

        salvarRespostas(respostas);
        atualizarContadores();
    }

    function atualizarContadores() {
        const respostas = carregarRespostas();
        const avaliacoes = respostas.filter((item) => item.tipo === 'avaliacao');
        const sugestoes = respostas.filter((item) => item.tipo === 'sugestao');

        totalAvaliacoes = avaliacoes.length;
        contadorAvaliacoes.textContent = totalAvaliacoes;

        if (adminTotalAvaliacoes) {
            adminTotalAvaliacoes.textContent = avaliacoes.length;
        }

        if (adminTotalSugestoes) {
            adminTotalSugestoes.textContent = sugestoes.length;
        }

        if (adminEstimativa) {
            const media = avaliacoes.length
                ? avaliacoes.reduce((soma, item) => soma + Number(item.nota || 0), 0) / avaliacoes.length
                : 0;
            const percentual = Math.min(100, Math.round((media / 5) * 100));
            adminEstimativa.textContent = `${percentual}%`;
        }

        if (adminTableBody) {
            const itens = [...respostas].reverse();

            if (!itens.length) {
                adminTableBody.innerHTML = '<tr><td colspan="5" class="admin-empty">Nenhuma resposta registrada ainda.</td></tr>';
                return;
            }

            adminTableBody.innerHTML = itens.map((item) => {
                const tipoLabel = item.tipo === 'avaliacao' ? 'Avaliação' : 'Sugestão';
                const resposta = item.tipo === 'avaliacao'
                    ? `${item.nota}/5 · ${item.resto}`
                    : item.sugestao;

                return `
                    <tr>
                        <td>${tipoLabel}</td>
                        <td>${formatarData(item.dataHora)}</td>
                        <td>${item.refeicao || item.tipoRefeicao || '-'}</td>
                        <td>${resposta || '-'}</td>
                        <td>${item.estudante || 'Estudante'}</td>
                    </tr>
                `;
            }).join('');
        }
    }

    function formatarData(dataHora) {
        if (!dataHora) return '-';
        const data = new Date(dataHora);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(data);
    }

    function atualizarHashUrl(paginaId) {
        const hash = paginaId && paginaId !== 'inicio' ? `#${paginaId}` : '#inicio';
        const url = `${window.location.pathname}${hash}`;
        window.history.replaceState(null, '', url);
    }

    function mostrarPagina(paginaId) {
        const paginas = document.querySelectorAll('.pagina');
        paginas.forEach((pagina) => {
            const deveMostrar = pagina.id === paginaId;
            pagina.classList.toggle('hidden', !deveMostrar);
        });

        atualizarHashUrl(paginaId);
    }

    function voltarInicio() {
        app.classList.remove('hidden');
        loginPage.classList.add('hidden');
        adminAccessPage.classList.add('hidden');
        adminApp.classList.add('hidden');
        mostrarPagina('inicio');
        mensagemAvaliacao.style.display = 'none';
        mensagemSugestao.style.display = 'none';
    }

    function sair() {
        voltarInicio();
    }

    function mostrarMensagem(elemento, texto) {
        elemento.textContent = texto;
        elemento.style.display = 'block';
        setTimeout(() => {
            elemento.style.display = 'none';
        }, 2600);
    }

    function inicializarGrafico() {
        const grafico = document.getElementById('graficoDesperdicio');

        if (!grafico || typeof Chart === 'undefined') {
            return;
        }

        new Chart(grafico, {
            type: 'bar',
            data: {
                labels: ['Legumes', 'Frutas', 'Proteínas', 'Grãos', 'Laticínios'],
                datasets: [{
                    label: 'Kg desperdiçados',
                    data: [6.5, 4.2, 8.1, 9.4, 5.7],
                    backgroundColor: ['#ff4f91', '#687442', '#ffc2d9', '#c9d88d', '#f7b4ce'],
                    borderRadius: 10,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `${value} kg`
                        }
                    }
                }
            }
        });
    }

    function abrirPainelAdmin() {
        loginPage.classList.add('hidden');
        app.classList.add('hidden');
        adminAccessPage.classList.remove('hidden');
        adminApp.classList.add('hidden');
        window.history.replaceState(null, '', `${window.location.pathname}#admin`);
    }

    function abrirDashboardAdmin() {
        adminAccessPage.classList.add('hidden');
        adminApp.classList.remove('hidden');
        atualizarContadores();
        window.history.replaceState(null, '', `${window.location.pathname}#admin`);
    }

    function fazerLoginAdmin(event) {
        event.preventDefault();

        const usuario = document.getElementById('adminUser').value.trim();
        const senha = document.getElementById('adminPassword').value.trim();

        if (usuario === ADMIN_USER && senha === ADMIN_PASS) {
            sessionStorage.setItem('adminAutenticado', 'true');
            abrirDashboardAdmin();
            adminLoginForm.reset();
            return;
        }

        adminLoginMensagem.textContent = 'Usuário ou senha incorretos.';
        adminLoginMensagem.style.display = 'block';
    }

    function logoutAdmin() {
        sessionStorage.removeItem('adminAutenticado');
        adminApp.classList.add('hidden');
        adminAccessPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
        window.history.replaceState(null, '', window.location.pathname);
    }

    function voltarParaInicioDoSite() {
        sessionStorage.removeItem('adminAutenticado');
        adminApp.classList.add('hidden');
        adminAccessPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
        app.classList.add('hidden');
        window.history.replaceState(null, '', window.location.pathname);
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const turma = document.getElementById('turma').value;
        const turno = document.getElementById('turno').value;

        if (!nome || !turma || !turno) {
            return;
        }

        nomeAluno.textContent = nome;
        app.classList.remove('hidden');
        loginPage.classList.add('hidden');
        mostrarPagina('inicio');
    });

    avaliacaoForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const data = document.getElementById('data').value;
        const refeicao = document.getElementById('refeicao').value;
        const nota = document.querySelector('input[name="nota"]:checked');
        const resto = document.querySelector('input[name="resto"]:checked');

        if (!data || !refeicao || !nota || !resto) {
            mostrarMensagem(mensagemAvaliacao, 'Preencha todos os campos da avaliação.');
            return;
        }

        const estudante = document.getElementById('nome')?.value.trim() || 'Estudante';

        registrarResposta('avaliacao', {
            estudante,
            data,
            refeicao,
            nota: nota.value,
            resto: resto.value,
            comentario: document.getElementById('comentario').value.trim()
        });

        mostrarMensagem(
            mensagemAvaliacao,
            `Obrigado! Sua avaliação sobre ${refeicao.toLowerCase()} foi registrada.`
        );

        avaliacaoForm.reset();
    });

    sugestaoForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const tipoRefeicao = document.getElementById('tipoRefeicao').value;
        const sugestao = document.getElementById('sugestao').value.trim();
        const motivo = document.getElementById('motivo').value.trim();

        if (!tipoRefeicao || !sugestao) {
            mostrarMensagem(mensagemSugestao, 'Preencha o tipo de refeição e a sugestão.');
            return;
        }

        const estudante = document.getElementById('nome')?.value.trim() || 'Estudante';

        registrarResposta('sugestao', {
            estudante,
            tipoRefeicao,
            sugestao,
            motivo
        });

        mostrarMensagem(
            mensagemSugestao,
            `Sugestão enviada com sucesso para ${tipoRefeicao.toLowerCase()}!`
        );

        sugestaoForm.reset();
    });

    adminLoginLink.addEventListener('click', () => {
        if (sessionStorage.getItem('adminAutenticado') === 'true') {
            abrirDashboardAdmin();
            return;
        }

        abrirPainelAdmin();
    });

    adminLoginForm.addEventListener('submit', fazerLoginAdmin);
    adminLogout.addEventListener('click', logoutAdmin);
    adminVoltarInicio.addEventListener('click', voltarParaInicioDoSite);

    window.mostrarPagina = mostrarPagina;
    window.voltarInicio = voltarInicio;
    window.sair = sair;

    const hash = window.location.hash.replace('#', '');
    const paginasValidas = ['inicio', 'avaliacao', 'sugestoes'];

    if (sessionStorage.getItem('adminAutenticado') === 'true') {
        abrirDashboardAdmin();
    } else if (hash === 'admin') {
        abrirPainelAdmin();
    } else if (paginasValidas.includes(hash)) {
        loginPage.classList.add('hidden');
        app.classList.remove('hidden');
        mostrarPagina(hash);
    } else {
        loginPage.classList.remove('hidden');
        app.classList.add('hidden');
        window.history.replaceState(null, '', `${window.location.pathname}#inicio`);
    }

    atualizarContadores();
    inicializarGrafico();
});
