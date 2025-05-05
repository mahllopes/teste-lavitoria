
// MODAL
function toggleModal(id) {
  const modal = document.getElementById(id);
  const isActive = modal.classList.contains('active');

  // Fecha todos os modais
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));

  // Reabre se não estava ativo
  if (!isActive) modal.classList.add('active');
}

// Fecha o modal ao clicar fora dele
window.addEventListener('click', (e) => {
  // Se o clique não foi dentro de um modal nem de um botão que abre modal
  if (!e.target.closest('.modal') && !e.target.closest('.botao-wrapper')) {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  }

const hammer = new Hammer(document.body);

hammer.on('tap', (e) => {
  const target = e.target;

  if (!target.closest('.modal') && !target.closest('.botao-wrapper')) {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  }
});
});

// FUNÇÃO CORES E UPLOAD
const imagensProdutos = {
  "Jaqueta": { "Preto": "img/jaqueta.png" },
  "Calça": { "Preto": "img/calca.png" }
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

let canvas;

document.addEventListener("DOMContentLoaded", function () {
  canvas = new fabric.Canvas('logo-canvas', { backgroundColor: "transparent" });
  ajustarCanvas();

  const produtoSelect = document.getElementById("produto-select");
  const uploadInput = document.getElementById("logo-upload");

  if (produtoSelect) {
    produtoSelect.addEventListener("change", () => atualizarCores(produtoSelect.value));
    atualizarCores(produtoSelect.value);
  }

  if (uploadInput) {
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
            // Escala proporcional para largura de 300px
            const larguraDesejada = 100;
            const escala = larguraDesejada / img.width;
    
            img.set({
              left: canvas.width / 2,
              top: canvas.height / 2,
              originX: "center",
              originY: "center",
              scaleX: escala,
              scaleY: escala,
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
  }

  // Habilitar gestos com Hammer.js no canvas
const hammer = new Hammer(canvas.upperCanvasEl);
hammer.get('pinch').set({ enable: true });

let imagemAtiva = null;
let escalaInicial = 1;

// Armazena escala inicial no começo do gesto
hammer.on('pinchstart', () => {
  const obj = canvas.getActiveObject();
  if (obj && obj.type === 'image') {
    imagemAtiva = obj;
    escalaInicial = obj.scaleX || 1;
  }
});

// Aplica nova escala durante o gesto
hammer.on('pinch', (e) => {
  if (imagemAtiva) {
    const novaEscala = escalaInicial * e.scale;
    imagemAtiva.scale(novaEscala);
    canvas.requestRenderAll();
  }
});

// Limpa quando termina o gesto
hammer.on('pinchend', () => {
  imagemAtiva = null;
});

  window.addEventListener('resize', ajustarCanvas);
});

//Atualiza cores ao clicar
function atualizarCores(produto) {
  const coresContainer = document.getElementById("cores-container");
  coresContainer.innerHTML = "";

  if (!imagensProdutos[produto]) return;

  Object.keys(imagensProdutos[produto]).forEach(cor => {
    const botao = document.createElement("button");
    botao.style.backgroundColor = corMap[cor] || "#ccc";
    botao.style.border = "1px solid rgb(167, 167, 167)";
    botao.style.borderRadius = "100%";
    botao.style.height = "30px";
    botao.style.width = "30px";
    botao.style.cursor = "pointer";
    botao.setAttribute("data-color", cor);

    botao.addEventListener("click", function () {
      setBackgroundImage(imagensProdutos[produto][cor]);
      setTimeout(ajustarCanvas, 300);
    });

    coresContainer.appendChild(botao);
  });

  const corPadrao = Object.keys(imagensProdutos[produto])[0];
  setBackgroundImage(imagensProdutos[produto][corPadrao]);
  setTimeout(ajustarCanvas, 300);
}

function setBackgroundImage(url) {
  fabric.Image.fromURL(url, function (img) {
    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = img.width / img.height;
    const marginFactor = 0.9;
    let scaleFactor = (canvasAspect > imgAspect)
      ? (canvas.height * marginFactor) / img.height
      : (canvas.width * marginFactor) / img.width;

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

function ajustarCanvas() {
  const canvasElement = document.getElementById('logo-canvas');
  const container = document.getElementById('produto-imagem-container');
  const rect = container.getBoundingClientRect();

  canvas.setWidth(rect.width);
  canvas.setHeight(rect.height);
  canvas.renderAll();

  if (canvas.backgroundImage?.getSrc) {
    setBackgroundImage(canvas.backgroundImage.getSrc());
  }
}

//APAGAR IMAGEM SELECIONADA
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById('delete-image-btn').addEventListener('click', function () {
    let activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
      canvas.remove(activeObject);
    }
  });

//REMOVER FUNDO DA IMAGEM
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
});

// FUNÇÃO ADICIONAR TEXTO
document.getElementById('addTextBtn').addEventListener('click', function () {
  let textValue = document.getElementById('textInput').value.trim();
  if (!textValue) return;

  let fontFamily = document.getElementById('fontSelect').value;
  let fontColor = document.getElementById('colorPicker').value;

  let text = new fabric.Textbox(textValue, {
    left: canvas.width / 2,
    top: canvas.height / 2,
    originX: "center",
    originY: "center",
    fontSize: 30,
    fill: fontColor,
    fontFamily: fontFamily,
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
    selectable: true,
    editable: true
  });

  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.bringToFront(text);
  canvas.renderAll();
});

// DELETAR TEXTO
document.getElementById('delete-text-btn').addEventListener('click', function () {
  let activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === 'textbox') {
    canvas.remove(activeObject);
    canvas.renderAll();
  }
});

// NEGRITO E ITÁLICO
let isBold = false;
let isItalic = false;

const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');

boldBtn.addEventListener('click', function () {
  isBold = !isBold;
  boldBtn.style.fontWeight = isBold ? 'bold' : 'normal';
});

italicBtn.addEventListener('click', function () {
  isItalic = !isItalic;
  italicBtn.style.fontStyle = isItalic ? 'italic' : 'normal';
});

//FUNÇÃO BAIXAR
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
