if (window.location.href === "https://lavitoria.com.br/projetos-lv/") {
    document.addEventListener("DOMContentLoaded", function () {
        let canvas = new fabric.Canvas('logo-canvas', {
            width: window.innerWidth * 0.7,
            height: window.innerHeight,
            backgroundColor: "transparent"
        });

        let uploadInput = document.getElementById('logo-upload');

        function ajustarCanvas() {
            let canvasElement = document.getElementById('logo-canvas');
            let containerElement = document.getElementById('produto-imagem-container');
            let containerRect = containerElement.getBoundingClientRect();

            canvasElement.width = containerRect.width;
            canvasElement.height = containerRect.height;
            canvas.setWidth(containerRect.width);
            canvas.setHeight(containerRect.height);
            canvas.renderAll();

            // Reaplica a imagem de fundo ajustando ao novo tamanho
            if (canvas.backgroundImage && canvas.backgroundImage.getSrc) {
                setBackgroundImage(canvas.backgroundImage.getSrc());
            }

        }

        window.addEventListener('resize', ajustarCanvas);
        ajustarCanvas();

        uploadInput.addEventListener('change', function (e) {
            let files = e.target.files;

            if (files.length > 5) {
                alert("Você pode enviar no máximo 5 imagens.");
                return;
            }

            for (let i = 0; i < files.length; i++) {
                let reader = new FileReader();
                reader.onload = function (event) {
                    fabric.Image.fromURL(event.target.result, function (img) {
                        img.set({
                            left: canvas.width / 2,
                            top: canvas.height / 2,
                            originX: "center",
                            originY: "center",
                            scaleX: 0.5,
                            scaleY: 0.5,
                            hasControls: true,
                            hasBorders: true,
                            selectable: true
                        });
                        canvas.add(img);
                        canvas.setActiveObject(img);
                        canvas.renderAll();
                    });
                };
                reader.readAsDataURL(files[i]);
            }
        });

        // Controle de formatação de texto
        let fontSelect = document.getElementById('font-select');
        let colorPicker = document.getElementById('color-picker');
        let boldBtn = document.getElementById('bold-btn');
        let italicBtn = document.getElementById('italic-btn');

        let isBold = false;
        let isItalic = false;

        // Adiciona texto ao canvas
        document.getElementById('addTextBtn').addEventListener('click', function () {
            let textValue = document.getElementById('textInput').value.trim();
            if (!textValue) return;

            // Pega as configurações de formatação
            let fontFamily = fontSelect.value;
            let fontColor = colorPicker.value;
            let fontWeight = isBold ? 'bold' : 'normal';
            let fontStyle = isItalic ? 'italic' : 'normal';

            // Cria o objeto de texto no canvas
            let text = new fabric.Textbox(textValue, {
                left: canvas.width / 2,
                top: canvas.height / 2,
                originX: "center",
                originY: "center",
                fontSize: 30,
                fill: fontColor,
                fontFamily: fontFamily,
                fontWeight: fontWeight,
                fontStyle: fontStyle,
                selectable: true,
                editable: true
            });

            canvas.add(text);
            canvas.setActiveObject(text);
            canvas.bringToFront(text);
            canvas.renderAll();
        });

        // Alterar estilo de fonte para negrito
        boldBtn.addEventListener('click', function () {
            isBold = !isBold;
            boldBtn.style.fontWeight = isBold ? 'bold' : 'normal';
        });

        // Alterar estilo de fonte para itálico
        italicBtn.addEventListener('click', function () {
            isItalic = !isItalic;
            italicBtn.style.fontStyle = isItalic ? 'italic' : 'normal';
        });

        document.getElementById('btn-baixar').addEventListener('click', function () {
            // Ajusta as dimensões do canvas de acordo com o tamanho do container antes de gerar a imagem
            let canvasElement = document.getElementById('logo-canvas');
            let containerElement = document.getElementById('produto-imagem-container');
            let containerRect = containerElement.getBoundingClientRect();

            canvas.setWidth(containerRect.width);
            canvas.setHeight(containerRect.height);
            canvas.renderAll();

            let link = document.createElement('a');
            link.href = canvas.toDataURL("image/png");
            link.download = "layout-personalizado.png";
            link.click();
        });

        // Apagar imagem selecionada
        document.getElementById('delete-image-btn').addEventListener('click', function () {
            let activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'image') {
                canvas.remove(activeObject);
            }
        });

        // Apagar texto selecionado
        document.getElementById('delete-text-btn').addEventListener('click', function () {
            let activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'textbox') {
                canvas.remove(activeObject);
            }
        });

        // Remover fundo da imagem selecionada
        document.getElementById('remove-bg-btn').addEventListener('click', function () {
            let activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'image') {
                const formData = new FormData();
                formData.append('image', dataURLtoBlob(activeObject.toDataURL()), 'image.png');

                fetch('/wp-admin/admin-ajax.php?action=projetos_lv_remove_bg', {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            const imageUrl = 'data:image/png;base64,' + data.data.image;
                            fabric.Image.fromURL(imageUrl, function (img) {
                                img.set({
                                    left: activeObject.left,
                                    top: activeObject.top,
                                    scaleX: activeObject.scaleX,
                                    scaleY: activeObject.scaleY,
                                    originX: activeObject.originX,
                                    originY: activeObject.originY,
                                    hasControls: true,
                                    hasBorders: true,
                                    selectable: true
                                });
                                canvas.remove(activeObject);
                                canvas.add(img);
                                canvas.setActiveObject(img);
                                canvas.renderAll();
                            });
                        } else {
                            console.error('Erro:', data.data.message);
                        }
                    })
                    .catch(error => console.error('Erro:', error));
            } else {
                alert('Por favor, selecione uma imagem para remover o fundo.');
            }
        });

        // Helper function to convert dataURL to Blob
        function dataURLtoBlob(dataurl) {
            let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }

        /* 🔹 TROCAR A IMAGEM DO PRODUTO AO SELECIONAR UM TIPO E COR */
        const imagensProdutos = {
            "Jaqueta": {
                "Preto": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-PRETO.png",
                "Branco": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-BRANCO.png",
                "Grafite": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-GRAFITE.png",
                "Silver": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-SILVER.png",
                "Bordo": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-BORDO.png",
                "Vermelho": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-VERMELHO.png",
                "Laranja": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-LARANJA.png",
                "Amarelo Seleção": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-AMARELOSELECAO.png",
                "Amarelo Limão": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-AMARELOLIMAO.png",
                "Verde Militar": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-VERDEMILITAR.png",
                "Verde Bandeira": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-VERDEBANDEIRA.png",
                "Verde Neon": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-VERDENEON.png",
                "Verde Agua": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-VERDEMENTA.png",
                "Azul Marinho": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-AZULMARINHO.png",
                "Azul Petroleo": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-AZULPETROLEO.png",
                "Azul Bic": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-AZULBIC.png",
                "Azul Turquesa": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-AZULTURQUESA.png",
                "Azul Claro": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-AZULCLARO.png",
                "Azul Imperial": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-AZULIMPERIAL.png",
                "Roxo": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-ROXO.png",
                "Lavanda": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-LAVANDA.png",
                "Rosa Chiclete": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-ROSACHICLETE.png",
                "Rosa Pink": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CV-ROSAPINK.png"
            },

            "Camisa Polo": {
                "Preto": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-GP-PRETO.png",
                "Branco": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-GP-BRANCO.png",
                "Grafite": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-GP-GRAFITE.png",
                "Silver": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-GP-SILVER.png",
                "Verde Militar": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-GP-VERDEMILITAR.png",
                "Verde Mar": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-GP-VERDEMAR.png",
                "Azul Marinho": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-GP-AZULMARINHO.png",
                "Azul Claro": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-GP-AZULCLARO.png",
                "Rosa Pink": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-GP-ROSAPINK.png"
            },
            "Bermuda": {
                "Preto": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-PRETO.png",
                "Branco": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-BRANCO.png",
                "Grafite": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-GRAFITE.png",
                "Silver": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-SILVER.png",
                "Bordo": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-BORDO.png",
                "Vermelho": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-VERMELHO.png",
                "Laranja": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-LARANJA.png",
                "Amarelo Seleção": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-AMARELOSELECAO.png",
                "Amarelo Limão": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-AMARELOLIMAO.png",
                "Verde Militar": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-VERDEMILITAR.png",
                "Verde Bandeira": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-VERDEBANDEIRA.png",
                "Verde Neon": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-VERDENEON.png",
                "Verde Agua": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-VERDEAGUA.png",
                "Azul Marinho": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-AZULMARINHO.png",
                "Azul Petroleo": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-AZULPETROLEO.png",
                "Azul Bic": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-AZULBIC.png",
                "Azul Turquesa": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-AZULTURQUESA.png",
                "Azul Claro": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-AZULCLARO.png",
                "Azul Imperial": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-BER-AZULIMPERIAL.png"
            },
            "Moletom": {
                "Preto": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-MO-PRETO.png",
                "Branco": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-MO-BRANCO.png",
                "Grafite": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-MO-GRAFITE.png",
                "Bordo": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-MO-BORDO.png",
                "Vermelho": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-MO-VERMELHO.png",
                "Laranja": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-MO-LARANJA.png",
                "Verde Militar": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-MO-VERDEMILITAR.png",
                "Azul Marinho": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-MO-AZULMARINHO.png",
                "Areia": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-MO-AREIA.png",
                "Off White": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-MO-OFFWHITE.png"
            },

            "Calça": {
                "Preto": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-PRETO.png",
                "Branco": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-BRANCO.png",
                "Grafite": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-GRAFITE.png",
                "Silver": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-SILVER.png",
                "Bordo": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-BORDO.png",
                "Vermelho": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-VERMELHO.png",
                "Laranja": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-LARANJA.png",
                "Amarelo Seleção": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-AMARELOSELECAO.png",
                "Amarelo Limão": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-AMARELOLIMAO.png",
                "Verde Militar": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-VERDEMILITAR.png",
                "Verde Bandeira": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-VERDEBANDEIRA.png",
                "Verde Neon": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-VERDENEON.png",
                "Verde Agua": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-VERDEAGUA.png",
                "Azul Marinho": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-AZULMARINHO.png",
                "Azul Petroleo": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-AZULPETROLEO.png",
                "Azul Bic": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-AZULBIC.png",
                "Azul Turquesa": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-AZULTURQUESA.png",
                "Azul Claro": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-AZULCLARO.png",
                "Azul Imperial": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-AZULIMPERIAL.png",
                "Roxo": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-ROXO.png",
                "Rosa Pink": "https://lavitoria.com.br/wp-content/uploads/2025/03/PV-CAL-ROSAPINK.png"
            },

            "Manga Longa 100% Algodão": {
                "Preto": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-PRETO.png",
                "Branco": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-BRANCO.png",
                "Grafite": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-GRAFITE.png",
                "Bordo": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-BORDO.png",
                "Vermelho": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-VERMELHO.png",
                "Verde Mar": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-VERDEMAR.png",
                "Azul Marinho": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-AZULMARINHO.png",
                "Azul Bic": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-AZULBIC.png",
                "Azul Turquesa": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-AZULTURQUESA.png",
                "Azul Claro": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-AZULCLARO.png",
                "Rosa Claro": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-ROSACLARO.png",
                "Bege": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-BEGE.png"
            },

            "Manga Longa Dry Poliamida": {
                "Preto": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-PRETO.png",
                "Branco": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-BRANCO.png",
                "Grafite": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-GRAFITE.png",
                "Bordo": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-BORDO.png",
                "Vermelho": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-VERMELHO.png",
                "Laranja": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-LARANJA.png",
                "Amarelo Seleção": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-AMARELOSELECAO.png",
                "Verde Neon": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-VERDENEON.png",
                "Verde Menta": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-VERDEMENTA.png",
                "Azul Marinho": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-AZULMARINHO.png",
                "Azul Petroleo": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-AZULPETROLEO.png",
                "Azul Indico": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-AZULINDICO.png",
                "Lavanda": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-LAVANDA.png"

            },

            "Manga Longa Dry Poliéster": {
                "Preto": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-PRETO.png",
                "Branco": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-BRANCO.png",
                "Verde Militar": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-VERDEMILITAR.png",
                "Verde Bandeira": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-VERDEBANDEIRA.png",
                "Azul Marinho": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-AZULMARINHO.png",
                "Azul Bic": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-ML-AZULBIC.png"
            },

            "Camiseta 100% Algodão": {
                "Preto": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-PRETO.png",
                "Branco": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-BRANCO.png",
                "Grafite": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-GRAFITE.png",
                "Bordo": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-BORDO.png",
                "Vermelho": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-VERMELHO.png",
                "Verde Mar": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-VERDEMAR.png",
                "Azul Marinho": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-AZULMARINHO.png",
                "Azul Bic": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-AZULBIC.png",
                "Azul Turquesa": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-AZULTURQUESA.png",
                "Azul Claro": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-AZULCLARO.png",
                "Rosa Claro": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-ROSACLARO.png",
                "Bege": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-BEGE.png"
            },

            "Camiseta Dry Poliamida": {
                "Preto": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-PRETO.png",
                "Branco": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-BRANCO.png",
                "Grafite": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-GRAFITE.png",
                "Bordo": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-BORDO.png",
                "Vermelho": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-VERMELHO.png",
                "Laranja": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-LARANJA.png",
                "Amarelo Seleção": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-AMARELOSELECAO.png",
                "Verde Neon": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-VERDENEON.png",
                "Verde Menta": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-VERDEMENTA.png",
                "Azul Marinho": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-AZULMARINHO.png",
                "Azul Petroleo": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-AZULPETROLEO.png",
                "Azul Indico": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-AZULINDICO.png",
                "Lavanda": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-LAVANDA.png"
            },

            "Camiseta Dry Poliéster": {
                "Preto": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-PRETO.png",
                "Branco": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-BRANCO.png",
                "Verde Militar": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-VERDEMILITAR.png",
                "Verde Bandeira": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-VERDEBANDEIRA.png",
                "Azul Marinho": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-AZULMARINHO.png",
                "Azul Bic": "https://lavitoria.com.br/wp-content/uploads/2025/04/PV-CA-AZULBIC.png"
            }
        };

        const corMap = {
            "Preto": "#000000",
            "Grafite": "#4f4f4f",
            "Silver": "#C0C0C0",
            "Branco": "#FFFFFF",
            "Amarelo Limão": "#c8ff00",
            "Amarelo Seleção": "#FFCB00",
            "Laranja": "#ff6200",
            "Rosa Pink": "#ff00a2",
            "Bordo": "#800921",
            "Vermelho": "#FF0000",
            "Verde Neon": "#77ff00",
            "Verde Agua": "#7dffaa",
            "Verde Militar": "#214f30",
            "Verde Bandeira": "#26a31f",
            "Azul Claro": "#8fdbff",
            "Azul Turquesa": "#04a7de",
            "Azul Imperial": "#9c97f7",
            "Azul Bic": "#0f53bf",
            "Azul Petroleo": "#0d3c66",
            "Azul Marinho": "#222045",
            "Roxo": "#462958",
            "Rosa Chiclete": "#ee656e",
            "Bege": "#EDD7C5",
            "Rosa Claro": "#F086D3",
            "Areia": "#AA9881",
            "Off White": "#F8F0E3",
            "Verde Mar": "#159C88",
            "Lavanda": "#9f5fb3",
            "Verde Menta": "#72CBA2",
            "Azul Indico": "#4E5180"
        };

        const produtoSelect = document.getElementById("produto-select");
        const coresContainer = document.getElementById("cores-container");

        produtoSelect.addEventListener("change", function () {
            atualizarCores(this.value);
        });

        function atualizarCores(produto) {
            coresContainer.innerHTML = "";

            if (imagensProdutos[produto]) {
                Object.keys(imagensProdutos[produto]).forEach(cor => {
                    const botao = document.createElement("button");
                    botao.style.backgroundColor = corMap[cor];
                    botao.style.border = "1px solid rgb(167, 167, 167)";
                    botao.style.borderRadius = "100%";
                    botao.style.height = "30px";
                    botao.style.width = "30px";
                    botao.style.marginRight = "5px";
                    botao.style.cursor = "pointer";
                    botao.setAttribute("data-color", cor);

                    // Tooltip como um único elemento global
                    const tooltip = document.createElement("span");
                    tooltip.textContent = cor; // O nome da cor
                    tooltip.style.position = "absolute";
                    tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                    tooltip.style.color = "white";
                    tooltip.style.padding = "5px";
                    tooltip.style.borderRadius = "4px";
                    tooltip.style.display = "none"; // Inicialmente invisível

                    // Adicionando o tooltip ao container
                    coresContainer.appendChild(tooltip);

                    botao.addEventListener("mouseover", function () {
                        tooltip.style.display = "block"; // Exibe o tooltip
                        const rect = botao.getBoundingClientRect();
                        const scrollTop = window.scrollY || document.documentElement.scrollTop; // Obtém o deslocamento vertical do scroll
                        tooltip.style.top = rect.top + scrollTop - tooltip.offsetHeight - 25 + "px"; // Ajuste acima do botão
                        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + "px"; // Centraliza
                    });

                    botao.addEventListener("mouseout", function () {
                        tooltip.style.display = "none"; // Esconde o tooltip
                    });

                    botao.addEventListener("click", function () {
                        setBackgroundImage(imagensProdutos[produto][cor]); // Define a imagem como background do canvas
                        setTimeout(ajustarCanvas, 300); // Ajusta o canvas após a troca da imagem
                    });

                    coresContainer.appendChild(botao);
                });


                // Define a cor padrão ao trocar de produto
                setBackgroundImage(imagensProdutos[produto][Object.keys(imagensProdutos[produto])[0]]); // Define a imagem como background do canvas
                setTimeout(ajustarCanvas, 300);
            }
        }

        function setBackgroundImage(url) {
            fabric.Image.fromURL(url, function (img) {
                const canvasAspect = canvas.width / canvas.height;
                const imgAspect = img.width / img.height;

                const marginFactor = 0.9;

                let scaleFactor;

                if (canvasAspect > imgAspect) {
                    scaleFactor = (canvas.height * marginFactor) / img.height;
                } else {
                    scaleFactor = (canvas.width * marginFactor) / img.width;
                }

                img.set({
                    originX: 'center',
                    originY: 'center',
                    left: canvas.width / 2,
                    top: canvas.height / 2,
                    scaleX: scaleFactor,
                    scaleY: scaleFactor,
                    selectable: false,
                    evented: false
                });

                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            });
        }

    });
}