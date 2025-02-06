import Reveal from '/node_modules/reveal.js/dist/reveal.esm.js';
import Markdown from '/node_modules/reveal.js/plugin/markdown/markdown.esm.js';

// Initialize Reveal.js with the Markdown plugin
Reveal.initialize({
    plugins: [Markdown],
    slideNumber: 'c/t',
    embedded: true
});


const narracoes = [
    [
        'Hoje a aula é sobre sistema digestório, vou fazer a exposição dos principais pontos, como sempre, fique à vontade para perguntar o que quiser',
        `O sistema digestório é responsável por garantir a quebra do alimento em partículas menores e pela absorção de nutrientes que são necessários ao corpo.`,        
    ],
    [
        `No sistema digestório temos o trato gastrointestinal, que é formado por boca, faringe, esôfago, estômago, intestino delgado e intestino grosso;`,
        'e as glândulas associadas: glândulas salivares, fígado e pâncreas.',
        'Na boca o alimento é rasgado e triturado pelos dentes e, com a ajuda da língua, é misturado com a saliva.',
        'O bolo alimentar segue da boca para a faringe e da faringe para o esôfago, sendo levado por meio de movimentos peristálticos até o estômago.'
    ],
    [
        'No estômago o bolo alimentar sofre a ação do suco gástrico e passa a ser chamado de quimo.',
        'Do estômago o quimo segue para o intestino delgado, onde sofrerá a ação do suco pancreático, da bile e das secreções produzidas pelo próprio intestino delgado.'
    ],
    [
        'No intestino grosso formam-se as fezes, as quais são eliminadas pelo ânus.'
    ],
    [
        'Essa foi a aula de hoje. Sinta-se à vontade para fazer uma pergunta ou rever pontos correlatos'
    ]
]


const capsIndexChech = []

function proximaNarracao() {
    // verifica se existe
    for(let slideIndex = 0; slideIndex<narracoes.length; slideIndex++) {
        const slidecaps = narracoes[slideIndex]
        for(let capIndex = 0; capIndex<slidecaps.length; capIndex++) {
            const cap = slidecaps[capIndex]
            const constItem = `${slideIndex}-${capIndex}`
            let retorno = []
            if (!capsIndexChech.includes(constItem)) {             
                retorno = [cap, capIndex === 0]
            }
            capsIndexChech.push(constItem)
            if (retorno.length > 0) {
                return retorno
            }
        }
    }
    return ['', false]
}

  



Reveal.on('slidechanged', (event) => {
    document.getElementById("speakButton").click()
  });


// Global variables
let utterance = null;
let isPaused = false;

function populateVoiceList() {
    const voices = window.speechSynthesis.getVoices();
    const select = document.getElementById("voiceSelect");

    select.innerHTML = ""; // Clear previous options
    voices.forEach((voice, index) => {
        if (voice.lang.startsWith("pt")) { // Only Portuguese voices
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            select.appendChild(option);
        }
    });
}

// Populate voices after they load
window.speechSynthesis.onvoiceschanged = populateVoiceList;
populateVoiceList();

document.getElementById('play').addEventListener('click', () => {
    if (Reveal.getState().indexh === 0) {
        const [cap, ehProxima] = proximaNarracao()
        console.log(cap, ehProxima)
        document.getElementById('caption-text').textContent = cap
        document.getElementById("speakButton").click()
    }
})

document.getElementById("speedRange").addEventListener("input", (event) => {
    document.getElementById("speedValue").textContent = `${event.target.value}x`;
});

document.getElementById("speakButton").addEventListener("click", () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) return; // Prevent multiple instances

    const text = document.getElementById('caption-text').textContent;
    const speed = parseFloat(document.getElementById("speedRange").value);
    
    console.log(`📢 Text: ${text}, Speed: ${speed}x`);

    if (!utterance) { // Create only if it doesn't exist
        utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = speed; // Set speech speed
        utterance.onboundary = (event) => {
            console.log(`🟡 Spoken word starts at character index: ${event.charIndex}`);
        };

        utterance.onstart = () => {
            console.log("🟢 Speech started!");
            isPaused = false; // Reset pause state
        };

        utterance.onend = () => {
            console.log("🔴 Speech finished!");
            utterance = null; // Reset after finishing
            isPaused = false; // Reset pause state
            const [proxText, ehParaTrocar] = proximaNarracao()
            document.getElementById('caption-text').textContent = proxText
            console.log('Eh para trocar?', ehParaTrocar)
            if (ehParaTrocar) {
                const index = Reveal.getState().indexh
                Reveal.slide(index + 1)
            } else {
                document.getElementById("speakButton").click()
            }
        };

        utterance.onpause = () => {
            console.log("⏸️ Speech paused.");
            isPaused = true;
        };

        utterance.onresume = () => {
            console.log("▶️ Speech resumed!");
            isPaused = false;
        };

        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = document.getElementById("voiceSelect").value;
        utterance.voice = voices[selectedVoice] || voices[0];
    }

    if (isPaused) {
        console.log("▶️ Resuming paused speech...");
        speechSynthesis.resume();
    } else {
        console.log("🔊 Starting new speech...");
        speechSynthesis.speak(utterance);
    }
});

// Pause speech
document.getElementById("pauseButton").addEventListener("click", () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        console.log("⏸️ Paused!");
        isPaused = true;
    }
});

// Resume speech
document.getElementById("resumeButton").addEventListener("click", () => {
    if (isPaused) {
        speechSynthesis.resume();
        console.log("▶️ Resumed!");
        isPaused = false;
    }
});

// Stop speech
document.getElementById("stopButton").addEventListener("click", () => {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        console.log("⛔ Speech stopped.");
        utterance = null; // Reset utterance so new speech can start
        isPaused = false;
    }
});
