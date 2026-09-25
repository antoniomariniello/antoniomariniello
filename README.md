# Antonio Mariniello
Portfolio fotografico statico in Astro, ricostruito da https://www.antoniomariniello.com il 25 settembre 2026.

## Avvio
Richiede Node >=22.12.
- npm install
- npm run dev — http://127.0.0.1:4322/
- npm run build — genera dist/
- npm run verify — controlla tutte le pagine, i file e l'ordine delle fotografie
- node scripts/browser-check.mjs — verifica desktop/mobile con Edge, a server locale avviato

## Contenuti
4 album: World (65), Events (14), Work (30), Portraiture (52). Tutte le 161 fotografie, 17 slide della home e 374 file originali sono locali. Le varianti WebP responsive sono generate senza modificare gli originali.
Gli URL /album/..., /gallery/..., /collection/164-2/, /about/, /privacy-policy/ e /ciao-mondo/ sono conservati. Le pagine gallery indicano la corrispondente pagina album come canonical. Il post WordPress di esempio e il suo commento restano accessibili ma esclusi dall'indicizzazione.
Menu, carosello e lightbox sono implementati senza plugin WordPress o framework client. Nessuna richiesta a database o API durante build o navigazione.

## Aggiornamento fotografie
Dati: src/data/site.json. Immagini originali: public/wp-content/uploads/. Varianti: public/images/.
Dopo aggiunte o modifiche eseguire node scripts/optimize-images.mjs e poi npm run build.
scripts/capture.py e scripts/import-assets.py sono strumenti di migrazione manuali (Python + Pillow). Non sono eseguiti dalla build. Gli snapshot WordPress sono in source/, esclusa da Git; la build usa solo i dati locali in src/data.
Inventario: docs/migration-inventory.json.

## Contatti
In attesa dell'indirizzo email confermato, About propone i quattro profili social originali. Il modulo Contact Form 7 non viene simulato: richiede PHP oppure un servizio di invio indipendente.
Il sito non include analytics, cookie applicativi o font remoti. La pagina privacy distingue le informazioni sul portfolio dal testo WordPress storico. Prima della pubblicazione va completata l'informativa con i dati del titolare e dell'hosting scelto.

## Pubblicazione
Output completamente statico: npm run build, cartella dist. Nessun adapter server, PHP o database.
Compatibile con hosting statico (incluso Cloudflare Pages). La scelta e attivazione dell'hosting non sono state effettuate.
Collegare il dominio direttamente al nuovo hosting, evitando redirect mascherati tramite iframe.
Il passaggio da hosting Aruba a dominio + email va concordato con Aruba verificando il servizio attuale. Mantenere intatti MX e record email SPF, DKIM, DMARC. Non cancellare caselle o dominio.
Prima di dismettere WordPress: conservare backup completo file/database, verificare la nuova pubblicazione e tutti gli URL, completare i contatti e verificare invio/ricezione email.
