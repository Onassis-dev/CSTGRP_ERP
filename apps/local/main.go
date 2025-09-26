package main

import (
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

var tempDir string
var port = "55000" // puedes cambiarlo con variable de entorno

func main() {
	// Configurar carpeta temporal según SO
	if runtime.GOOS == "windows" {
		tempDir = "C:\\TempLabelOpener"
	} else {
		tempDir = "/tmp/label_opener"
	}

	if err := os.MkdirAll(tempDir, os.ModePerm); err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/open", handleOpen)

	fmt.Printf("Servidor corriendo en https://127.0.0.1:%s\n", port)

	// Configurar HTTPS con certificado autofirmado
	certFile := "cert.pem"
	keyFile := "key.pem"

	// Crear certificados autofirmados si no existen
	if _, err := os.Stat(certFile); os.IsNotExist(err) {
		err := generateSelfSignedCert(certFile, keyFile)
		if err != nil {
			log.Fatal("No se pudo generar certificado:", err)
		}
	}

	server := &http.Server{
		Addr: fmt.Sprintf("127.0.0.1:%s", port),
		TLSConfig: &tls.Config{
			MinVersion: tls.VersionTLS12,
		},
	}

	log.Fatal(server.ListenAndServeTLS(certFile, keyFile))
}

func handleOpen(w http.ResponseWriter, r *http.Request) {
	// --- CORS ---
	w.Header().Set("Access-Control-Allow-Origin", "*") // o tu frontend https://localhost:5173
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Preflight
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Solo POST permitido", http.StatusMethodNotAllowed)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Archivo no recibido", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := filepath.Ext(header.Filename)
	if ext != ".png" && ext != ".jpg" && ext != ".jpeg" {
		http.Error(w, "Tipo de archivo no permitido", http.StatusBadRequest)
		return
	}

	savePath := filepath.Join(tempDir, header.Filename)
	out, err := os.Create(savePath)
	if err != nil {
		http.Error(w, "Error guardando archivo", http.StatusInternalServerError)
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		http.Error(w, "Error guardando archivo", http.StatusInternalServerError)
		return
	}

	// Abrir archivo
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("cmd", "/c", "start", "", savePath)
	} else {
		cmd = exec.Command("xdg-open", savePath)
	}

	if err := cmd.Start(); err != nil {
		http.Error(w, "Error abriendo archivo", http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"status":"ok"}`))
}

// --- Generar certificado autofirmado ---
func generateSelfSignedCert(certFile, keyFile string) error {
	cmd := exec.Command("openssl", "req",
		"-x509",
		"-newkey", "rsa:2048",
		"-nodes",
		"-keyout", keyFile,
		"-out", certFile,
		"-days", "36500",
		"-subj", "/CN=localhost")
	return cmd.Run()
}
