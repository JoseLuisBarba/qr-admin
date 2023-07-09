function activarCamara(event) {
    event.preventDefault(); // Evita que el enlace redirija a una nueva página
  
    // Verificar si el navegador es compatible con getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Solicitar acceso a la cámara
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
          // La cámara está activa, puedes realizar cualquier acción que necesites aquí
          console.log("Camera on");
        })
        .catch(function(error) {
          // Ocurrió un error al intentar acceder a la cámara
          console.error("Error al activar la cámara:", error);
        });
    } else {
      console.error("El navegador no admite getUserMedia");
    }
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    const enlaceEscanearQR = document.getElementById('scanQR');
    const enlaceEscanearQRMobile = document.getElementById('scanQRMobile');
  
    enlaceEscanearQR.addEventListener('click', activarCamara);
    enlaceEscanearQRMobile.addEventListener('click', activarCamara);
  });