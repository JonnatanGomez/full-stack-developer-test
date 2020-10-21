var habilitis = [];
function getHabiliti() {
  $.ajax({
    url: "./api/withskill",
    type: "GET", //el método post o get del formulario
    data: {
      term: $("#inpHabili").val(),
    },
    beforeSend: function () {
      var htmlLoading =
        '<div class="col" style="text-align: center;">' +
        '<img src="./views/images/loading1.gif" width="350px">' +
        "</div>";
      $("#resHabili").html(htmlLoading);
    },
    error: function (data) {
      console.log("error");
      console.log(data);
    },
    success: function (data) {
      console.log("success");
      html = "";
      if (data != undefined && data != null) {
        for (var i = 0; i < data.length; i++) {
          var habilidades = data[i];
          html +=
            '<div class="row" style="max-width: 100%;font-size: 25px;cursor: pointer;" ' +
            "onclick=\"addHabilidad('" +
            habilidades._id +
            "','" +
            habilidades.nombre +
            "')\">" +
            '<div class="col">' +
            '<font class="azulClaro arial bold">' +
            habilidades.nombre +
            "</font>" +
            "</div>" +
            "</div>" +
            '<hr class="bkAzulClaro">';
        }
      }
      $("#resHabili").html(html);
    },
  });
}
function delHabili(id) {
  $("#" + id).remove();
  habilitis.remove(id);
}
function addHabilidad(id, nombre) {
  var html = "";
  html =
    '<div style="cursor:pointer;" class="bkWhite arial bold azul tarjeta" id="' +
    id +
    '">' +
    "<font onclick=\"delHabili('" +
    id +
    "')\">" +
    nombre +
    ' <i class="fa fa-minus-circle"></i>' +
    "</font>" +
    "</div>";
  $("#selHabili").append(html);
  habilitis.push(id);
}

var categorias = [];
var categoriasIds = [];
function getCategorias() {
  $.ajax({
    url: "./api/categoria?pais=" + idPais + "",
    type: "GET", //el método post o get del formulario
    headers: {
      token: "171e5e7d7569bdf63bbd11ee00199c82",
    },
    beforeSend: function () {},
    error: function (data) {
      console.log("error");
      console.log(data);
    },
    success: function (data) {
      console.log("success");
      html = "";
      jsCode = "";
      if (data.qa_content != undefined && data.qa_content != null) {
        for (var i = 0; i < data.qa_content.length; i++) {
          var categoria = data.qa_content[i];
          html +=
            '<div id="' +
            categoria.id +
            '" class="divStar col-4" style="color:white;background: #2371ab;padding: 10px;text-align: center;border: 1px solid white;">' +
            "<label>" +
            categoria.nombre +
            "</label><br>" +
            '<div id="stars' +
            categoria.id +
            '" style="display:none">' +
            '<i id="1-' +
            categoria.id +
            '" class="fa fa-star stars icoStar" aria-hidden="true" style="color: white;cursor:pointer;"></i>' +
            '<i id="2-' +
            categoria.id +
            '" class="fa fa-star stars icoStar" aria-hidden="true" style="color: white;cursor:pointer;"></i>' +
            '<i id="3-' +
            categoria.id +
            '" class="fa fa-star stars icoStar" aria-hidden="true" style="color: white;cursor:pointer;"></i>' +
            '<i id="4-' +
            categoria.id +
            '"  class="fa fa-star stars icoStar" aria-hidden="true" style="color: white;cursor:pointer;"></i>' +
            '<i id="5-' +
            categoria.id +
            '" class="fa fa-star stars icoStar" aria-hidden="true" style="color: white;cursor:pointer;"></i>' +
            "</div>" +
            "</div>";
        }
      }

      $("#categories").html(html);

      $(".divStar").hover(
        function () {
          // $(this).attr('style', 'color:#2371ab; background: white;padding: 10px;text-align: center;border: 1px solid white;');
          var id = $(this).attr("id");

          if (categoriasIds.includes(id)) return true;

          $("#stars" + id).show();
        },
        function () {
          // $(this).attr('style', 'color:white;background: #2371ab;padding: 10px;text-align: center;border: 1px solid white;');
          var id = $(this).attr("id");

          if (categoriasIds.includes(id)) return true;

          $("#stars" + id).hide();
        }
      );

      $(".icoStar").hover(
        function () {
          var numId = $(this).attr("id");
          var numStar = numId.split("-")[0];
          var idStar = numId.split("-")[1];

          if (categoriasIds.includes(idStar)) return true;

          $(this).attr("style", "color: yellow;cursor:pointer;");
          for (var i = numStar; i > 0; i--)
            $("#" + i + "-" + idStar).attr(
              "style",
              "color: yellow;cursor:pointer;"
            );
        },
        function () {
          var numId = $(this).attr("id");
          var numStar = numId.split("-")[0];
          var idStar = numId.split("-")[1];

          if (categoriasIds.includes(idStar)) return true;

          $(this).attr("style", "color: white;cursor:pointer;");
          for (var i = numStar; i > 0; i--)
            $("#" + i + "-" + idStar).attr(
              "style",
              "color: white;cursor:pointer;"
            );
        }
      );

      $(".icoStar").click(function () {
        var numId = $(this).attr("id");
        var numStar = numId.split("-")[0];
        var idStar = numId.split("-")[1];

        if (categoriasIds.includes(idStar)) return true;

        if (categoriasIds.length >= 3) {
          $("#msjModalTitle").html("Limite de categorias");
          $("#msjModalSubTitle").html(
            "Solamente puede seleccionar un máximo de 3 categorias"
          );
          $("#msjModal").modal("show");
          return true;
        }

        categorias.push({ idCate: idStar, star: numStar });
        categoriasIds.push(idStar);
        $("#stars" + idStar).show();

        $(this).attr("style", "color: yellow;cursor:pointer;");
        for (var i = numStar; i > 0; i--)
          $("#" + i + "-" + idStar).attr(
            "style",
            "color: yellow;cursor:pointer;"
          );
      });
    },
  });
}

