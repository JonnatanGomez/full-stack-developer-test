$("#loginFrm").submit(function (e) {
  validateFrm = true;
  e.preventDefault(); // avoid to execute the actual submit of the form.
  var form = $(this);
  var url = form.attr("action");
  var dataJson = getFormData(form);

  $.ajax({
    url: "./api/user",
    type: "GET", //el método post o get del formulario
    data: {
      user: dataJson.user,
      pass: dataJson.pass,
    },
    beforeSend: function () {
      loading(true);
    },
    error: function (data) {
      console.log("error");
      console.log(data);
    },
    success: function (data) {
      console.log("success");
      html = "";
      if (data.cd != undefined && data.cd != null) {
        if (data.cd == "ok") {
          sessionStorage.setItem("user", JSON.stringify(data.qa_content));
          sessionStorage.setItem("token", data.qa_content.token);
          sessionStorage.setItem("session", true);
          window.location.replace("./main.ejs");
          loading(false);
        } else {
          $("#msjModalTitle").html("Correo o Contraseña Invalido");
          $("#msjModalSubTitle").html(
            "Verifique los datos y vuelva a intentarlo"
          );
          $("#msjModal").modal("show");
          loading(false);
        }
      }
      $("#loginFrm").reset();
    },
    complete: function (data) {},
  });
});

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
function formatDatetime(date) {
  var myDate = new Date(date);
  var dateRes =
    ("0" + myDate.getDate()).slice(-2) +
    "/" +
    ("0" + (myDate.getMonth() + 1)).slice(-2) +
    "/" +
    myDate.getFullYear() +
    " " +
    myDate.getHours() +
    ":" +
    ("0" + myDate.getMinutes()).slice(-2) +
    ":" +
    myDate.getSeconds();
  return dateRes;
}
