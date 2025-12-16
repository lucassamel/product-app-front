$(function () {

  const urlBase = "https://localhost:8081";

  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    var username = $("#username").val();
    var password = $("#password").val();

    $.ajax({
      url: `${urlBase}/api/Auth/login`,
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        username: username,
        password: password
      }),
      success: function (response) {
        let token = response.data.token;
        localStorage.setItem("token", token);
        window.location.href = "/products.html";
      },
      error: function (xhr) {
        alert("Erro no login");
      }
    });
  });

  /// REGISTER

  $("#cadastroForm").on("submit", function (e) {
    e.preventDefault();

    var username = $("#username").val();
    var email = $("#email").val();
    var password = $("#password").val();
    var cep = $("#cep").val();
    var logradouro = $("#logradouro").val();
    var complemento = $("#complemento").val();
    var bairro = $("#bairro").val();
    var localidade = $("#localidade").val();
    var uf = $("#uf").val();

    $.ajax({
      url: `${urlBase}/api/Auth/register`,
      method: "POST",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        username: username,
        email: email,
        password: password,
        address: {
          cep: onlyDigits(cep).slice(0, 8),
          logradouro: logradouro,
          localidade: localidade,
          complemento: complemento,
          bairro: bairro,
          uf: uf
        }
      }),
      success: function (response) {
        let token = response.data.token;
        localStorage.setItem("token", token);
        window.location.href = "/products.html";
      },
      error: function (xhr) {
        alert("Erro:", xhr.responseText);
      }
    });
  });

  // ---------- CEP: máscara + ViaCEP ----------
  const cepInput = document.getElementById("cep");
  const cepHint = document.getElementById("cepHint");

  const logradouroInput = document.getElementById("logradouro");
  const complementoInput = document.getElementById("complemento");
  const bairroInput = document.getElementById("bairro");
  const localidadeInput = document.getElementById("localidade");
  const ufSelect = document.getElementById("uf");

  let lastFetchedCep = ""; // evita buscar repetidamente o mesmo CEP

  function onlyDigits(value) {
    return value.replace(/\D/g, "");
  }

  function formatCep(value) {
    const digits = onlyDigits(value).slice(0, 8);
    if (digits.length <= 5) return digits;
    return digits.slice(0, 5) + "-" + digits.slice(5);
  }

  function setCepStatus(type, message) {
    // type: "idle" | "loading" | "ok" | "error"
    cepHint.textContent = message;

    // feedback visual simples reaproveitando o focus/visual do input
    cepInput.dataset.status = type;
    if (type === "error") {
      cepHint.style.color = "rgba(255, 120, 120, .9)";
    } else if (type === "ok") {
      cepHint.style.color = "rgba(120, 255, 170, .9)";
    } else {
      cepHint.style.color = "rgba(170,182,214,.8)";
    }
  }

  function setAddressLoading(loading) {
    const disabled = !!loading;
    logradouroInput.disabled = disabled;
    bairroInput.disabled = disabled;
    localidadeInput.disabled = disabled;
    ufSelect.disabled = disabled;
    // complemento costuma variar (apto etc), então deixo editável mesmo carregando
  }

  function clearAddressFields(keepComplemento = true) {
    logradouroInput.value = "";
    bairroInput.value = "";
    localidadeInput.value = "";
    ufSelect.value = "";
    if (!keepComplemento) complementoInput.value = "";
  }

  async function fetchAddressByCep(cepDigits) {
    // ViaCEP aceita 8 dígitos
    const url = `https://viacep.com.br/ws/${cepDigits}/json/`;

    setCepStatus("loading", "Buscando endereço pelo CEP...");
    setAddressLoading(true);

    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error("Falha ao consultar o ViaCEP.");

      const data = await res.json();
      if (data.erro) {
        clearAddressFields(true);
        setCepStatus("error", "CEP não encontrado.");
        lastFetchedCep = "";
        return;
      }

      // Preenche campos
      logradouroInput.value = data.logradouro || "";
      bairroInput.value = data.bairro || "";
      localidadeInput.value = data.localidade || "";
      ufSelect.value = data.uf || "";

      // Se o complemento vier vazio e o usuário já digitou, preserva o dele
      if (!complementoInput.value) {
        complementoInput.value = data.complemento || "";
      }

      setCepStatus("ok", "Endereço preenchido pelo ViaCEP.");
      lastFetchedCep = cepDigits;
    } catch (err) {
      setCepStatus("error", "Erro ao consultar o ViaCEP. Verifique sua conexão.");
      lastFetchedCep = "";
    } finally {
      setAddressLoading(false);
    }
  }

  // Máscara ao digitar
  cepInput.addEventListener("input", (e) => {
    const formatted = formatCep(e.target.value);
    e.target.value = formatted;

    const digits = onlyDigits(formatted);
    if (digits.length < 8) {
      setCepStatus("idle", "Formato: 00000-000");
      lastFetchedCep = "";
      // não limpa automaticamente para não atrapalhar quem quer preencher manualmente
    }

    // dispara automaticamente quando completar 8 dígitos
    if (digits.length === 8 && digits !== lastFetchedCep) {
      fetchAddressByCep(digits);
    }
  });

  // Reforço: se colar algo e sair do campo, tenta buscar
  cepInput.addEventListener("blur", () => {
    const digits = onlyDigits(cepInput.value);
    if (digits.length === 8 && digits !== lastFetchedCep) {
      fetchAddressByCep(digits);
    }
  });

  // Exemplo de submit (não envia de verdade; só evita refresh)
  document.getElementById("cadastroForm").addEventListener("submit", (e) => {
    e.preventDefault();    
  });

  // Reset: limpa status do CEP
  document.getElementById("cadastroForm").addEventListener("reset", () => {
    setTimeout(() => {
      setCepStatus("idle", "Formato: 00000-000");
      lastFetchedCep = "";
    }, 0);
  });

  /// PRODUCTS

  // Máscara para o preço
  $('#preco').mask('R$ 000.000.000,00', { reverse: true });

  // Inicializa o DataTable
  $(document).ready(function () {
    var table = $('#produtosTable').DataTable();
    getProductsList();
    // Envio do formulário
    $('#produtoForm').on('submit', function (e) {
      e.preventDefault();

      // Pega os valores do formulário
      var nome = $('#nome').val();
      var preco = $('#preco').val();
      var descricao = $('#descricao').val();
      var quantidade = $('#quantidade').val();

      // Envia os dados para a API (simulada aqui com um log)
      var produto = {
        nome: nome,
        preco: preco,
        descricao: descricao,
        quantidade: quantidade,
      };

      // Atualiza a tabela com o novo produto
      table.row.add([
        produto.nome,
        produto.preco,
        produto.descricao,
        produto.quantidade
      ]).draw();

      table.ajax.reload(null, false);
      // Limpa os campos após enviar
      $('#produtoForm')[0].reset();
    });

    getProductsList();
  });

  function setUpTable(lista, elementId, doRescue) {
    const table = document.getElementById("produtosTable");
    const tbody = table.querySelector('tbody');

    if (tbody) {
      while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
      }
    }

    let element = "#produtosTable";


    if ($.fn.DataTable.isDataTable(element)) {
      $(element).DataTable().destroy();
    }


    $(element).find("tbody").html(
      lista.map(x => `
   <tr>
    <td>${x.name}</td>
    <td>${x.description}</td>                    
    <td>${x.price}</td>
    <td>${x.count}</td>
    <td>
    <a  class='btn btn-outline-success btn-sm'   
    data-toggle="tooltip" title="Perform Rescue"
    onclick="perfomRescue(${x.id},${x.longitude},${x.latitude})">
    <i class="fa fa-play"></i>
    </a> 
    <a  class='btn btn-outline-danger btn-sm'   
    data-toggle="tooltip" title="Delete Rescue Point"
    onclick="deleteRescue(${x.id})">
    <i class="fa fa-times"></i>
    </a>      

   </td>
   </tr>`).join(""));

    $(document).ready(function () {
      $(element).DataTable();
    });

  };

  const getProductsList = async () => {

    let token = localStorage.getItem("token");

    $.ajax({
      url: `${urlBase}/api/Products`,
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      success: function (response) {
        console.log(response);
        setUpTable(response.data, "produtosTable", false);
      },
      error: function (xhr) {
        console.log("Erro:", xhr.status);
      }
    });
  };

});
