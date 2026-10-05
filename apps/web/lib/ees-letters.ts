/**
 * Template letters for EES rectification requests under Article 52 of
 * Regulation (EU) 2017/2226 (AGENTS.md §8: EN + official-language versions,
 * placeholders in {curly_braces}). These are our own drafted content; the
 * legal references they cite are verified in data/ees.json's sources.
 */

export interface LetterTemplate {
  /** BCP47-ish language code of the letter body. */
  lang: string;
  languageName: string;
  subject: string;
  body: string;
}

const EN: LetterTemplate = {
  lang: "en",
  languageName: "English",
  subject:
    "Request for rectification of Entry/Exit System (EES) data — Article 52 of Regulation (EU) 2017/2226",
  body: `Dear Sir or Madam,

Pursuant to Article 52 of Regulation (EU) 2017/2226, I request the rectification of inaccurate data recorded about me in the Entry/Exit System (EES).

Personal details
- Full name: {full_name}
- Date of birth: {date_of_birth}
- Nationality: {nationality}
- Travel document type and number: {travel_document_number}

Incorrect record
{describe_the_incorrect_record — for example: "No exit was recorded for my departure on {date} via {border_crossing_point}, and I am now incorrectly flagged as an overstayer."}

Correct facts
{state_the_correct_facts — for example: "I exited the Schengen Area on {date} on flight {flight_number} from {airport}."}

Evidence enclosed
{list_your_evidence — for example: boarding pass, travel booking, accommodation and payment records}

I ask that the data be rectified or completed accordingly, and that I be informed of the outcome within the 45-day period laid down in Article 52(1) of Regulation (EU) 2017/2226. Should this request not be dealt with in time, I reserve the right to bring a complaint under Article 54 of that Regulation.

Reply address: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const FR: LetterTemplate = {
  lang: "fr",
  languageName: "French",
  subject:
    "Demande de rectification de données du système d'entrée/de sortie (EES) — article 52 du règlement (UE) 2017/2226",
  body: `Madame, Monsieur,

Conformément à l'article 52 du règlement (UE) 2017/2226, je demande la rectification de données inexactes me concernant enregistrées dans le système d'entrée/de sortie (EES).

Renseignements personnels
- Nom et prénom : {full_name}
- Date de naissance : {date_of_birth}
- Nationalité : {nationality}
- Type et numéro du document de voyage : {travel_document_number}

Enregistrement inexact
{décrivez_l'enregistrement_inexact — par exemple : « Aucune sortie n'a été enregistrée pour mon départ le {date} par {border_crossing_point}, et je suis désormais signalé(e) à tort comme ayant dépassé la durée de séjour autorisée. »}

Faits exacts
{indiquez_les_faits_exacts}

Pièces justificatives jointes
{listez_vos_justificatifs — par exemple : carte d'embarquement, réservation, justificatifs d'hébergement et de paiement}

Je vous prie de rectifier ou de compléter ces données et de m'informer de la suite donnée dans le délai de 45 jours prévu à l'article 52, paragraphe 1, du règlement (UE) 2017/2226. À défaut, je me réserve le droit d'introduire un recours au titre de l'article 54 dudit règlement.

Adresse de réponse : {postal_address_or_email}

{place_and_date}
{signature}`,
};

const ES: LetterTemplate = {
  lang: "es",
  languageName: "Spanish",
  subject:
    "Solicitud de rectificación de datos del Sistema de Entradas y Salidas (SES/EES) — artículo 52 del Reglamento (UE) 2017/2226",
  body: `Muy señores míos:

De conformidad con el artículo 52 del Reglamento (UE) 2017/2226, solicito la rectificación de los datos inexactos que constan sobre mí en el Sistema de Entradas y Salidas (EES).

Datos personales
- Nombre y apellidos: {full_name}
- Fecha de nacimiento: {date_of_birth}
- Nacionalidad: {nationality}
- Tipo y número del documento de viaje: {travel_document_number}

Registro inexacto
{describa_el_registro_inexacto — por ejemplo: «No se registró ninguna salida en mi partida del {date} por {border_crossing_point}, y ahora figuro erróneamente como persona que ha sobrepasado la estancia autorizada.»}

Hechos correctos
{indique_los_hechos_correctos}

Pruebas adjuntas
{enumere_sus_pruebas — por ejemplo: tarjeta de embarque, reserva, justificantes de alojamiento y de pago}

Solicito que los datos sean rectificados o completados en consecuencia y que se me informe del resultado dentro del plazo de 45 días previsto en el artículo 52, apartado 1, del Reglamento (UE) 2017/2226. En su defecto, me reservo el derecho a presentar una reclamación con arreglo al artículo 54 de dicho Reglamento.

Dirección de respuesta: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const DE: LetterTemplate = {
  lang: "de",
  languageName: "German",
  subject:
    "Antrag auf Berichtigung von Daten im Einreise-/Ausreisesystem (EES) — Artikel 52 der Verordnung (EU) 2017/2226",
  body: `Sehr geehrte Damen und Herren,

gemäß Artikel 52 der Verordnung (EU) 2017/2226 beantrage ich die Berichtigung unrichtiger Daten, die im Einreise-/Ausreisesystem (EES) über mich gespeichert sind.

Persönliche Angaben
- Vor- und Nachname: {full_name}
- Geburtsdatum: {date_of_birth}
- Staatsangehörigkeit: {nationality}
- Art und Nummer des Reisedokuments: {travel_document_number}

Unrichtiger Eintrag
{beschreiben_Sie_den_unrichtigen_Eintrag — zum Beispiel: „Für meine Ausreise am {date} über {border_crossing_point} wurde keine Ausreise erfasst; ich werde daher zu Unrecht als Person geführt, die die zulässige Aufenthaltsdauer überschritten hat."}

Richtiger Sachverhalt
{schildern_Sie_den_richtigen_Sachverhalt}

Beigefügte Nachweise
{listen_Sie_Ihre_Nachweise_auf — zum Beispiel: Bordkarte, Buchung, Unterkunfts- und Zahlungsbelege}

Ich bitte, die Daten entsprechend zu berichtigen oder zu vervollständigen und mich innerhalb der in Artikel 52 Absatz 1 der Verordnung (EU) 2017/2226 vorgesehenen Frist von 45 Tagen über das Ergebnis zu unterrichten. Andernfalls behalte ich mir vor, einen Rechtsbehelf nach Artikel 54 der Verordnung einzulegen.

Antwortadresse: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const IT: LetterTemplate = {
  lang: "it",
  languageName: "Italian",
  subject:
    "Richiesta di rettifica dei dati del sistema di ingressi/uscite (EES) — articolo 52 del regolamento (UE) 2017/2226",
  body: `Spettabile Autorità,

ai sensi dell'articolo 52 del regolamento (UE) 2017/2226, chiedo la rettifica dei dati inesatti che mi riguardano registrati nel sistema di ingressi/uscite (EES).

Dati personali
- Nome e cognome: {full_name}
- Data di nascita: {date_of_birth}
- Cittadinanza: {nationality}
- Tipo e numero del documento di viaggio: {travel_document_number}

Registrazione inesatta
{descrivere_la_registrazione_inesatta — ad esempio: «Non risulta registrata alcuna uscita per la mia partenza del {date} attraverso {border_crossing_point}; risulto pertanto erroneamente segnalato/a come soggiornante fuori termine.»}

Fatti corretti
{indicare_i_fatti_corretti}

Documentazione allegata
{elencare_le_prove — ad esempio: carta d'imbarco, prenotazione, ricevute di alloggio e di pagamento}

Chiedo che i dati siano rettificati o completati di conseguenza e di essere informato/a dell'esito entro il termine di 45 giorni previsto dall'articolo 52, paragrafo 1, del regolamento (UE) 2017/2226. In difetto, mi riservo di proporre ricorso ai sensi dell'articolo 54 del medesimo regolamento.

Recapito per la risposta: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const NL: LetterTemplate = {
  lang: "nl",
  languageName: "Dutch",
  subject:
    "Verzoek tot rectificatie van gegevens in het inreis-uitreissysteem (EES) — artikel 52 van Verordening (EU) 2017/2226",
  body: `Geachte heer/mevrouw,

Op grond van artikel 52 van Verordening (EU) 2017/2226 verzoek ik om rectificatie van onjuiste gegevens die over mij in het inreis-uitreissysteem (EES) zijn geregistreerd.

Persoonsgegevens
- Volledige naam: {full_name}
- Geboortedatum: {date_of_birth}
- Nationaliteit: {nationality}
- Soort en nummer reisdocument: {travel_document_number}

Onjuiste registratie
{beschrijf_de_onjuiste_registratie — bijvoorbeeld: "Voor mijn vertrek op {date} via {border_crossing_point} is geen uitreis geregistreerd; ik sta daardoor ten onrechte geregistreerd als iemand die de toegestane verblijfsduur heeft overschreden."}

Juiste feiten
{vermeld_de_juiste_feiten}

Bijgevoegd bewijs
{som_uw_bewijsstukken_op — bijvoorbeeld: instapkaart, boeking, verblijfs- en betalingsbewijzen}

Ik verzoek u de gegevens dienovereenkomstig te rectificeren of aan te vullen en mij binnen de in artikel 52, lid 1, van Verordening (EU) 2017/2226 gestelde termijn van 45 dagen over de uitkomst te informeren. Bij gebreke daarvan behoud ik mij het recht voor een klacht in te dienen op grond van artikel 54 van die verordening.

Antwoordadres: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_BG: LetterTemplate = {
  lang: "bg",
  languageName: "Bulgarian",
  subject:
    "Искане за поправка на данни в Системата за влизане/излизане (СВИ/EES) — член 52 от Регламент (ЕС) 2017/2226",
  body: `Уважаеми госпожи и господа,

На основание член 52 от Регламент (ЕС) 2017/2226 моля за поправка на неточни данни за мен, записани в Системата за влизане/излизане (СВИ).

Лични данни
- Име и фамилия: {full_name}
- Дата на раждане: {date_of_birth}
- Гражданство: {nationality}
- Вид и номер на документа за пътуване: {travel_document_number}

Неточен запис
{опишете_неточния_запис — например: „При заминаването ми на {date} през {border_crossing_point} не е регистрирано излизане и сега неправилно съм отбелязан(а) като лице, превишило разрешения срок на престой.“}

Верни факти
{посочете_верните_факти}

Приложени доказателства
{избройте_доказателствата_си — например: бордна карта, резервация за пътуване, документи за настаняване и плащания}

Моля данните да бъдат поправени или допълнени съответно и да бъда уведомен(а) за резултата в 45-дневния срок, предвиден в член 52, параграф 1 от Регламент (ЕС) 2017/2226. Ако искането не бъде разгледано в срок, си запазвам правото да подам жалба съгласно член 54 от посочения регламент.

Адрес за отговор: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_CS: LetterTemplate = {
  lang: "cs",
  languageName: "Czech",
  subject:
    "Žádost o opravu údajů v Systému vstupu/výstupu (EES) — článek 52 nařízení (EU) 2017/2226",
  body: `Vážení,

podle článku 52 nařízení (EU) 2017/2226 žádám o opravu nepřesných údajů o mé osobě zaznamenaných v Systému vstupu/výstupu (EES).

Osobní údaje
- Jméno a příjmení: {full_name}
- Datum narození: {date_of_birth}
- Státní příslušnost: {nationality}
- Druh a číslo cestovního dokladu: {travel_document_number}

Nesprávný záznam
{describe_the_incorrect_record — například: „Můj výstup dne {date} přes {border_crossing_point} nebyl zaznamenán, a proto jsem nyní nesprávně veden(a) jako osoba, která překročila povolenou dobu pobytu.“}

Správné skutečnosti
{state_the_correct_facts — například: „Schengenský prostor jsem opustil(a) dne {date} letem {flight_number} z letiště {airport}.“}

Přiložené důkazy
{list_your_evidence — například: palubní vstupenka, rezervace cesty, doklady o ubytování a platbách}

Žádám, aby údaje byly odpovídajícím způsobem opraveny nebo doplněny a abych byl(a) o výsledku informován(a) ve lhůtě 45 dnů stanovené v čl. 52 odst. 1 nařízení (EU) 2017/2226. Nebude-li žádost vyřízena včas, vyhrazuji si právo využít právní ochranu podle článku 54 uvedeného nařízení.

Adresa pro odpověď: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_DA: LetterTemplate = {
  lang: "da",
  languageName: "Danish",
  subject:
    "Anmodning om berigtigelse af oplysninger i ind- og udrejsesystemet (EES) — artikel 52 i forordning (EU) 2017/2226",
  body: `Kære modtager

I henhold til artikel 52 i forordning (EU) 2017/2226 anmoder jeg om berigtigelse af ukorrekte oplysninger om mig, der er registreret i ind- og udrejsesystemet (EES).

Personoplysninger
- Fulde navn: {full_name}
- Fødselsdato: {date_of_birth}
- Statsborgerskab: {nationality}
- Rejsedokumentets type og nummer: {travel_document_number}

Ukorrekt registrering
{describe_the_incorrect_record — for eksempel: "Der blev ikke registreret nogen udrejse ved min afrejse den {date} via {border_crossing_point}, og jeg er nu fejlagtigt registreret som en person, der har overskredet den tilladte opholdsperiode."}

Korrekte oplysninger
{state_the_correct_facts — for eksempel: "Jeg forlod Schengenområdet den {date} med fly {flight_number} fra {airport}."}

Vedlagt dokumentation
{list_your_evidence — for eksempel: boardingkort, rejsebestilling, dokumentation for indkvartering og betalinger}

Jeg anmoder om, at oplysningerne berigtiges eller suppleres i overensstemmelse hermed, og at jeg underrettes om resultatet inden for fristen på 45 dage, jf. artikel 52, stk. 1, i forordning (EU) 2017/2226. Hvis anmodningen ikke behandles rettidigt, forbeholder jeg mig retten til at indgive klage i henhold til artikel 54 i nævnte forordning.

Svaradresse: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_EL: LetterTemplate = {
  lang: "el",
  languageName: "Greek",
  subject:
    "Αίτημα διόρθωσης δεδομένων στο σύστημα εισόδου/εξόδου (ΣΕΕ/EES) — άρθρο 52 του κανονισμού (ΕΕ) 2017/2226",
  body: `Αξιότιμες κυρίες και κύριοι,

Σύμφωνα με το άρθρο 52 του κανονισμού (ΕΕ) 2017/2226, ζητώ τη διόρθωση ανακριβών δεδομένων που με αφορούν και έχουν καταχωριστεί στο σύστημα εισόδου/εξόδου (ΣΕΕ).

Προσωπικά στοιχεία
- Ονοματεπώνυμο: {full_name}
- Ημερομηνία γέννησης: {date_of_birth}
- Ιθαγένεια: {nationality}
- Είδος και αριθμός ταξιδιωτικού εγγράφου: {travel_document_number}

Ανακριβής καταχώριση
{περιγράψτε_την_ανακριβή_καταχώριση — για παράδειγμα: «Δεν καταχωρίστηκε έξοδος κατά την αναχώρησή μου στις {date} από το {border_crossing_point}, και πλέον εμφανίζομαι εσφαλμένα ως πρόσωπο που υπερέβη τη διάρκεια της επιτρεπόμενης παραμονής.»}

Ορθά γεγονότα
{αναφέρετε_τα_ορθά_γεγονότα}

Συνημμένα αποδεικτικά
{απαριθμήστε_τα_αποδεικτικά_σας — για παράδειγμα: κάρτα επιβίβασης, κράτηση ταξιδιού, αποδεικτικά διαμονής και πληρωμών}

Ζητώ να διορθωθούν ή να συμπληρωθούν αναλόγως τα δεδομένα και να ενημερωθώ για το αποτέλεσμα εντός της προθεσμίας των 45 ημερών που προβλέπεται στο άρθρο 52 παράγραφος 1 του κανονισμού (ΕΕ) 2017/2226. Σε περίπτωση που το αίτημα δεν διεκπεραιωθεί εγκαίρως, επιφυλάσσομαι του δικαιώματός μου να υποβάλω καταγγελία βάσει του άρθρου 54 του εν λόγω κανονισμού.

Διεύθυνση απάντησης: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_ET: LetterTemplate = {
  lang: "et",
  languageName: "Estonian",
  subject:
    "Taotlus riiki sisenemise ja riigist lahkumise süsteemi (EES) andmete parandamiseks — määruse (EL) 2017/2226 artikkel 52",
  body: `Lugupeetud adressaat

Määruse (EL) 2017/2226 artikli 52 alusel taotlen minu kohta riiki sisenemise ja riigist lahkumise süsteemi (EES) kantud ebaõigete andmete parandamist.

Isikuandmed
- Täielik nimi: {full_name}
- Sünniaeg: {date_of_birth}
- Kodakondsus: {nationality}
- Reisidokumendi liik ja number: {travel_document_number}

Ebaõige kanne
{describe_the_incorrect_record — näiteks: "Minu lahkumist {date} piiripunkti {border_crossing_point} kaudu ei registreeritud ja mind on nüüd ekslikult märgitud lubatud viibimisaega ületanud isikuks."}

Õiged asjaolud
{state_the_correct_facts — näiteks: "Lahkusin Schengeni alalt {date} lennuga {flight_number} lennujaamast {airport}."}

Lisatud tõendid
{list_your_evidence — näiteks: pardakaart, reisibroneering, majutus- ja maksedokumendid}

Palun parandada või täiendada andmeid vastavalt ning teavitada mind tulemusest määruse (EL) 2017/2226 artikli 52 lõikes 1 sätestatud 45 päeva jooksul. Kui taotlusele ei vastata tähtaegselt, jätan endale õiguse esitada hagi või kaebus nimetatud määruse artikli 54 alusel.

Vastuse aadress: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_FI: LetterTemplate = {
  lang: "fi",
  languageName: "Finnish",
  subject:
    "Rajanylitystietojärjestelmän (EES) tietojen oikaisupyyntö — asetuksen (EU) 2017/2226 52 artikla",
  body: `Arvoisa vastaanottaja,

Pyydän asetuksen (EU) 2017/2226 52 artiklan nojalla oikaisemaan minusta rajanylitystietojärjestelmään (EES) tallennetut virheelliset tiedot.

Henkilötiedot
- Koko nimi: {full_name}
- Syntymäaika: {date_of_birth}
- Kansalaisuus: {nationality}
- Matkustusasiakirjan tyyppi ja numero: {travel_document_number}

Virheellinen merkintä
{describe_the_incorrect_record — esimerkiksi: "Maastalähtöäni {date} rajanylityspaikan {border_crossing_point} kautta ei kirjattu, ja minut on nyt virheellisesti merkitty sallitun oleskeluajan ylittäneeksi."}

Oikeat tiedot
{state_the_correct_facts — esimerkiksi: "Poistuin Schengen-alueelta {date} lennolla {flight_number} lentoasemalta {airport}."}

Liitteenä olevat todisteet
{list_your_evidence — esimerkiksi: tarkastuskortti, matkavaraus, majoitus- ja maksutositteet}

Pyydän, että tiedot oikaistaan tai niitä täydennetään tämän mukaisesti ja että minulle ilmoitetaan lopputuloksesta asetuksen (EU) 2017/2226 52 artiklan 1 kohdassa säädetyssä 45 päivän määräajassa. Jos pyyntöä ei käsitellä määräajassa, pidätän oikeuden panna vireille kanteen tai tehdä kantelun mainitun asetuksen 54 artiklan nojalla.

Vastausosoite: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_HR: LetterTemplate = {
  lang: "hr",
  languageName: "Croatian",
  subject:
    "Zahtjev za ispravak podataka u sustavu ulaska/izlaska (EES) — članak 52. Uredbe (EU) 2017/2226",
  body: `Poštovani,

na temelju članka 52. Uredbe (EU) 2017/2226 zahtijevam ispravak netočnih podataka o meni evidentiranih u sustavu ulaska/izlaska (EES).

Osobni podaci
- Ime i prezime: {full_name}
- Datum rođenja: {date_of_birth}
- Državljanstvo: {nationality}
- Vrsta i broj putne isprave: {travel_document_number}

Netočan zapis
{describe_the_incorrect_record — na primjer: „Moj izlazak {date} preko {border_crossing_point} nije evidentiran, zbog čega sam sada pogrešno označen(a) kao osoba koja je prekoračila dopušteno trajanje boravka.”}

Točne činjenice
{state_the_correct_facts — na primjer: „Schengenski prostor napustio/napustila sam {date} letom {flight_number} iz zračne luke {airport}.”}

Priloženi dokazi
{list_your_evidence — na primjer: ukrcajna propusnica, rezervacija putovanja, potvrde o smještaju i plaćanjima}

Molim da se podaci na odgovarajući način isprave ili dopune te da me se o ishodu obavijesti u roku od 45 dana propisanom člankom 52. stavkom 1. Uredbe (EU) 2017/2226. Ako zahtjev ne bude pravodobno riješen, zadržavam pravo na pravna sredstva iz članka 54. navedene Uredbe.

Adresa za odgovor: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_HU: LetterTemplate = {
  lang: "hu",
  languageName: "Hungarian",
  subject:
    "Kérelem a határregisztrációs rendszerben (EES) tárolt adatok helyesbítésére — az (EU) 2017/2226 rendelet 52. cikke",
  body: `Tisztelt Hölgyem/Uram!

Az (EU) 2017/2226 rendelet 52. cikke alapján kérem a határregisztrációs rendszerben (EES) rólam rögzített pontatlan adatok helyesbítését.

Személyes adatok
- Teljes név: {full_name}
- Születési dátum: {date_of_birth}
- Állampolgárság: {nationality}
- Úti okmány típusa és száma: {travel_document_number}

Pontatlan bejegyzés
{describe_the_incorrect_record — például: „A(z) {date} napon, {border_crossing_point} határátkelőhelyen történt kilépésemet nem rögzítették, ezért most tévesen az engedélyezett tartózkodási időt túllépő személyként szerepelek.”}

Helyes tények
{state_the_correct_facts — például: „A schengeni térséget {date} napon hagytam el a(z) {flight_number} számú járattal, {airport} repülőtérről.”}

Csatolt bizonyítékok
{list_your_evidence — például: beszállókártya, utazási foglalás, szállás- és fizetési igazolások}

Kérem az adatok ennek megfelelő helyesbítését vagy kiegészítését, valamint azt, hogy az eredményről az (EU) 2017/2226 rendelet 52. cikkének (1) bekezdésében meghatározott 45 napos határidőn belül tájékoztassanak. Amennyiben kérelmemet határidőn belül nem bírálják el, fenntartom a jogot, hogy az említett rendelet 54. cikke szerinti jogorvoslattal éljek.

Válaszcím: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_IS: LetterTemplate = {
  lang: "is",
  languageName: "Icelandic",
  subject:
    "Beiðni um leiðréttingu upplýsinga í komu- og brottfararkerfinu (Entry/Exit System, EES) — 52. gr. reglugerðar (ESB) 2017/2226",
  body: `Til hlutaðeigandi stjórnvalds

Með vísan til 52. gr. reglugerðar (ESB) 2017/2226 óska ég eftir leiðréttingu á röngum upplýsingum um mig sem skráðar eru í komu- og brottfararkerfið (Entry/Exit System, EES).

Persónuupplýsingar
- Fullt nafn: {full_name}
- Fæðingardagur: {date_of_birth}
- Ríkisfang: {nationality}
- Tegund og númer ferðaskilríkis: {travel_document_number}

Röng skráning
{describe_the_incorrect_record — til dæmis: "Brottför mín {date} um {border_crossing_point} var ekki skráð og ég er nú ranglega merkt(ur) sem einstaklingur sem hefur dvalið lengur en heimilt er."}

Réttar upplýsingar
{state_the_correct_facts — til dæmis: "Ég fór frá Schengen-svæðinu {date} með flugi {flight_number} frá {airport}."}

Meðfylgjandi gögn
{list_your_evidence — til dæmis: brottfararspjald, ferðabókun, kvittanir fyrir gistingu og greiðslum}

Ég óska eftir að upplýsingarnar verði leiðréttar eða bætt við þær í samræmi við þetta og að mér verði tilkynnt um niðurstöðuna innan 45 daga frestsins sem kveðið er á um í 1. mgr. 52. gr. reglugerðar (ESB) 2017/2226. Verði beiðninni ekki svarað innan frestsins áskil ég mér rétt til að leggja fram kvörtun eða höfða mál samkvæmt 54. gr. sömu reglugerðar.

Svarheimilisfang: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_LT: LetterTemplate = {
  lang: "lt",
  languageName: "Lithuanian",
  subject:
    "Prašymas ištaisyti atvykimo ir išvykimo sistemos (AIS/EES) duomenis — Reglamento (ES) 2017/2226 52 straipsnis",
  body: `Gerbiamieji,

Vadovaudamasis (-asi) Reglamento (ES) 2017/2226 52 straipsniu, prašau ištaisyti netikslius duomenis apie mane, užregistruotus atvykimo ir išvykimo sistemoje (AIS, angl. EES).

Asmens duomenys
- Vardas ir pavardė: {full_name}
- Gimimo data: {date_of_birth}
- Pilietybė: {nationality}
- Kelionės dokumento rūšis ir numeris: {travel_document_number}

Netikslus įrašas
{describe_the_incorrect_record — pavyzdžiui: „Mano išvykimas {date} per {border_crossing_point} nebuvo užregistruotas, todėl dabar esu klaidingai pažymėtas (-a) kaip viršijęs (-usi) leidžiamą buvimo laiką.“}

Teisingi faktai
{state_the_correct_facts — pavyzdžiui: „Išvykau iš Šengeno erdvės {date} skrydžiu {flight_number} iš {airport} oro uosto.“}

Pridedami įrodymai
{list_your_evidence — pavyzdžiui: įlaipinimo kortelė, kelionės užsakymas, apgyvendinimo ir mokėjimų dokumentai}

Prašau atitinkamai ištaisyti arba papildyti duomenis ir informuoti mane apie rezultatą per Reglamento (ES) 2017/2226 52 straipsnio 1 dalyje nustatytą 45 dienų terminą. Jei prašymas nebus išnagrinėtas laiku, pasilieku teisę pateikti ieškinį arba skundą pagal minėto reglamento 54 straipsnį.

Adresas atsakymui: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_LV: LetterTemplate = {
  lang: "lv",
  languageName: "Latvian",
  subject:
    "Pieprasījums labot ieceļošanas/izceļošanas sistēmas (IIS/EES) datus — Regulas (ES) 2017/2226 52. pants",
  body: `Godātie kungi un dāmas!

Saskaņā ar Regulas (ES) 2017/2226 52. pantu lūdzu labot neprecīzus datus par mani, kas reģistrēti ieceļošanas/izceļošanas sistēmā (IIS, angliski EES).

Personas dati
- Vārds, uzvārds: {full_name}
- Dzimšanas datums: {date_of_birth}
- Valstspiederība: {nationality}
- Ceļošanas dokumenta veids un numurs: {travel_document_number}

Neprecīzais ieraksts
{describe_the_incorrect_record — piemēram: "Mana izceļošana {date} caur {border_crossing_point} netika reģistrēta, un tagad mani kļūdaini atzīmē kā personu, kas pārsniegusi atļauto uzturēšanās laiku."}

Pareizie fakti
{state_the_correct_facts — piemēram: "Es izceļoju no Šengenas zonas {date} ar reisu {flight_number} no lidostas {airport}."}

Pievienotie pierādījumi
{list_your_evidence — piemēram: iekāpšanas karte, ceļojuma rezervācija, naktsmītnes un maksājumu apliecinājumi}

Lūdzu attiecīgi labot vai papildināt datus un informēt mani par rezultātu Regulas (ES) 2017/2226 52. panta 1. punktā noteiktajā 45 dienu termiņā. Ja pieprasījums netiks izskatīts laikā, es paturu tiesības celt prasību vai iesniegt sūdzību saskaņā ar minētās regulas 54. pantu.

Adrese atbildei: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_NB: LetterTemplate = {
  lang: "nb",
  languageName: "Norwegian (Bokmål)",
  subject:
    "Anmodning om retting av opplysninger i inn- og utreisesystemet (Entry/Exit System, EES) — artikkel 52 i forordning (EU) 2017/2226",
  body: `Til rette myndighet

I medhold av artikkel 52 i forordning (EU) 2017/2226 ber jeg om retting av uriktige opplysninger om meg som er registrert i inn- og utreisesystemet (Entry/Exit System, EES).

Personopplysninger
- Fullt navn: {full_name}
- Fødselsdato: {date_of_birth}
- Statsborgerskap: {nationality}
- Type reisedokument og nummer: {travel_document_number}

Uriktig registrering
{describe_the_incorrect_record — for eksempel: "Det ble ikke registrert noen utreise da jeg reiste ut {date} via {border_crossing_point}, og jeg er nå feilaktig registrert som en person som har overskredet tillatt oppholdstid."}

Riktige opplysninger
{state_the_correct_facts — for eksempel: "Jeg forlot Schengen-området {date} med fly {flight_number} fra {airport}."}

Vedlagt dokumentasjon
{list_your_evidence — for eksempel: boardingkort, reisebestilling, kvitteringer for overnatting og betalinger}

Jeg ber om at opplysningene rettes eller suppleres i samsvar med dette, og at jeg blir informert om utfallet innen fristen på 45 dager i artikkel 52 nr. 1 i forordning (EU) 2017/2226. Dersom anmodningen ikke behandles innen fristen, forbeholder jeg meg retten til å klage eller bringe saken inn for domstolene etter artikkel 54 i samme forordning.

Svaradresse: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_PL: LetterTemplate = {
  lang: "pl",
  languageName: "Polish",
  subject:
    "Wniosek o sprostowanie danych w systemie wjazdu/wyjazdu (EES) — art. 52 rozporządzenia (UE) 2017/2226",
  body: `Szanowni Państwo,

na podstawie art. 52 rozporządzenia (UE) 2017/2226 wnoszę o sprostowanie nieprawidłowych danych dotyczących mojej osoby, zarejestrowanych w systemie wjazdu/wyjazdu (EES).

Dane osobowe
- Imię i nazwisko: {full_name}
- Data urodzenia: {date_of_birth}
- Obywatelstwo: {nationality}
- Rodzaj i numer dokumentu podróży: {travel_document_number}

Nieprawidłowy wpis
{describe_the_incorrect_record — na przykład: „Nie zarejestrowano mojego wyjazdu w dniu {date} przez {border_crossing_point}, w związku z czym jestem obecnie błędnie oznaczony(-a) jako osoba, która przekroczyła dozwolony okres pobytu.”}

Prawidłowy stan faktyczny
{state_the_correct_facts — na przykład: „Opuściłem(-am) strefę Schengen w dniu {date} lotem {flight_number} z lotniska {airport}.”}

Załączone dowody
{list_your_evidence — na przykład: karta pokładowa, rezerwacja podróży, potwierdzenia zakwaterowania i płatności}

Wnoszę o odpowiednie sprostowanie lub uzupełnienie danych oraz o poinformowanie mnie o wyniku w terminie 45 dni określonym w art. 52 ust. 1 rozporządzenia (UE) 2017/2226. W przypadku nierozpatrzenia wniosku w terminie zastrzegam sobie prawo do skorzystania ze środków ochrony prawnej przewidzianych w art. 54 tego rozporządzenia.

Adres do korespondencji: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_PT: LetterTemplate = {
  lang: "pt",
  languageName: "Portuguese",
  subject:
    "Pedido de retificação de dados do Sistema de Entrada/Saída (SES/EES) — artigo 52.º do Regulamento (UE) 2017/2226",
  body: `Exmos. Senhores,

Nos termos do artigo 52.º do Regulamento (UE) 2017/2226, solicito a retificação de dados inexatos que me dizem respeito registados no Sistema de Entrada/Saída (SES).

Dados pessoais
- Nome completo: {full_name}
- Data de nascimento: {date_of_birth}
- Nacionalidade: {nationality}
- Tipo e número do documento de viagem: {travel_document_number}

Registo inexato
{descreva_o_registo_inexato — por exemplo: «Não foi registada qualquer saída na minha partida de {date} através de {border_crossing_point}, e estou agora indevidamente assinalado(a) como tendo excedido o período de estada autorizado.»}

Factos corretos
{indique_os_factos_corretos}

Documentos comprovativos anexos
{enumere_os_seus_comprovativos — por exemplo: cartão de embarque, reserva de viagem, comprovativos de alojamento e de pagamento}

Solicito que os dados sejam retificados ou completados em conformidade e que seja informado(a) do resultado no prazo de 45 dias previsto no artigo 52.º, n.º 1, do Regulamento (UE) 2017/2226. Caso o pedido não seja tratado nesse prazo, reservo-me o direito de apresentar uma reclamação ao abrigo do artigo 54.º do referido regulamento.

Endereço para resposta: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_RO: LetterTemplate = {
  lang: "ro",
  languageName: "Romanian",
  subject:
    "Cerere de rectificare a datelor din Sistemul de intrare/ieșire (EES) — articolul 52 din Regulamentul (UE) 2017/2226",
  body: `Stimate doamne și stimați domni,

În temeiul articolului 52 din Regulamentul (UE) 2017/2226, solicit rectificarea datelor inexacte care mă privesc, înregistrate în Sistemul de intrare/ieșire (EES).

Date personale
- Nume și prenume: {full_name}
- Data nașterii: {date_of_birth}
- Cetățenie: {nationality}
- Tipul și numărul documentului de călătorie: {travel_document_number}

Înregistrare inexactă
{descrieți_înregistrarea_inexactă — de exemplu: „Nu a fost înregistrată nicio ieșire la plecarea mea din {date} prin {border_crossing_point}, iar acum sunt semnalat(ă) în mod eronat ca persoană care a depășit durata de ședere autorizată.”}

Faptele corecte
{indicați_faptele_corecte}

Dovezi anexate
{enumerați_dovezile_dumneavoastră — de exemplu: carte de îmbarcare, rezervare de călătorie, documente privind cazarea și plățile}

Vă rog să rectificați sau să completați datele în consecință și să mă informați cu privire la rezultat în termenul de 45 de zile prevăzut la articolul 52 alineatul (1) din Regulamentul (UE) 2017/2226. În cazul în care cererea nu este soluționată în termen, îmi rezerv dreptul de a depune o plângere în temeiul articolului 54 din regulamentul menționat.

Adresa pentru răspuns: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_SK: LetterTemplate = {
  lang: "sk",
  languageName: "Slovak",
  subject:
    "Žiadosť o opravu údajov v systéme vstup/výstup (EES) — článok 52 nariadenia (EÚ) 2017/2226",
  body: `Vážení,

podľa článku 52 nariadenia (EÚ) 2017/2226 žiadam o opravu nesprávnych údajov o mojej osobe zaznamenaných v systéme vstup/výstup (EES).

Osobné údaje
- Meno a priezvisko: {full_name}
- Dátum narodenia: {date_of_birth}
- Štátna príslušnosť: {nationality}
- Druh a číslo cestovného dokladu: {travel_document_number}

Nesprávny záznam
{describe_the_incorrect_record — napríklad: „Môj výstup dňa {date} cez {border_crossing_point} nebol zaznamenaný, a preto som teraz nesprávne vedený(-á) ako osoba, ktorá prekročila povolenú dĺžku pobytu.“}

Správne skutočnosti
{state_the_correct_facts — napríklad: „Schengenský priestor som opustil(a) dňa {date} letom {flight_number} z letiska {airport}.“}

Priložené dôkazy
{list_your_evidence — napríklad: palubný lístok, rezervácia cesty, doklady o ubytovaní a platbách}

Žiadam, aby boli údaje zodpovedajúcim spôsobom opravené alebo doplnené a aby som bol(a) o výsledku informovaný(-á) v lehote 45 dní stanovenej v článku 52 ods. 1 nariadenia (EÚ) 2017/2226. Ak žiadosť nebude vybavená včas, vyhradzujem si právo využiť prostriedky nápravy podľa článku 54 uvedeného nariadenia.

Adresa na odpoveď: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_SL: LetterTemplate = {
  lang: "sl",
  languageName: "Slovenian",
  subject:
    "Zahteva za popravek podatkov v sistemu vstopa/izstopa (SVI/EES) — člen 52 Uredbe (EU) 2017/2226",
  body: `Spoštovani,

na podlagi člena 52 Uredbe (EU) 2017/2226 zahtevam popravek netočnih podatkov o meni, evidentiranih v sistemu vstopa/izstopa (SVI, angl. EES).

Osebni podatki
- Ime in priimek: {full_name}
- Datum rojstva: {date_of_birth}
- Državljanstvo: {nationality}
- Vrsta in številka potne listine: {travel_document_number}

Netočen vpis
{describe_the_incorrect_record — na primer: »Moj izstop dne {date} prek {border_crossing_point} ni bil evidentiran, zato sem zdaj napačno označen(-a) kot oseba, ki je prekoračila dovoljeno obdobje bivanja.«}

Pravilna dejstva
{state_the_correct_facts — na primer: »Schengensko območje sem zapustil(-a) dne {date} z letom {flight_number} z letališča {airport}.«}

Priložena dokazila
{list_your_evidence — na primer: vstopni kupon, rezervacija potovanja, dokazila o nastanitvi in plačilih}

Prosim, da se podatki ustrezno popravijo ali dopolnijo in da me o izidu obvestite v 45-dnevnem roku iz člena 52(1) Uredbe (EU) 2017/2226. Če zahteva ne bo pravočasno obravnavana, si pridržujem pravico do uporabe pravnih sredstev iz člena 54 navedene uredbe.

Naslov za odgovor: {postal_address_or_email}

{place_and_date}
{signature}`,
};

const LANG_SV: LetterTemplate = {
  lang: "sv",
  languageName: "Swedish",
  subject:
    "Begäran om rättelse av uppgifter i in- och utresesystemet (EES) — artikel 52 i förordning (EU) 2017/2226",
  body: `Till den behöriga myndigheten,

Med stöd av artikel 52 i förordning (EU) 2017/2226 begär jag rättelse av felaktiga uppgifter om mig som har registrerats i in- och utresesystemet (EES).

Personuppgifter
- Fullständigt namn: {full_name}
- Födelsedatum: {date_of_birth}
- Medborgarskap: {nationality}
- Typ av resehandling och nummer: {travel_document_number}

Felaktig registrering
{describe_the_incorrect_record — till exempel: "Ingen utresa registrerades när jag lämnade landet den {date} via {border_crossing_point}, och jag är nu felaktigt markerad som en person som har överskridit den tillåtna vistelsen."}

Korrekta uppgifter
{state_the_correct_facts — till exempel: "Jag lämnade Schengenområdet den {date} med flyg {flight_number} från {airport}."}

Bifogade bevis
{list_your_evidence — till exempel: boardingkort, resebokning, kvitton för boende och betalningar}

Jag begär att uppgifterna rättas eller kompletteras i enlighet med detta och att jag underrättas om resultatet inom den tidsfrist på 45 dagar som anges i artikel 52.1 i förordning (EU) 2017/2226. Om begäran inte behandlas i tid förbehåller jag mig rätten att väcka talan eller inge klagomål enligt artikel 54 i samma förordning.

Svarsadress: {postal_address_or_email}

{place_and_date}
{signature}`,
};

/** Local-language template per country, always paired with EN on the page. */
export const lettersByCountry: Record<string, LetterTemplate> = {
  AT: DE,
  BE: NL,
  BG: LANG_BG,
  CH: DE,
  CZ: LANG_CS,
  DE: DE,
  DK: LANG_DA,
  EE: LANG_ET,
  ES: ES,
  FI: LANG_FI,
  FR: FR,
  GR: LANG_EL,
  HR: LANG_HR,
  HU: LANG_HU,
  IS: LANG_IS,
  IT: IT,
  LI: DE,
  LT: LANG_LT,
  LU: FR,
  LV: LANG_LV,
  NL: NL,
  NO: LANG_NB,
  PL: LANG_PL,
  PT: LANG_PT,
  RO: LANG_RO,
  SE: LANG_SV,
  SI: LANG_SL,
  SK: LANG_SK,
};

export const letterEnglish = EN;
