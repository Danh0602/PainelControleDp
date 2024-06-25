document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('menu-suspenso').addEventListener('change', function() {
        const selectedOption = this.value;
        if (selectedOption === 'ferias') {
            fetchAndDisplayData('Férias.xlsx', 'Férias');
        } else if (selectedOption === 'salario') {
            fetchAndDisplayData('Salário.xlsx', 'Salário');
        } else {
            document.getElementById('dados').innerHTML = '<h3>Selecione uma opção para exibir os dados</h3>';
        }
    });
});

async function fetchAndDisplayData(filename, type) {
    const blobUrl = `https://htb01.blob.core.windows.net/<your-container-name>/${filename}`;
    try {
        const response = await fetch(blobUrl);
        if (!response.ok) {
            throw new Error('Erro ao buscar arquivo');
        }
        const data = await response.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        const userRE = localStorage.getItem('userRE'); // Obtém o identificador do usuário
        const userData = jsonData.find(item => item.RE === userRE);

        if (userData) {
            const formattedData = formatData(userData);
            displayData(formattedData, type);
        } else {
            alert('Dados do usuário não encontrados!');
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

function formatData(data) {
    const formattedData = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key];
            if (isDate(value)) {
                // Se for uma data válida, formata para dd/MM/yyyy
                const date = new Date(value);
                formattedData[key] = `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
            } else if (key === 'Iníc.Plan.Fér.' || key === 'Fim Plan.Fér.') {
                // Trata os campos específicos que devem exibir "Vazio" se estiverem vazios
                formattedData[key] = value || 'Vazio';
            } else if (value === null || value === undefined || value === '') {
                // Se for nulo, indefinido ou vazio, mantém como está
                formattedData[key] = value;
            } else {
                // Caso contrário, mantém o valor original
                formattedData[key] = value;
            }
        }
    }
    return formattedData;
}

function isDate(value) {
    // Função para verificar se um valor pode ser interpretado como uma data válida
    return (typeof value === 'string' && !isNaN(Date.parse(value)));
}

function displayData(data, type) {
    const dadosContainer = document.getElementById('dados');
    dadosContainer.innerHTML = `
        <h3>Dados de ${type}</h3>
        ${Object.keys(data).map(key => `<p><strong>${formatarPalavra(key)}:</strong> ${data[key]}</p>`).join('')}
    `;
}

function formatarPalavra(palavra) {
    return palavra.charAt(0).toUpperCase() + palavra.slice(1);
}