function clearCates() {
  console.log(categoriasIds);
  console.log(categorias);

  categorias.forEach(function (row) {
    var numStar = row.star;
    var idStar = row.idCate;

    $("#stars" + idStar).hide();
    for (var i = numStar; i > 0; i--)
      $("#" + i + "-" + idStar).attr("style", "color: white;cursor:pointer;");
  });

  categorias = [];
  categoriasIds = [];
}

function getMonedas(idSelect, callback, load) {
  $.ajax({
    url: "./api/moneda",
    type: "GET", //el método post o get del formulario
    data: {
      pais: paisGlb,
    },
    beforeSend: function () {
      if (load !== null) {
        loading(true);
      }
    },
    error: function (data) {
      console.log("error");
      console.log(data);
    },
    success: function (data) {
      console.log("success");
      html = "";
      if (data.qa_content != undefined && data.qa_content != null) {
        html += '<option  value="" disabled selected>Moneda</option>';
        for (var i = 0; i < data.qa_content.length; i++) {
          var moneda = data.qa_content[i];
          html +=
            '<option value="' +
            moneda.id_moneda +
            '">' +
            moneda.moneda +
            "</option>";
        }
      }
      $(idSelect).html(html);
    },
    complete: function () {
      if (callback !== null && callback !== undefined) {
        callback();
      }
      if (load !== null) {
        loading(false);
      }
    },
  });
}
function getDepartamentos(idSelect, callback, load) {
  $.ajax({
    url: "./api/departamento",
    type: "GET", //el método post o get del formulario
    data: {
      pais: paisGlb,
    },
    beforeSend: function () {
      if (load !== null) {
        loading(true);
      }
    },
    error: function (data) {
      console.log("error");
      console.log(data);
    },
    success: function (data) {
      console.log("success");
      html = "";
      if (data.qa_content != undefined && data.qa_content != null) {
        html += '<option  value="" disabled selected>Departamentos</option>';
        for (var i = 0; i < data.qa_content.length; i++) {
          var departamento = data.qa_content[i];
          html +=
            '<option value="' +
            departamento.id +
            '">' +
            departamento.nombre +
            "</option>";
        }
      }
      $(idSelect).html(html);
    },
    complete: function () {
      if (callback !== null) {
        callback();
      }
      if (load) {
        loading(false);
      }
    },
  });
}
function getMunicipio(idDepart, idSelect, callback, load) {
  $.ajax({
    url: "./api/municipio",
    type: "GET", //el método post o get del formulario
    data: {
      pais: paisGlb,
      idDepartamento: idDepart,
    },
    beforeSend: function () {
      if (load !== null) {
        loading(true);
      }
    },
    error: function (data) {
      console.log("error");
      console.log(data);
    },
    success: function (data) {
      console.log("success");
      html = "";
      if (data.qa_content != undefined && data.qa_content != null) {
        html += '<option  value="" disabled selected>Municipio</option>';
        for (var i = 0; i < data.qa_content.length; i++) {
          var municipio = data.qa_content[i];
          html +=
            '<option value="' +
            municipio.id +
            '">' +
            municipio.nombre +
            "</option>";
        }
      }
      $(idSelect).html(html);
    },
    complete: function () {
      if (callback !== null && callback !== undefined) {
        callback();
      }
      if (load !== null) {
        loading(false);
      }
    },
  });
}
function valEmail(email) {
  $.ajax({
    url: "./api/validatemail_v02/",
    type: "GET", //el método post o get del formulario
    data: {
      email: email,
      pais: idPais,
    },
    beforeSend: function () {},
    error: function (data) {
      console.log("error");
      console.log(data);
    },
    success: function (data) {
      console.log("valEmail");
      html = "";
      if (data.qa_content.email != undefined && data.qa_content.email != null) {
        $("#msjModalTitle").html("Email Invalido");
        $("#msjModalSubTitle").html("El email ya esta utilizado");
        $("#msjModal").modal("show");
        $("#correo").val("");
        validateFrm = false;
      } else {
        validateFrm = true;
      }
    },
  });
}
function valIdentificacion(dpiVal) {
  $.ajax({
    url: "./api/get-dpi/",
    type: "GET", //el método post o get del formulario
    data: {
      pais: idPais,
      dpi: dpiVal,
    },
    beforeSend: function () {},
    error: function (data) {
      console.log("error");
      console.log(data);
    },
    success: function (data) {
      console.log("valDpi");
      if (data.cd == "ok") {
        $("#msjModalTitle").html("DPI Invalido");
        $("#msjModalSubTitle").html("El dpi ya esta utilizado");
        $("#msjModal").modal("show");
        $("#correo").val("");
        validateFrm = false;
        $("#identificacion").val("");
        $("#identificacion").focus();
      } else {
        validateFrm = true;
      }
    },
  });
}
function getIdiomas(idSelect, callback, load) {
  $.ajax({
    url: "./api/idioma",
    type: "GET", //el método post o get del formulario
    data: {
      pais: paisGlb,
    },
    beforeSend: function () {
      if (load !== null) {
        loading(true);
      }
    },
    error: function (data) {
      console.log("error");
      console.log(data);
    },
    success: function (data) {
      console.log("success");
      html = "";
      if (data.qa_content != undefined && data.qa_content != null) {
        html += '<option  value="" disabled selected>Idioma</option>';
        for (var i = 0; i < data.qa_content.length; i++) {
          var row = data.qa_content[i];
          html +=
            '<option value="' +
            row.id_idioma +
            '">' +
            row.nombre_idioma +
            "</option>";
        }
      }
      $(idSelect).html(html);
    },
    complete: function () {
      if (callback !== null && callback !== undefined) {
        callback();
      }
      if (load !== null) {
        loading(false);
      }
    },
  });
}

