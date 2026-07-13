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

/** Local-language template per country, always paired with EN on the page. */
export const lettersByCountry: Record<string, LetterTemplate> = {
  FR,
  ES,
  DE: DE,
  IT,
  NL,
};

export const letterEnglish = EN;
