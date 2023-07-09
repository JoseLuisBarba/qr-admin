
M.Sidenav.init(document.querySelector('.sidenav'));

CKEDITOR.replace('body', {
    plugins: 'wysiwygarea, toolbar, basicstyles, link'
});



document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems, options);
});


// Or with jQuery

$(document).ready(function(){
    $('.sidenav').sidenav();
});


// calendar - add 
$(document).ready(function(){
        $('.datepicker').datepicker();
    });


// select type 
$(document).ready(function(){
    $('select').formSelect();
});


// carusel
$(document).ready(function(){
    $('.carousel').carousel();
});


// sidenav
$(document).ready(function(){
    $('.sidenav').sidenav();
});


// parallax
$(document).ready(function(){
    $('.parallax').parallax();
});

// collapsible
$(document).ready(function(){
    $('.collapsible').collapsible();
});

// tooltip
$(document).ready(function(){
    $('.tooltipped').tooltip();
});
    
var serieInput = document.querySelector("#filter_row input[placeholder='Filtrar serie']");
var fechaCompraInput = document.querySelector("#filter_row input[placeholder='Filtrar Fecha de compra']");
var fechaRegistroInput = document.querySelector("#filter_row input[placeholder='Filtrar fecha de registro']");
var tipoInput = document.querySelector("#filter_row input[placeholder='Filtrar tipo']");
var marcaInput = document.querySelector("#filter_row input[placeholder='Filtrar marca']");
var colorInput = document.querySelector("#filter_row input[placeholder='Filtrar color']");
var modeloInput = document.querySelector("#filter_row input[placeholder='Filtrar modelo']");
var accionInput = document.querySelector("#filter_row input[placeholder='Filtrar acción']");

// Agregar eventos de escucha para los campos de filtro
serieInput.addEventListener('input', filterTable);
fechaCompraInput.addEventListener('input', filterTable);
fechaRegistroInput.addEventListener('input', filterTable);
tipoInput.addEventListener('input', filterTable);
marcaInput.addEventListener('input', filterTable);
colorInput.addEventListener('input', filterTable);
modeloInput.addEventListener('input', filterTable);
accionInput.addEventListener('input', filterTable);

// Función para filtrar la tabla
function filterTable() {
    var filterSerie = serieInput.value.toUpperCase();
    var filterFechaCompra = fechaCompraInput.value.toUpperCase();
    var filterFechaRegistro = fechaRegistroInput.value.toUpperCase();
    var filterTipo = tipoInput.value.toUpperCase();
    var filterMarca = marcaInput.value.toUpperCase();
    var filterColor = colorInput.value.toUpperCase();
    var filterModelo = modeloInput.value.toUpperCase();
    var filterAccion = accionInput.value.toUpperCase();

    var table = document.getElementById("devices_table");
    var tbody = table.getElementsByTagName("tbody")[0];
    var rows = tbody.getElementsByTagName("tr");

    for (var i = 0; i < rows.length; i++) {
        var serie = rows[i].getElementsByTagName("td")[0].textContent.toUpperCase();
        var fechaCompra = rows[i].getElementsByTagName("td")[1].textContent.toUpperCase();
        var fechaRegistro = rows[i].getElementsByTagName("td")[2].textContent.toUpperCase();
        var tipo = rows[i].getElementsByTagName("td")[3].textContent.toUpperCase();
        var marca = rows[i].getElementsByTagName("td")[4].textContent.toUpperCase();
        var color = rows[i].getElementsByTagName("td")[5].textContent.toUpperCase();
        var modelo = rows[i].getElementsByTagName("td")[6].textContent.toUpperCase();
        var accion = rows[i].getElementsByTagName("td")[7].textContent.toUpperCase();

        if (serie.indexOf(filterSerie) > -1 &&
            fechaCompra.indexOf(filterFechaCompra) > -1 &&
            fechaRegistro.indexOf(filterFechaRegistro) > -1 &&
            tipo.indexOf(filterTipo) > -1 &&
            marca.indexOf(filterMarca) > -1 &&
            color.indexOf(filterColor) > -1 &&
            modelo.indexOf(filterModelo) > -1 &&
            accion.indexOf(filterAccion) > -1) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}



// Modal Trigger 
$(document).ready(function(){
    $('.modal').modal();
});
$(document).ready(function(){
    $('.materialboxed').materialbox();
});
$(document).ready(function(){
    $('.slider').slider();
});
$(document).ready(function(){
    $('.materialboxed').materialbox();
});
     