function getIdiomasNivel(idSelect, callback, load) {
  $.ajax({
    url: "./api/nivelidioma",
    type: "GET", //el método post o get del formulario
    data: {
      pais: paisGlb,
    },
    beforeSend: function () {
      if (load !== null) {
        loading(true);
      }
    },
    error: function (data) {
      console.log("error");
      console.log(data);
    },
    success: function (data) {
      console.log("success");

      html = "";
      if (data.qa_content != undefined && data.qa_content != null) {
        html += '<option  value="" disabled selected>Nivel</option>';
        for (var i = 0; i < data.qa_content.length; i++) {
          var row = data.qa_content[i];
          html += '<option value="' + row.id + '">' + row.des + "</option>";
        }
      }
      $(idSelect).html(html);
    },
    complete: function () {
      if (callback !== null && callback !== undefined) {
        callback();
      }
      if (load !== null) {
        loading(false);
      }
    },
  });
}

function getDiscapacidades(idSelect, callback, load) {
  $.ajax({
    url: "./api/discapacidad",
    type: "GET", //el método post o get del formulario
    data: {
      pais: paisGlb,
    },
    beforeSend: function () {
      if (load !== null) {
        loading(true);
      }
    },
    error: function (data) {
      console.log("error");
      console.log(data);
    },
    success: function (data) {
      console.log("success");

      html = "";
      if (data.qa_content != undefined && data.qa_content != null) {
        html += '<option  value="" disabled selected>Discapacidad</option>';
        for (var i = 0; i < data.qa_content.length; i++) {
          var row = data.qa_content[i];
          html +=
            '<option value="' +
            row.id_discapacidad +
            '">' +
            row.nombre +
            "</option>";
        }
      }
      $(idSelect).html(html);
    },
    complete: function () {
      if (callback !== null && callback !== undefined) {
        callback();
      }
      if (load !== null) {
        loading(false);
      }
    },
  });
}

function goToLogin() {
  window.location.replace("./login.ejs");
}

//TOOLS
function getFormData($form) {
  var unindexed_array = $form.serializeArray();
  var indexed_array = {};

  $.map(unindexed_array, function (n, i) {
    indexed_array[n["name"]] = n["value"];
  });

  return indexed_array;
}
function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}
