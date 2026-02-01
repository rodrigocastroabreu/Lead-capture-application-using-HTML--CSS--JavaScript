// Configurações do Supabase
const SUPABASE_URL = 'https://dtjlkofyeeueitxpwsqe.supabase.co';
const SUPABASE_API_KEY = 'sb_publishable_s2VPtFf57E-rQBo2wgCHpQ_1EX7_l3_';
const TABLE_NAME = 'Leads';

// Elementos do DOM
const leadsForm = document.getElementById('leadsForm');
const nomeInput = document.getElementById('nome');
const dddInput = document.getElementById('ddd');
const telefoneInput = document.getElementById('telefone');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Elementos de erro
const nomeError = document.getElementById('nomeError');
const dddError = document.getElementById('dddError');
const telefoneError = document.getElementById('telefoneError');

// Event Listeners
leadsForm.addEventListener('submit', handleFormSubmit);

// Validação em tempo real
nomeInput.addEventListener('blur', validateNome);
dddInput.addEventListener('blur', validateDDD);
dddInput.addEventListener('input', formatDDD);
telefoneInput.addEventListener('blur', validateTelefone);
telefoneInput.addEventListener('input', formatTelefone);

/**
 * Formata o input de DDD para aceitar apenas números
 */
function formatDDD(e) {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
}

/**
 * Formata o input de telefone para o padrão 99999-9999
 */
function formatTelefone(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 5) {
        e.target.value = value;
    } else if (value.length <= 9) {
        e.target.value = value.slice(0, 5) + '-' + value.slice(5);
    } else {
        e.target.value = value.slice(0, 5) + '-' + value.slice(5, 9);
    }
}

/**
 * Valida o campo nome
 */
function validateNome() {
    const value = nomeInput.value.trim();
    
    if (!value) {
        nomeError.textContent = 'Nome é obrigatório';
        nomeInput.classList.add('error');
        return false;
    }
    
    if (value.length < 3) {
        nomeError.textContent = 'Nome deve ter pelo menos 3 caracteres';
        nomeInput.classList.add('error');
        return false;
    }
    
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
        nomeError.textContent = 'Nome deve conter apenas letras';
        nomeInput.classList.add('error');
        return false;
    }
    
    nomeError.textContent = '';
    nomeInput.classList.remove('error');
    return true;
}

/**
 * Valida o campo DDD
 */
function validateDDD() {
    const value = dddInput.value.trim();
    
    if (!value) {
        dddError.textContent = 'DDD é obrigatório';
        dddInput.classList.add('error');
        return false;
    }
    
    if (!/^\d{2}$/.test(value)) {
        dddError.textContent = 'DDD deve ter exatamente 2 dígitos';
        dddInput.classList.add('error');
        return false;
    }
    
    dddError.textContent = '';
    dddInput.classList.remove('error');
    return true;
}

/**
 * Valida o campo telefone
 */
function validateTelefone() {
    const value = telefoneInput.value.replace(/\D/g, '');
    
    if (!value) {
        telefoneError.textContent = 'Telefone é obrigatório';
        telefoneInput.classList.add('error');
        return false;
    }
    
    if (!/^\d{8,9}$/.test(value)) {
        telefoneError.textContent = 'Telefone deve ter 8 ou 9 dígitos';
        telefoneInput.classList.add('error');
        return false;
    }
    
    telefoneError.textContent = '';
    telefoneInput.classList.remove('error');
    return true;
}

/**
 * Valida todo o formulário
 */
function validateForm() {
    return validateNome() && validateDDD() && validateTelefone();
}

/**
 * Limpa as mensagens de sucesso e erro
 */
function clearMessages() {
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
}

/**
 * Exibe mensagem de sucesso
 */
function showSuccessMessage() {
    clearMessages();
    successMessage.style.display = 'flex';
    setTimeout(() => {
        clearMessages();
        leadsForm.reset();
    }, 3000);
}

/**
 * Exibe mensagem de erro
 */
function showErrorMessage(message) {
    clearMessages();
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    setTimeout(() => {
        clearMessages();
    }, 5000);
}

/**
 * Envia os dados para o Supabase via API REST
 */
async function sendToSupabase(data) {
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/${TABLE_NAME}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_API_KEY,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(data)
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || 
                errorData.error_description || 
                `Erro ao enviar dados (${response.status})`
            );
        }
        
        return true;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar';
    }
}

/**
 * Trata o envio do formulário
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    clearMessages();
    
    // Valida o formulário
    if (!validateForm()) {
        showErrorMessage('Por favor, preencha todos os campos corretamente');
        return;
    }
    
    // Prepara os dados
    const nome = nomeInput.value.trim();
    const ddd = dddInput.value.trim();
    const numeroTelefone = telefoneInput.value.replace(/\D/g, '');
    const telefoneCompleto = `(${ddd}) ${numeroTelefone.slice(0, 5)}-${numeroTelefone.slice(5)}`;
    
    const data = {
        nome: nome,
        telefone: telefoneCompleto
    };
    
    try {
        await sendToSupabase(data);
        showSuccessMessage();
    } catch (error) {
        showErrorMessage(
            error.message || 
            'Ocorreu um erro ao cadastrar o lead. Tente novamente.'
        );
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicação de Captura de Leads carregada');
});
