# Workspace Hub (PWA Modulare)

## Struttura del Pacchetto
- `index.html`: Dashboard principale con tassonomia per funzione d'uso
- `assets/css/style.css`: Foglio di stile centralizzato
- `assets/js/app.js`: Logica dashboard, sincronizzazione `tools.json` + `localStorage`
- `data/tools.json`: Configurazione sezioni e strumenti
- `modules/prompt-builder.html`: Libreria System Prompt & Workflow AI
- `modules/preventivi.html`: Gestione Attività & Preventivi
- `modules/tipografia.html`: Strumento Tipografico & Impaginazione (pt, mm, margini, colonne, export Word/Google Docs)
- `modules/template-modulo.html`: Template base per nuovi strumenti
- `manifest.json` & `sw.js`: Configurazione Progressive Web App (installabile e offline)
