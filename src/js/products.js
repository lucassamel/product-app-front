$(function () {

  const urlBase = "https://localhost:8081";

  // Máscara para o preço
  $('#preco').mask('R$ 000.000.000,00', { reverse: true });

  // Inicializa o DataTable
  $(document).ready(function () {
    var table = $('#produtosTable').DataTable();
    getProductsList();

    // Envio do formulário
    $('.cadastrarBtn').on('click', function (e) {
      e.preventDefault();

      newProduct();
    });


  });

  function brToDecimal(valor) {
  if (valor === null || valor === undefined) return 0;

  return Number(
    valor
      .toString()
      .trim()
      .replace(/\./g, "") // remove separador de milhar
      .replace(",", ".")  // troca vírgula por ponto
  );
}


  function setUpTable(lista) {
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
    <a  class='btn btn-outline-success btn-sm btnEditar'   
    data-toggle="tooltip" title="Perform Rescue"
    data-id='${x.id}'>
    <i class="fa fa-pen"></i>
    </a> 
    <a  class='btn btn-outline-danger btn-sm btnExcluir'   
    data-toggle="tooltip" title="Delete Rescue Point"
    data-id='${x.id}'>
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
        alert("Erro:", xhr.status);
      }
    });
  };

  const newProduct = async () => {

    var name = $('#nome').val();
    var price = $('#preco').val();
    var description = $('#descricao').val();
    var count = $('#quantidade').val();

    let token = localStorage.getItem("token");
    $.ajax({
      url: `${urlBase}/api/Products`,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        name: name,
        price: brToDecimal(price),
        description: description,
        count: parseInt(count)
      }),
      success: function (response) {

        getProductsList();

      },
      error: function (xhr) {
        alert("Erro:", xhr.responseText);
      }
    });
  };

  $("body").on("click", ".btnExcluir", (e) => {
    var id = $(e.currentTarget).data("id");
    deleteProduct(id);
  });

  function deleteProduct(guid) {

    let token = localStorage.getItem("token");

    $.ajax({
      url: `${urlBase}/api/Products/${guid}`,
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        getProductsList();
      },
      error: function (xhr) {
        console.log("Erro:", xhr.responseText);
      }
    });
  };

  $("body").on("click", ".btnEditar", (e) => {
    var id = $(e.currentTarget).data("id");
    getProduct(id);
  });

  function getProduct(guid) {

    let token = localStorage.getItem("token");

    $.ajax({
      url: `${urlBase}/api/Products/${guid}`,
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        console.log(response);
        $('#nome').val(response.data.name);
        $('#preco').val(response.data.price);
        $('#descricao').val(response.data.description);
        $('#quantidade').val(response.data.count);

        $(".cadastrarBtn").addClass("hidden");
        $(".editarBtn").removeClass("hidden");
        $(".editarBtn").data("id", guid);
      },
      error: function (xhr) {
        alert("Erro:", xhr.responseText);
      }
    });
  };

  $("body").on("click", ".editarBtn", (e) => {
    var id = $(e.currentTarget).data("id");

    var name = $('#nome').val();
    var price = $('#preco').val();
    var description = $('#descricao').val();
    var count = $('#quantidade').val();

    let token = localStorage.getItem("token");
    $.ajax({
      url: `${urlBase}/api/Products/${id}`,
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        name: name,
        price: brToDecimal(price),
        description: description,
        count: parseInt(count)
      }),
      success: function (response) {
        $(".cadastrarBtn").removeClass("hidden");
        $(".editarBtn").addClass("hidden");       

      },
      error: function (xhr) {
        alert("Erro:", xhr.responseText);
      }
    });

  });

});
