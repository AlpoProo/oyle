document.getElementById("convertForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  try {
    const response = await fetch("/convert", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "converted-file";
      link.click();

      document.getElementById("output").innerText = "Dönüştürme işlemi başarılı!";
    } else {
      document.getElementById("output").innerText = "Dönüştürme işlemi başarısız!";
    }
  } catch (error) {
    console.error("Hata:", error);
    document.getElementById("output").innerText = "Bir hata oluştu!";
  }
});
