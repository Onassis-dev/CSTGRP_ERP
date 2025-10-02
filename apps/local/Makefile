# Nombres de los ejecutables
EXE_WIN=cst-helper.exe
EXE_LINUX=cst-helper

# Carpeta de salida
BUILD=dist

# Version opcional
VERSION=1.0.0

# Crear carpeta de build
setup:
	@mkdir -p $(BUILD)

# Compilar para Windows x64
build-windows: setup
	GOOS=windows GOARCH=amd64 go build -ldflags="-s -w -H=windowsgui" -o $(BUILD)/$(EXE_WIN) main.go
	@echo "¡Windows .exe listo en $(BUILD)/$(EXE_WIN)!"

# Compilar para Linux x64
build-linux: setup
	GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o $(BUILD)/$(EXE_LINUX) main.go
	@echo "¡Linux binario listo en $(BUILD)/$(EXE_LINUX)!"

# Compilar ambos
build: build-windows build-linux

# Limpiar carpeta de build
clean:
	rm -rf $(BUILD)
	@echo "Carpeta $(BUILD) limpiada"

# Target por defecto
all: build
